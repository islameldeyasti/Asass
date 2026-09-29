export function payrollWpsRowsFromDocument(run) {
  if (!run) return [];
  return (run.employees || []).map((row) => ({
    employeeId: row.employeeId || row.name || '',
    name: row.name || '',
    routingCode: 'ASAS',
    startDate: run.period ? `${run.period}-01` : run.date,
    endDate: run.date,
    income: ((row.netMinor || row.baseMinor || 0) / 100).toFixed(2),
    hours: '160',
  }));
}
