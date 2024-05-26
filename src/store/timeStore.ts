import { calculateTimeLeft } from '@/lib/calculateTimeLeft';
import { atom } from 'nanostores';

interface TimeState {
  targetDate: Date;
  targetWorkDate: Date;
  targetFamilyDate: Date;
  timeLeft: any;
}

export const $time = atom<TimeState>({
    targetDate: new Date("2024-11-08T20:00:00"),
    targetWorkDate: new Date("2023-12-21T18:00:00"),
    targetFamilyDate: new Date("2023-12-16T13:00:00"),
    timeLeft: calculateTimeLeft(new Date("2024-11-08T00:00:00")),
  });


export const getTime = (): TimeState => {
  return $time.get();
};

export const setTime = (targetDate: Date) => {
    $time.set({
        ...$time.get(),
        targetDate,
        timeLeft: calculateTimeLeft(targetDate),
      });
  };