"use client";
import Image from "next/image";
import React, { FormEvent, useId, useState } from "react";
import Button from "./ui/Button";

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
    <section className="mx-auto w-full max-w-xl">
      <Image
        src="/oops.jpg"
        alt="El mono títere mirando de reojo, incómodo"
        width={960}
        height={600}
        priority
        className="mx-auto h-auto max-h-[16svh] w-auto sm:max-h-[24svh] rounded-card object-cover shadow-sm"
      />
      <h1 className="mt-3 text-[2rem] leading-[1.05] text-ink sm:mt-5 sm:text-display-s">Oops, emmm, a ver…</h1>
      <p className="mt-2 text-sm text-ink-2 sm:mt-3 sm:text-base">
        Ese número no está en la lista (revisá que sea como <strong className="font-bold text-ink">11XXXXXXXX</strong>). Si te
        tendría que haber llegado, pedí la invitación y te aviso cuando la apruebe.
      </p>

      {state.kind === "sent" ? (
        <div role="status" className="well mt-4 p-4 sm:mt-5 sm:p-5">
          <p className="font-display text-title text-ink">¡Listo, ya me llegó!</p>
          <p className="mt-1 text-ink-2">
            Cuando la apruebe, buscá de nuevo tu número <strong className="text-ink">{number}</strong> desde el inicio.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-3">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label htmlFor={`${id}-name`} className="mb-1 block text-xs font-medium text-ink sm:text-sm">
                Tu nombre
              </label>
              <input
                id={`${id}-name`}
                className={`${inputClass} h-10 sm:h-11`}
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`${id}-phone`} className="mb-1 block text-xs font-medium text-ink sm:text-sm">
                Tu teléfono
              </label>
              <input
                id={`${id}-phone`}
                className={`${inputClass} h-10 sm:h-11`}
                inputMode="tel"
                autoComplete="tel"
                placeholder="11XXXXXXXX"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor={`${id}-message`} className="mb-1 block text-xs font-medium text-ink sm:text-sm">
              ¿De dónde nos conocemos? <span className="font-normal text-muted">(opcional)</span>
            </label>
            <input
              id={`${id}-message`}
              className={`${inputClass} h-10 sm:h-11`}
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
            <Button type="submit" variant="primary" loading={state.kind === "sending"}>
              Pedir invitación
            </Button>
          </div>
        </form>
      )}
    </section>
  );
};

export default NoInvitation;
