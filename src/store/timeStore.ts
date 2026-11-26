import { atom } from 'nanostores';

/**
 * Deprecated: the party date now comes from the config (useParty() in
 * components/ConfigProvider). Kept so older imports still compile.
 */
interface TimeState {
  eventDate: Date;
}

export const $time = atom<TimeState>({
  eventDate: new Date(),
});

export const getTime = (): TimeState => $time.get();

export const setEventDate = (eventDate: Date) => {
  $time.set({ eventDate });
};
