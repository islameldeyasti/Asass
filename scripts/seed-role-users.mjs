import {fileURLToPath} from 'url';
import {mkdir, readFile, writeFile} from 'fs/promises';
import path from 'path';
import {hash} from 'bcryptjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const seedFile = path.join(root, 'content/cms/users.json');
const dataDir = path.join(root, '.data/cms');
const dataFile = path.join(dataDir, 'users.json');

const DEMO = [
  {email: 'admin@asasengg.ae', name: 'ASAS Super Admin', role: 'super_admin'},
  {email: 'finance@asasengg.ae', name: 'Finance Manager', role: 'finance_manager'},
  {email: 'clerk@asasengg.ae', name: 'Finance Clerk', role: 'finance_clerk'},
  {email: 'sales@asasengg.ae', name: 'Sales Manager', role: 'sales_manager'},
  {email: 'purchase@asasengg.ae', name: 'Purchasing Manager', role: 'purchase_manager'},
  {email: 'payroll@asasengg.ae', name: 'Payroll Manager', role: 'payroll_manager'},
  {email: 'editor@asasengg.ae', name: 'Website Editor', role: 'editor'},
  {email: 'seo@asasengg.ae', name: 'SEO Manager', role: 'seo_manager'},
  {email: 'hr@asasengg.ae', name: 'HR Manager', role: 'hr'},
  {email: 'viewer@asasengg.ae', name: 'Viewer', role: 'viewer'},
];

const passwordHash = await hash('asas-admin', 10);
const now = new Date().toISOString();

let existing = [];
try {
  existing = JSON.parse(await readFile(seedFile, 'utf8'));
} catch {
  existing = [];
}
try {
  const runtime = JSON.parse(await readFile(dataFile, 'utf8'));
  if (Array.isArray(runtime) && runtime.length) existing = runtime;
} catch {
  // no runtime store yet
}

const byEmail = new Map(
  (Array.isArray(existing) ? existing : []).map((user) => [String(user.email || '').toLowerCase(), user]),
);

const users = DEMO.map((demo, index) => {
  const prev = byEmail.get(demo.email);
  return {
    id: prev?.id || `usr_demo_${demo.role}_${String(index).padStart(2, '0')}`,
    email: demo.email,
    name: demo.name,
    role: demo.role,
    passwordHash: prev?.passwordHash || passwordHash,
    active: true,
    createdAt: prev?.createdAt || now,
    updatedAt: now,
    lastLoginAt: prev?.lastLoginAt || null,
  };
});

const payload = `${JSON.stringify(users, null, 2)}\n`;
await writeFile(seedFile, payload, 'utf8');
await mkdir(dataDir, {recursive: true});
await writeFile(dataFile, payload, 'utf8');
console.log(users.map((user) => `${user.email}\t${user.role}`).join('\n'));
