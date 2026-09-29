import {withOpsMutation} from '@/lib/ops/store';
import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {PERMS, hasPermission} from '@/lib/cms/permissions';
import {writeAudit} from '@/lib/cms/audit';
import {notifyStaff, sendMail} from '@/lib/cms/mail';
import {deleteClient, listClients, saveClient} from '@/lib/ops/clients';
import {
  deleteDepartment,
  listDepartments,
  saveDepartment,
} from '@/lib/ops/departments';
import {
  deleteEmployee,
  getEmployeeByCmsUserId,
  getOrgChart,
  listEmployees,
  saveEmployee,
} from '@/lib/ops/employees';
import {
  deleteProject,
  deleteProjectMember,
  getProject360,
  listProjectMembers,
  listProjects,
  saveProject,
  saveProjectMember,
} from '@/lib/ops/projects';
import {
  applyStageTemplateToProject,
  deleteProjectStage,
  deleteStageTemplate,
  listProjectStages,
  listStageTemplates,
  saveProjectStage,
  saveStageTemplate,
} from '@/lib/ops/stages';
import {
  deleteTask,
  enrichTasks,
  getMyTasksBoard,
  listTasks,
  saveTask,
  updateTaskStatus,
} from '@/lib/ops/tasks';
import {
  addDocumentRevision,
  deleteDocument,
  listDocuments,
  saveDocument,
} from '@/lib/ops/documents';
import {
  decideApprovalStep,
  getApproval,
  deleteApproval,
  listApprovals,
  saveApproval,
} from '@/lib/ops/approvals';
import {
  createTasksFromMeetingActions,
  deleteMeeting,
  listMeetings,
  saveMeeting,
} from '@/lib/ops/meetings';
import {deleteComment, listComments, saveComment, threadComments} from '@/lib/ops/comments';
import {
  decideLeaveRequest,
  deleteLeaveRequest,
  leaveBalanceSummary,
  listLeaveRequests,
  saveLeaveRequest,
} from '@/lib/ops/leave';
import {
  deleteAttendance,
  listAttendance,
  saveAttendance,
  summarizeAttendance,
} from '@/lib/ops/attendance';
import {getWorkloadBoard} from '@/lib/ops/workload';
import {
  createNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notifyEmployees,
} from '@/lib/ops/notifications';
import {getOpsInsights, listOpsAudit} from '@/lib/ops/insights';
import {buildOpsReport, OPS_REPORT_TYPES} from '@/lib/ops/reports';

export const dynamic = 'force-dynamic';

function errorResponse(err) {
  const status = err.status || 500;
  return NextResponse.json({error: err.message || 'Request failed'}, {status});
}

async function audit(session, action, entity, entityId) {
  await writeAudit({
    actorId: session.user?.id,
    actorEmail: session.user?.email,
    action,
    entity,
    entityId,
  });
}

export async function GET(request) {
  try {
    const session = await requireAdmin(PERMS.OPS_VIEW);
    const {searchParams} = new URL(request.url);
    const resource = searchParams.get('resource') || 'overview';

    if (resource === 'departments') {
      await requireAdmin(PERMS.OPS_DEPARTMENTS_READ);
      return NextResponse.json({
        items: await listDepartments({includeInactive: searchParams.get('inactive') !== '0'}),
      });
    }

    if (resource === 'employees') {
      await requireAdmin(PERMS.OPS_EMPLOYEES_READ);
      return NextResponse.json({
        items: await listEmployees({
          status: searchParams.get('status') || null,
          departmentId: searchParams.get('departmentId') || null,
        }),
      });
    }

    if (resource === 'org-chart') {
      await requireAdmin(PERMS.OPS_EMPLOYEES_READ);
      return NextResponse.json(await getOrgChart());
    }

    if (resource === 'clients') {
      await requireAdmin(PERMS.OPS_CLIENTS_READ);
      return NextResponse.json({
        items: await listClients({includeInactive: searchParams.get('inactive') !== '0'}),
      });
    }

    if (resource === 'projects') {
      await requireAdmin(PERMS.OPS_PROJECTS_READ);
      return NextResponse.json({
        items: await listProjects({
          status: searchParams.get('status') || null,
          clientId: searchParams.get('clientId') || null,
        }),
      });
    }

    if (resource === 'project') {
      await requireAdmin(PERMS.OPS_PROJECTS_READ);
      const data = await getProject360(searchParams.get('id'));
      if (!data) return NextResponse.json({error: 'Project not found'}, {status: 404});
      return NextResponse.json(data);
    }

    if (resource === 'project-members') {
      await requireAdmin(PERMS.OPS_PROJECTS_READ);
      return NextResponse.json({
        items: await listProjectMembers({
          projectId: searchParams.get('projectId') || null,
          employeeId: searchParams.get('employeeId') || null,
        }),
      });
    }

    if (resource === 'stage-templates') {
      await requireAdmin(PERMS.OPS_PROJECTS_READ);
      return NextResponse.json({
        items: await listStageTemplates({includeInactive: searchParams.get('inactive') !== '0'}),
      });
    }

    if (resource === 'project-stages') {
      await requireAdmin(PERMS.OPS_PROJECTS_READ);
      const projectId = searchParams.get('projectId');
      return NextResponse.json({items: await listProjectStages(projectId)});
    }

    if (resource === 'tasks') {
      await requireAdmin(PERMS.OPS_TASKS_READ);
      const items = await listTasks({
        projectId: searchParams.get('projectId') || null,
        stageId: searchParams.get('stageId') || null,
        status: searchParams.get('status') || null,
        assigneeId: searchParams.get('assigneeId') || null,
      });
      const [projects, employees] = await Promise.all([listProjects(), listEmployees()]);
      const stages = searchParams.get('projectId')
        ? await listProjectStages(searchParams.get('projectId'))
        : [];
      return NextResponse.json({
        items: enrichTasks(items, {projects, stages, employees}),
      });
    }

    if (resource === 'my-tasks') {
      await requireAdmin(PERMS.OPS_TASKS_READ);
      let assigneeId = searchParams.get('assigneeId') || null;
      if (!assigneeId && searchParams.get('scope') !== 'all' && session.user?.id) {
        const me = await getEmployeeByCmsUserId(session.user.id);
        assigneeId = me?.id || null;
      }
      const board = await getMyTasksBoard({
        assigneeId,
        projectId: searchParams.get('projectId') || null,
      });
      const [projects, employees] = await Promise.all([listProjects(), listEmployees()]);
      const enrichBucket = (list) => enrichTasks(list, {projects, employees});
      return NextResponse.json({
        ...board,
        assigneeId,
        buckets: Object.fromEntries(
          Object.entries(board.buckets).map(([key, list]) => [key, enrichBucket(list)]),
        ),
        kanban: Object.fromEntries(
          Object.entries(board.kanban).map(([key, list]) => [key, enrichBucket(list)]),
        ),
      });
    }

    if (resource === 'documents') {
      await requireAdmin(PERMS.OPS_DOCS_READ);
      return NextResponse.json({
        items: await listDocuments({
          projectId: searchParams.get('projectId') || null,
          stageId: searchParams.get('stageId') || null,
          taskId: searchParams.get('taskId') || null,
          status: searchParams.get('status') || null,
        }),
      });
    }

    if (resource === 'approvals') {
      await requireAdmin(PERMS.OPS_APPROVALS_READ);
      let approverEmployeeId = searchParams.get('approverEmployeeId') || null;
      if (searchParams.get('mine') === '1' && session.user?.id) {
        const me = await getEmployeeByCmsUserId(session.user.id);
        approverEmployeeId = me?.id || null;
      }
      return NextResponse.json({
        items: await listApprovals({
          projectId: searchParams.get('projectId') || null,
          status: searchParams.get('status') || null,
          approverEmployeeId,
        }),
      });
    }

    if (resource === 'meetings') {
      await requireAdmin(PERMS.OPS_MEETINGS_READ);
      return NextResponse.json({
        items: await listMeetings({
          projectId: searchParams.get('projectId') || null,
        }),
      });
    }

    if (resource === 'comments') {
      await requireAdmin(PERMS.OPS_PROJECTS_READ);
      const items = await listComments({
        projectId: searchParams.get('projectId') || null,
        subjectType: searchParams.get('subjectType') || null,
        subjectId: searchParams.get('subjectId') || null,
      });
      return NextResponse.json({
        items,
        threads: threadComments(items),
      });
    }

    if (resource === 'leave-requests') {
      const isHr = hasPermission(session.role, PERMS.OPS_HR_READ);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      let employeeId = searchParams.get('employeeId') || null;
      if (!isHr) {
        if (!me?.id) {
          return NextResponse.json({error: 'Link your CMS user to an employee profile to view leave'}, {status: 403});
        }
        employeeId = me.id;
      }
      const items = await listLeaveRequests({
        employeeId,
        status: searchParams.get('status') || null,
        leaveType: searchParams.get('leaveType') || null,
      });
      return NextResponse.json({
        items,
        balances: leaveBalanceSummary(items, isHr ? employeeId : me.id),
        meEmployeeId: me?.id || null,
        isHr,
      });
    }

    if (resource === 'attendance') {
      await requireAdmin(PERMS.OPS_HR_READ);
      const items = await listAttendance({
        employeeId: searchParams.get('employeeId') || null,
        date: searchParams.get('date') || null,
        from: searchParams.get('from') || null,
        to: searchParams.get('to') || null,
        type: searchParams.get('type') || null,
      });
      return NextResponse.json({
        items,
        summary: summarizeAttendance(items),
      });
    }

    if (resource === 'workload') {
      const canHr = hasPermission(session.role, PERMS.OPS_HR_READ);
      const canEmployees = hasPermission(session.role, PERMS.OPS_EMPLOYEES_READ);
      const canProjects = hasPermission(session.role, PERMS.OPS_PROJECTS_READ);
      if (!canHr && !canEmployees && !canProjects) {
        return NextResponse.json({error: 'Forbidden'}, {status: 403});
      }
      const board = await getWorkloadBoard({
        departmentId: searchParams.get('departmentId') || null,
      });
      return NextResponse.json(board);
    }

    if (resource === 'insights') {
      await requireAdmin(PERMS.OPS_VIEW);
      const canHr = hasPermission(session.role, PERMS.OPS_HR_READ);
      return NextResponse.json(await getOpsInsights({canHr}));
    }

    if (resource === 'notifications') {
      await requireAdmin(PERMS.OPS_VIEW);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const items = await listNotifications({
        userId: session.user?.id || null,
        unreadOnly: searchParams.get('unread') === '1',
        limit: Number(searchParams.get('limit') || 100),
      });
      // Also include employee-targeted notifications without userId yet
      const byEmployee =
        me?.id && !searchParams.get('userOnly')
          ? await listNotifications({employeeId: me.id, unreadOnly: searchParams.get('unread') === '1'})
          : [];
      const merged = Object.values(
        Object.fromEntries([...items, ...byEmployee].map((n) => [n.id, n])),
      ).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      return NextResponse.json({
        items: merged,
        unread: merged.filter((n) => !n.readAt).length,
        meEmployeeId: me?.id || null,
      });
    }

    if (resource === 'audit') {
      await requireAdmin(PERMS.OPS_REPORTS);
      return NextResponse.json({
        items: await listOpsAudit({
          q: searchParams.get('q') || '',
          limit: Number(searchParams.get('limit') || 100),
        }),
      });
    }

    if (resource === 'report') {
      await requireAdmin(PERMS.OPS_REPORTS);
      const type = searchParams.get('type') || 'projects';
      const meta = OPS_REPORT_TYPES.find((t) => t.value === type);
      if (!meta) return NextResponse.json({error: 'Unknown report type'}, {status: 400});
      if (meta.needsHr && !hasPermission(session.role, PERMS.OPS_HR_READ)) {
        return NextResponse.json({error: 'HR permission required for this report'}, {status: 403});
      }
      const report = await buildOpsReport(type);
      if (searchParams.get('format') === 'csv') {
        return new NextResponse(report.csv, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${report.filename}"`,
          },
        });
      }
      return NextResponse.json({
        types: OPS_REPORT_TYPES,
        type,
        filename: report.filename,
        count: report.count,
        preview: report.csv.split('\n').slice(0, 6).join('\n'),
      });
    }

    if (resource === 'report-types') {
      await requireAdmin(PERMS.OPS_REPORTS);
      const canHr = hasPermission(session.role, PERMS.OPS_HR_READ);
      return NextResponse.json({
        items: OPS_REPORT_TYPES.filter((t) => canHr || !t.needsHr),
      });
    }

    const [departments, employees, clients, projects, tasks, documents, approvals, meetings, leavePending] =
      await Promise.all([
        listDepartments({includeInactive: false}),
        listEmployees(),
        listClients({includeInactive: false}),
        listProjects(),
        listTasks(),
        listDocuments(),
        listApprovals(),
        listMeetings(),
        listLeaveRequests({status: 'pending'}),
      ]);
    return NextResponse.json({
      overview: {
        departments: departments.length,
        employees: employees.length,
        activeEmployees: employees.filter((e) => e.status === 'active').length,
        onLeave: employees.filter((e) => e.status === 'on_leave').length,
        clients: clients.length,
        projects: projects.length,
        activeProjects: projects.filter((p) => p.status === 'active').length,
        openTasks: tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length,
        overdueTasks: tasks.filter(
          (t) =>
            t.dueDate &&
            t.dueDate < new Date().toISOString().slice(0, 10) &&
            t.status !== 'completed' &&
            t.status !== 'cancelled',
        ).length,
        documents: documents.length,
        meetings: meetings.length,
        pendingApprovals: approvals.filter((a) => a.status === 'pending').length,
        pendingLeave: leavePending.length,
      },
      sessionUser: session.user,
    });
  } catch (err) {
    return errorResponse(err);
  }
}

async function putOperation(request) {
  try {
    const body = await request.json();
    const resource = body.resource;
    const document = body.document || {};

    if (resource === 'departments') {
      const session = await requireAdmin(PERMS.OPS_DEPARTMENTS_WRITE);
      const saved = await saveDepartment(document);
      await audit(session, document.id ? 'ops.department.update' : 'ops.department.create', 'ops_department', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'employees') {
      const session = await requireAdmin(PERMS.OPS_EMPLOYEES_WRITE);
      const saved = await saveEmployee(document);
      await audit(session, document.id ? 'ops.employee.update' : 'ops.employee.create', 'ops_employee', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'clients') {
      const session = await requireAdmin(PERMS.OPS_CLIENTS_WRITE);
      const saved = await saveClient(document);
      await audit(session, document.id ? 'ops.client.update' : 'ops.client.create', 'ops_client', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'projects') {
      const session = await requireAdmin(PERMS.OPS_PROJECTS_WRITE);
      const saved = await saveProject(document);
      await audit(session, document.id ? 'ops.project.update' : 'ops.project.create', 'ops_project', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'project-members') {
      const session = await requireAdmin(PERMS.OPS_PROJECTS_WRITE);
      const saved = await saveProjectMember(document);
      await audit(session, document.id ? 'ops.project_member.update' : 'ops.project_member.create', 'ops_project_member', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'stage-templates') {
      const session = await requireAdmin(PERMS.OPS_PROJECTS_WRITE);
      const saved = await saveStageTemplate(document);
      await audit(session, document.id ? 'ops.stage_template.update' : 'ops.stage_template.create', 'ops_stage_template', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'project-stages') {
      const session = await requireAdmin(PERMS.OPS_PROJECTS_WRITE);
      const saved = await saveProjectStage(document);
      await audit(session, document.id ? 'ops.project_stage.update' : 'ops.project_stage.create', 'ops_project_stage', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'apply-stages') {
      const session = await requireAdmin(PERMS.OPS_PROJECTS_WRITE);
      const stages = await applyStageTemplateToProject(document.projectId, document.templateId || null, {
        force: Boolean(document.force),
      });
      await audit(session, 'ops.project_stages.apply', 'ops_project', document.projectId);
      return NextResponse.json({items: stages});
    }

    if (resource === 'tasks') {
      const session = await requireAdmin(PERMS.OPS_TASKS_WRITE);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const saved = await saveTask({
        ...document,
        createdByUserId: document.createdByUserId || session.user?.id || null,
        createdByEmployeeId: document.createdByEmployeeId || me?.id || null,
      });
      await audit(session, document.id ? 'ops.task.update' : 'ops.task.create', 'ops_task', saved.id);
      if (!document.id && (saved.assigneeIds || []).length) {
        const employees = await listEmployees();
        await notifyEmployees(
          saved.assigneeIds,
          {
            title: 'New task assigned',
            body: saved.title,
            href: saved.projectId ? `/admin/ops/projects/${saved.projectId}` : '/admin/ops/tasks',
            type: 'task',
          },
          employees,
        );
      }
      return NextResponse.json({document: saved});
    }

    if (resource === 'task-status') {
      const session = await requireAdmin(PERMS.OPS_TASKS_WRITE);
      const saved = await updateTaskStatus(document.id, document.status);
      await audit(session, 'ops.task.status', 'ops_task', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'documents') {
      const session = await requireAdmin(PERMS.OPS_DOCS_WRITE);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const saved = await saveDocument({
        ...document,
        uploadedByUserId: document.uploadedByUserId || session.user?.id || null,
        uploadedByEmployeeId: document.uploadedByEmployeeId || me?.id || null,
      });
      await audit(session, document.id ? 'ops.document.update' : 'ops.document.create', 'ops_document', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'document-revision') {
      const session = await requireAdmin(PERMS.OPS_DOCS_WRITE);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const saved = await addDocumentRevision(document.documentId, {
        ...document,
        uploadedByUserId: session.user?.id || null,
        uploadedByEmployeeId: me?.id || null,
      });
      await audit(session, 'ops.document.revision', 'ops_document', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'approvals') {
      const session = await requireAdmin(PERMS.OPS_APPROVALS_WRITE);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const saved = await saveApproval({
        ...document,
        requestedByUserId: document.requestedByUserId || session.user?.id || null,
        requestedByEmployeeId: document.requestedByEmployeeId || me?.id || null,
      });
      await audit(session, document.id ? 'ops.approval.update' : 'ops.approval.create', 'ops_approval', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'approval-decide') {
      const session = await requireAdmin(PERMS.OPS_APPROVALS_WRITE);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const approval = await getApproval(document.approvalId);
      const step = approval?.steps.find(s=>s.id===document.stepId);
      if (session.role !== 'super_admin' && (!me || step?.approverEmployeeId !== me.id)) {
        return NextResponse.json({error:'Only the assigned reviewer can make this decision'}, {status:403});
      }
      const saved = await decideApprovalStep(document.approvalId, document.stepId, {
        status: document.status,
        comment: document.comment,
        decision: document.decision,
      });
      await audit(session, 'ops.approval.decide', 'ops_approval', saved.id);
      await notifyStaff(`Approval ${saved.status}`, `${saved.title} · ${saved.status}`);
      if (saved.requestedByUserId || saved.requestedByEmployeeId) {
        await createNotification({
          userId: saved.requestedByUserId || null,
          employeeId: saved.requestedByEmployeeId || null,
          title: `Approval ${saved.status}`,
          body: saved.title,
          href: saved.projectId ? `/admin/ops/projects/${saved.projectId}` : '/admin/ops/approvals',
          type: 'approval',
        });
      }
      return NextResponse.json({document: saved});
    }

    if (resource === 'meetings') {
      const session = await requireAdmin(PERMS.OPS_MEETINGS_WRITE);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const saved = await saveMeeting({
        ...document,
        organizerEmployeeId: document.organizerEmployeeId || me?.id || null,
      });
      await audit(session, document.id ? 'ops.meeting.update' : 'ops.meeting.create', 'ops_meeting', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'meeting-tasks') {
      const session = await requireAdmin(PERMS.OPS_MEETINGS_WRITE);
      await requireAdmin(PERMS.OPS_TASKS_WRITE);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const result = await createTasksFromMeetingActions(document.meetingId, {
        createdByUserId: session.user?.id || null,
        createdByEmployeeId: me?.id || null,
      });
      await audit(session, 'ops.meeting.tasks', 'ops_meeting', document.meetingId);
      return NextResponse.json(result);
    }

    if (resource === 'comments') {
      const session = await requireAdmin(PERMS.OPS_PROJECTS_WRITE);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const saved = await saveComment({
        ...document,
        authorUserId: document.authorUserId || session.user?.id || null,
        authorEmployeeId: document.authorEmployeeId || me?.id || null,
      });
      await audit(session, document.id ? 'ops.comment.update' : 'ops.comment.create', 'ops_comment', saved.id);
      if ((saved.mentionKeys || []).length) {
        const employees = await listEmployees();
        const mentioned = employees.filter((e) => {
          const keys = [
            e.email?.split('@')[0],
            e.fullNameEn?.split(/\s+/)[0],
            e.employeeCode,
          ]
            .filter(Boolean)
            .map((k) => String(k).toLowerCase());
          return saved.mentionKeys.some((m) => keys.includes(String(m).toLowerCase()));
        });
        await notifyEmployees(
          mentioned.map((e) => e.id),
          {
            title: 'You were mentioned',
            body: saved.body.slice(0, 140),
            href: saved.projectId ? `/admin/ops/projects/${saved.projectId}` : '/admin/ops',
            type: 'mention',
          },
          employees,
        );
      }
      return NextResponse.json({document: saved});
    }

    if (resource === 'leave-requests') {
      const session = await requireAdmin(PERMS.OPS_VIEW);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const isHr = hasPermission(session.role, PERMS.OPS_HR_WRITE);
      let employeeId = document.employeeId || null;
      if (!isHr) {
        if (!me?.id) {
          return NextResponse.json({error: 'Link your CMS user to an employee profile to request leave'}, {status: 403});
        }
        employeeId = me.id;
        if (document.id && document.status && !['pending', 'cancelled'].includes(document.status)) {
          return NextResponse.json({error: 'Forbidden'}, {status: 403});
        }
      }
      const saved = await saveLeaveRequest({
        ...document,
        employeeId,
        status: document.id ? document.status || undefined : 'pending',
        requestedByUserId: document.requestedByUserId || session.user?.id || null,
      });
      await audit(session, document.id ? 'ops.leave.update' : 'ops.leave.create', 'ops_leave', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'leave-decide') {
      const session = await requireAdmin(PERMS.OPS_HR_WRITE);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const saved = await decideLeaveRequest(document.id, {
        status: document.status,
        decisionNote: document.decisionNote,
        decidedByEmployeeId: me?.id || null,
        decidedByUserId: session.user?.id || null,
      });
      await audit(session, 'ops.leave.decide', 'ops_leave', saved.id);
      const employee = (await listEmployees()).find((item) => item.id === saved.employeeId);
      if (employee?.email) {
        await sendMail({
          to: employee.email,
          subject: `Leave ${saved.status}`,
          text: `${saved.leaveType} · ${saved.startDate} → ${saved.endDate}`,
        });
      }
      const employees = await listEmployees();
      await notifyEmployees(
        [saved.employeeId],
        {
          title: `Leave ${saved.status}`,
          body: `${saved.leaveType} · ${saved.startDate} → ${saved.endDate}`,
          href: '/admin/ops/leave',
          type: 'leave',
        },
        employees,
      );
      return NextResponse.json({document: saved});
    }

    if (resource === 'attendance') {
      const session = await requireAdmin(PERMS.OPS_HR_WRITE);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const saved = await saveAttendance({
        ...document,
        recordedByUserId: session.user?.id || null,
        recordedByEmployeeId: me?.id || null,
      });
      await audit(session, document.id ? 'ops.attendance.update' : 'ops.attendance.create', 'ops_attendance', saved.id);
      return NextResponse.json({document: saved});
    }

    if (resource === 'notification-read') {
      const session = await requireAdmin(PERMS.OPS_VIEW);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const saved = await markNotificationRead(document.id, {
        userId: session.user?.id || null,
        employeeId: me?.id || null,
      });
      return NextResponse.json({document: saved});
    }

    if (resource === 'notifications-read-all') {
      const session = await requireAdmin(PERMS.OPS_VIEW);
      const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
      const result = await markAllNotificationsRead({
        userId: session.user?.id || null,
        employeeId: me?.id || null,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({error: 'Unknown resource'}, {status: 400});
  } catch (err) {
    return errorResponse(err);
  }
}

async function deleteOperation(request) {
  try {
    const {searchParams} = new URL(request.url);
    const resource = searchParams.get('resource');
    const id = searchParams.get('id');
    if (!resource || !id) {
      return NextResponse.json({error: 'resource and id required'}, {status: 400});
    }

    const map = {
      departments: [PERMS.OPS_DEPARTMENTS_WRITE, deleteDepartment, 'ops_department', 'ops.department.delete'],
      employees: [PERMS.OPS_EMPLOYEES_WRITE, deleteEmployee, 'ops_employee', 'ops.employee.delete'],
      clients: [PERMS.OPS_CLIENTS_WRITE, deleteClient, 'ops_client', 'ops.client.delete'],
      projects: [PERMS.OPS_PROJECTS_WRITE, deleteProject, 'ops_project', 'ops.project.delete'],
      'project-members': [PERMS.OPS_PROJECTS_WRITE, deleteProjectMember, 'ops_project_member', 'ops.project_member.delete'],
      'stage-templates': [PERMS.OPS_PROJECTS_WRITE, deleteStageTemplate, 'ops_stage_template', 'ops.stage_template.delete'],
      'project-stages': [PERMS.OPS_PROJECTS_WRITE, deleteProjectStage, 'ops_project_stage', 'ops.project_stage.delete'],
      tasks: [PERMS.OPS_TASKS_WRITE, deleteTask, 'ops_task', 'ops.task.delete'],
      documents: [PERMS.OPS_DOCS_WRITE, deleteDocument, 'ops_document', 'ops.document.delete'],
      approvals: [PERMS.OPS_APPROVALS_WRITE, deleteApproval, 'ops_approval', 'ops.approval.delete'],
      meetings: [PERMS.OPS_MEETINGS_WRITE, deleteMeeting, 'ops_meeting', 'ops.meeting.delete'],
      comments: [PERMS.OPS_PROJECTS_WRITE, deleteComment, 'ops_comment', 'ops.comment.delete'],
      'leave-requests': [PERMS.OPS_HR_WRITE, deleteLeaveRequest, 'ops_leave', 'ops.leave.delete'],
      attendance: [PERMS.OPS_HR_WRITE, deleteAttendance, 'ops_attendance', 'ops.attendance.delete'],
    };

    const entry = map[resource];
    if (!entry) return NextResponse.json({error: 'Unknown resource'}, {status: 400});
    const [perm, fn, entity, action] = entry;
    const session = await requireAdmin(perm);
    await fn(id);
    await audit(session, action, entity, id);
    return NextResponse.json({ok: true});
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(request) { return withOpsMutation(() => putOperation(request)); }
export async function DELETE(request) { return withOpsMutation(() => deleteOperation(request)); }
