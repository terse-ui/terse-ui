import type {DirectiveDoc} from './types';

/** Render extracted directive docs as markdown tables matching existing doc format. */
export function renderApiMarkdown(directives: DirectiveDoc[]): string {
  return directives.map(renderDirective).join('\n\n---\n\n');
}

function renderDirective(d: DirectiveDoc): string {
  const sections: string[] = [];

  // Heading (only if multiple directives in the entry point)
  sections.push(`### ${d.name}`);

  if (d.description) {
    sections.push(d.description);
  }

  // Metadata table
  const meta: string[] = [];
  meta.push(`| | |`);
  meta.push(`| --- | --- |`);
  meta.push(`| **Selector** | \`${d.selector}\` |`);
  if (d.exportAs.length > 0) {
    meta.push(`| **Exported as** | \`${d.exportAs.join(', ')}\` |`);
  }
  sections.push(meta.join('\n'));

  // Inputs
  if (d.inputs.length > 0) {
    const rows: string[] = [];
    rows.push(`#### Inputs`);
    rows.push('');
    rows.push(`| Input | Type | Default | Description |`);
    rows.push(`| --- | --- | --- | --- |`);
    for (const inp of d.inputs) {
      const def = inp.default ?? '';
      rows.push(
        `| \`${inp.alias}\` | \`${inp.type}\` | ${def ? `\`${def}\`` : ''} | ${inp.description} |`,
      );
    }
    sections.push(rows.join('\n'));
  }

  // Outputs
  if (d.outputs.length > 0) {
    const rows: string[] = [];
    rows.push(`#### Outputs`);
    rows.push('');
    rows.push(`| Output | Type | Description |`);
    rows.push(`| --- | --- | --- |`);
    for (const out of d.outputs) {
      rows.push(`| \`${out.alias}\` | \`${out.type}\` | ${out.description} |`);
    }
    sections.push(rows.join('\n'));
  }

  // Properties (public readonly, non-input/output)
  if (d.properties.length > 0) {
    const rows: string[] = [];
    rows.push(`#### Properties`);
    rows.push('');
    rows.push(`| Property | Type | Description |`);
    rows.push(`| --- | --- | --- |`);
    for (const prop of d.properties) {
      const ro = prop.isReadonly ? ' (readonly)' : '';
      rows.push(`| \`${prop.name}\` | \`${prop.type}\`${ro} | ${prop.description} |`);
    }
    sections.push(rows.join('\n'));
  }

  // Data attributes (from host bindings)
  const dataAttrs = d.hostBindings.filter((h) => h.category === 'data-attribute');
  if (dataAttrs.length > 0) {
    const rows: string[] = [];
    rows.push(`#### Data Attributes`);
    rows.push('');
    rows.push(`| Attribute | Binding |`);
    rows.push(`| --- | --- |`);
    for (const attr of dataAttrs) {
      const name = extractAttrName(attr.binding);
      rows.push(`| \`${name}\` | \`${attr.expression}\` |`);
    }
    sections.push(rows.join('\n'));
  }

  // ARIA bindings
  const ariaAttrs = d.hostBindings.filter((h) => h.category === 'aria');
  if (ariaAttrs.length > 0) {
    const rows: string[] = [];
    rows.push(`#### ARIA Bindings`);
    rows.push('');
    rows.push(`| Attribute | Binding |`);
    rows.push(`| --- | --- |`);
    for (const attr of ariaAttrs) {
      const name = extractAttrName(attr.binding);
      rows.push(`| \`${name}\` | \`${attr.expression}\` |`);
    }
    sections.push(rows.join('\n'));
  }

  // Style bindings
  const styleBindings = d.hostBindings.filter((h) => h.category === 'style');
  if (styleBindings.length > 0) {
    const rows: string[] = [];
    rows.push(`#### Host Style Bindings`);
    rows.push('');
    rows.push(`| Property | Binding |`);
    rows.push(`| --- | --- |`);
    for (const sb of styleBindings) {
      const prop = sb.binding.replace(/^\[style\./, '').replace(/\]$/, '');
      rows.push(`| \`${prop}\` | \`${sb.expression}\` |`);
    }
    sections.push(rows.join('\n'));
  }

  return sections.join('\n\n');
}

function extractAttrName(binding: string): string {
  // [attr.data-hover] → data-hover
  const match = binding.match(/\[attr\.(.+)\]/);
  return match ? match[1] : binding;
}
