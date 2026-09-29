export function officeToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit'}).format(now);
}
export function projectHealth(project, today = officeToday()) {
  if (project.status === 'completed') return {label: 'Completed', tone: 'good'};
  if (project.status === 'cancelled') return {label: 'Cancelled', tone: 'neutral'};
  if (project.status === 'on_hold') return {label: 'On hold', tone: 'warning'};
  if (!project.plannedEndDate) return {label: 'No baseline', tone: 'neutral'};
  if (project.plannedEndDate < today) return {label: 'Overdue', tone: 'danger'};
  return {label: 'Within due date', tone: 'good'};
}
export function exportOpsCsv(filename, columns, rows) {
  const escape = (value) => {
    let text = String(value ?? '');
    if (/^[\s]*[=+@\-]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const csv = [columns.map((c) => escape(c.label)).join(','), ...rows.map((row) => columns.map((c) => escape(row[c.key])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], {type: 'text/csv;charset=utf-8;'}));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
