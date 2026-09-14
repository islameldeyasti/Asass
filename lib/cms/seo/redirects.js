/**
 * Redirect validation helpers (loops / self-targets).
 */

function normalizePath(value) {
  let path = String(value || '').trim();
  if (!path) return '';
  try {
    if (/^https?:\/\//i.test(path)) {
      path = new URL(path).pathname || '/';
    }
  } catch {
    // keep raw
  }
  path = path.split('?')[0].split('#')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return path.toLowerCase();
}

function redirectFields(item = {}) {
  const from =
    item.from ?? item.source ?? item.fromPath ?? item.src ?? item.path ?? '';
  const to =
    item.to ?? item.destination ?? item.toPath ?? item.target ?? item.redirect ?? '';
  return {from: normalizePath(from), to: normalizePath(to)};
}

/**
 * Validate a redirect item for self-targets and loops against an optional list.
 * @param {object} item
 * @param {object[]} [allItems]
 * @returns {{ok: boolean, errors: string[], warnings: string[], from: string, to: string}}
 */
export function validateRedirect(item, allItems = []) {
  const errors = [];
  const warnings = [];
  const {from, to} = redirectFields(item);

  if (!from) errors.push('Missing source path');
  if (!to) errors.push('Missing destination path');

  if (from && to && from === to) {
    errors.push('Redirect points to itself');
  }

  if (from && to && errors.length === 0) {
    const map = new Map();
    const list = Array.isArray(allItems) ? allItems : [];
    for (const entry of list) {
      const fields = redirectFields(entry);
      if (fields.from && fields.to) map.set(fields.from, fields.to);
    }
    // Ensure the item under validation is present in the graph.
    map.set(from, to);

    const seen = new Set();
    let cursor = from;
    let steps = 0;
    while (map.has(cursor) && steps < 50) {
      if (seen.has(cursor)) {
        errors.push('Redirect loop detected');
        break;
      }
      seen.add(cursor);
      cursor = map.get(cursor);
      steps += 1;
    }

    if (steps >= 50) {
      errors.push('Redirect chain is too long');
    } else if (steps > 3) {
      warnings.push(`Long redirect chain (${steps} hops)`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    from,
    to,
  };
}
