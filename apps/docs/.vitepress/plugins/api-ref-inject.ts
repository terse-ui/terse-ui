import type {Plugin, ViteDevServer} from 'vite';
import {existsSync, readFileSync, watch} from 'node:fs';
import {resolve} from 'node:path';

interface DirectiveDoc {
  name: string;
  selector: string;
  exportAs: string[];
  description: string;
  inputs: {
    name: string;
    alias: string;
    type: string;
    description: string;
    isRequired: boolean;
    default?: string;
  }[];
  outputs: {name: string; alias: string; type: string; description: string}[];
  properties: {name: string; type: string; description: string; isReadonly: boolean}[];
  hostBindings: {binding: string; expression: string; category: string}[];
}

interface EntryPointDoc {
  entryPoint: string;
  packageName: string;
  directives: DirectiveDoc[];
}

/**
 * VitePress/Vite plugin that replaces `<!-- api-ref:atoms/hover -->` markers
 * in markdown files with rendered API reference tables from extracted JSON.
 *
 * In dev mode, watches the JSON data directory and triggers full page reload
 * when API data changes (e.g. after the extractor re-runs on source changes).
 */
export function apiRefInject(): Plugin {
  const root = resolve(import.meta.dirname, '..', '..', '..', '..');
  const dataDir = resolve(root, 'apps/docs/.vitepress/data/api');

  let server: ViteDevServer | undefined;

  return {
    name: 'api-ref-inject',
    enforce: 'pre',

    configureServer(srv) {
      server = srv;

      // Watch the JSON data directory for changes from the extractor
      if (!existsSync(dataDir)) return;

      watch(dataDir, {recursive: true}, (_event, filename) => {
        if (!filename?.toString().endsWith('.json')) return;

        console.log(`[api-ref] API data changed: ${filename}`);

        // Invalidate all .md modules that use api-ref markers so VitePress
        // re-transforms them with fresh JSON on next request
        const mods = server!.moduleGraph.getModulesByFile;
        for (const [id, mod] of server!.moduleGraph.idToModuleMap) {
          if (id.endsWith('.md')) {
            server!.moduleGraph.invalidateModule(mod);
          }
        }

        // Trigger full reload — HMR for markdown content requires it
        server!.ws.send({type: 'full-reload'});
      });
    },

    transform(code, id) {
      if (!id.endsWith('.md')) return;
      if (!code.includes('<!-- api-ref:')) return;

      return code.replace(/<!-- api-ref:(\S+) -->/g, (_, ref: string) => {
        const jsonPath = resolve(dataDir, `${ref}.json`);
        if (!existsSync(jsonPath)) {
          return `\n::: warning\nAPI reference not found: \`${ref}\`. Run \`npx tsx tools/api-extractor/extract.ts --package=${ref.split('/')[0]}\` to generate it.\n:::\n`;
        }

        const data: EntryPointDoc = JSON.parse(readFileSync(jsonPath, 'utf-8'));
        return renderEntryPoint(data);
      });
    },
  };
}

function renderEntryPoint(data: EntryPointDoc): string {
  return data.directives.map(renderDirective).join('\n\n---\n\n');
}

function renderDirective(d: DirectiveDoc): string {
  const sections: string[] = [];

  sections.push(`### ${d.name}\n`);

  // Metadata table
  const meta = [`| | |`, `| --- | --- |`, `| **Selector** | \`${d.selector}\` |`];
  if (d.exportAs.length > 0) {
    meta.push(`| **Exported as** | \`${d.exportAs.join(', ')}\` |`);
  }

  const dataAttrs = d.hostBindings.filter((h) => h.category === 'data-attribute');
  if (dataAttrs.length > 0) {
    const names = dataAttrs.map((a) => `\`${extractAttrName(a.binding)}\``).join(', ');
    meta.push(`| **Data attributes** | ${names} |`);
  }

  const ariaAttrs = d.hostBindings.filter((h) => h.category === 'aria');
  if (ariaAttrs.length > 0) {
    const names = ariaAttrs.map((a) => `\`${extractAttrName(a.binding)}\``).join(', ');
    meta.push(`| **ARIA bindings** | ${names} |`);
  }

  const styleBindings = d.hostBindings.filter((h) => h.category === 'style');
  if (styleBindings.length > 0) {
    const names = styleBindings
      .map((s) => `\`${s.binding.replace(/^\[style\./, '').replace(/\]$/, '')}\``)
      .join(', ');
    meta.push(`| **Style bindings** | ${names} |`);
  }

  sections.push(meta.join('\n'));

  // Inputs
  if (d.inputs.length > 0) {
    const rows = [
      `#### Inputs\n`,
      `| Input | Type | Default | Description |`,
      `| --- | --- | --- | --- |`,
    ];
    for (const inp of d.inputs) {
      const def = inp.default ? `\`${inp.default}\`` : '';
      const req = inp.isRequired ? ' **(required)**' : '';
      rows.push(
        `| \`${inp.alias}\` | \`${escapeType(inp.type)}\` | ${def} | ${inp.description}${req} |`,
      );
    }
    sections.push(rows.join('\n'));
  }

  // Outputs
  if (d.outputs.length > 0) {
    const rows = [
      `#### Outputs\n`,
      `| Output | Type | Description |`,
      `| --- | --- | --- |`,
    ];
    for (const out of d.outputs) {
      rows.push(`| \`${out.alias}\` | \`${escapeType(out.type)}\` | ${out.description} |`);
    }
    sections.push(rows.join('\n'));
  }

  // Properties
  if (d.properties.length > 0) {
    const rows = [
      `#### Properties\n`,
      `| Property | Type | Description |`,
      `| --- | --- | --- |`,
    ];
    for (const prop of d.properties) {
      const ro = prop.isReadonly ? ' (readonly)' : '';
      rows.push(
        `| \`${prop.name}\` | \`${escapeType(prop.type)}\`${ro} | ${prop.description} |`,
      );
    }
    sections.push(rows.join('\n'));
  }

  return sections.join('\n\n');
}

function extractAttrName(binding: string): string {
  const match = binding.match(/\[attr\.(.+)\]/);
  return match ? match[1]! : binding;
}

function escapeType(type: string): string {
  return type.replace(/\|/g, '\\|');
}
