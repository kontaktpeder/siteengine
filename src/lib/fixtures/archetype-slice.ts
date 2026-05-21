import type { SiteData } from "@/lib/site-types";
import type { SiteArchetype } from "@/lib/archetype-config";
import { ARCHETYPE_CONFIGS } from "@/lib/archetype-config";

const SHARED_IMAGE =
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&q=80";

const SHARED_COPY = {
  heroTitle: "Signatur opplevelse",
  heroSubtitle:
    "Tre tilbud — samme tekst for begge archetypes i slice-test. Forskjellen kommer fra renderer-resolver.",
  services: [
    { title: "Klassiker", description: "Vår mest etterspurte." },
    { title: "Sesong", description: "Begrenset tilgjengelighet." },
    { title: "Signatur", description: "Det vi er kjent for." },
  ],
  ctaLabel: "Ta kontakt",
  ctaHref: "#kontakt",
};

const NOW = new Date(0).toISOString();

function sectionsFor(archetype: SiteArchetype): SiteData["sections"] {
  const cfg = ARCHETYPE_CONFIGS[archetype];
  const base = {
    page_id: "slice",
    body: null,
    is_visible: true,
    created_at: NOW,
    updated_at: NOW,
  };
  const sections = [
    {
      ...base,
      id: `slice-hero-${archetype}`,
      module_type: "hero",
      variant: archetype === "food_popup_editorial" ? "editorial" : "split",
      sort_order: 0,
      title: SHARED_COPY.heroTitle,
      subtitle: SHARED_COPY.heroSubtitle,
      eyebrow: archetype === "food_popup_editorial" ? "Gold of Sicily" : "Om oss",
      anchor_id: "topp",
      background_style: "default",
      layout_style: archetype === "food_popup_editorial" ? "editorial" : "split",
      cta_label: SHARED_COPY.ctaLabel,
      cta_href: SHARED_COPY.ctaHref,
      image_url: SHARED_IMAGE,
      content: { image_url: SHARED_IMAGE, image_alt: "Produkt" },
      settings: { renderer: cfg.default_renderer_by_module.hero ?? {} },
    },
    {
      ...base,
      id: `slice-services-${archetype}`,
      module_type: "services_grid",
      variant: "cards",
      sort_order: 1,
      title: "Det vi tilbyr",
      subtitle: null,
      eyebrow: archetype === "food_popup_editorial" ? "Meny" : "Tilbud",
      anchor_id: "tilbud",
      background_style: "default",
      layout_style: "grid",
      cta_label: null,
      cta_href: null,
      image_url: null,
      content: {},
      settings: { renderer: cfg.default_renderer_by_module.services_grid ?? {} },
    },
    {
      ...base,
      id: `slice-contact-${archetype}`,
      module_type: "contact_cta",
      variant: archetype === "food_popup_editorial" ? "strong" : "soft",
      sort_order: 2,
      title: "Neste steg",
      subtitle: "Samme CTA-tekst — ulik regissering.",
      eyebrow: "Kontakt",
      anchor_id: "kontakt",
      background_style: "default",
      layout_style: null,
      cta_label: SHARED_COPY.ctaLabel,
      cta_href: SHARED_COPY.ctaHref,
      image_url: null,
      content: {},
      settings: { renderer: cfg.default_renderer_by_module.contact_cta ?? {} },
    },
  ];
  return sections as unknown as SiteData["sections"];
}

export function buildArchetypeSliceFixture(archetype: SiteArchetype): SiteData {
  const cfg = ARCHETYPE_CONFIGS[archetype];
  const clientId = `fixture-${archetype}`;
  const client = {
    id: clientId,
    name:
      archetype === "food_popup_editorial" ? "Arancini (slice)" : "Opplev-type (slice)",
    slug: "slice",
    status: "published",
    description: null,
    theme: cfg.default_theme,
    created_at: NOW,
    updated_at: NOW,
  };
  const brain = {
    id: "slice-brain",
    client_id: clientId,
    site_type: archetype === "food_popup_editorial" ? "food_brand" : "nonprofit",
    short_description: SHARED_COPY.heroTitle,
    long_description: SHARED_COPY.heroSubtitle,
    services: SHARED_COPY.services,
    cta_primary_label: SHARED_COPY.ctaLabel,
    cta_primary_href: SHARED_COPY.ctaHref,
    cta_secondary_label: null,
    cta_secondary_href: null,
    mission: null,
    vision: null,
    problem_statement: null,
    solution_statement: null,
    trust_points: [],
    partners: [],
    faq: [],
    audience: [],
    brand_keywords: [],
    tone_keywords: [],
    primary_goal: null,
    secondary_goal: null,
    raw_notes: null,
    internal_notes: null,
    flagship_story: null,
    emotional_trigger: null,
    anti_brand: null,
    memorable_takeaway: null,
    representative_scene: null,
    desired_feelings: null,
    created_at: NOW,
    updated_at: NOW,
  };
  const recipe = {
    id: "slice-recipe",
    client_id: clientId,
    site_type: archetype === "food_popup_editorial" ? "food_brand" : "nonprofit",
    recipe_type: cfg.recipe_type,
    primary_intent: cfg.primary_intent,
    design_direction: cfg.design_direction,
    storytelling_mode:
      archetype === "nonprofit_documentary" ? "documentary" : "editorial",
    content_depth: "standard",
    visual_proof_level: "medium",
    rhythm_strategy: "varied",
    compression_policy: "preserve_detail",
    creative_direction: null,
    color_palette: {},
    typography: {},
    layout_preferences: {},
    module_strategy: { archetype },
    variant_presets: {},
    enabled_modules: cfg.section_blueprint,
    navigation: [],
    footer: {},
    created_at: NOW,
    updated_at: NOW,
  };
  const page = {
    id: "slice-page",
    client_id: clientId,
    slug: "/",
    title: "Slice test",
    status: "published",
    meta_title: "Archetype slice",
    meta_description: "",
    sort_order: 0,
    noindex: true,
    og_image_url: null,
    created_at: NOW,
    updated_at: NOW,
  };
  return {
    client: client as unknown as SiteData["client"],
    brain: brain as unknown as SiteData["brain"],
    recipe: recipe as unknown as SiteData["recipe"],
    page: page as unknown as SiteData["page"],
    sections: sectionsFor(archetype),
  };
}
