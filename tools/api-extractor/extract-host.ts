import * as ts from 'typescript';
import type {HostBindingDoc} from './types';

/**
 * Extract host bindings from a directive's `@Directive`/`@Component` decorator
 * by parsing the TypeScript AST. The Angular compiler's `getApiDocumentation`
 * does not include `host: {}` bindings, so we extract them separately.
 */
export function extractHostBindings(
  filePath: string,
  sourceText: string,
): Map<string, HostBindingDoc[]> {
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
  const result = new Map<string, HostBindingDoc[]>();

  function visit(node: ts.Node): void {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.text;
      const bindings = extractFromClass(node);
      if (bindings.length > 0) {
        result.set(className, bindings);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return result;
}

function extractFromClass(classNode: ts.ClassDeclaration): HostBindingDoc[] {
  for (const decorator of ts.getDecorators(classNode) ?? []) {
    if (!ts.isCallExpression(decorator.expression)) continue;

    const decoratorName = decorator.expression.expression.getText();
    if (decoratorName !== 'Directive' && decoratorName !== 'Component') continue;

    const arg = decorator.expression.arguments[0];
    if (!arg || !ts.isObjectLiteralExpression(arg)) continue;

    for (const prop of arg.properties) {
      if (
        ts.isPropertyAssignment(prop) &&
        prop.name.getText() === 'host' &&
        ts.isObjectLiteralExpression(prop.initializer)
      ) {
        return parseHostObject(prop.initializer);
      }
    }
  }
  return [];
}

function parseHostObject(hostObj: ts.ObjectLiteralExpression): HostBindingDoc[] {
  const bindings: HostBindingDoc[] = [];

  for (const prop of hostObj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;

    const key = prop.name.getText().replace(/^'|'$/g, '').replace(/^"|"$/g, '');
    const value = prop.initializer.getText().replace(/^'|'$/g, '').replace(/^"|"$/g, '');

    // Skip event handlers — they're implementation details, not API surface
    if (key.startsWith('(')) continue;

    bindings.push({
      binding: key,
      expression: value,
      category: categorize(key),
    });
  }

  return bindings;
}

function categorize(binding: string): HostBindingDoc['category'] {
  if (binding.match(/\[attr\.data-/)) return 'data-attribute';
  if (binding.match(/\[attr\.aria-/)) return 'aria';
  if (binding.match(/\[style\./)) return 'style';
  if (binding.match(/\[class\./)) return 'class';
  if (binding === '[class]') return 'class';
  return 'property';
}
