import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { getClientBundle, upsertBrain, upsertClient } from "@/lib/admin.functions";
import type { Client, ClientBrain } from "@/lib/site-types";

export const Route = createFileRoute("/studio/$clientId")({
  loader: ({ params }) => getClientBundle({ data: { id: params.clientId } }),
  component: StudioEditor,
});

type Bundle = { client: Client | null; brain: ClientBrain | null };

function asJson(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return JSON.stringify(v, null, 2);
}

function parseJson(s: string): unknown {
  const t = s.trim();
  if (!t) return [];
  try {
    return JSON.parse(t);
  } catch {
    return s
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-foreground">{label}</div>
      {hint ? <div className="mb-2 text-xs text-muted-foreground">{hint}</div> : <div className="mb-2" />}
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function StudioEditor() {
  const data = Route.useLoaderData() as Bundle;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const c = data.client;
  const b = data.brain;
  if (!c) {
    return (
      <div className="mx-auto max-w-3xl p-10">
        <p>Klient ikke funnet.</p>
        <Link to="/studio" className="underline">
          Tilbake
        </Link>
      </div>
    );
  }

  const [client, setClient] = useState({
    name: c.name,
    slug: c.slug,
    status: c.status,
    email: c.email ?? "",
    phone: c.phone ?? "",
    primary_domain: c.primary_domain ?? "",
  });

  const [brain, setBrain] = useState({
    site_type: b?.site_type ?? "landing_page",
    primary_goal: b?.primary_goal ?? "",
    short_description: b?.short_description ?? "",
    mission: b?.mission ?? "",
    vision: b?.vision ?? "",
    problem_statement: b?.problem_statement ?? "",
    solution_statement: b?.solution_statement ?? "",
    cta_primary_label: b?.cta_primary_label ?? "",
    cta_primary_href: b?.cta_primary_href ?? "",
    cta_secondary_label: b?.cta_secondary_label ?? "",
    cta_secondary_href: b?.cta_secondary_href ?? "",
    raw_notes: b?.raw_notes ?? "",
    internal_notes: b?.internal_notes ?? "",
    audience: asJson(b?.audience),
    brand_keywords: asJson(b?.brand_keywords),
    tone_keywords: asJson(b?.tone_keywords),
    trust_points: asJson(b?.trust_points),
    services: asJson(b?.services),
    partners: asJson(b?.partners),
    faq: asJson(b?.faq),
  });

  async function handleSave() {
    setBusy(true);
    setMsg(null);
    try {
      await upsertClient({ data: { id: c!.id, ...client } });
      await upsertBrain({
        data: {
          client_id: c!.id,
          site_type: brain.site_type,
          primary_goal: brain.primary_goal,
          short_description: brain.short_description,
          mission: brain.mission,
          vision: brain.vision,
          problem_statement: brain.problem_statement,
          solution_statement: brain.solution_statement,
          cta_primary_label: brain.cta_primary_label,
          cta_primary_href: brain.cta_primary_href,
          cta_secondary_label: brain.cta_secondary_label,
          cta_secondary_href: brain.cta_secondary_href,
          raw_notes: brain.raw_notes,
          internal_notes: brain.internal_notes,
          audience: parseJson(brain.audience),
          brand_keywords: parseJson(brain.brand_keywords),
          tone_keywords: parseJson(brain.tone_keywords),
          trust_points: parseJson(brain.trust_points),
          services: parseJson(brain.services),
          partners: parseJson(brain.partners),
          faq: parseJson(brain.faq),
        },
      });
      setMsg("Lagret.");
      router.invalidate();
    } catch (err) {
      setMsg(`Feil: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 md:px-10">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/studio" className="text-sm text-muted-foreground hover:text-foreground">
            ← Klienter
          </Link>
          <h1 className="mt-2 text-3xl">{client.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          {msg ? <span className="text-sm text-muted-foreground">{msg}</span> : null}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm hover:bg-accent"
          >
            Forhåndsvis
          </a>
          <button
            onClick={handleSave}
            disabled={busy}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Lagrer…" : "Lagre"}
          </button>
        </div>
      </div>

      <Section title="Klient">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Navn">
            <input className={inputCls} value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} />
          </Field>
          <Field label="Slug">
            <input className={inputCls} value={client.slug} onChange={(e) => setClient({ ...client, slug: e.target.value })} />
          </Field>
          <Field label="Status">
            <select
              className={inputCls}
              value={client.status}
              onChange={(e) => setClient({ ...client, status: e.target.value })}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </Field>
          <Field label="E-post">
            <input className={inputCls} value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} />
          </Field>
          <Field label="Telefon">
            <input className={inputCls} value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} />
          </Field>
          <Field label="Primært domene">
            <input className={inputCls} value={client.primary_domain} onChange={(e) => setClient({ ...client, primary_domain: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="Brain — kjerne">
        <div className="grid gap-4">
          <Field label="Site type">
            <input className={inputCls} value={brain.site_type} onChange={(e) => setBrain({ ...brain, site_type: e.target.value })} />
          </Field>
          <Field label="Primært mål">
            <textarea rows={2} className={inputCls} value={brain.primary_goal} onChange={(e) => setBrain({ ...brain, primary_goal: e.target.value })} />
          </Field>
          <Field label="Kort beskrivelse">
            <textarea rows={2} className={inputCls} value={brain.short_description} onChange={(e) => setBrain({ ...brain, short_description: e.target.value })} />
          </Field>
          <Field label="Mission">
            <textarea rows={2} className={inputCls} value={brain.mission} onChange={(e) => setBrain({ ...brain, mission: e.target.value })} />
          </Field>
          <Field label="Vision">
            <textarea rows={2} className={inputCls} value={brain.vision} onChange={(e) => setBrain({ ...brain, vision: e.target.value })} />
          </Field>
          <Field label="Problem statement">
            <textarea rows={2} className={inputCls} value={brain.problem_statement} onChange={(e) => setBrain({ ...brain, problem_statement: e.target.value })} />
          </Field>
          <Field label="Solution statement">
            <textarea rows={2} className={inputCls} value={brain.solution_statement} onChange={(e) => setBrain({ ...brain, solution_statement: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="Brain — lister (JSON eller én linje per element)">
        <div className="grid gap-4">
          <JsonField label="Audience" hint='[{ "label": "...", "description": "..." }]' value={brain.audience} onChange={(v) => setBrain({ ...brain, audience: v })} />
          <JsonField label="Brand keywords" hint='["mestring", "trygghet"]' value={brain.brand_keywords} onChange={(v) => setBrain({ ...brain, brand_keywords: v })} />
          <JsonField label="Tone keywords" hint='["varm", "rolig"]' value={brain.tone_keywords} onChange={(v) => setBrain({ ...brain, tone_keywords: v })} />
          <JsonField label="Trust points" hint='[{ "label": "...", "description": "..." }]' value={brain.trust_points} onChange={(v) => setBrain({ ...brain, trust_points: v })} />
          <JsonField label="Services" hint='[{ "title": "...", "description": "..." }]' value={brain.services} onChange={(v) => setBrain({ ...brain, services: v })} />
          <JsonField label="Partners" hint='[{ "name": "..." }]' value={brain.partners} onChange={(v) => setBrain({ ...brain, partners: v })} />
          <JsonField label="FAQ" hint='[{ "question": "...", "answer": "..." }]' value={brain.faq} onChange={(v) => setBrain({ ...brain, faq: v })} />
        </div>
      </Section>

      <Section title="CTA">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primær CTA-tekst">
            <input className={inputCls} value={brain.cta_primary_label} onChange={(e) => setBrain({ ...brain, cta_primary_label: e.target.value })} />
          </Field>
          <Field label="Primær CTA-link">
            <input className={inputCls} value={brain.cta_primary_href} onChange={(e) => setBrain({ ...brain, cta_primary_href: e.target.value })} />
          </Field>
          <Field label="Sekundær CTA-tekst">
            <input className={inputCls} value={brain.cta_secondary_label} onChange={(e) => setBrain({ ...brain, cta_secondary_label: e.target.value })} />
          </Field>
          <Field label="Sekundær CTA-link">
            <input className={inputCls} value={brain.cta_secondary_href} onChange={(e) => setBrain({ ...brain, cta_secondary_href: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="Notater">
        <div className="grid gap-4">
          <Field label="Raw notes">
            <textarea rows={4} className={inputCls} value={brain.raw_notes} onChange={(e) => setBrain({ ...brain, raw_notes: e.target.value })} />
          </Field>
          <Field label="Interne notater">
            <textarea rows={4} className={inputCls} value={brain.internal_notes} onChange={(e) => setBrain({ ...brain, internal_notes: e.target.value })} />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-4 mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={busy}
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg disabled:opacity-50"
        >
          {busy ? "Lagrer…" : "Lagre alt"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-5 text-xl">{title}</h2>
      {children}
    </section>
  );
}

function JsonField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        rows={6}
        spellCheck={false}
        className={`${inputCls} font-mono text-xs`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}
