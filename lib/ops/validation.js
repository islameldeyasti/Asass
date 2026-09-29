export function invalid(message, status = 400) { const error = new Error(message); error.status=status; throw error; }
export function validateDateRange(start, end) {
  for (const value of [start,end].filter(Boolean)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0,10)!==value) invalid('Use a valid calendar date');
  }
  if (start && end && end < start) invalid('The end date cannot be before the start date');
}
export function uniqueValue(items, next, key, label) {
  if (next[key] && items.some(item=>item.id!==next.id && String(item[key]||'').toLowerCase()===String(next[key]).toLowerCase())) invalid(`${label} already exists`,409);
}
export function requireExisting(items, id, label) { if(id&&!items.some(item=>item.id===id)) invalid(`${label} does not exist`); }
