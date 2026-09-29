# ASAS ERP — local operating guide

Open `/admin/erp` after signing in with an existing authorized account. ERP shares the CMS session and links to the existing Operations clients, projects and employees. No user passwords or existing role assignments were changed.

## Implemented scope

- Sales opportunities, quotations, approvals and conversion to contracts and draft invoices.
- Vendors, purchase orders, receipt confirmation and conversion to supplier bills.
- Customer invoices, supplier bills, employee expenses, partial receipts and payments.
- Double-entry ledger, manual journals, dated reversals, period closure and bank reconciliation.
- Timesheets with approval and daily-hour checks; project budgets and management cost reporting.
- Payroll batches with gross expense, withholding liability and net pay; fixed assets and monthly straight-line depreciation.
- Trial balance, profit and loss, balance sheet, aging, journal and project reports; CSV exports and printable documents.
- Role authorization, separate maker/reviewer checks (explicit super-admin override), audit history, optimistic locking and idempotent create retries.

Document changes and accounting entries commit in one SQLite transaction. Posted documents cannot be edited; corrections use a dated reversal. Payments are accounting records: they do not transfer money or connect to a bank. Approved timesheet cost is a management estimate shown separately from ledger cost.

## Runtime and storage

Use a current Node runtime supporting `node:sqlite`, including `DatabaseSync` and `backup` (verified with the installed development runtime). Run from `Frontend`:

```sh
npm run dev
npm run test:erp
npm run test:ops
npm run build
```

ERP initializes `.data/erp/company.sqlite` on first access. `ASAS_ERP_DB` can select an absolute persistent database path. SQLite uses WAL, foreign keys and synchronous transactions. Deploy on a persistent Node server with a writable local disk, not an ephemeral serverless filesystem or shared network filesystem. Existing Operations master data remains in `.data/ops` with `content/ops` seed fallback. ERP references prevent deletion of linked clients, projects and employees.

Keep `.data`, database backups and environment files out of public web paths and version control. A complete platform backup must include Operations/CMS runtime data and uploads as well as ERP; the ERP download alone is not a full platform backup.

## Configuration and backup

Set company identity, currency and tax rates in ERP Settings before real transactions. Default tax is zero; no jurisdiction-specific tax or payroll compliance is implied. Currency becomes fixed after the first document. Closing a period blocks dated postings and cannot be undone from this interface.

Download a consistent ERP backup from Settings, or run:

```sh
npm run erp:backup -- /absolute/path/to/new-backup.sqlite
npm run erp:verify-backup -- /absolute/path/to/new-backup.sqlite
```

Verification checks integrity, foreign keys and balanced entries without overwriting live data. For recovery: verify the backup, stop every application process using the database, preserve the current database and its WAL/SHM files separately, then restore the verified database to the configured path without stale WAL/SHM files. Restore matching Operations/CMS data as needed; start the app and reconcile record counts and report balances. No automatic live restore is implemented.

## Verification and deployment boundaries

Automated checks use isolated synthetic company data and do not modify real records. Browser QA uses `node scripts/erp-ui-fixture.mjs`, an isolated synthetic app bound to loopback; it must never be deployed as the authenticated application. The actual API requires the existing admin session and checks server-derived permissions.

This release serves one company and one accounting currency. It is not a certified ERP or a claim of regulatory compliance. Multi-entity consolidation, foreign exchange, inventory/warehouses, automated statutory payroll/WPS, electronic tax filing, bank integrations and external invoice delivery are not implemented. Payroll withholdings are entered explicitly; deduction policy and statutory calculations require separate configuration and implementation. Production rollout requires accountant validation of the chart of accounts and opening balances, company policies, role assignments, backup/restore rehearsal and infrastructure monitoring.
