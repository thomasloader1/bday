"use client";

import { cloneElement, useCallback, useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { AppConfig, EventConfig, GiftConfig, GuestConfig } from "@/lib/config/schema";
import { slugId } from "@/lib/config/schema";
import { audienceOf } from "@/lib/config/visibility";
import { getNextBirthday, getTurningAge, formatPartyLine } from "@/lib/eventDate";
import { needsServerResolve, parseGoogleMapsCoords } from "@/lib/mapsUrl";

type Tab = "festejo" | "textos" | "eventos" | "invitados" | "regalos";
const TABS: { id: Tab; label: string }[] = [
  { id: "festejo", label: "Festejo" },
  { id: "textos", label: "Textos" },
  { id: "eventos", label: "Eventos" },
  { id: "invitados", label: "Invitados" },
  { id: "regalos", label: "Regalos" },
];

type Rsvp = { isConfirmed?: boolean; isDrity?: boolean };
type Status = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string; issues?: { path: string; message: string }[] };

const inputClass =
  "h-11 w-full min-w-0 rounded-input border border-rule bg-surface px-3 text-base text-ink shadow-sm placeholder:text-muted";

/* ---------- small field helpers ---------- */

/**
 * A labelled control. The <label> points at the control by id instead of
 * wrapping it: a wrapped text field adds its own value to its accessible name.
 * The hint is linked with aria-describedby.
 */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactElement }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {cloneElement(children, { id, "aria-describedby": hintId })}
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Paragraphs edited as one textarea, separated by a blank line. Keeps its own raw text while typing. */
function ParagraphsField({ label, value, onChange, rows = 8 }: { label: string; value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  const [raw, setRaw] = useState(value.join("\n\n"));
  return (
    <Field label={label} hint="Separá los párrafos con una línea en blanco.">
      <textarea
        rows={rows}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          onChange(e.target.value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean));
        }}
        className="w-full rounded-input border border-rule bg-surface px-3 py-2 text-base leading-relaxed text-ink shadow-sm"
      />
    </Field>
  );
}

/** A comma-separated list (e.g. the food of an event). */
function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [raw, setRaw] = useState(value.join(", "));
  return (
    <Field label={label} hint="Separado por comas.">
      <input
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean));
        }}
        className={inputClass}
      />
    </Field>
  );
}

/** A number typed as text, so partial input ("-34.") is not lost. */
function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState(String(value));
  return (
    <Field label={label}>
      <input
        inputMode="decimal"
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          const n = Number(e.target.value.replace(",", "."));
          if (e.target.value.trim() !== "" && Number.isFinite(n)) onChange(n);
        }}
        className={inputClass}
      />
    </Field>
  );
}

/* ---------- page ---------- */

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("festejo");
  const [saved, setSaved] = useState<AppConfig | null>(null);
  const [draft, setDraft] = useState<AppConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [rsvp, setRsvp] = useState<Record<string, Rsvp>>({});
  const [query, setQuery] = useState("");
  // Remounts the fields that keep raw text after a load, save or discard.
  const [formKey, setFormKey] = useState(0);

  const load = useCallback(async () => {
    setLoadError(null);
    const response = await fetch("/api/admin/config", { cache: "no-store" });
    if (response.status === 401) {
      router.replace("/admin/login?redirected=1");
      return;
    }
    if (!response.ok) {
      setLoadError("No se pudo cargar la configuración.");
      return;
    }
    const config = (await response.json()) as AppConfig;
    setSaved(config);
    setDraft(config);
    setFormKey((k) => k + 1);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  // Confirmation state lives in Firestore; read it to show who answered.
  useEffect(() => {
    getDocs(collection(db, "persons"))
      .then((snapshot) => {
        const next: Record<string, Rsvp> = {};
        snapshot.docs.forEach((d) => (next[d.id] = d.data() as Rsvp));
        setRsvp(next);
      })
      .catch((error) => console.error("Error leyendo confirmaciones:", error));
  }, []);

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const update = (fn: (c: AppConfig) => AppConfig) => {
    setDraft((current) => (current ? fn(current) : current));
    setStatus({ kind: "idle" });
  };

  const save = async () => {
    if (!draft) return;
    setStatus({ kind: "saving" });
    const response = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setSaved(data as AppConfig);
      setDraft(data as AppConfig);
      setStatus({ kind: "saved" });
      return;
    }
    if (response.status === 401) {
      router.replace("/admin/login?redirected=1");
      return;
    }
    setStatus({ kind: "error", message: data.error || "No se pudo guardar.", issues: data.issues });
  };

  const discard = () => {
    setDraft(saved);
    setFormKey((k) => k + 1);
    setStatus({ kind: "idle" });
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (loadError) {
    return (
      <Card as="section" className="mx-auto my-16 max-w-lg">
        <p className="text-ink">{loadError}</p>
        <div className="mt-4">
          <Button onClick={load}>Reintentar</Button>
        </div>
      </Card>
    );
  }

  if (!draft) {
    return <p className="py-16 text-ink-2">Cargando configuración…</p>;
  }

  const age = getTurningAge(draft.party, getNextBirthday(draft.party));

  return (
    <div className="pb-32 pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-s text-ink">Panel del festejo</h1>
          <p className="mt-1 text-ink-2">
            Cumplís {age}. {formatPartyLine(draft.party).replace("Hasta el", "El festejo es el")}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noreferrer" className="link text-sm font-medium">
            Ver el sitio
          </a>
          <Button variant="secondary" size="sm" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      <div role="tablist" aria-label="Secciones" className="mt-8 flex gap-2 overflow-x-auto border-b border-rule">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === t.id ? "border-spot text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={formKey} className="mt-8">
        {tab === "festejo" && <PartyTab draft={draft} update={update} />}
        {tab === "textos" && <TextsTab draft={draft} update={update} />}
        {tab === "eventos" && <EventsTab draft={draft} update={update} />}
        {tab === "invitados" && <GuestsTab draft={draft} update={update} rsvp={rsvp} query={query} setQuery={setQuery} />}
        {tab === "regalos" && <GiftsTab draft={draft} update={update} />}
      </div>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-rule bg-surface">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
          <div role="status" className="min-w-0 text-sm">
            {status.kind === "saving" && <span className="text-ink-2">Guardando…</span>}
            {status.kind === "saved" && <span className="text-ink">Guardado. Ya se ve en el sitio.</span>}
            {status.kind === "error" && (
              <div className="text-spot-deep">
                <p className="font-semibold">{status.message}</p>
                {status.issues && (
                  <ul className="mt-1 list-disc pl-5">
                    {status.issues.slice(0, 5).map((issue) => (
                      <li key={issue.path + issue.message}>{issue.message}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {status.kind === "idle" && <span className="text-muted">{dirty ? "Tenés cambios sin guardar." : "Todo guardado."}</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={!dirty || status.kind === "saving"} onClick={discard}>
              Descartar
            </Button>
            <Button size="sm" disabled={!dirty} loading={status.kind === "saving"} onClick={save}>
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

type TabProps = { draft: AppConfig; update: (fn: (c: AppConfig) => AppConfig) => void };

/* ---------- Festejo ---------- */

function PartyTab({ draft, update }: TabProps) {
  const p = draft.party;
  const set = (patch: Partial<AppConfig["party"]>) => update((c) => ({ ...c, party: { ...c.party, ...patch } }));
  const time = `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card as="section">
        <h2 className="text-title text-ink">Fecha del cumpleaños</h2>
        <p className="mt-1 text-sm text-muted">Se repite cada año; la edad se calcula sola.</p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <NumberField label="Día" value={p.day} onChange={(day) => set({ day })} />
          <NumberField label="Mes" value={p.month} onChange={(month) => set({ month })} />
          <Field label="Hora">
            <input
              type="time"
              value={time}
              onChange={(e) => {
                const [hour, minute] = e.target.value.split(":").map(Number);
                if (Number.isFinite(hour) && Number.isFinite(minute)) set({ hour, minute });
              }}
              className={inputClass}
            />
          </Field>
          <NumberField label="Año de nacimiento" value={p.birthYear} onChange={(birthYear) => set({ birthYear })} />
        </div>
      </Card>

      <Card as="section">
        <h2 className="text-title text-ink">Home</h2>
        <div className="mt-6 space-y-4">
          <Field label="Título">
            <input value={p.homeTitle} onChange={(e) => set({ homeTitle: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Frase bajo la cuenta regresiva">
            <input value={p.homeLead} onChange={(e) => set({ homeLead: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Texto cuando faltan más de 30 días">
            <input value={p.closedLead} onChange={(e) => set({ closedLead: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Frase del pie">
            <input value={p.footerLine} onChange={(e) => set({ footerLine: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Textos ---------- */

function TextsTab({ draft, update }: TabProps) {
  return (
    <Card as="section" className="max-w-3xl">
      <h2 className="text-title text-ink">Carta de la invitación</h2>
      <p className="mt-1 text-sm text-muted">
        Es lo primero que lee cada invitado. El primer párrafo se muestra más grande. Lo que va en cada tarjeta se edita en Eventos.
      </p>
      <div className="mt-6">
        <ParagraphsField
          label="Párrafos"
          rows={14}
          value={draft.letter.paragraphs}
          onChange={(paragraphs) => update((c) => ({ ...c, letter: { paragraphs } }))}
        />
      </div>
    </Card>
  );
}

/* ---------- Eventos ---------- */

/** Pick guests by name: a select to add, chips to remove. */
function GuestPicker({
  label,
  hint,
  guests,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  guests: GuestConfig[];
  value: number[];
  onChange: (ids: number[]) => void;
}) {
  const byId = new Map(guests.map((g) => [g.id, g]));
  const available = guests.filter((g) => !value.includes(g.id));
  return (
    <div>
      <Field label={label} hint={hint}>
        <select
          value=""
          onChange={(e) => {
            const id = Number(e.target.value);
            if (id) onChange([...value, id]);
          }}
          className={inputClass}
        >
          <option value="">Elegí un invitado…</option>
          {available.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.id})
            </option>
          ))}
        </select>
      </Field>
      {value.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {value.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== id))}
                aria-label={`Quitar a ${byId.get(id)?.name ?? id}`}
                className="inline-flex min-h-9 items-center gap-2 rounded-full bg-paper-2 px-3 text-sm text-ink hover:bg-paper-3"
              >
                {byId.get(id)?.name ?? id}
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EventEditor({
  event,
  draft,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  event: EventConfig;
  draft: AppConfig;
  index: number;
  count: number;
  onChange: (e: EventConfig) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const set = (patch: Partial<EventConfig>) => onChange({ ...event, ...patch });
  const audience = audienceOf(draft, { ...event, published: true });
  const ownDate = event.date !== null;
  const mapsInputId = useId();
  const mapsHintId = `${mapsInputId}-hint`;
  const [mapsInput, setMapsInput] = useState(event.location?.url ?? "");
  const [mapsStatus, setMapsStatus] = useState<
    { kind: "idle" } | { kind: "loading" } | { kind: "ok"; message: string } | { kind: "error"; message: string }
  >({ kind: "idle" });

  useEffect(() => {
    setMapsInput(event.location?.url ?? "");
  }, [event.location?.url]);

  const applyMapsUrl = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setMapsStatus({ kind: "error", message: "Pegá una URL de Google Maps." });
      return;
    }

    const isHttpUrl = /^https?:\/\//i.test(trimmed);
    const direct = parseGoogleMapsCoords(trimmed);
    if (direct) {
      set({ location: isHttpUrl ? { ...direct, url: trimmed } : direct });
      setMapsStatus({
        kind: "ok",
        message: `Ubicación actualizada (${direct.lat}, ${direct.lng}).`,
      });
      return;
    }

    if (!needsServerResolve(trimmed)) {
      setMapsStatus({
        kind: "error",
        message: "No pudimos leer coordenadas de ese texto. Pegá un enlace de Google Maps (google.com/maps o maps.app.goo.gl).",
      });
      return;
    }

    setMapsStatus({ kind: "loading" });
    try {
      const response = await fetch("/api/admin/resolve-maps-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = (await response.json()) as {
        lat?: number;
        lng?: number;
        resolvedUrl?: string;
        error?: string;
      };
      if (!response.ok || typeof data.lat !== "number" || typeof data.lng !== "number") {
        setMapsStatus({
          kind: "error",
          message: data.error || "No se pudo resolver esa URL de Google Maps.",
        });
        return;
      }
      set({ location: { lat: data.lat, lng: data.lng, url: trimmed } });
      setMapsStatus({
        kind: "ok",
        message: `Ubicación actualizada (${data.lat}, ${data.lng}).`,
      });
    } catch {
      setMapsStatus({
        kind: "error",
        message: "No se pudo conectar para resolver el enlace. Probá de nuevo.",
      });
    }
  };

  return (
    <Card as="section" aria-label={event.title || "Evento nuevo"}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-title text-ink">{event.title || "Evento nuevo"}</h2>
          <p className="mt-1 text-sm text-muted">
            {event.published
              ? `Publicado. Lo ven ${audience.length} ${audience.length === 1 ? "invitado" : "invitados"}.`
              : `Oculto: no lo ve nadie. Al publicarlo lo verían ${audience.length}.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-input border border-rule bg-surface px-3 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={event.published}
              onChange={(e) => set({ published: e.target.checked })}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            Publicado
          </label>
          <Button variant="secondary" size="sm" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Subir ${event.title}`}>
            Subir
          </Button>
          <Button variant="secondary" size="sm" disabled={index === count - 1} onClick={() => onMove(1)} aria-label={`Bajar ${event.title}`}>
            Bajar
          </Button>
          <Button variant="secondary" size="sm" onClick={onRemove} aria-label={`Borrar ${event.title}`}>
            Borrar
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Field label="Título">
            <input value={event.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} />
          </Field>
          <ParagraphsField label="Texto de la tarjeta" rows={5} value={event.paragraphs} onChange={(paragraphs) => set({ paragraphs })} />
          <Field label="Posdata (opcional)">
            <input value={event.ps} onChange={(e) => set({ ps: e.target.value })} className={inputClass} placeholder="PD: …" />
          </Field>
          <ListField label="Comida (opcional)" value={event.food} onChange={(food) => set({ food })} />

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">Requisitos (opcional)</legend>
            <div className="space-y-2">
              {event.requirements.map((req, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2">
                  <input
                    aria-label={`Requisito ${i + 1}`}
                    value={req.name}
                    onChange={(e) => set({ requirements: event.requirements.map((r, k) => (k === i ? { ...r, name: e.target.value } : r)) })}
                    className={inputClass}
                    placeholder="Vestimenta"
                  />
                  <input
                    aria-label={`Valor del requisito ${i + 1}`}
                    value={req.description}
                    onChange={(e) => set({ requirements: event.requirements.map((r, k) => (k === i ? { ...r, description: e.target.value } : r)) })}
                    className={inputClass}
                    placeholder="Sport"
                  />
                  <Button variant="secondary" size="sm" aria-label={`Quitar requisito ${i + 1}`} onClick={() => set({ requirements: event.requirements.filter((_, k) => k !== i) })}>
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <Button variant="secondary" size="sm" onClick={() => set({ requirements: [...event.requirements, { name: "", description: "" }] })}>
                Agregar requisito
              </Button>
            </div>
          </fieldset>
        </div>

        <div className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="mb-2 text-sm font-medium text-ink">Cuándo</legend>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={!ownDate}
                onChange={(e) => set(e.target.checked ? { date: null, time: null } : { date: new Date().toISOString().slice(0, 10), time: "20:00" })}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              El mismo día y hora del cumpleaños
            </label>
            {ownDate && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Fecha">
                  <input type="date" value={event.date ?? ""} onChange={(e) => set({ date: e.target.value || null })} className={inputClass} />
                </Field>
                <Field label="Hora">
                  <input type="time" value={event.time ?? ""} onChange={(e) => set({ time: e.target.value || null })} className={inputClass} />
                </Field>
              </div>
            )}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-2 text-sm font-medium text-ink">Dónde</legend>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={event.location !== null}
                onChange={(e) => {
                  set({ location: e.target.checked ? { lat: -34.6037, lng: -58.3816 } : null });
                  setMapsStatus({ kind: "idle" });
                }}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              Mostrar mapa y botón &quot;Abrir en Maps&quot;
            </label>
            {event.location && (
              <>
                <div>
                  <label htmlFor={mapsInputId} className="mb-1.5 block text-sm font-medium text-ink">
                    URL de Google Maps
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id={mapsInputId}
                      aria-describedby={mapsHintId}
                      type="url"
                      value={mapsInput}
                      onChange={(e) => {
                        setMapsInput(e.target.value);
                        if (mapsStatus.kind !== "idle") setMapsStatus({ kind: "idle" });
                      }}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData("text");
                        if (pasted && (parseGoogleMapsCoords(pasted) || needsServerResolve(pasted))) {
                          e.preventDefault();
                          setMapsInput(pasted);
                          void applyMapsUrl(pasted);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void applyMapsUrl(mapsInput);
                        }
                      }}
                      placeholder="https://maps.app.goo.gl/… o https://www.google.com/maps/place/…"
                      className={inputClass}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={mapsStatus.kind === "loading"}
                      onClick={() => void applyMapsUrl(mapsInput)}
                    >
                      {mapsStatus.kind === "loading" ? "Leyendo…" : "Aplicar"}
                    </Button>
                  </div>
                  <p id={mapsHintId} className="mt-1 text-sm text-muted">
                    Pegá un enlace de Google Maps (también sirve maps.app.goo.gl) para actualizar latitud y longitud automáticamente.
                  </p>
                </div>
                {mapsStatus.kind === "ok" && (
                  <p role="status" className="text-sm font-medium text-ink">
                    {mapsStatus.message}
                  </p>
                )}
                {mapsStatus.kind === "error" && (
                  <p role="alert" className="text-sm font-medium text-spot-deep">
                    {mapsStatus.message}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    label="Latitud"
                    value={event.location.lat}
                    onChange={(lat) => {
                      set({ location: { lat, lng: event.location!.lng } });
                      setMapsInput("");
                      setMapsStatus({ kind: "idle" });
                    }}
                  />
                  <NumberField
                    label="Longitud"
                    value={event.location.lng}
                    onChange={(lng) => {
                      set({ location: { lat: event.location!.lat, lng } });
                      setMapsInput("");
                      setMapsStatus({ kind: "idle" });
                    }}
                  />
                </div>
                <a
                  className="link inline-block text-sm font-medium"
                  href={event.location.url || `https://www.google.com/maps?q=${event.location.lat},${event.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver ubicación en Google Maps
                </a>
              </>
            )}
          </fieldset>

          <fieldset className="space-y-4 rounded-input bg-paper-2 p-4">
            <legend className="sr-only">Quién lo ve</legend>
            <p className="text-sm font-semibold text-ink">Quién lo ve</p>
            <div>
              <p className="mb-2 text-sm text-ink-2">Grupos</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {draft.groups.map((group) => (
                  <label key={group.id} className="inline-flex items-center gap-1.5 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={event.groups.includes(group.id)}
                      onChange={(e) => set({ groups: e.target.checked ? [...event.groups, group.id] : event.groups.filter((g) => g !== group.id) })}
                      className="h-4 w-4 accent-[var(--color-accent)]"
                    />
                    {group.name}
                  </label>
                ))}
              </div>
            </div>
            <GuestPicker
              label="Sumar invitados"
              hint="Lo ven aunque no estén en esos grupos."
              guests={draft.guests}
              value={event.include}
              onChange={(include) => set({ include, exclude: event.exclude.filter((id) => !include.includes(id)) })}
            />
            <GuestPicker
              label="Excluir invitados"
              hint="No lo ven aunque estén en esos grupos."
              guests={draft.guests}
              value={event.exclude}
              onChange={(exclude) => set({ exclude, include: event.include.filter((id) => !exclude.includes(id)) })}
            />
          </fieldset>
        </div>
      </div>
    </Card>
  );
}

function EventsTab({ draft, update }: TabProps) {
  const setEvents = (fn: (e: EventConfig[]) => EventConfig[]) => update((c) => ({ ...c, events: fn(c.events) }));

  const add = () =>
    setEvents((list) => [
      ...list,
      {
        id: slugId(`evento-${list.length + 1}`, list.map((e) => e.id)),
        published: false,
        title: "Evento nuevo",
        paragraphs: ["Contá de qué se trata."],
        ps: "",
        date: null,
        time: null,
        food: [],
        requirements: [],
        location: null,
        groups: [],
        include: [],
        exclude: [],
      },
    ]);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-ink-2">
        Cada evento es una tarjeta de la invitación. Lo ven los invitados de los grupos marcados, más los que sumes y menos los que excluyas. Un evento oculto no lo ve nadie.
      </p>
      {draft.events.map((event, index) => (
        <EventEditor
          key={event.id}
          event={event}
          draft={draft}
          index={index}
          count={draft.events.length}
          onChange={(next) => setEvents((list) => list.map((e, i) => (i === index ? next : e)))}
          onMove={(delta) =>
            setEvents((list) => {
              const target = index + delta;
              if (target < 0 || target >= list.length) return list;
              const next = [...list];
              [next[index], next[target]] = [next[target], next[index]];
              return next;
            })
          }
          onRemove={() => {
            if (window.confirm(`¿Borrar "${event.title}"? Se quita de todas las invitaciones al guardar.`)) {
              setEvents((list) => list.filter((_, i) => i !== index));
            }
          }}
        />
      ))}
      {draft.events.length === 0 && (
        <Card as="section">
          <p className="text-ink-2">No hay eventos todavía. Los invitados ven solo la carta hasta que agregues y publiques uno.</p>
        </Card>
      )}
      <Button onClick={add}>Agregar evento</Button>
    </div>
  );
}

/* ---------- Invitados ---------- */

function GroupsEditor({ draft, update }: TabProps) {
  const [name, setName] = useState("");
  const counts = new Map(draft.groups.map((g) => [g.id, draft.guests.filter((guest) => guest.group.includes(g.id)).length]));

  const addGroup = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    update((c) => ({ ...c, groups: [...c.groups, { id: slugId(trimmed, c.groups.map((g) => g.id)), name: trimmed }] }));
    setName("");
  };

  const removeGroup = (id: string, label: string) => {
    if (!window.confirm(`¿Borrar el grupo "${label}"? Se quita de los invitados y de los eventos al guardar.`)) return;
    update((c) => ({
      ...c,
      groups: c.groups.filter((g) => g.id !== id),
      guests: c.guests.map((g) => ({ ...g, group: g.group.filter((x) => x !== id) })),
      events: c.events.map((e) => ({ ...e, groups: e.groups.filter((x) => x !== id) })),
    }));
  };

  return (
    <Card as="section">
      <h2 className="text-title text-ink">Grupos</h2>
      <p className="mt-1 text-sm text-muted">Los eventos se asignan a grupos. Un invitado puede estar en varios.</p>
      <ul className="mt-4 space-y-2">
        {draft.groups.map((group, index) => (
          <li key={group.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
            <input
              aria-label={`Nombre del grupo ${group.name}`}
              value={group.name}
              onChange={(e) =>
                update((c) => ({ ...c, groups: c.groups.map((g, i) => (i === index ? { ...g, name: e.target.value } : g)) }))
              }
              className={inputClass}
            />
            <span className="whitespace-nowrap text-sm text-muted">{counts.get(group.id) ?? 0} invitados</span>
            <Button variant="secondary" size="sm" aria-label={`Borrar el grupo ${group.name}`} onClick={() => removeGroup(group.id, group.name)}>
              Borrar
            </Button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          aria-label="Nombre del grupo nuevo"
          placeholder="Nombre del grupo nuevo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addGroup();
            }
          }}
          className={`${inputClass} max-w-xs`}
        />
        <Button variant="secondary" size="sm" onClick={addGroup} disabled={!name.trim()}>
          Crear grupo
        </Button>
      </div>
    </Card>
  );
}

function GuestsTab({
  draft,
  update,
  rsvp,
  query,
  setQuery,
}: TabProps & { rsvp: Record<string, Rsvp>; query: string; setQuery: (q: string) => void }) {
  const guests = draft.guests;
  const setGuests = (fn: (g: GuestConfig[]) => GuestConfig[]) => update((c) => ({ ...c, guests: fn(c.guests) }));
  const setGuest = (index: number, patch: Partial<GuestConfig>) =>
    setGuests((list) => list.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  const removeGuest = (index: number) => {
    const id = guests[index].id;
    update((c) => ({
      ...c,
      guests: c.guests.filter((_, i) => i !== index),
      // Drop the guest from every event's exceptions too.
      events: c.events.map((e) => ({ ...e, include: e.include.filter((x) => x !== id), exclude: e.exclude.filter((x) => x !== id) })),
    }));
  };

  const q = query.trim().toLowerCase();
  const visible = guests
    .map((guest, index) => ({ guest, index }))
    .filter(({ guest }) => !q || guest.name.toLowerCase().includes(q) || String(guest.id).includes(q));

  const confirmed = guests.filter((g) => rsvp[g.id]?.isConfirmed).length;
  const declined = guests.filter((g) => rsvp[g.id]?.isDrity && !rsvp[g.id]?.isConfirmed).length;
  const eventsSeen = (guest: GuestConfig) =>
    draft.events.filter((e) => e.published && !e.exclude.includes(guest.id) && (e.include.includes(guest.id) || e.groups.some((g) => guest.group.includes(g)))).length;

  const statusOf = (id: number) => {
    const r = rsvp[id];
    if (r?.isConfirmed) return { label: "Confirmó", cls: "bg-lime text-lime-ink" };
    if (r?.isDrity) return { label: "No viene", cls: "bg-paper-3 text-ink-2" };
    return { label: "Pendiente", cls: "bg-paper-2 text-muted" };
  };

  return (
    <div className="space-y-6">
      <GroupsEditor draft={draft} update={update} />

      <Card as="section">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-title text-ink">{guests.length} invitados</h2>
            <p className="mt-1 text-sm text-muted">
              {confirmed} confirmaron, {declined} no vienen, {guests.length - confirmed - declined} pendientes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              aria-label="Buscar invitado"
              placeholder="Buscar por nombre o teléfono"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${inputClass} w-64`}
            />
            <Button
              size="sm"
              onClick={() => {
                setQuery("");
                setGuests((list) => [{ id: 0, name: "", group: draft.groups[0] ? [draft.groups[0].id] : [] }, ...list]);
              }}
            >
              Agregar invitado
            </Button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-rule text-muted">
                <th className="py-2 pr-3 font-medium">Teléfono</th>
                <th className="py-2 pr-3 font-medium">Nombre</th>
                <th className="py-2 pr-3 font-medium">Grupos</th>
                <th className="py-2 pr-3 font-medium">Ve</th>
                <th className="py-2 pr-3 font-medium">Estado</th>
                <th className="py-2 font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ guest, index }) => {
                const s = statusOf(guest.id);
                const seen = eventsSeen(guest);
                return (
                  <tr key={index} className="border-b border-rule align-middle">
                    <td className="py-2 pr-3">
                      <input
                        aria-label={`Teléfono de ${guest.name || "invitado nuevo"}`}
                        inputMode="tel"
                        value={guest.id || ""}
                        onChange={(e) => setGuest(index, { id: Number(e.target.value.replace(/\D/g, "")) || 0 })}
                        className={`${inputClass} w-40`}
                        placeholder="11XXXXXXXX"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        aria-label={`Nombre del invitado ${guest.id || "nuevo"}`}
                        value={guest.name}
                        onChange={(e) => setGuest(index, { name: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {draft.groups.map((group) => (
                          <label key={group.id} className="inline-flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={guest.group.includes(group.id)}
                              onChange={(e) =>
                                setGuest(index, {
                                  group: e.target.checked ? [...guest.group, group.id] : guest.group.filter((g) => g !== group.id),
                                })
                              }
                              className="h-4 w-4 accent-[var(--color-accent)]"
                            />
                            {group.name}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-2 pr-3 text-ink-2">
                      {seen} {seen === 1 ? "evento" : "eventos"}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-2">
                        {guest.id > 0 && (
                          <a className="link whitespace-nowrap text-sm" href={`/${guest.id}`} target="_blank" rel="noreferrer">
                            Ver
                          </a>
                        )}
                        <Button variant="secondary" size="sm" aria-label={`Quitar a ${guest.name || "invitado nuevo"}`} onClick={() => removeGuest(index)}>
                          Quitar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted">
                    Ningún invitado coincide con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">
          Quitar a alguien de la lista no borra su confirmación en Firestore; solo deja de poder ver la invitación.
        </p>
      </Card>
    </div>
  );
}

/* ---------- Regalos ---------- */

function GiftsTab({ draft, update }: TabProps) {
  const gifts = draft.gifts;
  const setGifts = (fn: (g: GiftConfig[]) => GiftConfig[]) => update((c) => ({ ...c, gifts: fn(c.gifts) }));
  const setGift = (index: number, patch: Partial<GiftConfig>) =>
    setGifts((list) => list.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  const move = (index: number, delta: number) =>
    setGifts((list) => {
      const target = index + delta;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <div className="space-y-4">
      {gifts.map((gift, index) => (
        <Card key={index} as="section" className="grid gap-4 md:grid-cols-[96px_minmax(0,1fr)_auto] md:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-input border border-rule bg-surface">
            {gift.image && <img src={gift.image} alt={gift.name} className="h-full w-full object-contain" />}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Nombre">
              <input value={gift.name} onChange={(e) => setGift(index, { name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="URL de la imagen">
              <input value={gift.image} onChange={(e) => setGift(index, { image: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Link de compra">
              <input value={gift.link} onChange={(e) => setGift(index, { link: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <div className="flex gap-2 md:flex-col">
            <Button variant="secondary" size="sm" aria-label={`Subir ${gift.name}`} disabled={index === 0} onClick={() => move(index, -1)}>
              Subir
            </Button>
            <Button
              variant="secondary"
              size="sm"
              aria-label={`Bajar ${gift.name}`}
              disabled={index === gifts.length - 1}
              onClick={() => move(index, 1)}
            >
              Bajar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              aria-label={`Quitar ${gift.name}`}
              onClick={() => setGifts((list) => list.filter((_, i) => i !== index))}
            >
              Quitar
            </Button>
          </div>
        </Card>
      ))}
      <Button variant="secondary" onClick={() => setGifts((list) => [...list, { name: "", image: "", link: "" }])}>
        Agregar regalo
      </Button>
    </div>
  );
}
