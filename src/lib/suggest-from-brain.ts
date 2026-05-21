import type { ModuleType, ThemeTokens } from "@/lib/site-types";

export const SUPPORTED_MODULE_TYPES: readonly ModuleType[] = [
  "hero",
  "trust_strip",
  "mission",
  "services_grid",
  "partners",
  "proof",
  "activities",
  "faq",
  "contact_cta",
  "popup_hero",
  "menu_preview",
  "story_snippet",
  "food_gallery",
  "drop_cta",
] as const;

export type BrainArchetype =
  | "nonprofit"
  | "course"
  | "food"
  | "portfolio"
  | "default";

export interface BrainSuggestionSection {
  module_type: ModuleType;
  variant: string;
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  anchor_id?: string | null;
  background_style?: string | null;
  layout_style?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
  content?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  is_visible?: boolean;
  sort_order?: number;
}

export interface BrainSuggestionPreview {
  archetype: BrainArchetype;
  site_type: string;
  primary_intent: string;
  design_direction: string;
  recipe_type: string;
  theme: ThemeTokens;
  enabled_modules: ModuleType[];
  variant_presets: Record<string, string>;
  navigation: { label: string; href: string }[];
  footer: Record<string, unknown>;
  sections: BrainSuggestionSection[];
}

type BrainLike = {
  raw_notes?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  mission?: string | null;
  primary_goal?: string | null;
  secondary_goal?: string | null;
  brand_keywords?: unknown;
  tone_keywords?: unknown;
  trust_points?: unknown;
  services?: unknown;
  partners?: unknown;
  faq?: unknown;
  audience?: unknown;
  cta_primary_label?: string | null;
  cta_primary_href?: string | null;
  cta_secondary_label?: string | null;
  cta_secondary_href?: string | null;
  site_type?: string | null;
  solution_statement?: string | null;
  problem_statement?: string | null;
  vision?: string | null;
  [k: string]: unknown;
};

const KEYWORDS: Record<Exclude<BrainArchetype, "default">, RegExp[]> = {
  nonprofit: [
    /nonprofit/i,
    /forening/i,
    /frivillig/i,
    /inkluder/i,
    /tilretteleg/i,
    /barn og unge/i,
    /samfunn/i,
    /stiftelse/i,
    /organisasjon/i,
  ],
  course: [
    /kurs/i,
    /workshop/i,
    /opplæring/i,
    /undervis/i,
    /kursdeltaker/i,
    /påmelding/i,
    /sertifis/i,
    /class/i,
    /training/i,
  ],
  food: [
    /restaurant/i,
    /kafe/i,
    /café/i,
    /meny/i,
    /mat\b/i,
    /spise/i,
    /kjøkken/i,
    /bakeri/i,
  ],
  portfolio: [
    /portefølje/i,
    /portfolio/i,
    /freelance/i,
    /designer/i,
    /fotograf/i,
    /case study/i,
    /prosjekt/i,
  ],
};

export function detectArchetype(brain: BrainLike): BrainArchetype {
  const haystack = [
    brain.raw_notes,
    brain.short_description,
    brain.long_description,
    brain.mission,
    brain.primary_goal,
    brain.site_type,
    Array.isArray(brain.brand_keywords)
      ? (brain.brand_keywords as unknown[]).map(String).join(" ")
      : "",
    Array.isArray(brain.tone_keywords)
      ? (brain.tone_keywords as unknown[]).map(String).join(" ")
      : "",
  ]
    .filter(Boolean)
    .join(" \n ");

  let best: BrainArchetype = "default";
  let bestScore = 0;
  (Object.keys(KEYWORDS) as Exclude<BrainArchetype, "default">[]).forEach((k) => {
    const score = KEYWORDS[k].reduce(
      (acc, re) => acc + (re.test(haystack) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = k;
    }
  });
  return bestScore >= 1 ? best : "default";
}

function arrLen(v: unknown): number {
  return Array.isArray(v) ? v.length : 0;
}

const THEMES: Record<BrainArchetype, ThemeTokens> = {
  nonprofit: {
    primaryColor: "oklch(0.55 0.09 168)",
    backgroundColor: "oklch(0.985 0.012 95)",
    surfaceColor: "oklch(1 0 0)",
    textColor: "oklch(0.22 0.02 160)",
    borderColor: "oklch(0.9 0.02 130)",
    radius: "1rem",
    fontStyle: "mixed",
  },
  course: {
    primaryColor: "oklch(0.58 0.15 250)",
    backgroundColor: "oklch(0.98 0.01 250)",
    surfaceColor: "oklch(1 0 0)",
    textColor: "oklch(0.2 0.03 250)",
    borderColor: "oklch(0.9 0.02 250)",
    radius: "0.75rem",
    fontStyle: "sans",
  },
  food: {
    primaryColor: "oklch(0.55 0.18 35)",
    backgroundColor: "oklch(0.97 0.02 70)",
    surfaceColor: "oklch(1 0 0)",
    textColor: "oklch(0.2 0.04 40)",
    borderColor: "oklch(0.88 0.04 60)",
    radius: "1.25rem",
    fontStyle: "serif",
  },
  portfolio: {
    primaryColor: "oklch(0.25 0.02 250)",
    backgroundColor: "oklch(0.98 0 0)",
    surfaceColor: "oklch(1 0 0)",
    textColor: "oklch(0.15 0 0)",
    borderColor: "oklch(0.9 0 0)",
    radius: "0.5rem",
    fontStyle: "mixed",
  },
  default: {
    primaryColor: "oklch(0.55 0.09 168)",
    backgroundColor: "oklch(0.985 0.012 95)",
    surfaceColor: "oklch(1 0 0)",
    textColor: "oklch(0.22 0.02 160)",
    borderColor: "oklch(0.9 0.02 130)",
    radius: "1rem",
    fontStyle: "mixed",
  },
};

const DESIGN_DIRECTIONS: Record<BrainArchetype, string> = {
  nonprofit: "fiken_calm_mint",
  course: "modern_clarity_blue",
  food: "warm_editorial",
  portfolio: "swiss_minimal",
  default: "fiken_calm_mint",
};

const SITE_TYPES: Record<BrainArchetype, string> = {
  nonprofit: "nonprofit",
  course: "course",
  food: "restaurant",
  portfolio: "portfolio",
  default: "landing_page",
};

const PRIMARY_INTENTS: Record<BrainArchetype, string> = {
  nonprofit: "build_trust",
  course: "drive_signups",
  food: "drive_visits",
  portfolio: "showcase_work",
  default: "build_trust",
};

const VARIANT_PRESETS: Record<string, Record<string, string>> = {
  default: {
    hero: "editorial",
    trust_strip: "default",
    mission: "simple",
    services_grid: "cards",
    partners: "text_list",
    proof: "default",
    activities: "default",
    faq: "accordion",
    contact_cta: "soft",
  },
  course: {
    hero: "split",
    trust_strip: "default",
    mission: "simple",
    services_grid: "cards",
    partners: "logo_grid",
    proof: "default",
    activities: "default",
    faq: "accordion",
    contact_cta: "strong",
  },
  food: {
    hero: "editorial",
    trust_strip: "default",
    mission: "simple",
    services_grid: "cards",
    partners: "text_list",
    proof: "default",
    activities: "default",
    faq: "accordion",
    contact_cta: "soft",
  },
  portfolio: {
    hero: "centered",
    trust_strip: "default",
    mission: "simple",
    services_grid: "cards",
    partners: "logo_grid",
    proof: "default",
    activities: "default",
    faq: "accordion",
    contact_cta: "soft",
  },
};

export function suggestFromBrain(brain: BrainLike): BrainSuggestionPreview {
  const detected = detectArchetype(brain);
  const stackKey: BrainArchetype = detected === "default" ? "nonprofit" : detected;

  const variants =
    VARIANT_PRESETS[stackKey] ?? VARIANT_PRESETS.default;

  const enabled: ModuleType[] = ["hero", "trust_strip", "mission", "services_grid"];
  if (arrLen(brain.services) > 0 || stackKey === "course" || stackKey === "nonprofit") {
    if (!enabled.includes("activities")) enabled.push("activities");
  }
  if (arrLen(brain.partners) > 0) enabled.push("partners");
  enabled.push("proof");
  if (arrLen(brain.faq) > 0) enabled.push("faq");
  enabled.push("contact_cta");

  const ctaLabel = brain.cta_primary_label || "Ta kontakt";
  const ctaHref =
    brain.cta_primary_href ||
    (brain.cta_secondary_href ?? "#kontakt");

  const heroTitle =
    brain.short_description ||
    brain.mission ||
    brain.primary_goal ||
    "Velkommen";
  const heroSubtitle =
    brain.long_description || brain.solution_statement || brain.secondary_goal || "";

  const sections: BrainSuggestionSection[] = enabled.map((mt, i) => {
    const base: BrainSuggestionSection = {
      module_type: mt,
      variant: variants[mt] ?? "default",
      content: {},
      settings: {},
      is_visible: true,
      sort_order: i,
      background_style: "default",
    };
    switch (mt) {
      case "hero":
        return {
          ...base,
          eyebrow: null,
          title: heroTitle,
          subtitle: heroSubtitle || null,
          anchor_id: "topp",
          layout_style: "editorial",
          cta_label: ctaLabel,
          cta_href: ctaHref,
        };
      case "trust_strip":
        return { ...base };
      case "mission":
        return {
          ...base,
          eyebrow: "Vårt oppdrag",
          title: "Vårt oppdrag",
          anchor_id: "om",
          background_style: "muted",
          layout_style: "split",
        };
      case "services_grid":
        return {
          ...base,
          eyebrow: stackKey === "course" ? "Kurs og tilbud" : "Det vi tilbyr",
          title: stackKey === "course" ? "Kurs og workshops" : "Tjenester",
          subtitle: null,
          anchor_id: "tilbud",
          layout_style: "grid",
        };
      case "activities":
        return {
          ...base,
          eyebrow: null,
          title: "Aktiviteter",
          subtitle: null,
        };
      case "partners":
        return {
          ...base,
          eyebrow: "Samarbeid",
          title: "Sammen med",
          subtitle: null,
          anchor_id: "samarbeid",
          background_style: "muted",
        };
      case "proof":
        return {
          ...base,
          eyebrow: "Hvorfor det virker",
          title: "Hvorfor det virker",
        };
      case "faq":
        return {
          ...base,
          eyebrow: "Spørsmål og svar",
          title: "Vanlige spørsmål",
        };
      case "contact_cta":
        return {
          ...base,
          eyebrow: "Ta kontakt",
          title: "Vil du komme i kontakt?",
          subtitle: "Send oss en melding — ingen forpliktelser.",
          anchor_id: "kontakt",
          background_style: "muted",
          cta_label: ctaLabel,
          cta_href: ctaHref,
        };
      default:
        return base;
    }
  });

  return {
    archetype: detected,
    site_type: SITE_TYPES[stackKey],
    primary_intent: PRIMARY_INTENTS[stackKey],
    design_direction: DESIGN_DIRECTIONS[stackKey],
    recipe_type: "trust_based_nonprofit",
    theme: THEMES[stackKey],
    enabled_modules: enabled,
    variant_presets: variants,
    navigation: [
      { label: "Om oss", href: "#om" },
      { label: stackKey === "course" ? "Kurs" : "Tilbud", href: "#tilbud" },
      ...(arrLen(brain.partners) > 0
        ? [{ label: "Samarbeid", href: "#samarbeid" }]
        : []),
      { label: "Kontakt", href: "#kontakt" },
    ],
    footer: {
      tagline: brain.mission || brain.short_description || "",
      email: extractEmail(brain.cta_primary_href ?? "") ?? null,
    },
    sections,
  };
}

function extractEmail(s: string): string | null {
  const m = s.match(/mailto:([^?]+)/i);
  return m ? m[1] : null;
}
