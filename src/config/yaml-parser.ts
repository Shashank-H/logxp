/**
 * Simple YAML parser for configuration files
 * Handles basic structures: objects, arrays, strings, numbers, booleans
 */

export function parseYaml(content: string): Record<string, unknown> {
  const lines = content.split('\n');
  const result: Record<string, unknown> = {};
  const stack: { indent: number; obj: Record<string, unknown>; key?: string }[] = [
    { indent: -1, obj: result },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const indent = line.search(/\S/);
    const colonIndex = trimmed.indexOf(':');

    if (colonIndex === -1) {
      if (trimmed.startsWith('- ')) {
        const value = parseValue(trimmed.slice(2).trim());
        const parent = findParent(stack, indent);
        if (parent.key && Array.isArray(parent.obj[parent.key])) {
          (parent.obj[parent.key] as unknown[]).push(value);
        }
      }
      continue;
    }

    const key = trimmed.slice(0, colonIndex).trim();
    const valueStr = trimmed.slice(colonIndex + 1).trim();

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];

    if (!valueStr) {
      const nextLine = lines[i + 1];
      const nextTrimmed = nextLine?.trim();

      if (nextTrimmed?.startsWith('- ')) {
        parent.obj[key] = [];
        stack.push({ indent, obj: parent.obj, key });
      } else {
        parent.obj[key] = {};
        stack.push({ indent, obj: parent.obj[key] as Record<string, unknown> });
      }
    } else {
      parent.obj[key] = parseValue(valueStr);
    }
  }

  return result;
}

function parseValue(str: string): unknown {
  const trimmed = str.trim();

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }

  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null' || trimmed === '~') return null;

  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== '') {
    return num;
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1);
    return inner.split(',').map((v) => parseValue(v.trim()));
  }

  return trimmed;
}

function findParent(
  stack: { indent: number; obj: Record<string, unknown>; key?: string }[],
  indent: number
): { indent: number; obj: Record<string, unknown>; key?: string } {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].indent < indent) {
      return stack[i];
    }
  }
  return stack[0];
}
