import { atom } from 'nanostores';

interface FetchState {
    loading: boolean;
}

export const $fetch = atom<FetchState>({loading: false});

export const getGuest = (): FetchState => {
  return $fetch.get();
};

export const setOnRequest = (isLoading: boolean) => {
    $fetch.set({...$fetch.get(), loading: isLoading});
  };