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
import { supabase } from "@/integrations/supabase/client";
import {
  EMPTY_FORMAT_BRIEF,
  parseFormatBrief,
  type FormatBrief,
} from "@/lib/format-brief";
import { PAGE_TEMPLATES, type PageTemplate } from "@/lib/page-templates";
import { buildClientContextPacket } from "@/lib/client-context-packet";

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

type Tab = "format" | "client" | "brain" | "recipe" | "sections";

function StudioEditor() {
  const data = Route.useLoaderData() as Bundle;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("format");
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
    content_depth: (r as { content_depth?: string } | null)?.content_depth ?? "balanced",
    storytelling_mode: (r as { storytelling_mode?: string } | null)?.storytelling_mode ?? "editorial",
    visual_proof_level: (r as { visual_proof_level?: string } | null)?.visual_proof_level ?? "medium",
    rhythm_strategy: (r as { rhythm_strategy?: string } | null)?.rhythm_strategy ?? "varied",
    compression_policy: (r as { compression_policy?: string } | null)?.compression_policy ?? "preserve_detail",
    creative_direction: (r as { creative_direction?: string | null } | null)?.creative_direction ?? "",
    page_template:
      ((r as { page_template?: string } | null)?.page_template as PageTemplate | undefined) ??
      "organization_documentary",
    visual_tone: (r as { visual_tone?: string | null } | null)?.visual_tone ?? "",
  });

  const initialFormatBrief: FormatBrief = parseFormatBrief(
    (bExt.format_brief as unknown) ?? EMPTY_FORMAT_BRIEF,
  );
  const [formatBrief, setFormatBrief] = useState<FormatBrief>(initialFormatBrief);

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
            content_depth: recipe.content_depth,
            storytelling_mode: recipe.storytelling_mode,
            visual_proof_level: recipe.visual_proof_level,
            rhythm_strategy: recipe.rhythm_strategy,
            compression_policy: recipe.compression_policy,
            creative_direction: recipe.creative_direction,
            page_template: recipe.page_template,
            visual_tone: recipe.visual_tone || null,
          },
        });
      }
      if (tab === "format") {
        // Persist page_template + visual_tone on recipe
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
            content_depth: recipe.content_depth,
            storytelling_mode: recipe.storytelling_mode,
            visual_proof_level: recipe.visual_proof_level,
            rhythm_strategy: recipe.rhythm_strategy,
            compression_policy: recipe.compression_policy,
            creative_direction: recipe.creative_direction,
            page_template: recipe.page_template,
            visual_tone: recipe.visual_tone || null,
          },
        });
        // Persist format_brief on brain (preserving existing brain fields)
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
            format_brief: formatBrief,
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
    { id: "format", label: "Format" },
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
            href={`/?client=${encodeURIComponent(client.slug)}`}
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

      {tab === "format" && (
        <FormatTab
          recipe={recipe as unknown as RecipeState}
          setRecipe={setRecipe as unknown as React.Dispatch<React.SetStateAction<RecipeState>>}
          formatBrief={formatBrief}
          setFormatBrief={setFormatBrief}
          packetPreview={(() => {
            try {
              return buildClientContextPacket({
                client: { ...(c as Client), theme: parseJson(client.theme, {}) as Client["theme"] },
                brain: { ...(b ?? ({} as ClientBrain)), format_brief: formatBrief as never } as ClientBrain,
                recipe: {
                  ...((r ?? {}) as SiteRecipe),
                  page_template: recipe.page_template,
                  visual_tone: recipe.visual_tone || null,
                } as SiteRecipe,
                sections: data.sections,
              });
            } catch {
              return null;
            }
          })()}
        />
      )}

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
                  <div><span className="text-muted-foreground">Content depth:</span> {(suggestion.recipe as { content_depth?: string }).content_depth ?? "—"}</div>
                  <div><span className="text-muted-foreground">Storytelling mode:</span> {(suggestion.recipe as { storytelling_mode?: string }).storytelling_mode ?? "—"}</div>
                  <div><span className="text-muted-foreground">Visual proof:</span> {(suggestion.recipe as { visual_proof_level?: string }).visual_proof_level ?? "—"}</div>
                  <div><span className="text-muted-foreground">Rhythm:</span> {(suggestion.recipe as { rhythm_strategy?: string }).rhythm_strategy ?? "—"}</div>
                  <div><span className="text-muted-foreground">Compression:</span> {(suggestion.recipe as { compression_policy?: string }).compression_policy ?? "—"}</div>
                </div>
                {(suggestion.recipe as { creative_direction?: string }).creative_direction ? (
                  <div className="rounded-md border border-border bg-background p-3">
                    <div className="text-xs uppercase text-muted-foreground">Creative direction</div>
                    <div className="mt-1 whitespace-pre-wrap text-xs">{(suggestion.recipe as { creative_direction?: string }).creative_direction}</div>
                  </div>
                ) : null}
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
                {(() => {
                  const refs = (suggestion as unknown as { studio_references_used?: { id: string; name: string; reference_type: string; rank: number; what_works: string | null }[] }).studio_references_used ?? [];
                  if (!refs.length) return null;
                  return (
                    <div className="rounded-md border border-border bg-background p-3">
                      <div className="text-xs uppercase text-muted-foreground">Studio Brain brukt ({refs.length})</div>
                      <ul className="mt-2 space-y-2">
                        {refs.map((r) => (
                          <li key={r.id} className="text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{r.name}</span>
                              <span className="rounded-full bg-muted px-2 py-0.5">{r.reference_type}</span>
                              <span className="text-muted-foreground">rank {r.rank}</span>
                            </div>
                            {r.what_works && (
                              <div className="mt-1 line-clamp-2 text-muted-foreground">{r.what_works}</div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
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

          <MediaNotesEditor clientId={c.id} />
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

          <Section title="Creative direction">
            <p className="mb-4 text-sm text-muted-foreground">
              Disse feltene styrer HVORDAN AI presenterer Client Brain — ikke OM
              ting tas med. Minimalisme her betyr aldri mindre innhold.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Content depth" hint="Hvor rik siden skal være">
                <select className={inputCls} value={recipe.content_depth} onChange={(e) => setRecipe({ ...recipe, content_depth: e.target.value })}>
                  <option value="lean">lean</option>
                  <option value="balanced">balanced</option>
                  <option value="rich">rich</option>
                </select>
              </Field>
              <Field label="Storytelling mode" hint="Hvordan historien fortelles">
                <select className={inputCls} value={recipe.storytelling_mode} onChange={(e) => setRecipe({ ...recipe, storytelling_mode: e.target.value })}>
                  <option value="minimal">minimal</option>
                  <option value="editorial">editorial</option>
                  <option value="documentary">documentary</option>
                  <option value="conversion">conversion</option>
                </select>
              </Field>
              <Field label="Visual proof level" hint="Hvor mye bildebevis siden skal vise">
                <select className={inputCls} value={recipe.visual_proof_level} onChange={(e) => setRecipe({ ...recipe, visual_proof_level: e.target.value })}>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </Field>
              <Field label="Rhythm strategy" hint="Variasjon mellom seksjoner">
                <select className={inputCls} value={recipe.rhythm_strategy} onChange={(e) => setRecipe({ ...recipe, rhythm_strategy: e.target.value })}>
                  <option value="calm">calm</option>
                  <option value="varied">varied</option>
                  <option value="high_contrast">high_contrast</option>
                </select>
              </Field>
              <Field label="Compression policy" hint="Hvor mye Client Brain-detaljer skal bevares">
                <select className={inputCls} value={recipe.compression_policy} onChange={(e) => setRecipe({ ...recipe, compression_policy: e.target.value })}>
                  <option value="preserve_detail">preserve_detail</option>
                  <option value="simplify">simplify</option>
                  <option value="aggressively_summarize">aggressively_summarize</option>
                </select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Creative direction (fritekst — høyprioritert AI-instruks)" hint="Skriv som om du brifer en designer. Overstyrer Studio Brain-referanser, men aldri Client Brain-substans.">
                <textarea className={inputCls} rows={6} value={recipe.creative_direction} onChange={(e) => setRecipe({ ...recipe, creative_direction: e.target.value })} placeholder="F.eks. 'Dokumentarisk og varm. Bruk bilder fra aktivitetene aktivt. Ikke corporate. Behold konkrete scener fra brain-en. Vekt på mennesker og øyeblikk.'" />
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

function MediaNotesEditor({ clientId }: { clientId: string }) {
  const [notes, setNotes] = useState<MediaNote[]>([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    image_url: "",
    title: "",
    description: "",
    emotional_value: "",
    suggested_usage: "",
    is_hero_candidate: false,
  });

  async function reload() {
    const { notes } = await listMediaNotes({ data: { client_id: clientId } });
    setNotes(notes);
  }
  useEffect(() => {
    reload().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function add() {
    if (!draft.image_url.trim()) return;
    setBusy(true);
    try {
      await upsertMediaNote({
        data: {
          client_id: clientId,
          image_url: draft.image_url.trim(),
          title: draft.title || null,
          description: draft.description || null,
          emotional_value: draft.emotional_value || null,
          suggested_usage: draft.suggested_usage || null,
          is_hero_candidate: draft.is_hero_candidate,
        },
      });
      setDraft({
        image_url: "",
        title: "",
        description: "",
        emotional_value: "",
        suggested_usage: "",
        is_hero_candidate: false,
      });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function patch(n: MediaNote, p: Partial<MediaNote>) {
    setBusy(true);
    try {
      await upsertMediaNote({
        data: {
          id: n.id,
          client_id: clientId,
          image_url: p.image_url ?? n.image_url,
          title: p.title !== undefined ? p.title : n.title,
          description: p.description !== undefined ? p.description : n.description,
          emotional_value:
            p.emotional_value !== undefined ? p.emotional_value : n.emotional_value,
          suggested_usage:
            p.suggested_usage !== undefined ? p.suggested_usage : n.suggested_usage,
          is_hero_candidate:
            p.is_hero_candidate !== undefined ? p.is_hero_candidate : n.is_hero_candidate,
        },
      });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Slette dette bildenotatet?")) return;
    setBusy(true);
    try {
      await deleteMediaNote({ data: { id } });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${clientId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("media")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      setDraft((d) => ({
        ...d,
        image_url: data.publicUrl,
        title: d.title || file.name.replace(/\.[^.]+$/, ""),
      }));
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Section title="Media notes — bilde-kontekst for AI">
      <p className="text-sm text-muted-foreground">
        Last opp bilder og fortell AI litt om hvert bilde. AI bruker dette
        til å foreslå hero-bilde og hvor bilder passer i seksjonene.
      </p>

      <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
        <div className="grid gap-3">
          <Field label="Bilde" hint="Last opp en fil (PNG, JPG, WebP)">
            <input
              type="file"
              accept="image/*"
              className={inputCls}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
              disabled={uploading}
            />
            {uploading ? (
              <p className="mt-1 text-xs text-muted-foreground">Laster opp…</p>
            ) : null}
            {uploadError ? (
              <p className="mt-1 text-xs text-destructive">{uploadError}</p>
            ) : null}
            {draft.image_url ? (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={draft.image_url}
                  alt=""
                  className="h-12 w-12 rounded object-cover border border-border"
                />
                <a
                  href={draft.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted-foreground underline truncate"
                >
                  {draft.image_url}
                </a>
              </div>
            ) : null}
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tittel">
              <input
                className={inputCls}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </Field>
            <Field label="Følelsesverdi" hint="Hva formidler bildet emosjonelt?">
              <input
                className={inputCls}
                value={draft.emotional_value}
                onChange={(e) => setDraft({ ...draft, emotional_value: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Beskrivelse" hint="Hva ser man på bildet?">
            <textarea
              rows={2}
              className={inputCls}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </Field>
          <Field
            label="Foreslått bruk"
            hint="Hvor i sidestrukturen passer bildet? F.eks. «hero», «mission», «aktiviteter»."
          >
            <input
              className={inputCls}
              value={draft.suggested_usage}
              onChange={(e) => setDraft({ ...draft, suggested_usage: e.target.value })}
            />
          </Field>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.is_hero_candidate}
              onChange={(e) =>
                setDraft({ ...draft, is_hero_candidate: e.target.checked })
              }
            />
            Hero-kandidat
          </label>
          <div>
            <button
              onClick={add}
              disabled={busy || !draft.image_url.trim()}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {busy ? "Lagrer…" : "+ Legg til bildenotat"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ingen bildenotater enda.</p>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[120px_1fr]"
            >
              <a href={n.image_url} target="_blank" rel="noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={n.image_url}
                  alt={n.title ?? ""}
                  className="aspect-[4/3] w-full rounded-md object-cover"
                />
              </a>
              <div className="grid gap-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Tittel">
                    <input
                      className={inputCls}
                      value={n.title ?? ""}
                      onChange={(e) =>
                        setNotes((ns) =>
                          ns.map((x) =>
                            x.id === n.id ? { ...x, title: e.target.value } : x,
                          ),
                        )
                      }
                      onBlur={(e) => patch(n, { title: e.target.value || null })}
                    />
                  </Field>
                  <Field label="Følelsesverdi">
                    <input
                      className={inputCls}
                      value={n.emotional_value ?? ""}
                      onChange={(e) =>
                        setNotes((ns) =>
                          ns.map((x) =>
                            x.id === n.id
                              ? { ...x, emotional_value: e.target.value }
                              : x,
                          ),
                        )
                      }
                      onBlur={(e) =>
                        patch(n, { emotional_value: e.target.value || null })
                      }
                    />
                  </Field>
                </div>
                <Field label="Beskrivelse">
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={n.description ?? ""}
                    onChange={(e) =>
                      setNotes((ns) =>
                        ns.map((x) =>
                          x.id === n.id ? { ...x, description: e.target.value } : x,
                        ),
                      )
                    }
                    onBlur={(e) => patch(n, { description: e.target.value || null })}
                  />
                </Field>
                <Field label="Foreslått bruk">
                  <input
                    className={inputCls}
                    value={n.suggested_usage ?? ""}
                    onChange={(e) =>
                      setNotes((ns) =>
                        ns.map((x) =>
                          x.id === n.id
                            ? { ...x, suggested_usage: e.target.value }
                            : x,
                        ),
                      )
                    }
                    onBlur={(e) => patch(n, { suggested_usage: e.target.value || null })}
                  />
                </Field>
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={n.is_hero_candidate}
                      onChange={(e) =>
                        patch(n, { is_hero_candidate: e.target.checked })
                      }
                    />
                    Hero-kandidat
                  </label>
                  <button
                    onClick={() => remove(n.id)}
                    className="rounded border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
                  >
                    Slett
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Section>
  );
}

// ---------------- Format Tab ----------------

function CsvInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const text = value.join(", ");
  return (
    <Field label={label} hint={hint}>
      <input
        className={inputCls}
        value={text}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
      />
    </Field>
  );
}

type RecipeState = {
  page_template: PageTemplate;
  visual_tone: string;
  [key: string]: unknown;
};

function FormatTab({
  recipe,
  setRecipe,
  formatBrief,
  setFormatBrief,
  packetPreview,
}: {
  recipe: RecipeState;
  setRecipe: React.Dispatch<React.SetStateAction<RecipeState>>;
  formatBrief: FormatBrief;
  setFormatBrief: React.Dispatch<React.SetStateAction<FormatBrief>>;
  packetPreview: ReturnType<typeof buildClientContextPacket> | null;
}) {
  const tplCfg = PAGE_TEMPLATES[recipe.page_template];
  const tones = Object.keys(tplCfg.theme_pack);

  return (
    <>
      <Section title="Page template (manuell — AI velger ikke dette)">
        <p className="mb-4 text-sm text-muted-foreground">
          Velg digitalt format først. Dette styrer hvilken renderer og blueprint
          som brukes, og hvilke moduler som er lovlige.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Page template" hint="organization_documentary | brand_poster | …">
            <select
              className={inputCls}
              value={recipe.page_template}
              onChange={(e) =>
                setRecipe((r) => ({
                  ...r,
                  page_template: e.target.value as PageTemplate,
                  visual_tone: "",
                }))
              }
            >
              {Object.values(PAGE_TEMPLATES).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Visual tone" hint={`Pakker for ${tplCfg.label}`}>
            <select
              className={inputCls}
              value={recipe.visual_tone || tplCfg.default_visual_tone}
              onChange={(e) => setRecipe((r) => ({ ...r, visual_tone: e.target.value }))}
            >
              {tones.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-3 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          {tplCfg.description} · section ceiling {tplCfg.section_ceiling} · forbidden:{" "}
          {tplCfg.forbidden_modules.length
            ? tplCfg.forbidden_modules.join(", ")
            : "—"}
        </div>
      </Section>

      <Section title="Format Brief (følelsen / restraint)">
        <p className="mb-4 text-sm text-muted-foreground">
          Disse styrer hvordan siden skal kjennes — ikke hva AI får lov til.
          Sett dette FØR du genererer. Påkrevd: «På 3 sek skal brukeren …».
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Digital object" hint="Hva er dette? En organisasjon, en plakat, et verktøy?">
            <select
              className={inputCls}
              value={formatBrief.digital_object}
              onChange={(e) =>
                setFormatBrief((f) => ({ ...f, digital_object: e.target.value as FormatBrief["digital_object"] }))
              }
            >
              <option value="organization">organization</option>
              <option value="popup_poster">popup_poster</option>
              <option value="conversion_tool">conversion_tool</option>
              <option value="editorial_room">editorial_room</option>
              <option value="community_platform">community_platform</option>
            </select>
          </Field>
          <Field label="Hero job" hint="Hva er hovedoppgaven til hero?">
            <select
              className={inputCls}
              value={formatBrief.hero_job}
              onChange={(e) =>
                setFormatBrief((f) => ({ ...f, hero_job: e.target.value as FormatBrief["hero_job"] }))
              }
            >
              <option value="create_craving">create_craving</option>
              <option value="build_trust">build_trust</option>
              <option value="explain_offer">explain_offer</option>
              <option value="book_contact">book_contact</option>
            </select>
          </Field>
          <Field label="Information budget" hint="Hvor mye tekst skal siden tåle?">
            <select
              className={inputCls}
              value={formatBrief.information_budget}
              onChange={(e) =>
                setFormatBrief((f) => ({
                  ...f,
                  information_budget: e.target.value as FormatBrief["information_budget"],
                }))
              }
            >
              <option value="scannable_20s">scannable_20s</option>
              <option value="standard">standard</option>
              <option value="documentary_deep">documentary_deep</option>
            </select>
          </Field>
          <Field label="Visual volume" hint="Hvor høyt skal designet rope?">
            <select
              className={inputCls}
              value={formatBrief.visual_volume ?? ""}
              onChange={(e) =>
                setFormatBrief((f) => ({
                  ...f,
                  visual_volume: (e.target.value || undefined) as FormatBrief["visual_volume"],
                }))
              }
            >
              <option value="">— ikke satt —</option>
              <option value="quiet">quiet</option>
              <option value="medium">medium</option>
              <option value="loud">loud</option>
            </select>
          </Field>
          <Field label="Copy style" hint="Stemme i tekst">
            <select
              className={inputCls}
              value={formatBrief.copy_style ?? ""}
              onChange={(e) =>
                setFormatBrief((f) => ({
                  ...f,
                  copy_style: (e.target.value || undefined) as FormatBrief["copy_style"],
                }))
              }
            >
              <option value="">— ikke satt —</option>
              <option value="editorial_warm">editorial_warm</option>
              <option value="documentary_calm">documentary_calm</option>
              <option value="punchy_minimal">punchy_minimal</option>
              <option value="playful_loud">playful_loud</option>
              <option value="neutral">neutral</option>
            </select>
          </Field>
          <Field
            label="Section ceiling (override)"
            hint={`Tom = bruk template-default (${tplCfg.section_ceiling}).`}
          >
            <input
              type="number"
              min={1}
              max={20}
              className={inputCls}
              value={formatBrief.section_ceiling_override ?? ""}
              onChange={(e) =>
                setFormatBrief((f) => ({
                  ...f,
                  section_ceiling_override: e.target.value
                    ? Math.max(1, Math.min(20, Number(e.target.value)))
                    : undefined,
                }))
              }
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4">
          <Field
            label="First 3 seconds (påkrevd)"
            hint="«På 3 sek skal brukeren …». Maks ~200 tegn."
          >
            <textarea
              rows={2}
              className={inputCls}
              value={formatBrief.first_3_seconds}
              maxLength={200}
              onChange={(e) =>
                setFormatBrief((f) => ({ ...f, first_3_seconds: e.target.value }))
              }
              placeholder="Se arancini, forstå popup, vil følge neste runde"
            />
          </Field>
          <CsvInput
            label="Feels like"
            hint="Maks 5. Kommaseparert."
            value={formatBrief.feels_like}
            onChange={(v) => setFormatBrief((f) => ({ ...f, feels_like: v.slice(0, 5) }))}
            placeholder="warm, packaging, editorial_food, limited_drop"
          />
          <CsvInput
            label="Må IKKE føles som (min 3)"
            hint="Kommaseparert. Brukes som forbudt-liste mot AI."
            value={formatBrief.must_not_feel_like}
            onChange={(v) =>
              setFormatBrief((f) => ({ ...f, must_not_feel_like: v.slice(0, 8) }))
            }
            placeholder="startup, saas, nonprofit, restaurant_chain"
          />
          <CsvInput
            label="Anti-patterns (valgfri)"
            value={formatBrief.anti_patterns ?? []}
            onChange={(v) => setFormatBrief((f) => ({ ...f, anti_patterns: v }))}
            placeholder="trust_strip, services_grid"
          />
        </div>
      </Section>

      {packetPreview ? (
        <Section title="ClientContextPacket (debug)">
          <div className="grid gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">page_template:</span>{" "}
              <strong>{packetPreview.page_template}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">visual_tone:</span>{" "}
              <strong>{packetPreview.visual_tone}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">section_ceiling:</span>{" "}
              {packetPreview.template_config.section_ceiling}
            </div>
            <div>
              <span className="text-muted-foreground">allowed_modules:</span>{" "}
              {packetPreview.template_config.allowed_modules.join(", ")}
            </div>
            <div>
              <span className="text-muted-foreground">forbidden_modules:</span>{" "}
              {packetPreview.template_config.forbidden_modules.join(", ") || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">banned_phrases:</span>{" "}
              {packetPreview.constraints.banned_phrases.join(", ")}
            </div>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-muted-foreground">
              Se full pakke (JSON)
            </summary>
            <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-background p-3 text-xs">
              {JSON.stringify(packetPreview, null, 2)}
            </pre>
          </details>
        </Section>
      ) : null}
    </>
  );
}

