import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  applyBrainSuggestion,
  getClientBundle,
  saveHomePageSections,
  upsertBrain,
  upsertClient,
  upsertRecipe,
} from "@/lib/admin.functions";
import {
  suggestFromBrain,
  SUPPORTED_MODULE_TYPES,
  type BrainSuggestionPreview,
  type BrainSuggestionSection,
} from "@/lib/suggest-from-brain";
import type {
  Client,
  ClientBrain,
  PageSection,
  SiteRecipe,
} from "@/lib/site-types";

export const Route = createFileRoute("/studio/$clientId")({
  loader: ({ params }) => getClientBundle({ data: { id: params.clientId } }),
  component: StudioEditor,
});

type Bundle = {
  client: Client | null;
  brain: ClientBrain | null;
  recipe: SiteRecipe | null;
  page: { id: string; slug: string; title: string } | null;
  sections: PageSection[];
  adminAvailable?: boolean;
  message?: string | null;
};

const inputCls =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function asJson(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  return JSON.stringify(v, null, 2);
}

function parseJson(s: string, fallback: unknown = []): unknown {
  const t = s.trim();
  if (!t) return fallback;
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
      {hint ? (
        <div className="mb-2 text-xs text-muted-foreground">{hint}</div>
      ) : (
        <div className="mb-2" />
      )}
      {children}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6">
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
  rows = 6,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        rows={rows}
        spellCheck={false}
        className={`${inputCls} font-mono text-xs`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

type Tab = "client" | "brain" | "recipe" | "sections";

function StudioEditor() {
  const data = Route.useLoaderData() as Bundle;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("brain");
  const [suggestion, setSuggestion] = useState<BrainSuggestionPreview | null>(null);

  const c = data.client;
  const b = data.brain;
  const r = data.recipe;

  if (data.adminAvailable === false) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
        <Link to="/studio" className="text-sm text-muted-foreground hover:text-foreground">
          ← Klienter
        </Link>
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h1 className="text-2xl">Studio utilgjengelig</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {data.message ?? "Studio admin krever servertilgang som ikke er tilgjengelig akkurat nå."}
          </p>
        </div>
      </div>
    );
  }

  const [client, setClient] = useState({
    name: c?.name ?? "",
    slug: c?.slug ?? "",
    status: c?.status ?? "draft",
    email: c?.email ?? "",
    phone: c?.phone ?? "",
    primary_domain: c?.primary_domain ?? "",
    description: c?.description ?? "",
    logo_url: c?.logo_url ?? "",
    favicon_url: c?.favicon_url ?? "",
    theme: asJson(c?.theme ?? {}),
  });

  const [brain, setBrain] = useState({
    site_type: b?.site_type ?? "landing_page",
    primary_goal: b?.primary_goal ?? "",
    short_description: b?.short_description ?? "",
    long_description: b?.long_description ?? "",
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

  const [recipe, setRecipe] = useState({
    recipe_type: r?.recipe_type ?? "trust_based_nonprofit",
    site_type: r?.site_type ?? "landing_page",
    primary_intent: r?.primary_intent ?? "",
    design_direction: r?.design_direction ?? "",
    color_palette: asJson(r?.color_palette ?? {}),
    typography: asJson(r?.typography ?? {}),
    layout_preferences: asJson(r?.layout_preferences ?? {}),
    module_strategy: asJson(r?.module_strategy ?? {}),
    variant_presets: asJson(r?.variant_presets ?? {}),
    enabled_modules: asJson(r?.enabled_modules ?? []),
    navigation: asJson(r?.navigation ?? []),
    footer: asJson(r?.footer ?? {}),
  });

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

  async function handleSave() {
    setBusy(true);
    setMsg(null);
    try {
      if (tab === "client" || tab === "sections") {
        await upsertClient({
          data: {
            id: c!.id,
            ...client,
            theme: parseJson(client.theme, {}),
          },
        });
      }
      if (tab === "brain") {
        await upsertBrain({
          data: {
            client_id: c!.id,
            ...brain,
            audience: parseJson(brain.audience),
            brand_keywords: parseJson(brain.brand_keywords),
            tone_keywords: parseJson(brain.tone_keywords),
            trust_points: parseJson(brain.trust_points),
            services: parseJson(brain.services),
            partners: parseJson(brain.partners),
            faq: parseJson(brain.faq),
          },
        });
      }
      if (tab === "recipe") {
        await upsertRecipe({
          data: {
            client_id: c!.id,
            recipe_type: recipe.recipe_type,
            site_type: recipe.site_type,
            primary_intent: recipe.primary_intent,
            design_direction: recipe.design_direction,
            color_palette: parseJson(recipe.color_palette, {}),
            typography: parseJson(recipe.typography, {}),
            layout_preferences: parseJson(recipe.layout_preferences, {}),
            module_strategy: parseJson(recipe.module_strategy, {}),
            variant_presets: parseJson(recipe.variant_presets, {}),
            enabled_modules: parseJson(recipe.enabled_modules, []),
            navigation: parseJson(recipe.navigation, []),
            footer: parseJson(recipe.footer, {}),
          },
        });
      }
      setMsg("Lagret.");
      router.invalidate();
    } catch (err) {
      setMsg(`Feil: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "brain", label: "Client Brain" },
    { id: "sections", label: "Sections" },
    { id: "recipe", label: "Site Recipe (avansert)" },
    { id: "client", label: "Klient (avansert)" },
  ];

  function handleGenerate() {
    const preview = suggestFromBrain({
      ...brain,
      audience: parseJson(brain.audience),
      brand_keywords: parseJson(brain.brand_keywords),
      tone_keywords: parseJson(brain.tone_keywords),
      trust_points: parseJson(brain.trust_points),
      services: parseJson(brain.services),
      partners: parseJson(brain.partners),
      faq: parseJson(brain.faq),
    });
    setSuggestion(preview);
    setMsg(null);
  }

  async function handleApplySuggestion() {
    if (!suggestion) return;
    if (
      !confirm(
        "Dette erstatter alle seksjoner på forsiden, oppdaterer Site Recipe og klientens theme. Fortsette?",
      )
    )
      return;
    setBusy(true);
    setMsg(null);
    try {
      await applyBrainSuggestion({
        data: { client_id: c!.id, suggestion },
      });
      setSuggestion(null);
      setMsg("Forslag tatt i bruk.");
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
          <div className="mt-1 text-xs text-muted-foreground">
            /{client.slug} · {client.status}
          </div>
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
          {tab !== "sections" && (
            <button
              onClick={handleSave}
              disabled={busy}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {busy ? "Lagrer…" : "Lagre"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2 text-sm transition ${
              tab === t.id
                ? "bg-card text-foreground border-x border-t border-border -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "client" && (
        <>
          <Section title="Grunninfo">
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
            <div className="mt-4 grid gap-4">
              <Field label="Beskrivelse">
                <textarea rows={3} className={inputCls} value={client.description} onChange={(e) => setClient({ ...client, description: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Logo URL">
                  <input className={inputCls} value={client.logo_url} onChange={(e) => setClient({ ...client, logo_url: e.target.value })} />
                </Field>
                <Field label="Favicon URL">
                  <input className={inputCls} value={client.favicon_url} onChange={(e) => setClient({ ...client, favicon_url: e.target.value })} />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Theme tokens">
            <JsonField
              label="Theme (JSON)"
              hint='{"primaryColor":"oklch(...)","backgroundColor":"...","surfaceColor":"...","textColor":"...","borderColor":"...","radius":"1rem","fontStyle":"mixed"}'
              value={client.theme}
              onChange={(v) => setClient({ ...client, theme: v })}
            />
          </Section>
        </>
      )}

      {tab === "brain" && (
        <>
          <Section title="Kjerne">
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
              <Field label="Lang beskrivelse">
                <textarea rows={3} className={inputCls} value={brain.long_description} onChange={(e) => setBrain({ ...brain, long_description: e.target.value })} />
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

          <Section title="Lister (JSON)">
            <div className="grid gap-4">
              <JsonField label="Audience" value={brain.audience} onChange={(v) => setBrain({ ...brain, audience: v })} />
              <JsonField label="Brand keywords" value={brain.brand_keywords} onChange={(v) => setBrain({ ...brain, brand_keywords: v })} />
              <JsonField label="Tone keywords" value={brain.tone_keywords} onChange={(v) => setBrain({ ...brain, tone_keywords: v })} />
              <JsonField label="Trust points" value={brain.trust_points} onChange={(v) => setBrain({ ...brain, trust_points: v })} />
              <JsonField label="Services" value={brain.services} onChange={(v) => setBrain({ ...brain, services: v })} />
              <JsonField label="Partners" value={brain.partners} onChange={(v) => setBrain({ ...brain, partners: v })} />
              <JsonField label="FAQ" value={brain.faq} onChange={(v) => setBrain({ ...brain, faq: v })} />
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
        </>
      )}

      {tab === "recipe" && (
        <>
          <Section title="Recipe — type og intent">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Recipe type">
                <input className={inputCls} value={recipe.recipe_type} onChange={(e) => setRecipe({ ...recipe, recipe_type: e.target.value })} />
              </Field>
              <Field label="Site type">
                <input className={inputCls} value={recipe.site_type} onChange={(e) => setRecipe({ ...recipe, site_type: e.target.value })} />
              </Field>
              <Field label="Primary intent" hint="f.eks. build_trust, drive_signups, showcase_work">
                <input className={inputCls} value={recipe.primary_intent} onChange={(e) => setRecipe({ ...recipe, primary_intent: e.target.value })} />
              </Field>
              <Field label="Design direction" hint="f.eks. fiken_calm_mint, brutalist_studio">
                <input className={inputCls} value={recipe.design_direction} onChange={(e) => setRecipe({ ...recipe, design_direction: e.target.value })} />
              </Field>
            </div>
          </Section>

          <Section title="Design og layout (JSON)">
            <div className="grid gap-4">
              <JsonField label="Color palette" value={recipe.color_palette} onChange={(v) => setRecipe({ ...recipe, color_palette: v })} rows={4} />
              <JsonField label="Typography" value={recipe.typography} onChange={(v) => setRecipe({ ...recipe, typography: v })} rows={4} />
              <JsonField label="Layout preferences" value={recipe.layout_preferences} onChange={(v) => setRecipe({ ...recipe, layout_preferences: v })} rows={4} />
            </div>
          </Section>

          <Section title="Moduler og varianter (JSON)">
            <div className="grid gap-4">
              <JsonField label="Enabled modules" hint='["hero","mission","faq",...]' value={recipe.enabled_modules} onChange={(v) => setRecipe({ ...recipe, enabled_modules: v })} rows={4} />
              <JsonField label="Module strategy" value={recipe.module_strategy} onChange={(v) => setRecipe({ ...recipe, module_strategy: v })} />
              <JsonField label="Variant presets" hint='{"hero":"editorial","faq":"accordion"}' value={recipe.variant_presets} onChange={(v) => setRecipe({ ...recipe, variant_presets: v })} />
            </div>
          </Section>

          <Section title="Navigasjon og footer (JSON)">
            <div className="grid gap-4">
              <JsonField label="Navigation" value={recipe.navigation} onChange={(v) => setRecipe({ ...recipe, navigation: v })} />
              <JsonField label="Footer" value={recipe.footer} onChange={(v) => setRecipe({ ...recipe, footer: v })} rows={4} />
            </div>
          </Section>
        </>
      )}

      {tab === "sections" && (
        <Section title={`Sections${data.page ? ` på ${data.page.slug}` : ""}`}>
          {data.sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ingen sections enda. Bruk seed eller legg til via SQL/API.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Variant</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Bg</th>
                    <th className="px-4 py-3">Visible</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sections.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-4 py-3 text-muted-foreground">{s.sort_order}</td>
                      <td className="px-4 py-3 font-medium">{s.module_type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.variant ?? "default"}</td>
                      <td className="px-4 py-3">{s.title ?? <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.background_style ?? "—"}</td>
                      <td className="px-4 py-3">{s.is_visible ? "Ja" : "Nei"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Read-only i denne versjonen. Bruk «Seed Foreningen Opplev» for å regenerere standardsettet.
          </p>
        </Section>
      )}
    </div>
  );
}
