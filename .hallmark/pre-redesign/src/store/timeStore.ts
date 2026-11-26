import { getNextBirthday } from '@/lib/eventDate';
import { atom } from 'nanostores';

interface TimeState {
  eventDate: Date;
}

export const $time = atom<TimeState>({
    eventDate: getNextBirthday(),
  });


export const getTime = (): TimeState => {
  return $time.get();
};

export const setEventDate = (eventDate: Date) => {
    $time.set({ eventDate });
  };
