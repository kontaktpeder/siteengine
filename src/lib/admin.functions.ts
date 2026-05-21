import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { PageSection } from "./site-types";
import { OPPLEV_SEED } from "./seed-opplev.server";
import { generateAiSuggestion, type AiSuggestion } from "./ai-suggestion.server";

const STUDIO_ENV_ERROR =
  "Studio admin er ikke tilgjengelig i dette miljøet fordi SUPABASE_SERVICE_ROLE_KEY mangler.";

function hasStudioAdminAccess() {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.STUDIO_SUPABASE_SERVICE_ROLE_KEY),
  );
}

export const listClients = createServerFn({ method: "GET" }).handler(async () => {
  if (!hasStudioAdminAccess()) {
    return {
      clients: [],
      adminAvailable: false,
      message: STUDIO_ENV_ERROR,
    };
  }

  const { data: clients, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!clients?.length) {
    return {
      clients: [],
      adminAvailable: true,
      message: null,
    };
  }

  const { data: recipes } = await supabaseAdmin
    .from("site_recipes")
    .select("client_id, site_type");
  const map = new Map<string, string | null>();
  (recipes ?? []).forEach((r) => map.set(r.client_id, r.site_type ?? null));
  return {
    clients: clients.map((c) => ({ ...c, site_type: map.get(c.id) ?? null })),
    adminAvailable: true,
    message: null,
  };
});

export const getClientBundle = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) {
      return {
        client: null,
        brain: null,
        recipe: null,
        page: null,
        sections: [] as PageSection[],
        adminAvailable: false,
        message: STUDIO_ENV_ERROR,
      };
    }

    const [{ data: client }, { data: brains }, { data: recipes }, { data: pages }] =
      await Promise.all([
        supabaseAdmin.from("clients").select("*").eq("id", data.id).single(),
        supabaseAdmin.from("client_brains").select("*").eq("client_id", data.id).limit(1),
        supabaseAdmin.from("site_recipes").select("*").eq("client_id", data.id).limit(1),
        supabaseAdmin.from("site_pages").select("*").eq("client_id", data.id).order("sort_order"),
      ]);

    const home =
      pages?.find((p) => p.slug === "/" || p.slug === "home") ?? pages?.[0] ?? null;

    let sections: PageSection[] = [];
    if (home) {
      const { data: sec } = await supabaseAdmin
        .from("page_sections")
        .select("*")
        .eq("page_id", home.id)
        .order("sort_order", { ascending: true });
      sections = sec ?? [];
    }

    return {
      client,
      brain: brains?.[0] ?? null,
      recipe: recipes?.[0] ?? null,
      page: home,
      sections,
      adminAvailable: true,
      message: null,
    };
  });

export const upsertClient = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id?: string;
      name: string;
      slug: string;
      status: string;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
      organization_number?: string | null;
      primary_domain?: string | null;
      description?: string | null;
      logo_url?: string | null;
      favicon_url?: string | null;
      theme?: unknown;
    }) => input,
  )
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) {
      throw new Error(STUDIO_ENV_ERROR);
    }

    const payload = {
      name: data.name,
      slug: data.slug,
      status: data.status,
      email: data.email ?? null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      organization_number: data.organization_number ?? null,
      primary_domain: data.primary_domain ?? null,
      description: data.description ?? null,
      logo_url: data.logo_url ?? null,
      favicon_url: data.favicon_url ?? null,
      theme: (data.theme ?? {}) as never,
    };
    if (data.id) {
      const { data: row, error } = await supabaseAdmin
        .from("clients")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw error;
      return row;
    }
    const { data: row, error } = await supabaseAdmin
      .from("clients")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return row;
  });

export const upsertBrain = createServerFn({ method: "POST" })
  .inputValidator((input: Record<string, unknown> & { client_id: string }) => input)
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) {
      throw new Error(STUDIO_ENV_ERROR);
    }

    const { data: existing } = await supabaseAdmin
      .from("client_brains")
      .select("id")
      .eq("client_id", data.client_id)
      .limit(1);

    const payload = {
      client_id: data.client_id,
      site_type: (data.site_type as string) ?? "landing_page",
      primary_goal: (data.primary_goal as string) ?? null,
      secondary_goal: (data.secondary_goal as string) ?? null,
      audience: (data.audience ?? []) as never,
      brand_keywords: (data.brand_keywords ?? []) as never,
      tone_keywords: (data.tone_keywords ?? []) as never,
      short_description: (data.short_description as string) ?? null,
      long_description: (data.long_description as string) ?? null,
      mission: (data.mission as string) ?? null,
      vision: (data.vision as string) ?? null,
      problem_statement: (data.problem_statement as string) ?? null,
      solution_statement: (data.solution_statement as string) ?? null,
      trust_points: (data.trust_points ?? []) as never,
      services: (data.services ?? []) as never,
      partners: (data.partners ?? []) as never,
      faq: (data.faq ?? []) as never,
      cta_primary_label: (data.cta_primary_label as string) ?? null,
      cta_primary_href: (data.cta_primary_href as string) ?? null,
      cta_secondary_label: (data.cta_secondary_label as string) ?? null,
      cta_secondary_href: (data.cta_secondary_href as string) ?? null,
      raw_notes: (data.raw_notes as string) ?? null,
      internal_notes: (data.internal_notes as string) ?? null,
      flagship_story: (data.flagship_story as string) ?? null,
      emotional_trigger: (data.emotional_trigger as string) ?? null,
      anti_brand: (data.anti_brand as string) ?? null,
      memorable_takeaway: (data.memorable_takeaway as string) ?? null,
      representative_scene: (data.representative_scene as string) ?? null,
      desired_feelings: (data.desired_feelings as string) ?? null,
      format_brief: (data.format_brief ?? {}) as never,
    } as never;

    if (existing && existing.length) {
      const { data: row, error } = await supabaseAdmin
        .from("client_brains")
        .update(payload)
        .eq("id", existing[0].id)
        .select("*")
        .single();
      if (error) throw error;
      return row;
    }
    const { data: row, error } = await supabaseAdmin
      .from("client_brains")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return row;
  });

export const upsertRecipe = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      client_id: string;
      recipe_type?: string;
      site_type?: string;
      primary_intent?: string | null;
      design_direction?: string | null;
      color_palette?: unknown;
      typography?: unknown;
      layout_preferences?: unknown;
      module_strategy?: unknown;
      variant_presets?: unknown;
      enabled_modules?: unknown;
      navigation?: unknown;
      footer?: unknown;
      content_depth?: string | null;
      storytelling_mode?: string | null;
      visual_proof_level?: string | null;
      rhythm_strategy?: string | null;
      compression_policy?: string | null;
      creative_direction?: string | null;
      page_template?: string | null;
      visual_tone?: string | null;
    }) => input,
  )
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) {
      throw new Error(STUDIO_ENV_ERROR);
    }

    const { data: existing } = await supabaseAdmin
      .from("site_recipes")
      .select("id")
      .eq("client_id", data.client_id)
      .limit(1);

    const payload = {
      client_id: data.client_id,
      recipe_type: data.recipe_type ?? "trust_based_nonprofit",
      site_type: data.site_type ?? "landing_page",
      primary_intent: data.primary_intent ?? null,
      design_direction: data.design_direction ?? null,
      color_palette: (data.color_palette ?? {}) as never,
      typography: (data.typography ?? {}) as never,
      layout_preferences: (data.layout_preferences ?? {}) as never,
      module_strategy: (data.module_strategy ?? {}) as never,
      variant_presets: (data.variant_presets ?? {}) as never,
      enabled_modules: (data.enabled_modules ?? []) as never,
      navigation: (data.navigation ?? []) as never,
      footer: (data.footer ?? {}) as never,
      content_depth: data.content_depth ?? "balanced",
      storytelling_mode: data.storytelling_mode ?? "editorial",
      visual_proof_level: data.visual_proof_level ?? "medium",
      rhythm_strategy: data.rhythm_strategy ?? "varied",
      compression_policy: data.compression_policy ?? "preserve_detail",
      creative_direction: data.creative_direction ?? null,
      page_template: data.page_template ?? "organization_documentary",
      visual_tone: data.visual_tone ?? null,
    } as never;

    if (existing && existing.length) {
      const { data: row, error } = await supabaseAdmin
        .from("site_recipes")
        .update(payload)
        .eq("id", existing[0].id)
        .select("*")
        .single();
      if (error) throw error;
      return row;
    }
    const { data: row, error } = await supabaseAdmin
      .from("site_recipes")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return row;
  });

/**
 * Seed Foreningen Opplev: client + brain + recipe + home page + sections.
 * Idempotent — looks up by slug "opplev".
 */
export const seedOpplev = createServerFn({ method: "POST" }).handler(async () => {
  if (!hasStudioAdminAccess()) {
    throw new Error(STUDIO_ENV_ERROR);
  }

  const seed = OPPLEV_SEED;

  // 1. Client
  let { data: client } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("slug", seed.client.slug)
    .maybeSingle();

  if (!client) {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .insert(seed.client as never)
      .select("*")
      .single();
    if (error) throw error;
    client = data;
  } else {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .update(seed.client as never)
      .eq("id", client.id)
      .select("*")
      .single();
    if (error) throw error;
    client = data;
  }

  // 2. Brain
  const { data: existingBrain } = await supabaseAdmin
    .from("client_brains")
    .select("id")
    .eq("client_id", client.id)
    .limit(1);
  const brainPayload = { ...seed.brain, client_id: client.id } as never;
  if (existingBrain && existingBrain.length) {
    await supabaseAdmin
      .from("client_brains")
      .update(brainPayload)
      .eq("id", existingBrain[0].id);
  } else {
    await supabaseAdmin.from("client_brains").insert(brainPayload);
  }

  // 3. Recipe
  const { data: existingRecipe } = await supabaseAdmin
    .from("site_recipes")
    .select("id")
    .eq("client_id", client.id)
    .limit(1);
  const recipePayload = { ...seed.recipe, client_id: client.id } as never;
  if (existingRecipe && existingRecipe.length) {
    await supabaseAdmin
      .from("site_recipes")
      .update(recipePayload)
      .eq("id", existingRecipe[0].id);
  } else {
    await supabaseAdmin.from("site_recipes").insert(recipePayload);
  }

  // 4. Home page
  let { data: page } = await supabaseAdmin
    .from("site_pages")
    .select("*")
    .eq("client_id", client.id)
    .eq("slug", "/")
    .maybeSingle();
  const pagePayload = { ...seed.page, client_id: client.id };
  if (!page) {
    const { data, error } = await supabaseAdmin
      .from("site_pages")
      .insert(pagePayload)
      .select("*")
      .single();
    if (error) throw error;
    page = data;
  } else {
    const { data, error } = await supabaseAdmin
      .from("site_pages")
      .update(pagePayload)
      .eq("id", page.id)
      .select("*")
      .single();
    if (error) throw error;
    page = data;
  }

  // 5. Replace sections
  await supabaseAdmin.from("page_sections").delete().eq("page_id", page.id);
  const sectionRows = seed.sections.map((s: Record<string, unknown>, i: number) => ({
    ...s,
    page_id: page!.id,
    sort_order: i,
  }));
  const { error: secErr } = await supabaseAdmin
    .from("page_sections")
    .insert(sectionRows as never);
  if (secErr) throw secErr;

  return { ok: true, client_id: client.id };
});

// ---------- Brain → page generation ----------

import {
  SUPPORTED_MODULE_TYPES,
  type BrainSuggestionPreview,
  type BrainSuggestionSection,
} from "./suggest-from-brain";

const SUPPORTED_MODULE_SET = new Set<string>(
  SUPPORTED_MODULE_TYPES as readonly string[],
);

function assertKnownModules(sections: { module_type: string }[]) {
  for (const s of sections) {
    if (!SUPPORTED_MODULE_SET.has(s.module_type)) {
      throw new Error(`Ukjent module_type: ${s.module_type}`);
    }
  }
}

async function ensureHomePage(clientId: string) {
  const { data: existing } = await supabaseAdmin
    .from("site_pages")
    .select("*")
    .eq("client_id", clientId)
    .eq("slug", "/")
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabaseAdmin
    .from("site_pages")
    .insert({
      client_id: clientId,
      slug: "/",
      title: "Forsiden",
      status: "draft",
      sort_order: 0,
      noindex: false,
    } as never)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export const applyBrainSuggestion = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { client_id: string; suggestion: BrainSuggestionPreview }) => input,
  )
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) throw new Error(STUDIO_ENV_ERROR);
    const { client_id, suggestion } = data;
    assertKnownModules(suggestion.sections);

    // 1. Ensure home page exists
    const page = await ensureHomePage(client_id);

    // 2. Upsert site_recipes
    const { data: existingRecipe } = await supabaseAdmin
      .from("site_recipes")
      .select("id")
      .eq("client_id", client_id)
      .limit(1);
    const recipePayload = {
      client_id,
      recipe_type: suggestion.recipe_type,
      site_type: suggestion.site_type,
      primary_intent: suggestion.primary_intent,
      design_direction: suggestion.design_direction,
      color_palette: {} as never,
      typography: {} as never,
      layout_preferences: {} as never,
      module_strategy: {} as never,
      variant_presets: suggestion.variant_presets as never,
      enabled_modules: suggestion.enabled_modules as never,
      navigation: suggestion.navigation as never,
      footer: suggestion.footer as never,
    };
    if (existingRecipe && existingRecipe.length) {
      const { error } = await supabaseAdmin
        .from("site_recipes")
        .update(recipePayload)
        .eq("id", existingRecipe[0].id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("site_recipes")
        .insert(recipePayload);
      if (error) throw error;
    }

    // 3. Update client theme
    const { error: themeErr } = await supabaseAdmin
      .from("clients")
      .update({ theme: suggestion.theme as never })
      .eq("id", client_id);
    if (themeErr) throw themeErr;

    // 4. Replace sections
    await supabaseAdmin.from("page_sections").delete().eq("page_id", page.id);
    const rows = suggestion.sections.map((s, i) => ({
      page_id: page.id,
      module_type: s.module_type,
      variant: s.variant ?? "default",
      sort_order: typeof s.sort_order === "number" ? s.sort_order : i,
      eyebrow: s.eyebrow ?? null,
      title: s.title ?? null,
      subtitle: s.subtitle ?? null,
      body: s.body ?? null,
      anchor_id: s.anchor_id ?? null,
      background_style: s.background_style ?? null,
      layout_style: s.layout_style ?? null,
      cta_label: s.cta_label ?? null,
      cta_href: s.cta_href ?? null,
      content: (s.content ?? {}) as never,
      settings: (s.settings ?? {}) as never,
      is_visible: s.is_visible ?? true,
    }));
    const { error: insErr } = await supabaseAdmin
      .from("page_sections")
      .insert(rows as never);
    if (insErr) throw insErr;

    return { ok: true, page_id: page.id, sections: rows.length };
  });

export const saveHomePageSections = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { client_id: string; sections: BrainSuggestionSection[] }) => input,
  )
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) throw new Error(STUDIO_ENV_ERROR);
    assertKnownModules(data.sections);
    const page = await ensureHomePage(data.client_id);
    await supabaseAdmin.from("page_sections").delete().eq("page_id", page.id);
    const rows = data.sections.map((s, i) => ({
      page_id: page.id,
      module_type: s.module_type,
      variant: s.variant ?? "default",
      sort_order: typeof s.sort_order === "number" ? s.sort_order : i,
      eyebrow: s.eyebrow ?? null,
      title: s.title ?? null,
      subtitle: s.subtitle ?? null,
      body: s.body ?? null,
      anchor_id: s.anchor_id ?? null,
      background_style: s.background_style ?? null,
      layout_style: s.layout_style ?? null,
      cta_label: s.cta_label ?? null,
      cta_href: s.cta_href ?? null,
      content: (s.content ?? {}) as never,
      settings: (s.settings ?? {}) as never,
      is_visible: s.is_visible ?? true,
    }));
    if (rows.length) {
      const { error } = await supabaseAdmin
        .from("page_sections")
        .insert(rows as never);
      if (error) throw error;
    }
    return { ok: true, page_id: page.id, sections: rows.length };
  });

// ---------- AI-powered suggestion ----------

export const generateAiBrainSuggestion = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { client_id: string; brain_draft?: Record<string, unknown> }) => input,
  )
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) throw new Error(STUDIO_ENV_ERROR);
    const [{ data: client }, { data: brains }, { data: recipes }, { data: pages }] =
      await Promise.all([
        supabaseAdmin.from("clients").select("*").eq("id", data.client_id).single(),
        supabaseAdmin
          .from("client_brains")
          .select("*")
          .eq("client_id", data.client_id)
          .limit(1),
        supabaseAdmin
          .from("site_recipes")
          .select("*")
          .eq("client_id", data.client_id)
          .limit(1),
        supabaseAdmin
          .from("site_pages")
          .select("id,slug")
          .eq("client_id", data.client_id),
      ]);

    const home = pages?.find((p) => p.slug === "/" || p.slug === "home") ?? null;
    let sections: unknown[] = [];
    if (home) {
      const { data: sec } = await supabaseAdmin
        .from("page_sections")
        .select("*")
        .eq("page_id", home.id);
      sections = sec ?? [];
    }

    const { data: mediaNotes } = await supabaseAdmin
      .from("media_notes" as never)
      .select("*")
      .eq("client_id", data.client_id);

    const brainMerged = {
      ...((brains?.[0] as Record<string, unknown>) ?? {}),
      ...(data.brain_draft ?? {}),
    };

    const studioRefs = await fetchRelevantStudioReferences(brainMerged);

    const suggestion = await generateAiSuggestion({
      client: client as Record<string, unknown> | null,
      brain: brainMerged,
      recipe: (recipes?.[0] as Record<string, unknown>) ?? null,
      sections,
      media_notes: (mediaNotes as unknown[]) ?? [],
      studio_references: studioRefs as unknown as Record<string, unknown>[],
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { ...(suggestion as any), studio_references_used: studioRefs };
  });

// ---------- Media notes (lightweight image metadata for AI context) ----------

export interface MediaNote {
  id: string;
  client_id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  emotional_value: string | null;
  suggested_usage: string | null;
  is_hero_candidate: boolean;
  created_at: string;
}

export const listMediaNotes = createServerFn({ method: "GET" })
  .inputValidator((input: { client_id: string }) => input)
  .handler(async ({ data }): Promise<{ notes: MediaNote[] }> => {
    if (!hasStudioAdminAccess()) return { notes: [] };
    const { data: rows, error } = await supabaseAdmin
      .from("media_notes" as never)
      .select("*")
      .eq("client_id", data.client_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { notes: ((rows as unknown) as MediaNote[]) ?? [] };
  });

export const upsertMediaNote = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id?: string;
      client_id: string;
      image_url: string;
      title?: string | null;
      description?: string | null;
      emotional_value?: string | null;
      suggested_usage?: string | null;
      is_hero_candidate?: boolean;
    }) => input,
  )
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) throw new Error(STUDIO_ENV_ERROR);
    const payload = {
      client_id: data.client_id,
      image_url: data.image_url,
      title: data.title ?? null,
      description: data.description ?? null,
      emotional_value: data.emotional_value ?? null,
      suggested_usage: data.suggested_usage ?? null,
      is_hero_candidate: data.is_hero_candidate ?? false,
    };
    if (data.id) {
      const { data: row, error } = await supabaseAdmin
        .from("media_notes" as never)
        .update(payload as never)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw error;
      return row;
    }
    const { data: row, error } = await supabaseAdmin
      .from("media_notes" as never)
      .insert(payload as never)
      .select("*")
      .single();
    if (error) throw error;
    return row;
  });

export const deleteMediaNote = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) throw new Error(STUDIO_ENV_ERROR);
    const { error } = await supabaseAdmin
      .from("media_notes" as never)
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const applyAiSuggestion = createServerFn({ method: "POST" })
  .inputValidator((input: { client_id: string; suggestion: AiSuggestion }) => input)
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) throw new Error(STUDIO_ENV_ERROR);
    const { client_id, suggestion } = data;
    assertKnownModules(suggestion.sections);

    // 1. Client (description + theme)
    const clientPatch: Record<string, unknown> = {};
    if (suggestion.client?.theme && Object.keys(suggestion.client.theme).length) {
      clientPatch.theme = suggestion.client.theme;
    }
    if (typeof suggestion.client?.description === "string" && suggestion.client.description.trim()) {
      clientPatch.description = suggestion.client.description;
    }
    if (Object.keys(clientPatch).length) {
      const { error } = await supabaseAdmin
        .from("clients")
        .update(clientPatch as never)
        .eq("id", client_id);
      if (error) throw error;
    }

    // 2. Brain (merge non-empty fields)
    const brainIn = suggestion.brain ?? {};
    const brainAllowed = [
      "site_type", "primary_goal", "secondary_goal", "audience", "brand_keywords",
      "tone_keywords", "short_description", "long_description", "mission", "vision",
      "problem_statement", "solution_statement", "trust_points", "services", "partners",
      "faq", "cta_primary_label", "cta_primary_href", "cta_secondary_label", "cta_secondary_href",
      "flagship_story", "emotional_trigger", "anti_brand", "memorable_takeaway",
      "representative_scene", "desired_feelings", "format_brief",
    ];
    const brainPatch: Record<string, unknown> = { client_id };
    for (const k of brainAllowed) {
      const v = (brainIn as Record<string, unknown>)[k];
      if (v === undefined || v === null) continue;
      if (typeof v === "string" && !v.trim()) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      brainPatch[k] = v;
    }
    const { data: existingBrain } = await supabaseAdmin
      .from("client_brains")
      .select("id")
      .eq("client_id", client_id)
      .limit(1);
    if (existingBrain && existingBrain.length) {
      const { error } = await supabaseAdmin
        .from("client_brains")
        .update(brainPatch as never)
        .eq("id", existingBrain[0].id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("client_brains")
        .insert(brainPatch as never);
      if (error) throw error;
    }

    // 3. Recipe
    const r = suggestion.recipe;
    const { data: existingRecipeRow } = await supabaseAdmin
      .from("site_recipes")
      .select("*")
      .eq("client_id", client_id)
      .limit(1);
    const existingRecipe = existingRecipeRow;
    const existingPageTemplate =
      (existingRecipeRow?.[0] as { page_template?: string } | undefined)?.page_template ?? null;
    const existingVisualTone =
      (existingRecipeRow?.[0] as { visual_tone?: string } | undefined)?.visual_tone ?? null;
    const recipePayload = {
      client_id,
      recipe_type: r.recipe_type,
      site_type: r.site_type,
      primary_intent: r.primary_intent,
      design_direction: r.design_direction,
      color_palette: (r.color_palette ?? {}) as never,
      typography: (r.typography ?? {}) as never,
      layout_preferences: (r.layout_preferences ?? {}) as never,
      module_strategy: (r.module_strategy ?? {}) as never,
      variant_presets: (r.variant_presets ?? {}) as never,
      enabled_modules: (r.enabled_modules ?? []) as never,
      navigation: (r.navigation ?? []) as never,
      footer: (r.footer ?? {}) as never,
      content_depth: r.content_depth ?? "balanced",
      storytelling_mode: r.storytelling_mode ?? "editorial",
      visual_proof_level: r.visual_proof_level ?? "medium",
      rhythm_strategy: r.rhythm_strategy ?? "varied",
      compression_policy: r.compression_policy ?? "preserve_detail",
      creative_direction: r.creative_direction ?? null,
    };
    if (existingRecipe && existingRecipe.length) {
      const { error } = await supabaseAdmin
        .from("site_recipes")
        .update(recipePayload)
        .eq("id", existingRecipe[0].id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin.from("site_recipes").insert(recipePayload);
      if (error) throw error;
    }

    // 4. Home page
    const page = await ensureHomePage(client_id);
    const homePatch: Record<string, unknown> = {};
    if (suggestion.home_page?.title) homePatch.title = suggestion.home_page.title;
    if (suggestion.home_page?.meta_title) homePatch.meta_title = suggestion.home_page.meta_title;
    if (suggestion.home_page?.meta_description)
      homePatch.meta_description = suggestion.home_page.meta_description;
    if (suggestion.home_page?.status) homePatch.status = suggestion.home_page.status;
    if (Object.keys(homePatch).length) {
      const { error } = await supabaseAdmin
        .from("site_pages")
        .update(homePatch as never)
        .eq("id", page.id);
      if (error) throw error;
    }

    // 5. Replace sections
    await supabaseAdmin.from("page_sections").delete().eq("page_id", page.id);
    const rows = suggestion.sections.map((s, i) => ({
      page_id: page.id,
      module_type: s.module_type,
      variant: s.variant ?? "default",
      sort_order: typeof s.sort_order === "number" ? s.sort_order : i,
      eyebrow: s.eyebrow ?? null,
      title: s.title ?? null,
      subtitle: s.subtitle ?? null,
      body: s.body ?? null,
      anchor_id: s.anchor_id ?? null,
      background_style: s.background_style ?? null,
      layout_style: s.layout_style ?? null,
      cta_label: s.cta_label ?? null,
      cta_href: s.cta_href ?? null,
      content: (s.content ?? {}) as never,
      settings: (s.settings ?? {}) as never,
      is_visible: s.is_visible ?? true,
    }));
    if (rows.length) {
      const { error } = await supabaseAdmin
        .from("page_sections")
        .insert(rows as never);
      if (error) throw error;
    }
    return { ok: true, page_id: page.id, sections: rows.length, source: suggestion.source };
  });

// ---------- Studio Brain (Taste Library) ----------

export interface StudioReference {
  id: string;
  name: string;
  reference_url: string | null;
  reference_type: string;
  status: string;
  rank: number;
  what_works: string | null;
  visual_principles: string | null;
  conversion_principles: string | null;
  seo_principles: string | null;
  component_patterns: string | null;
  tone_patterns: string | null;
  avoid_copying: string;
  created_at: string;
  updated_at: string;
}

export const listStudioReferences = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ references: StudioReference[]; adminAvailable: boolean }> => {
    if (!hasStudioAdminAccess()) return { references: [], adminAvailable: false };
    const { data, error } = await supabaseAdmin
      .from("studio_design_references")
      .select("*")
      .order("rank", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return { references: (data ?? []) as StudioReference[], adminAvailable: true };
  },
);

export const getStudioReference = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) throw new Error(STUDIO_ENV_ERROR);
    const { data: row, error } = await supabaseAdmin
      .from("studio_design_references")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw error;
    return row as StudioReference;
  });

export const upsertStudioReference = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id?: string;
      name: string;
      reference_url?: string | null;
      reference_type?: string;
      status?: string;
      rank?: number;
      what_works?: string | null;
      visual_principles?: string | null;
      conversion_principles?: string | null;
      seo_principles?: string | null;
      component_patterns?: string | null;
      tone_patterns?: string | null;
      avoid_copying?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) throw new Error(STUDIO_ENV_ERROR);
    const payload = {
      name: data.name,
      reference_url: data.reference_url ?? null,
      reference_type: data.reference_type ?? "general",
      status: data.status ?? "draft",
      rank: data.rank ?? 0,
      what_works: data.what_works ?? null,
      visual_principles: data.visual_principles ?? null,
      conversion_principles: data.conversion_principles ?? null,
      seo_principles: data.seo_principles ?? null,
      component_patterns: data.component_patterns ?? null,
      tone_patterns: data.tone_patterns ?? null,
      avoid_copying:
        data.avoid_copying ??
        "Do not copy text, brand identity, layout 1:1, assets or proprietary design. Extract principles only.",
      updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { data: row, error } = await supabaseAdmin
        .from("studio_design_references")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw error;
      return row as StudioReference;
    }
    const { data: row, error } = await supabaseAdmin
      .from("studio_design_references")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return row as StudioReference;
  });

export const archiveStudioReference = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    if (!hasStudioAdminAccess()) throw new Error(STUDIO_ENV_ERROR);
    const { error } = await supabaseAdmin
      .from("studio_design_references")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// Mapping av brain → relevante reference_type
function inferRelevantTypes(brain: Record<string, unknown>): string[] {
  const haystack = [
    brain.site_type,
    brain.primary_goal,
    brain.secondary_goal,
    brain.flagship_story,
    brain.desired_feelings,
    brain.raw_notes,
    brain.short_description,
    brain.long_description,
    Array.isArray(brain.tone_keywords) ? (brain.tone_keywords as unknown[]).join(" ") : "",
    Array.isArray(brain.brand_keywords) ? (brain.brand_keywords as unknown[]).join(" ") : "",
  ]
    .filter((x): x is string => typeof x === "string")
    .join(" ")
    .toLowerCase();

  const scores: Record<string, number> = {};
  const bump = (t: string, n = 1) => {
    scores[t] = (scores[t] ?? 0) + n;
  };

  // nonprofit
  if (/nonprofit|forening|frivillig|trygg|barn|inklud|samfunn|veldedig|støtte|medlem/.test(haystack))
    bump("nonprofit", 3);
  // lead_generation
  if (/kurs|opplæring|lead|forespør|booking|kontakt oss|tilbud|påmeld|kunde|salg/.test(haystack))
    bump("lead_generation", 3);
  // food_brand
  if (/mat|smak|kjøkken|popup|restaurant|drikke|råvare|meny|gastro/.test(haystack))
    bump("food_brand", 3);
  // portfolio
  if (/portfolio|portefølj|case|prosjekt|studio|byrå|arbeider|verker/.test(haystack))
    bump("portfolio", 3);
  // campaign
  if (/kampanje|aksjon|mobilis|launch|lansering/.test(haystack)) bump("campaign", 2);
  // local_business
  if (/lokal|by|kommune|åpningstider|adresse|nærmiljø/.test(haystack)) bump("local_business", 2);

  // also use direct site_type if it matches
  const siteType = typeof brain.site_type === "string" ? brain.site_type : "";
  if (siteType) bump(siteType, 4);

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);
}

export async function fetchRelevantStudioReferences(
  brain: Record<string, unknown>,
  limit = 3,
): Promise<StudioReference[]> {
  if (!hasStudioAdminAccess()) return [];
  const types = inferRelevantTypes(brain);

  if (types.length) {
    const { data } = await supabaseAdmin
      .from("studio_design_references")
      .select("*")
      .eq("status", "approved")
      .in("reference_type", types)
      .order("rank", { ascending: false })
      .limit(limit);
    if (data && data.length) return data as StudioReference[];
  }

  // fallback: top approved general
  const { data: fallback } = await supabaseAdmin
    .from("studio_design_references")
    .select("*")
    .eq("status", "approved")
    .eq("reference_type", "general")
    .order("rank", { ascending: false })
    .limit(limit);
  if (fallback && fallback.length) return fallback as StudioReference[];

  // last resort: any approved
  const { data: anyApproved } = await supabaseAdmin
    .from("studio_design_references")
    .select("*")
    .eq("status", "approved")
    .order("rank", { ascending: false })
    .limit(limit);
  return (anyApproved ?? []) as StudioReference[];
}

export const getRelevantStudioReferencesForBrain = createServerFn({ method: "POST" })
  .inputValidator((input: { client_id: string }) => input)
  .handler(async ({ data }): Promise<{ references: StudioReference[] }> => {
    if (!hasStudioAdminAccess()) return { references: [] };
    const { data: brains } = await supabaseAdmin
      .from("client_brains")
      .select("*")
      .eq("client_id", data.client_id)
      .limit(1);
    const brain = (brains?.[0] as Record<string, unknown>) ?? {};
    const refs = await fetchRelevantStudioReferences(brain);
    return { references: refs };
  });
