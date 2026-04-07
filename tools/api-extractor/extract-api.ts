import {
  createCompilerHost,
  type DirectiveEntry,
  type DocEntry,
  type MemberEntry,
  MemberTags,
  type NgtscProgram,
  performCompilation,
  type PropertyEntry,
  readConfiguration,
} from '@angular/compiler-cli';
import type {DirectiveDoc, InputDoc, OutputDoc, PropertyDoc} from './types';

function isDirective(entry: DocEntry): entry is DirectiveEntry {
  return entry.entryType === 'directive';
}

function isProperty(entry: MemberEntry): entry is PropertyEntry {
  return entry.memberType === 'property';
}

function isInput(entry: MemberEntry): entry is PropertyEntry {
  return isProperty(entry) && entry.memberTags.includes(MemberTags.Input);
}

function isOutput(entry: MemberEntry): entry is PropertyEntry {
  return isProperty(entry) && entry.memberTags.includes(MemberTags.Output);
}

function isPublicReadonly(entry: MemberEntry): entry is PropertyEntry {
  return (
    isProperty(entry) &&
    entry.memberTags.includes(MemberTags.Readonly) &&
    !entry.memberTags.includes(MemberTags.Protected) &&
    !isInput(entry) &&
    !isOutput(entry) &&
    !entry.name.startsWith('#')
  );
}

function isInternal(entry: MemberEntry): boolean {
  return entry.jsdocTags?.some((t) => t.name === 'internal') ?? false;
}

/** Extract the inner type from signal wrappers like ModelSignal<T>, InputSignal<T>, etc. */
function unwrapSignalType(type: string): string {
  const match = type.match(/^(InputSignal|InputSignalWithTransform|ModelSignal)<(.+)>$/);
  if (!match) return type;
  const inner = match[2]!;

  // For InputSignalWithTransform<T, U>, extract only T
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === '(' || inner[i] === '<') depth++;
    else if (inner[i] === ')' || inner[i] === '>') depth--;
    else if (inner[i] === ',' && depth === 0) {
      return inner.slice(0, i).trim();
    }
  }
  return inner.trim();
}

function unwrapOutputType(type: string): string {
  return type.replace(/^(OutputEmitterRef|ModelSignal)<(.*)>$/, '$2');
}

function mapInput(entry: PropertyEntry): InputDoc {
  return {
    name: entry.name,
    alias: entry.inputAlias ?? entry.name,
    type: unwrapSignalType(entry.type),
    description: entry.description,
    isRequired: entry.isRequiredInput ?? false,
    default: entry.jsdocTags?.find((t) => t.name === 'default')?.comment,
  };
}

function mapOutput(entry: PropertyEntry): OutputDoc {
  return {
    name: entry.name,
    alias: entry.outputAlias ?? entry.name,
    type: unwrapOutputType(entry.type),
    description: entry.description,
  };
}

function mapProperty(entry: PropertyEntry): PropertyDoc {
  return {
    name: entry.name,
    type: unwrapSignalType(entry.type),
    description: entry.description,
    isReadonly: entry.memberTags.includes(MemberTags.Readonly),
  };
}

function mapDirective(entry: DirectiveEntry): DirectiveDoc {
  const publicMembers = entry.members.filter((m) => !isInternal(m));
  return {
    name: entry.name,
    selector: entry.selector,
    exportAs: entry.exportAs,
    description: entry.description,
    inputs: publicMembers.filter(isInput).map(mapInput),
    outputs: publicMembers.filter(isOutput).map(mapOutput),
    properties: publicMembers.filter(isPublicReadonly).map(mapProperty),
    hostBindings: [], // filled in by extract-host.ts
  };
}

/**
 * Extract directive metadata from a package using the Angular compiler.
 *
 * @param tsconfigPath - Path to the package's tsconfig.lib.json
 * @param entryPointPaths - Absolute paths to secondary entry point index.ts files
 */
export function extractApi(
  tsconfigPath: string,
  entryPointPaths: string[],
): Map<string, DirectiveDoc[]> {
  const {options, rootNames} = readConfiguration(tsconfigPath);
  const host = createCompilerHost({options});
  const compilation = performCompilation({options, rootNames, host});
  const program = compilation.program as NgtscProgram;

  const result = new Map<string, DirectiveDoc[]>();

  for (const entryPoint of entryPointPaths) {
    try {
      const api = program.getApiDocumentation(entryPoint, new Set());
      const directives = api.entries.filter(isDirective).map(mapDirective);
      if (directives.length > 0) {
        result.set(entryPoint, directives);
      }
    } catch (e) {
      console.error(`Error extracting API from ${entryPoint}:`, e);
    }
  }

  return result;
}
