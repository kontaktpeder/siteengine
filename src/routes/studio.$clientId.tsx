import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  applyAiSuggestion,
  deleteMediaNote,
  generateAiBrainSuggestion,
  getClientBundle,
  listMediaNotes,
  saveHomePageSections,
  upsertBrain,
  upsertClient,
  upsertMediaNote,
  upsertRecipe,
  type MediaNote,
} from "@/lib/admin.functions";
import {
  SUPPORTED_MODULE_TYPES,
  type BrainSuggestionSection,
} from "@/lib/suggest-from-brain";
import type { AiSuggestion } from "@/lib/ai-suggestion.server";
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
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);

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

  const bExt = (b ?? {}) as Record<string, unknown>;
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
    flagship_story: (bExt.flagship_story as string) ?? "",
    emotional_trigger: (bExt.emotional_trigger as string) ?? "",
    anti_brand: (bExt.anti_brand as string) ?? "",
    memorable_takeaway: (bExt.memorable_takeaway as string) ?? "",
    representative_scene: (bExt.representative_scene as string) ?? "",
    desired_feelings: (bExt.desired_feelings as string) ?? "",
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

  async function handleGenerate() {
    setBusy(true);
    setMsg(null);
    try {
      const brain_draft = {
        ...brain,
        audience: parseJson(brain.audience),
        brand_keywords: parseJson(brain.brand_keywords),
        tone_keywords: parseJson(brain.tone_keywords),
        trust_points: parseJson(brain.trust_points),
        services: parseJson(brain.services),
        partners: parseJson(brain.partners),
        faq: parseJson(brain.faq),
      };
      const result = await generateAiBrainSuggestion({
        data: { client_id: c!.id, brain_draft },
      });
      setSuggestion(result as AiSuggestion);
      if ((result as AiSuggestion).source === "fallback") {
        setMsg("AI utilgjengelig — viser heuristisk forslag.");
      }
    } catch (err) {
      setMsg(`Feil: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleApplySuggestion() {
    if (!suggestion) return;
    if (
      !confirm(
        "Dette erstatter alle seksjoner på forsiden, oppdaterer Site Recipe, klientens theme og forsidens metadata. Fortsette?",
      )
    )
      return;
    setBusy(true);
    setMsg(null);
    try {
      await applyAiSuggestion({
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
          <Section title="Generer forslag fra Client Brain">
            <p className="text-sm text-muted-foreground">
              AI analyserer Brain-en din og foreslår theme, recipe, forside-metadata
              og seksjoner. Du ser først en preview — ingenting lagres før du
              trykker «Bruk forslag».
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleGenerate}
                disabled={busy}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {busy && !suggestion ? "Genererer…" : "Generer med AI"}
              </button>
              {suggestion ? (
                <>
                  <button
                    onClick={handleApplySuggestion}
                    disabled={busy}
                    className="rounded-full border border-primary bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary disabled:opacity-50"
                  >
                    {busy ? "Tar i bruk…" : "Bruk forslag"}
                  </button>
                  <button
                    onClick={() => setSuggestion(null)}
                    className="rounded-full border border-border bg-card px-5 py-2.5 text-sm hover:bg-accent"
                  >
                    Avbryt
                  </button>
                </>
              ) : null}
            </div>
            {suggestion ? (
              <div className="mt-5 grid gap-3 rounded-xl border border-border bg-muted/30 p-5 text-sm">
                <div className="grid gap-1 sm:grid-cols-2">
                  <div><span className="text-muted-foreground">Kilde:</span> {suggestion.source}</div>
                  <div><span className="text-muted-foreground">Site type:</span> {suggestion.recipe.site_type}</div>
                  <div><span className="text-muted-foreground">Primary intent:</span> {suggestion.recipe.primary_intent}</div>
                  <div><span className="text-muted-foreground">Design direction:</span> {suggestion.recipe.design_direction}</div>
                </div>
                {suggestion.warnings?.length ? (
                  <div className="rounded-md bg-amber-100/40 p-2 text-xs text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                    {suggestion.warnings.join(" · ")}
                  </div>
                ) : null}
                {suggestion.home_page?.meta_title || suggestion.home_page?.meta_description ? (
                  <div className="rounded-md border border-border bg-background p-3">
                    <div className="text-xs uppercase text-muted-foreground">SEO</div>
                    <div className="mt-1 font-medium">{suggestion.home_page.meta_title}</div>
                    <div className="text-xs text-muted-foreground">{suggestion.home_page.meta_description}</div>
                  </div>
                ) : null}
                <div>
                  <div className="mb-1 text-muted-foreground">Moduler ({suggestion.sections.length}):</div>
                  <ol className="list-decimal pl-5">
                    {suggestion.sections.map((s: BrainSuggestionSection, i: number) => (
                      <li key={i}>
                        <span className="font-medium">{s.module_type}</span>
                        <span className="text-muted-foreground"> · {s.variant}</span>
                        {s.title ? <span className="text-muted-foreground"> — {s.title}</span> : null}
                      </li>
                    ))}
                  </ol>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground">Se full JSON</summary>
                  <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-background p-3 text-xs">{JSON.stringify(suggestion, null, 2)}</pre>
                </details>
              </div>
            ) : null}
          </Section>


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

          <Section title="Identitet — menneskelig kontekst for AI">
            <p className="mb-4 text-sm text-muted-foreground">
              Disse feltene gir AI en mer menneskelig forståelse av hvem dere er.
              Skriv som du forteller en venn — ikke salg, ikke buzzwords.
            </p>
            <div className="grid gap-4">
              <Field
                label="Flagship story"
                hint="Den viktigste historien eller opplevelsen virksomheten handler om."
              >
                <textarea rows={4} className={inputCls} value={brain.flagship_story} onChange={(e) => setBrain({ ...brain, flagship_story: e.target.value })} />
              </Field>
              <Field
                label="Representativ scene"
                hint="Beskriv en ekte scene eller situasjon som representerer virksomheten."
              >
                <textarea rows={4} className={inputCls} value={brain.representative_scene} onChange={(e) => setBrain({ ...brain, representative_scene: e.target.value })} />
              </Field>
              <Field
                label="Emosjonell trigger"
                hint="Hva reagerer folk emosjonelt på når de møter dere?"
              >
                <textarea rows={3} className={inputCls} value={brain.emotional_trigger} onChange={(e) => setBrain({ ...brain, emotional_trigger: e.target.value })} />
              </Field>
              <Field
                label="Ønskede følelser"
                hint="Hvordan skal folk føle seg etter å ha besøkt siden? F.eks. trygg, rolig, sett."
              >
                <textarea rows={3} className={inputCls} value={brain.desired_feelings} onChange={(e) => setBrain({ ...brain, desired_feelings: e.target.value })} />
              </Field>
              <Field
                label="Memorable takeaway"
                hint="Den ene tingen folk skal huske etter å ha vært på siden."
              >
                <textarea rows={3} className={inputCls} value={brain.memorable_takeaway} onChange={(e) => setBrain({ ...brain, memorable_takeaway: e.target.value })} />
              </Field>
              <Field
                label="Anti-brand"
                hint="Hva ønsker dere IKKE å fremstå som? F.eks. «ikke corporate», «ikke for hipt»."
              >
                <textarea rows={3} className={inputCls} value={brain.anti_brand} onChange={(e) => setBrain({ ...brain, anti_brand: e.target.value })} />
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
        <SectionsEditor
          clientId={c.id}
          initial={data.sections}
          onSaved={() => {
            setMsg("Seksjoner lagret.");
            router.invalidate();
          }}
          onError={(m) => setMsg(`Feil: ${m}`)}
        />
      )}
    </div>
  );
}

function sectionToEditable(s: PageSection | BrainSuggestionSection, i: number): BrainSuggestionSection {
  return {
    module_type: s.module_type as BrainSuggestionSection["module_type"],
    variant: s.variant ?? "default",
    eyebrow: s.eyebrow ?? null,
    title: s.title ?? null,
    subtitle: s.subtitle ?? null,
    body: (s as PageSection).body ?? null,
    anchor_id: s.anchor_id ?? null,
    background_style: s.background_style ?? null,
    layout_style: s.layout_style ?? null,
    cta_label: s.cta_label ?? null,
    cta_href: s.cta_href ?? null,
    content: ((s as PageSection).content as Record<string, unknown>) ?? {},
    settings: ((s as PageSection).settings as Record<string, unknown>) ?? {},
    is_visible: s.is_visible ?? true,
    sort_order: typeof s.sort_order === "number" ? s.sort_order : i,
  };
}

function SectionsEditor({
  clientId,
  initial,
  onSaved,
  onError,
}: {
  clientId: string;
  initial: PageSection[];
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [rows, setRows] = useState<BrainSuggestionSection[]>(
    initial.map(sectionToEditable),
  );
  const [busy, setBusy] = useState(false);

  function update(i: number, patch: Partial<BrainSuggestionSection>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function remove(i: number) {
    setRows((rs) => rs.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, sort_order: idx })));
  }
  function move(i: number, dir: -1 | 1) {
    setRows((rs) => {
      const copy = [...rs];
      const j = i + dir;
      if (j < 0 || j >= copy.length) return rs;
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy.map((r, idx) => ({ ...r, sort_order: idx }));
    });
  }
  function add() {
    setRows((rs) => [
      ...rs,
      {
        module_type: "hero",
        variant: "default",
        content: {},
        settings: {},
        is_visible: true,
        sort_order: rs.length,
      },
    ]);
  }

  async function save() {
    setBusy(true);
    try {
      await saveHomePageSections({ data: { client_id: clientId, sections: rows } });
      onSaved();
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="Sections på forsiden">
      <p className="text-sm text-muted-foreground">
        Lagring erstatter alle seksjoner på forsiden. Felt for content/settings
        bevares som JSON.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={add}
          className="rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-accent"
        >
          + Legg til seksjon
        </button>
        <button
          onClick={save}
          disabled={busy}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Lagrer…" : "Lagre seksjoner"}
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
              <span className="text-xs text-muted-foreground">#{i}</span>
              <select
                className={`${inputCls} max-w-[180px]`}
                value={r.module_type}
                onChange={(e) => update(i, { module_type: e.target.value as BrainSuggestionSection["module_type"] })}
              >
                {SUPPORTED_MODULE_TYPES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                className={`${inputCls} max-w-[160px]`}
                placeholder="variant"
                value={r.variant}
                onChange={(e) => update(i, { variant: e.target.value })}
              />
              <label className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={r.is_visible ?? true}
                  onChange={(e) => update(i, { is_visible: e.target.checked })}
                />
                synlig
              </label>
              <div className="ml-auto flex gap-1">
                <button onClick={() => move(i, -1)} className="rounded border border-border px-2 py-1 text-xs hover:bg-accent">↑</button>
                <button onClick={() => move(i, 1)} className="rounded border border-border px-2 py-1 text-xs hover:bg-accent">↓</button>
                <button onClick={() => remove(i)} className="rounded border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10">Slett</button>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Eyebrow"><input className={inputCls} value={r.eyebrow ?? ""} onChange={(e) => update(i, { eyebrow: e.target.value || null })} /></Field>
              <Field label="Anchor id"><input className={inputCls} value={r.anchor_id ?? ""} onChange={(e) => update(i, { anchor_id: e.target.value || null })} /></Field>
              <Field label="Title"><input className={inputCls} value={r.title ?? ""} onChange={(e) => update(i, { title: e.target.value || null })} /></Field>
              <Field label="Subtitle"><input className={inputCls} value={r.subtitle ?? ""} onChange={(e) => update(i, { subtitle: e.target.value || null })} /></Field>
              <Field label="Background style"><input className={inputCls} value={r.background_style ?? ""} onChange={(e) => update(i, { background_style: e.target.value || null })} /></Field>
              <Field label="Layout style"><input className={inputCls} value={r.layout_style ?? ""} onChange={(e) => update(i, { layout_style: e.target.value || null })} /></Field>
              <Field label="CTA label"><input className={inputCls} value={r.cta_label ?? ""} onChange={(e) => update(i, { cta_label: e.target.value || null })} /></Field>
              <Field label="CTA href"><input className={inputCls} value={r.cta_href ?? ""} onChange={(e) => update(i, { cta_href: e.target.value || null })} /></Field>
            </div>
            <div className="mt-3">
              <Field label="Body">
                <textarea rows={2} className={inputCls} value={r.body ?? ""} onChange={(e) => update(i, { body: e.target.value || null })} />
              </Field>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-muted-foreground">Avansert: content / settings JSON</summary>
              <div className="mt-2 grid gap-3">
                <JsonField
                  label="Content"
                  value={JSON.stringify(r.content ?? {}, null, 2)}
                  onChange={(v) => {
                    try { update(i, { content: JSON.parse(v || "{}") }); } catch { /* ignore parse errors while typing */ }
                  }}
                  rows={4}
                />
                <JsonField
                  label="Settings"
                  value={JSON.stringify(r.settings ?? {}, null, 2)}
                  onChange={(v) => {
                    try { update(i, { settings: JSON.parse(v || "{}") }); } catch { /* ignore */ }
                  }}
                  rows={3}
                />
              </div>
            </details>
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ingen seksjoner. Bruk «+ Legg til seksjon» eller generer fra Client Brain.</p>
        ) : null}
      </div>
    </Section>
  );
}
