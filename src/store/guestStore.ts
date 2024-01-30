import { atom } from 'nanostores';

interface GuestState {

}

export const $guest = atom<GuestState>({});

export const getGuest = (): GuestState => {
  return $guest.get();
};

export const setGuest = (guest: GuestState) => {
    $guest.set(guest);
  };