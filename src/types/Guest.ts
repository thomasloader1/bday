import type { GuestEvent } from "@/lib/config/schema";

export interface Guest {
  id: number;
  name: string;
  group: string[];
  lunch?: { _lat: number; _long: number };
  after?: { _lat: number; _long: number };
  isConfirmed: boolean;
  isVoted?: boolean;
  isDrity: boolean;
  votedFor?: string;
  /** Events this guest can see (decided on the server). Never written to Firestore. */
  events?: GuestEvent[];
}

export interface UpdateGuest {
  [key: string]: any;
}
