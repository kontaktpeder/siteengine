import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { listClients, seedOpplev, upsertClient } from "@/lib/admin.functions";

export const Route = createFileRoute("/studio/")({
  loader: () => listClients(),
  component: StudioIndex,
});

type ClientRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  site_type?: string | null;
};

type StudioIndexLoaderData = {
  clients: ClientRow[];
  adminAvailable: boolean;
  message: string | null;
};

function StudioIndex() {
  const { clients, adminAvailable, message } = Route.useLoaderData() as StudioIndexLoaderData;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  async function handleSeed() {
    setBusy(true);
    try {
      await seedOpplev();
      router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !slug) return;
    setBusy(true);
    try {
      await upsertClient({ data: { name, slug, status: "draft" } });
      setName("");
      setSlug("");
      setCreating(false);
      router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 md:px-10">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm uppercase tracking-wider text-muted-foreground">
            Studio P. A. Halvorsen
          </div>
          <h1 className="mt-2 text-4xl">Klienter</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCreating((v) => !v)}
            disabled={!adminAvailable}
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm hover:bg-accent"
          >
            {creating ? "Avbryt" : "Ny klient"}
          </button>
          <button
            onClick={handleSeed}
            disabled={busy || !adminAvailable}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Jobber…" : "Seed Foreningen Opplev"}
          </button>
        </div>
      </div>

      {!adminAvailable && message ? (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-muted-foreground">
          {message}
        </div>
      ) : null}

      {creating && adminAvailable && (
        <form
          onSubmit={handleCreate}
          className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Klientnavn"
            className="rounded-lg border border-border bg-background px-4 py-2.5"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            placeholder="slug"
            className="rounded-lg border border-border bg-background px-4 py-2.5"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Opprett
          </button>
        </form>
      )}

      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
        {clients.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Ingen klienter ennå. Trykk «Seed Foreningen Opplev» for å komme i gang.
          </div>
        ) : (
          clients.map((c) => (
            <Link
              key={c.id}
              to="/studio/$clientId"
              params={{ clientId: c.id }}
              className="flex items-center justify-between gap-6 p-5 transition hover:bg-accent/40"
            >
              <div>
                <div className="text-lg">{c.name}</div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>/{c.slug}</span>
                  {c.site_type ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                      {c.site_type}
                    </span>
                  ) : null}
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  c.status === "published"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {c.status}
              </span>
            </Link>
          ))
        )}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        v1: admin er ubeskyttet. Legg til auth før dette settes på et offentlig domene.
      </p>
    </div>
  );
}
