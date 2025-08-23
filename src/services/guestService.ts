import { findGuestInJson, findGuestInFirebase } from "@/infrastructure/guestRepository";
import { Guest } from "@/domain/guest";

export async function getGuest(id: number): Promise<Guest | null> {
  const localGuest = await findGuestInJson(id);
  const firebaseGuest = await findGuestInFirebase(id);
  console.log({localGuest, firebaseGuest})
  return  localGuest;
}