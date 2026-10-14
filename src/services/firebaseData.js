import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  orderBy,
  limit,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";

const publicFields = (pet, uid) => ({
  id: pet.id,
  ownerUid: uid,
  name: pet.name || "",
  species: pet.species || "",
  speciesOther: pet.speciesOther || "",
  animalType: pet.animalType || "Mascota doméstica",
  animalTypeOther: pet.animalTypeOther || "",
  breed: pet.breed || "",
  birthDate: pet.birthDate || "",
  sex: pet.sex || "",
  weight: pet.weight || "",
  color: pet.color || "",
  photo: pet.photo || "",
  temperament: pet.temperament || "",
  bio: pet.bio || "",
  reward: pet.reward || '',
  ownerName: pet.ownerName || "",
  phone: pet.phone || "",
  whatsapp: pet.whatsapp || "",
  city: pet.city || "",
  allergies: pet.allergies || "",
  conditions: pet.conditions || "",
  medication: pet.medication || "",
  fears: pet.fears || "",
  emergencyNotes: pet.emergencyNotes || "",
  food: pet.food || "",
  foodAmount: pet.foodAmount || "",
  foodSchedule: pet.foodSchedule || "",
  walkNotes: pet.walkNotes || "",
  vetName: pet.vetName || "",
  vetPhone: pet.vetPhone || "",
  updatedAt: new Date().toISOString(),
});
export async function loadUserData(uid) {
  const petSnap = await getDoc(doc(db, "users", uid, "pets", "main"));
  const entriesSnap = await getDocs(collection(db, "users", uid, "entries"));
  return {
    pet: petSnap.exists() ? petSnap.data() : null,
    entries: entriesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
}
export async function savePet(uid, pet, user) {
  const full = {
    ...pet,
    ownerUid: uid,
    id: pet.id && pet.id !== "luna-demo" ? pet.id : crypto.randomUUID(),
  };
  await setDoc(doc(db, "users", uid, "pets", "main"), full);
  await setDoc(doc(db, "publicPets", full.id), publicFields(full, uid));
  // Actualizar los datos visibles del ranking sin perder nunca los puntos.
  // La transacción evita que una edición de mascota pise una actualización
  // concurrente del puntaje de cuidado.
  const leaderboardRef = doc(db, "leaderboardProfiles", uid);
  await runTransaction(db, async (transaction) => {
    const leaderboardSnap = await transaction.get(leaderboardRef);
    const existing = leaderboardSnap.exists() ? leaderboardSnap.data() : {};
    transaction.set(
      leaderboardRef,
      {
        uid,
        displayName:
          user?.displayName || user?.email?.split("@")[0] || "Amante de mascotas",
        points: Number.isFinite(Number(existing.points))
          ? Number(existing.points)
          : 0,
        species:
          full.species === "Otro"
            ? full.speciesOther || "Otra especie"
            : full.species || "Otra",
        animalType:
          full.animalType === "Otro"
            ? full.animalTypeOther || "Otro tipo"
            : full.animalType || "Mascota doméstica",
        petName: full.name || "Mi mascota",
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  });
  return full;
}
export async function saveEntries(uid, entries) {
  const current = await getDocs(collection(db, "users", uid, "entries"));
  const ids = new Set(entries.map((e) => e.id));
  await Promise.all(
    current.docs.filter((d) => !ids.has(d.id)).map((d) => deleteDoc(d.ref)),
  );
  await Promise.all(
    entries.map(({ id, ...data }) =>
      setDoc(doc(db, "users", uid, "entries", id), data),
    ),
  );
}
export async function getPublicPet(id) {
  const snap = await getDoc(doc(db, "publicPets", id));
  return snap.exists() ? snap.data() : null;
}
export async function loadLeaderboard() {
  const q = query(
    collection(db, "leaderboardProfiles"),
    orderBy("points", "desc"),
    limit(100),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}
export async function updateLeaderboard(uid, points, pet, user) {
  await setDoc(
    doc(db, "leaderboardProfiles", uid),
    {
      uid,
      displayName:
        user?.displayName || user?.email?.split("@")[0] || "Amante de mascotas",
      points,
      species:
        pet.species === "Otro"
          ? pet.speciesOther || "Otra especie"
          : pet.species || "Otra",
      animalType:
        pet.animalType === "Otro"
          ? pet.animalTypeOther || "Otro tipo"
          : pet.animalType || "Mascota doméstica",
      petName: pet.name || "Mi mascota",
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
