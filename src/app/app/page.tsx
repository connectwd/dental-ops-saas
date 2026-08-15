import { resolveActor } from "@/application/resolveActor";

// S00 demo target: "reach protected empty application shell".
// No customer-facing feature beyond this shell belongs in S00.
export default async function AppShellPage() {
  const actor = await resolveActor();

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          Practice application shell
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          S00 foundation only. No assets, QR, inspections yet — see S01.
        </p>
        <dl className="mt-4 space-y-1 text-sm text-slate-700">
          <div>
            <dt className="inline font-medium">Signed in as: </dt>
            <dd className="inline">{actor.email}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Role: </dt>
            <dd className="inline">{actor.role}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Practice site: </dt>
            <dd className="inline">{actor.practiceSiteId}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
