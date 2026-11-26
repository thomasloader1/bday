"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import type { PublicConfig } from "@/lib/config/schema";
import { getNextBirthday, getTurningAge } from "@/lib/eventDate";

/**
 * The public config, read on the server by the root layout and handed to
 * every client component through context (no fetch, no loading state).
 */
const ConfigContext = createContext<PublicConfig | null>(null);

export function ConfigProvider({ config, children }: { config: PublicConfig; children: ReactNode }) {
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig(): PublicConfig {
  const config = useContext(ConfigContext);
  if (!config) throw new Error("useConfig must be used inside <ConfigProvider>");
  return config;
}

/** The next party date and the age turned at it; `roll()` moves on once the countdown reaches zero. */
export function useParty() {
  const { party } = useConfig();
  const [eventDate, setEventDate] = useState(() => getNextBirthday(party));

  useEffect(() => {
    setEventDate(getNextBirthday(party));
  }, [party]);

  const roll = useCallback(() => setEventDate(getNextBirthday(party)), [party]);

  return { party, eventDate, age: getTurningAge(party, eventDate), roll };
}
