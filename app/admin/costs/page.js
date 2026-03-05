import { createServerClient } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "API Costs — Admin",
  robots: "noindex, nofollow",
};

function formatCost(cost) {
  return `$${Number(cost).toFixed(2)}`;
}

function formatCostSmall(cost) {
  return `$${Number(cost).toFixed(4)}`;
}

export default async function CostsDashboardPage() {
  const supabase = createServerClient();

  // Current month range
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  // Previous month range
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  // Fetch all clients with their plans
  const { data: clients } = await supabase
    .from("tracker_clients")
    .select("id, business_name, plan, subscription_status, monthly_api_budget")
    .order("business_name");

  // Fetch current month costs
  const { data: currentCosts } = await supabase
    .from("api_cost_log")
    .select("client_id, ai_model, estimated_cost, call_type")
    .gte("created_at", monthStart)
    .lte("created_at", monthEnd);

  // Fetch previous month costs
  const { data: prevCosts } = await supabase
    .from("api_cost_log")
    .select("client_id, estimated_cost")
    .gte("created_at", prevMonthStart)
    .lte("created_at", prevMonthEnd);

  // Aggregate costs per client
  const costByClient = {};
  const costByModel = {};
  const costByType = {};
  let totalCurrentCost = 0;

  for (const row of currentCosts || []) {
    const cost = Number(row.estimated_cost) || 0;
    totalCurrentCost += cost;

    if (!costByClient[row.client_id]) costByClient[row.client_id] = { total: 0, byModel: {}, calls: 0 };
    costByClient[row.client_id].total += cost;
    costByClient[row.client_id].calls++;
    costByClient[row.client_id].byModel[row.ai_model] = (costByClient[row.client_id].byModel[row.ai_model] || 0) + cost;

    costByModel[row.ai_model] = (costByModel[row.ai_model] || 0) + cost;
    costByType[row.call_type] = (costByType[row.call_type] || 0) + cost;
  }

  let totalPrevCost = 0;
  for (const row of prevCosts || []) {
    totalPrevCost += Number(row.estimated_cost) || 0;
  }

  // Revenue estimates by plan
  const planRevenue = { starter: 500, growth: 1000, pro: 1500 };

  // Build client rows
  const clientRows = (clients || []).map((c) => {
    const costs = costByClient[c.id] || { total: 0, byModel: {}, calls: 0 };
    const revenue = planRevenue[c.plan] || 500;
    const margin = revenue > 0 ? Math.round(((revenue - costs.total) / revenue) * 100 * 10) / 10 : 100;
    const budgetPct = c.monthly_api_budget
      ? Math.round((costs.total / Number(c.monthly_api_budget)) * 100)
      : null;

    return {
      ...c,
      cost: costs.total,
      calls: costs.calls,
      byModel: costs.byModel,
      revenue,
      margin,
      budgetPct,
    };
  });

  // Sort models by cost descending
  const sortedModels = Object.entries(costByModel).sort((a, b) => b[1] - a[1]);

  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const costDelta = totalPrevCost > 0
    ? Math.round(((totalCurrentCost - totalPrevCost) / totalPrevCost) * 100)
    : null;

  // Estimated monthly total (project from days elapsed)
  const daysElapsed = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedCost = daysElapsed > 0 ? (totalCurrentCost / daysElapsed) * daysInMonth : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            API <span className="text-[#3b82f6]">Costs</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">{monthName}</p>
        </div>
        <Link
          href="/admin/tracker"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          &larr; Back to Tracker
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Month-to-Date</p>
          <p className="text-3xl font-bold text-white">{formatCost(totalCurrentCost)}</p>
          {costDelta !== null && (
            <p className={`text-xs mt-1 ${costDelta > 0 ? "text-red-400" : "text-green-400"}`}>
              {costDelta > 0 ? "+" : ""}{costDelta}% vs last month
            </p>
          )}
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Projected Monthly</p>
          <p className="text-3xl font-bold text-yellow-400">{formatCost(projectedCost)}</p>
          <p className="text-xs text-gray-600 mt-1">Based on {daysElapsed} days</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">API Calls</p>
          <p className="text-3xl font-bold text-white">{(currentCosts || []).length}</p>
          <p className="text-xs text-gray-600 mt-1">this month</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active Clients</p>
          <p className="text-3xl font-bold text-[#3b82f6]">{clients?.length || 0}</p>
          <p className="text-xs text-gray-600 mt-1">
            est. revenue {formatCost(clientRows.reduce((s, c) => s + c.revenue, 0))}/mo
          </p>
        </div>
      </div>

      {/* Cost by Model */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 mb-8">
        <h3 className="text-sm font-semibold text-white mb-4">Cost by AI Model</h3>
        <div className="space-y-3">
          {sortedModels.map(([model, cost]) => {
            const pct = totalCurrentCost > 0 ? Math.round((cost / totalCurrentCost) * 100) : 0;
            return (
              <div key={model} className="flex items-center gap-3">
                <span className="text-sm text-gray-300 w-24">{model}</span>
                <div className="flex-1 h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct > 50 ? "bg-red-500" : pct > 25 ? "bg-yellow-500" : "bg-[#3b82f6]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">{formatCost(cost)}</span>
                <span className="text-xs text-gray-600 w-10 text-right">{pct}%</span>
              </div>
            );
          })}
          {sortedModels.length === 0 && (
            <p className="text-sm text-gray-500">No cost data yet. Costs are logged after tracker runs.</p>
          )}
        </div>
      </div>

      {/* Per-Client Breakdown */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1f1f1f]">
          <h3 className="text-sm font-semibold text-white">Per-Client Costs & Margins</h3>
        </div>

        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-2 text-xs text-gray-500 uppercase tracking-wider border-b border-[#1f1f1f]">
          <span>Client</span>
          <span>Plan</span>
          <span className="text-right">Revenue</span>
          <span className="text-right">API Cost</span>
          <span className="text-right">Margin</span>
          <span className="text-right">Calls</span>
          <span className="text-right">Budget</span>
        </div>

        {clientRows.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 lg:gap-4 px-6 py-3 border-b border-[#1f1f1f] hover:bg-[#0d0d0d] transition-colors items-center"
          >
            <div>
              <Link href={`/admin/tracker/${c.id}`} className="text-sm text-white font-medium hover:text-[#3b82f6] transition-colors">
                {c.business_name}
              </Link>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
              c.plan === "pro" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
              c.plan === "growth" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
              "bg-gray-500/10 text-gray-400 border border-gray-500/20"
            }`}>
              {c.plan || "starter"}
            </span>
            <span className="text-sm text-green-400 text-right">{formatCost(c.revenue)}</span>
            <span className="text-sm text-white text-right">{formatCost(c.cost)}</span>
            <span className={`text-sm font-medium text-right ${
              c.margin >= 95 ? "text-green-400" : c.margin >= 90 ? "text-yellow-400" : "text-red-400"
            }`}>
              {c.margin}%
            </span>
            <span className="text-sm text-gray-400 text-right">{c.calls}</span>
            <span className="text-right">
              {c.budgetPct !== null ? (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  c.budgetPct >= 90 ? "bg-red-500/10 text-red-400" :
                  c.budgetPct >= 70 ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-green-500/10 text-green-400"
                }`}>
                  {c.budgetPct}%
                </span>
              ) : (
                <span className="text-xs text-gray-600">No budget</span>
              )}
            </span>
          </div>
        ))}

        {clientRows.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500 text-sm">
            No clients found. Add clients in the AI Tracker to start tracking costs.
          </div>
        )}

        {/* Totals row */}
        {clientRows.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 lg:gap-4 px-6 py-3 bg-[#0d0d0d] items-center font-medium">
            <span className="text-sm text-gray-400">Total ({clientRows.length} clients)</span>
            <span />
            <span className="text-sm text-green-400 text-right">
              {formatCost(clientRows.reduce((s, c) => s + c.revenue, 0))}
            </span>
            <span className="text-sm text-white text-right">
              {formatCost(clientRows.reduce((s, c) => s + c.cost, 0))}
            </span>
            <span className="text-sm text-green-400 text-right">
              {(() => {
                const rev = clientRows.reduce((s, c) => s + c.revenue, 0);
                const cost = clientRows.reduce((s, c) => s + c.cost, 0);
                return rev > 0 ? `${Math.round(((rev - cost) / rev) * 1000) / 10}%` : "—";
              })()}
            </span>
            <span className="text-sm text-gray-400 text-right">
              {clientRows.reduce((s, c) => s + c.calls, 0)}
            </span>
            <span />
          </div>
        )}
      </div>
    </div>
  );
}
