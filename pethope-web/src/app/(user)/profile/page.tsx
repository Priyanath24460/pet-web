"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { onAuthStateChanged, updateProfile, User as FirebaseUser } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase/config";
import { PetListing } from "../../../types/database";
import Header from "../../../components/Header";
import { PawPrint, User, Mail, Edit2, Loader2, MapPin } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [userPets, setUserPets] = useState<PetListing[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
        
        // Fetch their pets
        try {
          const petsRef = collection(db, "pets");
          const q = query(petsRef, where("ownerId", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);
          
          const petsData: PetListing[] = [];
          querySnapshot.forEach((doc) => {
            petsData.push({ id: doc.id, ...doc.data() } as PetListing);
          });
          setUserPets(petsData);
        } catch (error) {
          console.error("Error fetching pets:", error);
          toast.error("Failed to load your pets.");
        } finally {
          setLoadingPets(false);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(user, { displayName });
      
      // Update in Firestore users collection
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { displayName });
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <Loader2 className="w-10 h-10 animate-spin text-[#007BFF]" />
      </div>
    );
  }

  if (!user) return null; // will redirect

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-20">
      {/* Header Component */}
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 lg:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              {/* Top Banner inside card */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 to-blue-400 z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center mt-12">
                <div className="w-28 h-28 bg-white p-1 rounded-full shadow-md mb-4">
                  <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-[#007BFF] text-4xl font-bold">
                    {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
                  </div>
                </div>
                
                {isEditing ? (
                  <div className="w-full space-y-3 mt-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full text-center bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#007BFF]/50"
                      placeholder="Your Name"
                    />
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={isSaving}
                        className="px-6 py-2 text-sm bg-[#007BFF] text-white rounded-full font-medium shadow-sm shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">{displayName || "Pet Lover"}</h2>
                    <p className="text-slate-500 flex items-center gap-2 mb-6">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-blue-50 text-[#007BFF] hover:bg-blue-100 font-medium py-3 rounded-2xl transition flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: User's Pets */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-slate-100 h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900">My Pet Listings</h3>
                <Link href="/add-pet" className="bg-[#007BFF] text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-700 transition shadow-sm shadow-blue-200 text-sm">
                  + Add New Pet
                </Link>
              </div>

              {loadingPets ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : userPets.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <PawPrint className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-slate-700 mb-2">No pets listed yet</h4>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    You haven't added any pets for adoption. Help a furry friend find a new home by creating a listing!
                  </p>
                  <Link href="/add-pet" className="text-[#007BFF] font-medium hover:underline">
                    Create your first listing &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {userPets.map((pet) => (
                    <Link href={`/pet/${pet.id}`} key={pet.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition group relative flex flex-col">
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        {pet.imageUrl ? (
                          <Image src={pet.imageUrl} alt={pet.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-300">No Image</div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                          {pet.category || pet.breed}
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h4 className="text-xl font-bold text-slate-900 mb-1">{pet.name}</h4>
                        <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{pet.location || "Location not specified"}</span>
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-600">{pet.gender} • {pet.age}</span>
                          <button className="text-[#007BFF] bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
