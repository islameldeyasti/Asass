# Operations workspace

The `/admin/ops` workspace provides a delivery overview, employee and department registers, searchable organization structure, client/project relationships, project health and card views, a structured workflow editor, and task creation with Kanban/list views.

## Delivery rules

- Project health uses planned completion dates and project status. It does not claim earned-value, profitability, or schedule performance calculations. Office calendar dates use Asia/Dubai.
- Workflow templates preserve stage IDs when reordered. Applying a template copies ownership, required deliverables, and approval requirements into the project. Existing projects are not silently migrated.
- A stage marked as requiring approval needs an approved stage review before completion. Choose the stage in the project's Approvals tab. Required deliverables are recorded as instructions; automatic document-completeness enforcement is not implemented.
- Workflow replacement is rejected when stages have started or have linked tasks, documents, or approvals.
- Reviews are sequential. Decisions require the assigned reviewer or a super administrator. Submitted request payloads cannot pre-approve steps, and decided requests cannot be rewritten.
- Employee codes, employee emails, client codes and project codes are checked for duplicates. Reporting and task dependency cycles are rejected. Task dependencies and stage assignments must be within the project.
- Project deletion is blocked when delivery records exist. Employee/client/department deletion includes reference guards; these are not a complete database foreign-key system.

## Persistence and deployment boundary

Runtime operations data lives in `.data/ops`. `content/ops` is a read-only seed fallback. Writes use a temporary file and atomic rename. Read corruption and write failure return errors rather than falsely reporting success. API mutations are serialized within one Node process.

This is still a local file-backed application. Before multi-instance or production company-wide deployment, migrate operations records to a transactional database with foreign keys and migrations, implement tested backup/restore and concurrency control across instances, and validate role/project-level access policies, authentication, and retention requirements. An ephemeral or read-only deployment cannot persist operations changes. No ISO certification or vendor accreditation is claimed.

## Verification

Run `node scripts/test-ops.mjs` for isolated domain and persistence checks. The script copies modules into a temporary directory and never modifies business records. Run targeted ESLint and `npm run build` to validate the application. Browser sign-in is required for authenticated visual/interaction QA.

## Functional references

- Deltek Vantagepoint: https://www.deltek.com/products/erp/vantagepoint/
- Autodesk review workflow: https://help.autodesk.com/cloudhelp/ENU/BIM360D-Document-Management/files/About-Reviews/GUID-C9632B31-2B76-4F3F-B883-45C38C29C280.html

These informed feature priorities; the implementation is independent and is not a certified integration with either product.
