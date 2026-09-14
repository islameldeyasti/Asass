import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {PERMS} from '@/lib/cms/permissions';
import {seoChecklist} from '@/lib/cms/seo/model';
import {
  auditPageSeo,
  ensurePageSeoSeeded,
  getAllPageSeo,
} from '@/lib/cms/seo/page-seo-store';
import {listSeoTargets} from '@/lib/cms/seo/registry';

export const runtime = 'nodejs';

function errorResponse(error) {
  const status = error.status || 500;
  return NextResponse.json({error: error.message || 'Request failed'}, {status});
}

function buildSummary(issues, targets, entries) {
  const missingTitle = new Set();
  const missingDescription = new Set();
  let noindex = 0;
  let withOg = 0;
  let scoreTotal = 0;

  for (const target of targets) {
    const entry = entries?.[target.key] || target;
    const checklist = seoChecklist(entry);
    scoreTotal += checklist.score;
    if (entry.robotsIndex === false) noindex += 1;
    if (String(entry.ogImage || '').trim()) withOg += 1;
  }

  for (const issue of issues) {
    if (/missing title/i.test(issue.issue || '')) missingTitle.add(`${issue.key}:${issue.locale}`);
    if (/missing meta description/i.test(issue.issue || '')) {
      missingDescription.add(`${issue.key}:${issue.locale}`);
    }
  }

  const total = targets.length || 1;
  return {
    total: targets.length,
    issues: issues.length,
    withIssues: new Set(issues.map((item) => item.key)).size,
    missingTitle: missingTitle.size,
    missingDescription: missingDescription.size,
    noindex,
    withOg,
    avgScore: Math.round((scoreTotal / total) * 10) / 10,
    maxScore: seoChecklist({}).max,
  };
}

export async function GET() {
  try {
    await requireAdmin(PERMS.SEO_READ);
    await ensurePageSeoSeeded();
    const [issues, store, targets] = await Promise.all([
      auditPageSeo(),
      getAllPageSeo(),
      listSeoTargets(),
    ]);
    const list = Array.isArray(issues) ? issues : issues?.issues || [];
    const summary = buildSummary(list, targets, store.entries || {});
    return NextResponse.json({
      issues: list,
      summary,
      total: summary.total,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
