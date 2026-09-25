// src/services/petService.ts
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { PetListing } from '../types/database';

export const getRecentPets = async (): Promise<PetListing[]> => {
  const petsCollection = collection(db, 'pets');
  const q = query(petsCollection, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const pets: PetListing[] = [];
  querySnapshot.forEach((doc) => {
    pets.push({ id: doc.id, ...doc.data() } as PetListing);
  });
  
  return pets;
};

import { doc, getDoc } from 'firebase/firestore';
import { UserDocument } from '../types/database';

export const getPetById = async (id: string): Promise<PetListing | null> => {
  const docRef = doc(db, 'pets', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as PetListing;
  }
  return null;
};

export const getUserById = async (id: string): Promise<UserDocument | null> => {
  const docRef = doc(db, 'users', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { uid: docSnap.id, ...docSnap.data() } as UserDocument;
  }
  return null;
};
