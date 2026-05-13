import type { ThemeTokens } from "./site-types";
import {
  suggestFromBrain,
  SUPPORTED_MODULE_TYPES,
  type BrainSuggestionSection,
} from "./suggest-from-brain";

const VALID_MODULES = new Set<string>(SUPPORTED_MODULE_TYPES as readonly string[]);
const VALID_BG = new Set(["default", "muted", "mint", "dark", "image"]);
const VALID_LAYOUT = new Set(["centered", "split", "grid", "editorial"]);
const VALID_HERO_VARIANTS = new Set(["editorial", "centered", "split"]);
const VALID_SITE_TYPES = new Set([
  "nonprofit",
  "lead_generation",
  "food_brand",
  "portfolio",
  "campaign",
  "local_business",
]);
const VALID_INTENTS = new Set([
  "build_trust",
  "generate_leads",
  "create_craving",
  "book_call",
  "inform",
  "collect_support",
]);
const VALID_CONTENT_DEPTH = new Set(["lean", "balanced", "rich"]);
const VALID_STORYTELLING = new Set([
  "minimal",
  "editorial",
  "documentary",
  "conversion",
]);
const VALID_VISUAL_PROOF = new Set(["low", "medium", "high"]);
const VALID_RHYTHM = new Set(["calm", "varied", "high_contrast"]);
const VALID_COMPRESSION = new Set([
  "preserve_detail",
  "simplify",
  "aggressively_summarize",
]);

// JSON-like used in AI suggestion fields so the server-fn serializer accepts the shape.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonLike = any;

export interface AiSuggestion {
  client: {
    description?: string | null;
    theme: ThemeTokens;
  };
  brain: Record<string, JsonLike>;
  recipe: {
    recipe_type: string;
    site_type: string;
    primary_intent: string;
    design_direction: string;
    color_palette: Record<string, JsonLike>;
    typography: Record<string, JsonLike>;
    layout_preferences: Record<string, JsonLike>;
    module_strategy: Record<string, JsonLike>;
    variant_presets: Record<string, string>;
    enabled_modules: string[];
    navigation: { label: string; href: string }[];
    footer: Record<string, JsonLike>;
    content_depth: string;
    storytelling_mode: string;
    visual_proof_level: string;
    rhythm_strategy: string;
    compression_policy: string;
    creative_direction: string;
  };
  home_page: {
    title: string;
    meta_title: string;
    meta_description: string;
    status: string;
  };
  sections: BrainSuggestionSection[];
  source: "ai" | "fallback";
  warnings?: string[];
}

const SYSTEM_PROMPT = `Du er en senior nettsidearkitekt og copywriter for et norsk byrå.
Du analyserer en "Client Brain" og lager et komplett nettsideforslag.

KILDEHIERARKI (viktigst først — ALDRI bryt denne):
1. CLIENT BRAIN = sannheten om identitet, innhold og substans. Alt meningsfullt innhold herfra SKAL med.
2. MEDIA NOTES = sannheten om tilgjengelige bilder.
3. STUDIO BRAIN REFERENCES = subtil stilistisk veiledning. Smak/filter, ikke fasit.
Studio Brain skal aldri overstyre, redusere eller sensurere Client Brain.

OPPGAVEN DIN:
"Dette er klienten — hvordan ville Studio P.A. Halvorsen presentert dette på best mulig måte?"
IKKE: "Gjør dette om til en Studio P.A.H-side."

REGLER:
- Returner KUN gyldig JSON som matcher det avtalte skjemaet. Ingen markdown, ingen forklaring.
- Skriv på norsk bokmål.
- Tone: profesjonell, klar, menneskelig. Ikke hype. Ikke overdrivelser. Ikke hard selling med mindre primary_goal er lead generation.
- Ikke finn på konkrete tall, kunder, resultater eller samarbeidspartnere som ikke står i Brain/raw_notes. Hvis noe mangler, skriv nøkternt og generisk.
- Velg site_type fra: nonprofit, lead_generation, food_brand, portfolio, campaign, local_business.
- Velg primary_intent fra: build_trust, generate_leads, create_craving, book_call, inform, collect_support.
- Gyldige module_type: hero, trust_strip, mission, services_grid, activities, partners, proof, faq, contact_cta.
- Hero-varianter: editorial, centered, split.
- background_style: default, muted, mint, dark, image.
- layout_style: centered, split, grid, editorial.
- Ikke ta med partners-modul hvis det ikke finnes partnere i Brain. Ikke ta med faq-modul hvis det ikke finnes spørsmål. (Dette er det ENESTE tillatte grunnlaget for å droppe en seksjon.)
- Theme: bruk oklch(...) for farger.
- Strukturen på sections skal følge en gjennomtenkt rekkefølge for valgt site_type/primary_intent.

BEVAR ALLTID FRA CLIENT BRAIN (ikke kutt, ikke komprimer bort):
- flagship_story, representative_scene, emotional_trigger, memorable_takeaway, desired_feelings
- mission, vision, problem_statement, solution_statement
- alle services som egen seksjon (services_grid eller activities)
- alle trust_points (trust_strip eller proof)
- alle partners (egen partners-seksjon hvis 1+)
- alle faq-spørsmål (egen faq-seksjon hvis 1+)
- konkret personlighet, differensiatorer og emosjonelle kroker
Hvis Client Brain er rikt → siden SKAL bli rik. Tomhet er en feil.

MENNESKELIGE IDENTITETSFELTER (les aktivt og la dem styre forslaget):
- flagship_story: Hvis satt — bruk denne historien som mulig hero-retning og prioriter en storytelling-/mission-seksjon tidlig (rett etter hero).
- representative_scene: Hvis satt — la denne scenen prege hero-copy og imagery-retning (referer til den i sections.content/settings.imagery_direction).
- emotional_trigger: Hvis satt — vev denne følelsen inn i mission/proof/contact_cta-copy.
- anti_brand: Hvis satt — unngå denne tonen/stilen. F.eks. "ikke corporate" → unngå stiv/offentlig tone, hold copy varm og menneskelig.
- desired_feelings: Hvis satt — la den styre tone, copy-rytme og visuell tetthet. F.eks. "trygg, rolig, sett" → mer luft, mykere copy, roligere CTA-er.
- memorable_takeaway: Hvis satt — sørg for at denne ene tingen kommer tydelig frem i hero ELLER en dedikert seksjon.

MEDIA NOTES (hvis tilgjengelig):
- Du får en liste media_notes med image_url, title, description, emotional_value, suggested_usage, is_hero_candidate.
- Hvis et bilde er is_hero_candidate=true, foreslå det som hero-bilde via sections[hero].content.image_url og settings.image_alt.
- For øvrige bilder: foreslå hvilken seksjon de passer i (legg image_url i tilhørende sections[i].content.image_url) og bruk emotional_value/suggested_usage som veiledning.
- Ikke finn på bilder som ikke er i listen.

STUDIO BRAIN REFERENCES (subtil stilistisk veiledning — IKKE fasit):
- Bruk dem KUN til å forbedre presentasjon: hierarki, rytme, copy-klarhet, modulrekkefølge, spacing, CTA-formulering, tonalitet.
- "Minimal", "rolig", "luftig", "tasteful" betyr BEDRE HIERARKI og RENERE KOMPOSISJON innenfor hver seksjon — ALDRI færre seksjoner, mindre tekst eller mindre identitet.
- "Mer menneskelig" betyr bedre rytme, tydeligere fokus, sterkere historiefortelling, mer emosjonell klarhet — ikke mindre innhold.
- Studio Brain skal raffinere, ikke redusere. Style, ikke sensurere. Strukturere, ikke erstatte identitet.
- Hvis Studio Brain og Client Brain ser ut til å kollidere → Client Brain vinner. Alltid.
- Ikke kopier tekst, layout, branding eller assets fra referansene.

SITE RECIPE — CREATIVE DIRECTION (styrer HVORDAN innholdet presenteres, ikke OM):
Du får (og du skal selv foreslå) disse feltene i recipe:
- content_depth: lean | balanced | rich
- storytelling_mode: minimal | editorial | documentary | conversion
- visual_proof_level: low | medium | high
- rhythm_strategy: calm | varied | high_contrast
- compression_policy: preserve_detail | simplify | aggressively_summarize
- creative_direction: fritekst (HØYPRIORITERT instruks fra studioet — følg den nøye)

Regler:
- "Calm" betyr rolig HIERARKI, ikke tom side. "Tasteful" betyr bedre rytme, ikke svakere identitet. Minimalisme betyr ALDRI mindre innhold.
- compression_policy=preserve_detail (default) → behold konkrete detaljer, navn, scener og sitater fra Client Brain ordrett der det gir mening. Ikke generaliser bort substans.
- compression_policy=simplify → kortere copy, men samme antall meningsfulle seksjoner og samme substansielle punkter.
- compression_policy=aggressively_summarize → kun for veldig korte landingssider; krever eksplisitt valg.
- content_depth=rich → flere seksjoner, lengre body, flere cards/punkter, flere konkrete eksempler. Bruk all relevant Client Brain-data.
- content_depth=balanced → standard moderne nettside.
- content_depth=lean → strammere, men aldri på bekostning av flagship_story, services, trust_points, partners eller faq.
- storytelling_mode=documentary → prioriter ekte scener, aktiviteter, mennesker, bilder og øyeblikk. Bruk representative_scene og media_notes aktivt. Skriv konkret, ikke abstrakt.
- storytelling_mode=editorial → magasinaktig rytme med tydelige eyebrows, sitater, varierte layouter.
- storytelling_mode=conversion → mer direkte CTA-rytme, men behold trust og substans.
- storytelling_mode=minimal → strammere copy, men samme antall meningsfulle seksjoner.
- visual_proof_level=high → bruk media_notes aktivt; spre bilder utover siden; foreslå image_url på flere seksjoner enn bare hero.
- visual_proof_level=medium → bilde i hero + 1-2 andre relevante seksjoner.
- visual_proof_level=low → tekst-tungt; bilde kun der det virkelig løfter.
- rhythm_strategy=varied → varier background_style (default/muted/mint/dark/image), layout_style og seksjonstyper. ALDRI white/card/white/card hele veien.
- rhythm_strategy=calm → ensartet, rolig rytme — men fortsatt full innholdsdybde.
- rhythm_strategy=high_contrast → tydelige skifter mellom mørke/lyse/bilde-seksjoner for dramatikk.
- creative_direction (fritekst): les denne som DIREKTE INSTRUKS fra studioet. Den overstyrer Studio Brain-referanser hvis de motsier hverandre. Den overstyrer ALDRI Client Brain-substans.

Når du velger defaults selv (hvis recipe-feltene er tomme):
- nonprofit med ekte aktiviteter → rich / documentary / high / varied / preserve_detail
- lead_generation/kurs → balanced / conversion / medium / varied / preserve_detail
- food_brand → balanced / editorial / high / varied / preserve_detail
- portfolio → balanced / editorial / high / varied / preserve_detail
- ellers → balanced / editorial / medium / varied / preserve_detail`;

function clampString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function asObj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

function validateAndCoerce(parsed: unknown): AiSuggestion {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI returnerte ikke et objekt");
  }
  const p = parsed as Record<string, unknown>;
  const recipeIn = asObj(p.recipe);
  const sectionsIn = asArray<Record<string, unknown>>(p.sections);

  if (!sectionsIn.length) throw new Error("AI returnerte ingen seksjoner");

  const warnings: string[] = [];
  const sections: BrainSuggestionSection[] = sectionsIn
    .map((s, i) => {
      const mt = clampString(s.module_type);
      if (!VALID_MODULES.has(mt)) {
        warnings.push(`Hopper over ukjent module_type "${mt}"`);
        return null;
      }
      let variant = clampString(s.variant, "default");
      if (mt === "hero" && !VALID_HERO_VARIANTS.has(variant)) variant = "editorial";
      const bg = clampString(s.background_style, "default");
      const layout = clampString(s.layout_style, "");
      const row: BrainSuggestionSection = {
        module_type: mt as BrainSuggestionSection["module_type"],
        variant,
        sort_order: typeof s.sort_order === "number" ? (s.sort_order as number) : i,
        is_visible: s.is_visible !== false,
        anchor_id: clampString(s.anchor_id) || null,
        eyebrow: clampString(s.eyebrow) || null,
        title: clampString(s.title) || null,
        subtitle: clampString(s.subtitle) || null,
        body: clampString(s.body) || null,
        cta_label: clampString(s.cta_label) || null,
        cta_href: clampString(s.cta_href) || null,
        background_style: VALID_BG.has(bg) ? bg : "default",
        layout_style: VALID_LAYOUT.has(layout) ? layout : null,
        content: asObj(s.content),
        settings: asObj(s.settings),
      };
      return row;
    })
    .filter((s): s is BrainSuggestionSection => s !== null)
    .map((s, i) => ({ ...s, sort_order: i }));

  if (!sections.length) throw new Error("Ingen gyldige seksjoner etter validering");

  const siteType = clampString(recipeIn.site_type, "nonprofit");
  const primaryIntent = clampString(recipeIn.primary_intent, "build_trust");

  const clientIn = asObj(p.client);
  const themeIn = asObj(clientIn.theme);

  const brainIn = asObj(p.brain);
  const homeIn = asObj(p.home_page);

  return {
    client: {
      description: clampString(clientIn.description) || null,
      theme: themeIn as ThemeTokens,
    },
    brain: brainIn,
    recipe: {
      recipe_type: clampString(recipeIn.recipe_type, "trust_based_nonprofit"),
      site_type: VALID_SITE_TYPES.has(siteType) ? siteType : "nonprofit",
      primary_intent: VALID_INTENTS.has(primaryIntent) ? primaryIntent : "build_trust",
      design_direction: clampString(recipeIn.design_direction, "fiken_calm_mint"),
      color_palette: asObj(recipeIn.color_palette),
      typography: asObj(recipeIn.typography),
      layout_preferences: asObj(recipeIn.layout_preferences),
      module_strategy: asObj(recipeIn.module_strategy),
      variant_presets: asObj(recipeIn.variant_presets) as Record<string, string>,
      enabled_modules: asArray<string>(recipeIn.enabled_modules).filter((m) =>
        VALID_MODULES.has(m),
      ),
      navigation: asArray<{ label: string; href: string }>(recipeIn.navigation).filter(
        (n) => n && typeof n.label === "string" && typeof n.href === "string",
      ),
      footer: asObj(recipeIn.footer),
    },
    home_page: {
      title: clampString(homeIn.title, "Forsiden"),
      meta_title: clampString(homeIn.meta_title, ""),
      meta_description: clampString(homeIn.meta_description, ""),
      status: clampString(homeIn.status, "published"),
    },
    sections,
    source: "ai",
    warnings: warnings.length ? warnings : undefined,
  };
}

function fallbackSuggestion(brain: Record<string, unknown>): AiSuggestion {
  const heur = suggestFromBrain(brain);
  return {
    client: { description: null, theme: heur.theme },
    brain: {},
    recipe: {
      recipe_type: heur.recipe_type,
      site_type: heur.site_type,
      primary_intent: heur.primary_intent,
      design_direction: heur.design_direction,
      color_palette: {},
      typography: {},
      layout_preferences: {},
      module_strategy: {},
      variant_presets: heur.variant_presets,
      enabled_modules: heur.enabled_modules,
      navigation: heur.navigation,
      footer: heur.footer as Record<string, unknown>,
    },
    home_page: {
      title: "Forsiden",
      meta_title: "",
      meta_description: "",
      status: "published",
    },
    sections: heur.sections,
    source: "fallback",
  };
}

export async function generateAiSuggestion(input: {
  client: Record<string, unknown> | null;
  brain: Record<string, unknown>;
  recipe: Record<string, unknown> | null;
  sections: unknown[];
  media_notes?: unknown[];
  studio_references?: Record<string, unknown>[];
}): Promise<AiSuggestion> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    const fb = fallbackSuggestion(input.brain);
    fb.warnings = ["LOVABLE_API_KEY mangler — brukte heuristikk"];
    return fb;
  }

  const studioRefsForPrompt = (input.studio_references ?? []).map((r) => ({
    name: r.name,
    reference_type: r.reference_type,
    rank: r.rank,
    what_works: r.what_works,
    visual_principles: r.visual_principles,
    conversion_principles: r.conversion_principles,
    seo_principles: r.seo_principles,
    component_patterns: r.component_patterns,
    tone_patterns: r.tone_patterns,
  }));

  const userPayload = {
    instruction:
      "Analyser klienten under og lag et komplett nettsideforslag. Returner kun JSON i avtalt format.",
    current: {
      client: input.client,
      brain: input.brain,
      recipe: input.recipe,
      sections_count: input.sections.length,
      media_notes: input.media_notes ?? [],
      studio_brain_references: studioRefsForPrompt,
    },
    expected_format: {
      client: { description: "", theme: { primaryColor: "", backgroundColor: "", surfaceColor: "", textColor: "", radius: "", fontStyle: "" } },
      brain: { site_type: "", primary_goal: "", secondary_goal: "", audience: [], brand_keywords: [], tone_keywords: [], short_description: "", long_description: "", mission: "", vision: "", problem_statement: "", solution_statement: "", trust_points: [], services: [], partners: [], faq: [], cta_primary_label: "", cta_primary_href: "", cta_secondary_label: "", cta_secondary_href: "", flagship_story: "", emotional_trigger: "", anti_brand: "", memorable_takeaway: "", representative_scene: "", desired_feelings: "" },
      recipe: { recipe_type: "", site_type: "", primary_intent: "", design_direction: "", color_palette: {}, typography: {}, layout_preferences: {}, module_strategy: {}, variant_presets: {}, enabled_modules: [], navigation: [], footer: {} },
      home_page: { title: "", meta_title: "", meta_description: "", status: "published" },
      sections: [{ module_type: "", variant: "", sort_order: 0, is_visible: true, anchor_id: "", eyebrow: "", title: "", subtitle: "", body: "", cta_label: "", cta_href: "", background_style: "", layout_style: "", content: {}, settings: {} }],
    },
  };

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(userPayload) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`AI gateway ${res.status}: ${t.slice(0, 300)}`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    if (!content.trim()) throw new Error("Tomt AI-svar");
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try extracting first {...} block
      const m = content.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Kunne ikke parse JSON fra AI");
      parsed = JSON.parse(m[0]);
    }
    return validateAndCoerce(parsed);
  } catch (err) {
    console.error("[ai-suggestion] AI call failed, using fallback:", err);
    const fb = fallbackSuggestion(input.brain);
    fb.warnings = [`AI feilet: ${(err as Error).message} — brukte heuristikk`];
    return fb;
  }
}
