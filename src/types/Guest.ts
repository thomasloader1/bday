export interface Guest {
  id: string;
  name: string;
  group: string[];
  place: string[];
  lunch: {_lat: number, _long: number};
  confirmed: boolean;
  isDrity: boolean;
}
