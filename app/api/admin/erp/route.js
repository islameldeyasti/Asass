import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {permissionsForRole} from '@/lib/cms/permissions';
import {listDocuments,lookupData,saveDocument,actOnDocument,companySettings,updateSettings,auditTrail,authorize} from '@/lib/erp/engine';
import {financialReports,overview} from '@/lib/erp/reports';
import {settings,database,audit} from '@/lib/erp/database';
import {backup} from 'node:sqlite';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function actor(){const session=await requireAdmin();return {id:session.user.id,role:session.role,permissions:permissionsForRole(session.role)};}
function errorResponse(error){console.error('[ERP]',error.message);return NextResponse.json({error:error.status?error.message:'The operation failed. No financial changes were committed.'},{status:error.status||500});}
export async function GET(request){
  try{
    const user=await actor();const params=new URL(request.url).searchParams;const moduleKey=params.get('module');
    if(moduleKey==='settings')return NextResponse.json(companySettings(user));
    if(moduleKey==='reports')return NextResponse.json(financialReports(user,params.get('from')||undefined,params.get('to')||undefined));
    if(moduleKey==='audit')return NextResponse.json({items:auditTrail(user)});
    if(moduleKey==='overview')return NextResponse.json(overview(user));
    if(moduleKey==='backup'){
      authorize(user,'erp.settings');const temp=await mkdtemp(path.join(os.tmpdir(),'asas-erp-backup-'));
      try{audit(database(),user,'backup',null);const file=path.join(temp,'erp.sqlite');await backup(database(),file);const bytes=await readFile(file);return new Response(bytes,{headers:{'Content-Type':'application/vnd.sqlite3','Content-Disposition':`attachment; filename="asas-erp-${new Date().toISOString().slice(0,10)}.sqlite"`,'Cache-Control':'no-store'}});}finally{await rm(temp,{recursive:true,force:true});}
    }
    return NextResponse.json({items:listDocuments(moduleKey,user),lookups:lookupData(moduleKey,user),currency:settings().currency,defaultTaxRate:settings().defaultTaxRate});
  }catch(error){return errorResponse(error);}
}
export async function POST(request){
  try{
    const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Cross-origin requests are not allowed'},{status:403});
    const user=await actor();let body;try{body=await request.json();}catch{return NextResponse.json({error:'Invalid request body'},{status:400});}
    if(body.module==='settings')return NextResponse.json({settings:updateSettings(body.document||{},user)});
    const document=body.action?actOnDocument(body.module,body.id,body.action,body.document||{},user):saveDocument(body.module,body.document||{},user);
    return NextResponse.json({document});
  }catch(error){return errorResponse(error);}
}
