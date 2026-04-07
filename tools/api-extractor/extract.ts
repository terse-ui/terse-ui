#!/usr/bin/env node

/**
 * API extraction script for Terse UI.
 *
 * Extracts directive metadata from source code using the Angular compiler
 * and writes per-entry-point JSON files for consumption by the VitePress docs.
 *
 * Usage:
 *   npx tsx tools/api-extractor/extract.ts --package=atoms
 *   npx tsx tools/api-extractor/extract.ts --package=atoms --watch
 */

import {existsSync, globSync, mkdirSync, readFileSync, watch, writeFileSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';
import {extractApi} from './extract-api';
import {extractHostBindings} from './extract-host';
import type {EntryPointDoc} from './types';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..', '..');

function parseArgs(): {packageName: string; watchMode: boolean} {
  const args = process.argv.slice(2);
  const pkg = args.find((a) => a.startsWith('--package='))?.split('=')[1];
  if (!pkg) {
    console.error('Usage: npx tsx tools/api-extractor/extract.ts --package=atoms|protos [--watch]');
    process.exit(1);
  }
  return {packageName: pkg, watchMode: args.includes('--watch')};
}

function discoverEntryPoints(packageName: string): string[] {
  const pattern = `packages/${packageName}/*/ng-package.json`;
  return globSync(pattern, {cwd: ROOT})
    .map((ngPkg) => {
      const dir = dirname(ngPkg);
      const indexPath = resolve(ROOT, dir, 'index.ts');
      return existsSync(indexPath) ? indexPath : null;
    })
    .filter((p): p is string => p !== null);
}

function discoverSourceFiles(packageName: string): Map<string, string> {
  const pattern = `packages/${packageName}/**/lib/*.ts`;
  const files = globSync(pattern, {cwd: ROOT, ignore: ['**/*.spec.ts', '**/*.test.ts']});
  const result = new Map<string, string>();
  for (const file of files) {
    const absPath = resolve(ROOT, file);
    result.set(absPath, readFileSync(absPath, 'utf-8'));
  }
  return result;
}

function entryPointName(entryPointPath: string): string {
  const dir = dirname(entryPointPath);
  return basename(dir);
}

function extract(packageName: string): void {
  const tsconfigPath = resolve(ROOT, `packages/${packageName}/tsconfig.lib.json`);

  if (!existsSync(tsconfigPath)) {
    console.error(`tsconfig not found: ${tsconfigPath}`);
    process.exit(1);
  }

  const entryPoints = discoverEntryPoints(packageName);

  // Step 1: Extract API via Angular compiler
  const apiMap = extractApi(tsconfigPath, entryPoints);

  // Step 2: Extract host bindings via TS AST
  const sourceFiles = discoverSourceFiles(packageName);
  const allHostBindings = new Map<
    string,
    ReturnType<typeof extractHostBindings> extends Map<string, infer V> ? V : never
  >();

  for (const [filePath, source] of sourceFiles) {
    const bindings = extractHostBindings(filePath, source);
    for (const [className, hostBindings] of bindings) {
      allHostBindings.set(className, hostBindings);
    }
  }

  // Step 3: Merge host bindings into directive docs
  for (const [, directives] of apiMap) {
    for (const directive of directives) {
      const hostBindings = allHostBindings.get(directive.name);
      if (hostBindings) {
        directive.hostBindings = hostBindings;
      }
    }
  }

  // Step 4: Write per-entry-point JSON
  const outDir = resolve(ROOT, `apps/docs/.vitepress/data/api/${packageName}`);
  mkdirSync(outDir, {recursive: true});

  const manifest: EntryPointDoc[] = [];

  for (const [entryPointPath, directives] of apiMap) {
    const name = entryPointName(entryPointPath);
    const doc: EntryPointDoc = {
      entryPoint: `@terse-ui/${packageName}/${name}`,
      packageName,
      directives,
    };

    const outPath = resolve(outDir, `${name}.json`);
    writeFileSync(outPath, JSON.stringify(doc, null, 2));
    manifest.push(doc);
  }

  const manifestPath = resolve(outDir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const dirCount = manifest.reduce((sum, ep) => sum + ep.directives.length, 0);
  console.log(
    `[api-extractor] ${packageName}: ${dirCount} directives from ${manifest.length} entry points`,
  );
}

function main() {
  const {packageName, watchMode} = parseArgs();

  // Initial extraction
  extract(packageName);

  if (!watchMode) return;

  // Watch mode: re-extract on source changes
  const watchDir = resolve(ROOT, `packages/${packageName}`);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  console.log(`[api-extractor] Watching packages/${packageName}/ for changes...`);

  watch(watchDir, {recursive: true}, (_event, filename) => {
    if (!filename) return;
    const f = filename.toString();

    // Only re-extract on .ts source file changes (not specs, not JSON)
    if (!f.endsWith('.ts') || f.endsWith('.spec.ts') || f.endsWith('.test.ts')) return;
    // Skip non-lib files
    if (!f.includes('lib/')) return;

    // Debounce: wait 300ms for rapid saves to settle
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`[api-extractor] Change detected: ${f}`);
      try {
        extract(packageName);
      } catch (e) {
        console.error(`[api-extractor] Extraction error:`, e);
      }
    }, 300);
  });
}

main();
