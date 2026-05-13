
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
