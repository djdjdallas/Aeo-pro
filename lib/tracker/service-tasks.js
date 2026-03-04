// lib/tracker/service-tasks.js
// Service delivery task templates and helpers

import { createServerClient } from "@/lib/supabase";

/**
 * Task templates by plan tier.
 * Each template defines the deliverables created when a client is onboarded.
 */
export const TASK_TEMPLATES = {
  starter: [
    { task_type: "schema_optimization", title: "Implement JSON-LD schema markup", description: "Add LocalBusiness/Organization schema, FAQ schema, and Review schema to the client's website." },
    { task_type: "llms_txt", title: "Create and deploy llms.txt", description: "Create an llms.txt file with business information, credentials, and service areas. Deploy to the root domain." },
    { task_type: "citation_submission", title: "Submit 20 citation listings", description: "Submit business to 20 AI-relevant citation sources: directories, review platforms, and data aggregators." },
  ],
  growth: [
    { task_type: "schema_optimization", title: "Implement JSON-LD schema markup", description: "Add LocalBusiness/Organization schema, FAQ schema, and Review schema to the client's website." },
    { task_type: "llms_txt", title: "Create and deploy llms.txt", description: "Create an llms.txt file with business information, credentials, and service areas. Deploy to the root domain." },
    { task_type: "citation_submission", title: "Submit 20 citation listings", description: "Submit business to 20 AI-relevant citation sources: directories, review platforms, and data aggregators." },
    { task_type: "article_placement", title: "Place 'Best X for Y' article", description: "Research top-ranking comparison articles for the client's category. Pitch and place the client in 2-3 high-authority 'Best [Type] in [Location]' articles. Articles carry 41% of AI recommendation weight." },
    { task_type: "reddit_authority", title: "Build Reddit authority", description: "Identify relevant subreddits. Create organic recommendation threads and comments mentioning the client. Reddit is cited in 46.7% of AI responses." },
    { task_type: "article_placement", title: "Wikipedia citation strategy", description: "Research Wikipedia articles relevant to the client's industry/location. Add or improve citations that reference the client or their domain. Wikipedia has a 3.2x citation multiplier for AI recommendations." },
  ],
  pro: [
    { task_type: "schema_optimization", title: "Implement JSON-LD schema markup", description: "Add LocalBusiness/Organization schema, FAQ schema, and Review schema to the client's website." },
    { task_type: "llms_txt", title: "Create and deploy llms.txt", description: "Create an llms.txt file with business information, credentials, and service areas. Deploy to the root domain." },
    { task_type: "citation_submission", title: "Submit 20 citation listings", description: "Submit business to 20 AI-relevant citation sources: directories, review platforms, and data aggregators." },
    { task_type: "article_placement", title: "Place 'Best X for Y' article", description: "Research top-ranking comparison articles for the client's category. Pitch and place the client in 2-3 high-authority 'Best [Type] in [Location]' articles." },
    { task_type: "reddit_authority", title: "Build Reddit authority", description: "Identify relevant subreddits. Create organic recommendation threads and comments mentioning the client." },
    { task_type: "wikipedia_citation", title: "Wikipedia citation strategy", description: "Research Wikipedia articles relevant to the client's industry/location. Add or improve citations that reference the client or their domain." },
    { task_type: "review_platform", title: "Review platform management", description: "Set up and optimize profiles on Trustpilot, G2, Capterra, and industry-specific review sites. Implement review generation workflow." },
    { task_type: "custom", title: "Competitor share-of-voice monitoring", description: "Set up weekly SOV tracking. Generate competitor analysis reports. Identify gaps and opportunities for overtaking top competitors." },
  ],
};

/**
 * Create service tasks for a client based on their plan.
 */
export async function createTasksForClient(clientId, plan) {
  const supabase = createServerClient();
  const templates = TASK_TEMPLATES[plan] || TASK_TEMPLATES.starter;

  const tasks = templates.map((t) => ({
    client_id: clientId,
    task_type: t.task_type,
    title: t.title,
    description: t.description,
    status: "pending",
  }));

  const { data, error } = await supabase
    .from("service_tasks")
    .insert(tasks)
    .select("id, title, status");

  if (error) throw error;
  return data;
}

/**
 * Get all service tasks for a client.
 */
export async function getTasksForClient(clientId) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("service_tasks")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Update a service task status.
 */
export async function updateTaskStatus(taskId, status) {
  const supabase = createServerClient();

  const update = { status };
  if (status === "completed") {
    update.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("service_tasks")
    .update(update)
    .eq("id", taskId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
