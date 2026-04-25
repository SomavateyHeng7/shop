import { addAuditNoteAction } from "@/app/superadmin/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACTION_CONFIG: Record<string, { label: string; classes: string }> = {
  Create: { label: "Create", classes: "bg-emerald-100 text-emerald-700" },
  Update: { label: "Update", classes: "bg-blue-100 text-blue-700" },
  Delete: { label: "Delete", classes: "bg-red-100 text-red-700" },
  Note: { label: "Note", classes: "bg-amber-100 text-amber-700" },
};

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] ?? { label: action, classes: "bg-slate-100 text-slate-600" };
}

export default async function SuperadminLogsPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Audit Timeline</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track policy changes, admin access updates, and manual operational notes.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-500">Log Manual Event</h2>
        <p className="mb-4 text-xs text-slate-400">Record incidents, decisions, or deployment activity for audit purposes.</p>
        <form action={addAuditNoteAction} className="flex gap-3">
          <input
            name="details"
            placeholder="Describe the incident, decision, or deployment activity…"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-slate-900 transition focus:border-slate-400 focus:bg-white focus:ring-2"
            required
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black"
          >
            Add Note
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Event Log</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {logs.length} events
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400">No audit events yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {logs.map((entry) => {
              const config = getActionConfig(entry.action);
              return (
                <div key={entry.id} className="flex items-start gap-4 px-5 py-4 transition hover:bg-slate-50">
                  <div className="mt-0.5 flex flex-col items-center gap-1">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${config.classes}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{entry.target}</p>
                      <time className="shrink-0 text-xs text-slate-400">{entry.createdAt.toLocaleString()}</time>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">{entry.details}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Actor: <span className="font-medium text-slate-600">{entry.actor}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
