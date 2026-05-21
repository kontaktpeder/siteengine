import type { ModuleType, ThemeTokens } from "@/lib/site-types";
import type { SectionRendererSettings } from "@/lib/renderer-resolver";

export type SiteArchetype =
  | "nonprofit_documentary"
  | "food_popup_editorial"
  | "neutral";

export interface ArchetypeConfig {
  id: SiteArchetype;
  allowed_modules: ModuleType[];
  forbidden_modules: ModuleType[];
  forbidden_assumptions: string[];
  banned_words: string[];
  default_theme: ThemeTokens;
  design_direction: string;
  recipe_type: string;
  primary_intent: string;
  section_blueprint: ModuleType[];
  default_renderer_by_module: Partial<Record<ModuleType, SectionRendererSettings>>;
}

const NEUTRAL_THEME: ThemeTokens = {
  primaryColor: "oklch(0.45 0.02 250)",
  backgroundColor: "oklch(0.98 0 0)",
  surfaceColor: "oklch(1 0 0)",
  textColor: "oklch(0.2 0 0)",
  borderColor: "oklch(0.9 0 0)",
  radius: "0.75rem",
  fontStyle: "sans",
};

export const ARCHETYPE_CONFIGS: Record<SiteArchetype, ArchetypeConfig> = {
  neutral: {
    id: "neutral",
    allowed_modules: [
      "hero",
      "trust_strip",
      "mission",
      "services_grid",
      "partners",
      "proof",
      "activities",
      "faq",
      "contact_cta",
    ],
    forbidden_modules: [],
    forbidden_assumptions: [],
    banned_words: [],
    default_theme: NEUTRAL_THEME,
    design_direction: "neutral_studio",
    recipe_type: "generic",
    primary_intent: "inform",
    section_blueprint: ["hero", "services_grid", "contact_cta"],
    default_renderer_by_module: {
      hero: { pacing: "balanced", imageScale: "medium", ctaIntensity: "normal" },
      services_grid: { pacing: "balanced", imageScale: "medium", ctaIntensity: "normal" },
      contact_cta: { pacing: "balanced", ctaIntensity: "normal" },
    },
  },
  nonprofit_documentary: {
    id: "nonprofit_documentary",
    allowed_modules: [
      "hero",
      "trust_strip",
      "mission",
      "services_grid",
      "activities",
      "partners",
      "proof",
      "faq",
      "contact_cta",
    ],
    forbidden_modules: [],
    forbidden_assumptions: ["Dette er en restaurant eller matmerkevare"],
    banned_words: ["bestill nå", "limited drop"],
    default_theme: {
      primaryColor: "oklch(0.55 0.09 168)",
      backgroundColor: "oklch(0.985 0.012 95)",
      surfaceColor: "oklch(1 0 0)",
      textColor: "oklch(0.22 0.02 160)",
      borderColor: "oklch(0.9 0.02 130)",
      radius: "1rem",
      fontStyle: "mixed",
    },
    design_direction: "warm_documentary",
    recipe_type: "trust_based_nonprofit",
    primary_intent: "build_trust",
    section_blueprint: ["hero", "trust_strip", "mission", "services_grid", "contact_cta"],
    default_renderer_by_module: {
      hero: { pacing: "spacious", imageScale: "large", ctaIntensity: "soft" },
      services_grid: { pacing: "spacious", imageScale: "medium", ctaIntensity: "soft" },
      contact_cta: { pacing: "spacious", ctaIntensity: "soft" },
    },
  },
  food_popup_editorial: {
    id: "food_popup_editorial",
    allowed_modules: ["hero", "services_grid", "proof", "partners", "faq", "contact_cta"],
    forbidden_modules: ["mission", "activities", "trust_strip"],
    forbidden_assumptions: [
      "Dette er en veldedig forening",
      "Siden trenger aktivitetsseksjon",
    ],
    banned_words: [
      "forening",
      "inkludering",
      "frivillig",
      "vårt oppdrag",
      "aktiviteter for alle",
    ],
    default_theme: {
      primaryColor: "oklch(0.58 0.20 35)",        // tomato / burnt orange — CTA
      primaryForegroundColor: "oklch(0.98 0.01 80)",
      secondaryColor: "oklch(0.92 0.05 75)",      // warm sand (NOT mint)
      secondaryForegroundColor: "oklch(0.20 0.04 40)",
      accentColor: "oklch(0.18 0.04 40)",         // espresso accent for eyebrows
      backgroundColor: "oklch(0.97 0.03 75)",     // warm cream
      surfaceColor: "oklch(1 0 0)",
      textColor: "oklch(0.18 0.04 40)",           // espresso ink
      borderColor: "oklch(0.88 0.05 55)",
      mutedColor: "oklch(0.45 0.04 40)",
      radius: "0.5rem",
      fontStyle: "sans",
    },
    design_direction: "warm_editorial_food",
    recipe_type: "conversion_food",
    primary_intent: "create_craving",
    section_blueprint: ["hero", "services_grid", "contact_cta"],
    default_renderer_by_module: {
      hero: { pacing: "tight", imageScale: "full", ctaIntensity: "strong" },
      services_grid: { pacing: "tight", imageScale: "large", ctaIntensity: "strong" },
      contact_cta: { pacing: "tight", ctaIntensity: "strong" },
    },
  },
};

export function isSiteArchetype(v: unknown): v is SiteArchetype {
  return typeof v === "string" && v in ARCHETYPE_CONFIGS;
}

export function inferArchetypeFromBrain(
  brain: Record<string, unknown> | null | undefined,
): SiteArchetype {
  if (!brain) return "neutral";
  const st = typeof brain.site_type === "string" ? brain.site_type.toLowerCase() : "";
  if (st === "food_brand" || st === "restaurant") return "food_popup_editorial";
  if (st === "nonprofit") return "nonprofit_documentary";
  const hay = [brain.raw_notes, brain.short_description, brain.flagship_story]
    .filter((x): x is string => typeof x === "string")
    .join(" ")
    .toLowerCase();
  if (/popup|street food|arancini|\bmat\b|meny|gastro/.test(hay)) return "food_popup_editorial";
  if (/forening|nonprofit|frivillig|inklud/.test(hay)) return "nonprofit_documentary";
  return "neutral";
}

export function getArchetypeFromSite(
  recipe:
    | {
        archetype?: string | null;
        site_type?: string | null;
        module_strategy?: unknown;
      }
    | null,
  brain?: Record<string, unknown> | null,
): SiteArchetype {
  const ms = (recipe?.module_strategy ?? null) as Record<string, unknown> | null;
  const explicit =
    (recipe as { archetype?: string | null } | null)?.archetype ?? ms?.archetype;
  if (isSiteArchetype(explicit)) return explicit;
  if (recipe?.site_type === "food_brand" || recipe?.site_type === "restaurant")
    return "food_popup_editorial";
  if (recipe?.site_type === "nonprofit") return "nonprofit_documentary";
  if (brain) return inferArchetypeFromBrain(brain);
  return "neutral";
}

export function getArchetypeConfig(a: SiteArchetype): ArchetypeConfig {
  return ARCHETYPE_CONFIGS[a] ?? ARCHETYPE_CONFIGS.neutral;
}
