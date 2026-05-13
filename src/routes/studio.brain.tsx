import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  listStudioReferences,
  upsertStudioReference,
  archiveStudioReference,
  type StudioReference,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/studio/brain")({
  loader: () => listStudioReferences(),
  component: StudioBrainPage,
});

const REFERENCE_TYPES = [
  "general",
  "nonprofit",
  "lead_generation",
  "food_brand",
  "portfolio",
  "campaign",
  "local_business",
];
const STATUSES = ["draft", "approved", "archived"];

type Draft = Partial<StudioReference> & { name: string };

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
const taCls = inputCls + " font-mono";

function emptyDraft(): Draft {
  return {
    name: "",
    reference_url: "",
    reference_type: "general",
    status: "draft",
    rank: 0,
    what_works: "",
    visual_principles: "",
    conversion_principles: "",
    seo_principles: "",
    component_patterns: "",
    tone_patterns: "",
    avoid_copying:
      "Do not copy text, brand identity, layout 1:1, assets or proprietary design. Extract principles only.",
  };
}

function StudioBrainPage() {
  const { references, adminAvailable } = Route.useLoaderData() as {
    references: StudioReference[];
    adminAvailable: boolean;
  };
  const router = useRouter();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    if (!editing || !editing.name.trim()) return;
    setBusy(true);
    try {
      await upsertStudioReference({
        data: {
          id: editing.id,
          name: editing.name,
          reference_url: editing.reference_url ?? null,
          reference_type: editing.reference_type ?? "general",
          status: editing.status ?? "draft",
          rank: Number(editing.rank ?? 0),
          what_works: editing.what_works ?? null,
          visual_principles: editing.visual_principles ?? null,
          conversion_principles: editing.conversion_principles ?? null,
          seo_principles: editing.seo_principles ?? null,
          component_patterns: editing.component_patterns ?? null,
          tone_patterns: editing.tone_patterns ?? null,
          avoid_copying: editing.avoid_copying,
        },
      });
      setEditing(null);
      router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive(id: string) {
    setBusy(true);
    try {
      await archiveStudioReference({ data: { id } });
      router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 md:px-10">
      <div className="flex items-end justify-between">
        <div>
          <Link to="/studio" className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
            ← Studio
          </Link>
          <h1 className="mt-2 text-4xl">Studio Brain</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Studioets felles smak, metode, referanser og designprinsipper. AI bruker disse som inspirasjon på tvers av alle klienter — aldri som kopi.
          </p>
        </div>
        <button
          onClick={() => setEditing(emptyDraft())}
          disabled={!adminAvailable}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Ny referanse
        </button>
      </div>

      {!adminAvailable && (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-muted-foreground">
          Studio admin er ikke tilgjengelig (mangler service-role).
        </div>
      )}

      {editing && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Navn</div>
              <input className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </label>
            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Reference URL</div>
              <input className={inputCls} value={editing.reference_url ?? ""} onChange={(e) => setEditing({ ...editing, reference_url: e.target.value })} />
            </label>
            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Reference type</div>
              <select className={inputCls} value={editing.reference_type ?? "general"} onChange={(e) => setEditing({ ...editing, reference_type: e.target.value })}>
                {REFERENCE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Status</div>
              <select className={inputCls} value={editing.status ?? "draft"} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                {STATUSES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <div className="mb-1 text-muted-foreground">Rank (høyere = viktigere)</div>
              <input type="number" className={inputCls} value={editing.rank ?? 0} onChange={(e) => setEditing({ ...editing, rank: Number(e.target.value) })} />
            </label>
          </div>

          <div className="mt-5 grid gap-4">
            {([
              ["what_works", "Hva fungerer (kort sammendrag)"],
              ["visual_principles", "Visuelle prinsipper"],
              ["conversion_principles", "Konverteringsprinsipper"],
              ["seo_principles", "SEO-prinsipper"],
              ["component_patterns", "Komponentmønstre"],
              ["tone_patterns", "Tonemønstre"],
              ["avoid_copying", "Avoid copying"],
            ] as const).map(([key, label]) => (
              <label key={key} className="text-sm">
                <div className="mb-1 text-muted-foreground">{label}</div>
                <textarea
                  rows={3}
                  className={taCls}
                  value={(editing[key] as string) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handleSave} disabled={busy} className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {busy ? "Lagrer…" : "Lagre"}
            </button>
            <button onClick={() => setEditing(null)} className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-accent">
              Avbryt
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
        {references.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Ingen referanser ennå.</div>
        ) : (
          references.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-6 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-lg">{r.name}</div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{r.reference_type}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "approved" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {r.status}
                  </span>
                  <span className="text-xs text-muted-foreground">rank {r.rank}</span>
                </div>
                {r.reference_url && (
                  <a href={r.reference_url} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-muted-foreground hover:underline">
                    {r.reference_url}
                  </a>
                )}
                {r.what_works && (
                  <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.what_works}</div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(r as Draft)}
                  className="rounded-full border border-border px-4 py-1.5 text-xs hover:bg-accent"
                >
                  Rediger
                </button>
                {r.status !== "archived" && (
                  <button
                    onClick={() => handleArchive(r.id)}
                    className="rounded-full border border-border px-4 py-1.5 text-xs hover:bg-accent"
                  >
                    Arkiver
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
