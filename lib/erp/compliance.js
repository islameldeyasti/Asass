import {database} from './database.js';
import {money} from './money.js';

export function vatSummary(to = new Date().toISOString().slice(0, 10)) {
  const db = database();
  const rows = db
    .prepare(
      `SELECT a.code,a.name,COALESCE(SUM(CASE WHEN e.date<=? THEN l.debit ELSE 0 END),0) debit,
              COALESCE(SUM(CASE WHEN e.date<=? THEN l.credit ELSE 0 END),0) credit
       FROM accounts a
       LEFT JOIN ledger_lines l ON l.account=a.code
       LEFT JOIN ledger e ON e.id=l.entry_id
       WHERE a.code IN ('1200','2200')
       GROUP BY a.code`,
    )
    .all(to, to);
  const input = rows.find((r) => r.code === '1200') || {debit: 0, credit: 0};
  const output = rows.find((r) => r.code === '2200') || {debit: 0, credit: 0};
  const recoverable = input.debit - input.credit;
  const payable = output.credit - output.debit;
  return {
    to,
    inputTax: recoverable,
    outputTax: payable,
    netPayable: payable - recoverable,
  };
}

export function formatMoneyMinor(amount, currency = 'AED') {
  return money(amount, currency);
}
