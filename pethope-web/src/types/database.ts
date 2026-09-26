// src/types/database.ts
import { Timestamp } from 'firebase/firestore';

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface PetListing {
  id?: string;
  name: string;
  breed?: string;
  age: string;
  gender: 'Male' | 'Female' | 'Both';
  location: string;
  category: string;
  description?: string;
  imageUrl: string;
  imageUrls?: string[];
  ownerId: string;
  contactNumber?: string;
  createdAt?: Timestamp;
}
