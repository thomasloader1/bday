"use client";
import Image from "next/image";
import React, { FormEvent, useId, useState } from "react";
import Button from "./ui/Button";
import WhatsAppButton from "./WhatsAppButton";

const inputClass =
  "w-full min-w-0 rounded-input border border-rule bg-surface px-4 text-base text-ink shadow-sm placeholder:text-muted";

type SendState = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/** The number searched is not on the list: say so, and let them ask for an invitation (approved from the dashboard). */
const NoInvitation = ({ phone }: { phone?: string }) => {
  const id = useId();
  const [name, setName] = useState("");
  const [number, setNumber] = useState(() => (phone ?? "").replace(/\D+/g, ""));
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SendState>({ kind: "idle" });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState({ kind: "sending" });
    try {
      const response = await fetch("/api/invite-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: number, name, message }),
      });
      if (response.ok) {
        setState({ kind: "sent" });
        return;
      }
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setState({ kind: "error", message: data.error || "No se pudo enviar. Probá de nuevo." });
    } catch {
      setState({ kind: "error", message: "No hay conexión. Probá de nuevo." });
    }
  };

  return (
    <section className="grid gap-12 md:grid-cols-12 md:gap-8">
      <div className="min-w-0 md:col-span-7">
        <Image
          src="/oops.jpg"
          alt="El mono títere mirando de reojo, incómodo"
          width={960}
          height={600}
          priority
          className="mb-8 h-auto w-full max-w-xl rounded-card shadow-sm"
        />
        <h1 className="mb-6 text-display text-ink">Oops, emmm, a ver…</h1>
        <div className="max-w-[60ch] space-y-4 text-lg leading-relaxed text-ink-2">
          <p className="lead text-ink">
            Ese número no está en la lista de invitados. Revisá que sea como{" "}
            <strong className="font-bold text-ink">11XXXXXXXX</strong>.
          </p>
          <p>Si te tendría que haber llegado la invitación, pedila acá y te aviso cuando la apruebe.</p>
        </div>

        {state.kind === "sent" ? (
          <div role="status" className="well mt-8 max-w-xl p-6">
            <p className="font-display text-title text-ink">¡Listo, ya me llegó!</p>
            <p className="mt-2 text-ink-2">
              Cuando la apruebe, buscá de nuevo tu número <strong className="text-ink">{number}</strong> desde el inicio.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 grid max-w-xl gap-4">
            <div>
              <label htmlFor={`${id}-name`} className="mb-2 block text-sm font-medium text-ink">
                Tu nombre
              </label>
              <input
                id={`${id}-name`}
                className={`${inputClass} h-[3.25rem]`}
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`${id}-phone`} className="mb-2 block text-sm font-medium text-ink">
                Tu número de teléfono
              </label>
              <input
                id={`${id}-phone`}
                className={`${inputClass} h-[3.25rem]`}
                inputMode="tel"
                autoComplete="tel"
                placeholder="11XXXXXXXX"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`${id}-message`} className="mb-2 block text-sm font-medium text-ink">
                ¿De dónde nos conocemos? <span className="font-normal text-muted">(opcional)</span>
              </label>
              <textarea
                id={`${id}-message`}
                className={`${inputClass} min-h-[6rem] py-3`}
                maxLength={300}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            {state.kind === "error" && (
              <p role="alert" className="text-sm font-medium text-spot-deep">
                {state.message}
              </p>
            )}
            <div>
              <Button type="submit" variant="primary" size="lg" loading={state.kind === "sending"}>
                Pedir invitación
              </Button>
            </div>
          </form>
        )}
      </div>
      <div className="well self-start p-8 md:col-span-4 md:col-start-9">
        <p className="mb-4 text-ink-2">¿Preferís escribirme directo?</p>
        <WhatsAppButton />
      </div>
    </section>
  );
};

export default NoInvitation;
