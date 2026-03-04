import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getTasksForClient, createTasksForClient, updateTaskStatus } from "@/lib/tracker/service-tasks";

/**
 * GET /api/tracker/tasks?client_id=xxx — Get all service tasks for a client
 */
export async function GET(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = request.nextUrl.searchParams.get("client_id");
  if (!clientId) {
    return NextResponse.json({ error: "client_id is required" }, { status: 400 });
  }

  try {
    const tasks = await getTasksForClient(clientId);
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("Get tasks error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/tracker/tasks — Create tasks from template or update a task
 * Body: { client_id, plan } to create from template
 *   or: { task_id, status } to update a task
 */
export async function POST(request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Update task status
    if (body.task_id && body.status) {
      const task = await updateTaskStatus(body.task_id, body.status);
      return NextResponse.json({ success: true, task });
    }

    // Create tasks from template
    if (body.client_id && body.plan) {
      const tasks = await createTasksForClient(body.client_id, body.plan);
      return NextResponse.json({ success: true, tasks_created: tasks.length, tasks });
    }

    return NextResponse.json({ error: "Provide client_id+plan or task_id+status" }, { status: 400 });
  } catch (err) {
    console.error("Tasks POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
