import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { SiteData } from "./site-types";

function getPublicClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase URL or publishable key is not configured");
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let _client: ReturnType<typeof getPublicClient> | undefined;
const supabaseAdmin = new Proxy({} as ReturnType<typeof getPublicClient>, {
  get(_, prop, receiver) {
    if (!_client) _client = getPublicClient();
    return Reflect.get(_client, prop, receiver);
  },
});

/**
 * Resolve the site to render. For v1: by slug param if provided, otherwise
 * fall back to the first published client (or first client at all).
 */
export const getSiteData = createServerFn({ method: "GET" })
  .inputValidator((input: { slug?: string } | undefined) => input ?? {})
  .handler(async ({ data }): Promise<SiteData | null> => {
    let clientQuery = supabaseAdmin.from("clients").select("*").limit(1);
    if (data.slug) {
      clientQuery = supabaseAdmin
        .from("clients")
        .select("*")
        .eq("slug", data.slug)
        .limit(1);
    } else {
      // prefer published
      const { data: published } = await supabaseAdmin
        .from("clients")
        .select("*")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(1);
      if (published && published.length) {
        clientQuery = supabaseAdmin
          .from("clients")
          .select("*")
          .eq("id", published[0].id)
          .limit(1);
      }
    }

    const { data: clients, error } = await clientQuery;
    if (error) throw error;
    const client = clients?.[0];
    if (!client) return null;

    const [{ data: brains }, { data: recipes }, { data: pages }] =
      await Promise.all([
        supabaseAdmin
          .from("client_brains")
          .select("*")
          .eq("client_id", client.id)
          .limit(1),
        supabaseAdmin
          .from("site_recipes")
          .select("*")
          .eq("client_id", client.id)
          .limit(1),
        supabaseAdmin
          .from("site_pages")
          .select("*")
          .eq("client_id", client.id)
          .order("sort_order", { ascending: true }),
      ]);

    const home =
      pages?.find((p) => p.slug === "/" || p.slug === "home") ?? pages?.[0] ?? null;

    let sections: SiteData["sections"] = [];
    if (home) {
      const { data: sec } = await supabaseAdmin
        .from("page_sections")
        .select("*")
        .eq("page_id", home.id)
        .eq("is_visible", true)
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
