export interface Guest {
  id: number;
  name: string;
  group: string[];
  lupe: { _lat: number; _long: number };
  isConfirmed: boolean;
  isDrity: boolean;
  email: null | string;
  images: string[];
}

export interface UpdateGuest {
  [key: string]: any;
}
