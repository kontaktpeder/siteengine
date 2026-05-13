import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { OPPLEV_SEED } from "./seed-opplev.server";

export const listClients = createServerFn({ method: "GET" }).handler(async () => {
  const { data: clients, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!clients?.length) return [];

  const { data: recipes } = await supabaseAdmin
    .from("site_recipes")
    .select("client_id, site_type");
  const map = new Map<string, string | null>();
  (recipes ?? []).forEach((r) => map.set(r.client_id, r.site_type ?? null));
  return clients.map((c) => ({ ...c, site_type: map.get(c.id) ?? null }));
});

export const getClientBundle = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const [{ data: client }, { data: brains }, { data: recipes }, { data: pages }] =
      await Promise.all([
        supabaseAdmin.from("clients").select("*").eq("id", data.id).single(),
        supabaseAdmin.from("client_brains").select("*").eq("client_id", data.id).limit(1),
        supabaseAdmin.from("site_recipes").select("*").eq("client_id", data.id).limit(1),
        supabaseAdmin.from("site_pages").select("*").eq("client_id", data.id).order("sort_order"),
      ]);

    const home =
      pages?.find((p) => p.slug === "/" || p.slug === "home") ?? pages?.[0] ?? null;

    let sections: Record<string, unknown>[] = [];
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
    };

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
    }) => input,
  )
  .handler(async ({ data }) => {
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
    };

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
