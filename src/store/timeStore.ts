import { calculateTimeLeft } from '@/lib/calculateTimeLeft';
import { atom } from 'nanostores';

interface TimeState {
  targetDate: Date;
  timeLeft: any;
}

export const $time = atom<TimeState>({
    targetDate: new Date("2023-12-16T00:00:00"),
    timeLeft: calculateTimeLeft(new Date("2023-12-16T00:00:00")),
  });


export const getTime = (): TimeState => {
  return $time.get();
};

export const setTime = (targetDate: Date) => {
    $time.set({
        targetDate,
        timeLeft: calculateTimeLeft(targetDate),
      });
  };