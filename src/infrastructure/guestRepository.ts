import { Guest } from "@/domain/guest";
import items from "@/data/guests.json";
import { db } from "@/config/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

export async function findGuestInJson(id: number): Promise<Guest | null> {
    const raw = items.persons.find(p => p.id === id);
    return raw ? { ...raw, id } : null;
}

export async function findGuestInFirebase(id: number): Promise<Guest | null> {
    try {
        if (!db) {
            console.warn("Firebase no está disponible en el servidor");
            return null;
        }
        
        const docRef = doc(db, "persons", id.toString());
        const snap = await getDoc(docRef);
        
        if (!snap.exists()) {
            return null;
        }
        
        const data = snap.data() as Guest;
        return { ...data, id };
    } catch (error: any) {
        console.error({ error })
        return null;
    }
}

export async function guestToPersonInFirebase(guest: Guest): Promise<void> {
    const idPerson = guest.id.toString();

    try {
        // Verificar si estamos en el cliente
        if (typeof window === "undefined") {
            throw new Error("Esta función solo puede ejecutarse en el cliente");
        }
        
        if (!db) {
            console.warn("Firebase no está disponible");
            throw new Error("Firebase no está disponible. Recarga la página e intenta nuevamente.");
        }
        
        console.log("Guardando invitado en Firebase:", { id: idPerson, guest });
        
        const documentoRef = doc(db, "persons", idPerson);
        
        // Agregar timeout para evitar cuelgues
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout: La operación tardó demasiado")), 10000);
        });
        
        const getDocPromise = getDoc(documentoRef);
        const documentSnapshot = await Promise.race([getDocPromise, timeoutPromise]) as any;

        if (documentSnapshot.exists()) {
            // La persona ya existe, entonces actualizamos el documento
            const updatePromise = updateDoc(documentoRef, guest);
            await Promise.race([updatePromise, timeoutPromise]);
            console.log("Documento actualizado correctamente.");
        } else {
            // La persona no existe, así que la agregamos como nuevo documento
            const setPromise = setDoc(documentoRef, guest);
            await Promise.race([setPromise, timeoutPromise]);
            console.log("Documento agregado correctamente.");
        }

    } catch (error: any) {
        console.error("Error al actualizar el documento:", error);
        throw new Error(error?.message || "Error al guardar los datos");
    }
}
