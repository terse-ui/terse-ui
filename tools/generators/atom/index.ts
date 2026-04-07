import type {Tree} from '@nx/devkit';
import {formatFiles, generateFiles} from '@nx/devkit';
import {join} from 'node:path';

interface AtomGeneratorSchema {
  name: string;
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export default async function atomGenerator(tree: Tree, schema: AtomGeneratorSchema) {
  const name = schema.name; // kebab-case, e.g. "focus-visible"
  const className = `Atom${toPascalCase(name)}`; // e.g. "AtomFocusVisible"
  const selector = `atom${toPascalCase(name)}`; // e.g. "atomFocusVisible"
  const camelName = toCamelCase(name); // e.g. "focusVisible"

  const templateVars = {
    name,
    className,
    selector,
    camelName,
    template: '', // needed by generateFiles
  };

  // 1. Generate atom package files
  generateFiles(tree, join(__dirname, 'files', 'atom'), `packages/atoms/${name}`, templateVars);

  // 2. Generate docs page
  generateFiles(tree, join(__dirname, 'files', 'doc'), `apps/docs/atoms`, {
    ...templateVars,
    fileName: name,
  });

  // 3. Update VitePress sidebar config
  updateSidebar(tree, name, toPascalCase(name));

  await formatFiles(tree);

  return () => {
    console.log(`\n  Created @terse-ui/atoms/${name}`);
    console.log(`  - packages/atoms/${name}/lib/atom-${name}.ts`);
    console.log(`  - packages/atoms/${name}/lib/atom-${name}.spec.ts`);
    console.log(`  - apps/docs/atoms/${name}.md`);
    console.log(`\n  Next steps:`);
    console.log(`  1. Implement the directive in atom-${name}.ts`);
    console.log(`  2. Write tests in atom-${name}.spec.ts`);
    console.log(`  3. Fill in the docs page at apps/docs/atoms/${name}.md`);
    console.log(`  4. Run: nx run atoms:extract-api\n`);
  };
}

function updateSidebar(tree: Tree, name: string, displayName: string) {
  const configPath = 'apps/docs/.vitepress/config.mts';
  const content = tree.read(configPath, 'utf-8');
  if (!content) return;

  // Find the Atoms sidebar section and add the new entry before the closing bracket
  // Pattern: items array inside the Atoms section
  const atomsItemsRegex = /(text:\s*'Atoms'[\s\S]*?items:\s*\[)([\s\S]*?)(\s*\])/;
  const match = content.match(atomsItemsRegex);

  if (match) {
    const [fullMatch, prefix, items, suffix] = match;
    const newEntry = `\n          {text: '${displayName}', link: '/atoms/${name}'},`;
    const updated = content.replace(fullMatch, `${prefix}${items}${newEntry}${suffix}`);
    tree.write(configPath, updated);
  }
}
