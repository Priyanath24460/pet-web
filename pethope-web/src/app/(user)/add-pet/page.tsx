"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase/config";
import { PawPrint, Image as ImageIcon, Loader2 } from "lucide-react";
import Header from "../../../components/Header";
import toast from "react-hot-toast";

export default function AddPetPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [category, setCategory] = useState("Dog");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        toast.error("You must be logged in to add a pet.");
        router.push("/login");
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "pethope";

    if (!cloudName) {
      throw new Error("Cloudinary cloud name is not configured.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload image to Cloudinary.");
    }

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!imageFile) {
      toast.error("Please select a pet image.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload image
      const imageUrl = await uploadImageToCloudinary(imageFile);

      // 2. Save to Firestore
      const petsCollection = collection(db, "pets");
      await addDoc(petsCollection, {
        name,
        breed,
        age,
        gender,
        location,
        contactNumber,
        category,
        imageUrl,
        ownerId: user.uid,
        createdAt: Timestamp.now(),
      });

      toast.success("Pet listed successfully!");
      router.push("/profile");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <Loader2 className="w-10 h-10 animate-spin text-[#007BFF]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-20">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 lg:mt-12">
        <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <PawPrint className="w-8 h-8 text-[#007BFF]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Add a Pet</h1>
              <p className="text-slate-500">Find a loving home for your furry friend</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Pet Photo</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-3xl hover:bg-slate-50 transition relative overflow-hidden">
                {imagePreview ? (
                  <div className="relative w-full h-64">
                    <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                    <button 
                      type="button" 
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 bg-white/90 text-red-500 p-2 rounded-full shadow-sm hover:bg-white transition"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-slate-300" />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#007BFF] hover:text-blue-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pet Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Max"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007BFF]/50 transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007BFF]/50 transition appearance-none"
                  required
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Breed</label>
                <input 
                  type="text" 
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="e.g. Golden Retriever"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007BFF]/50 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
                <input 
                  type="text" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 2 months"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007BFF]/50 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Male" 
                      checked={gender === "Male"}
                      onChange={() => setGender("Male")}
                      className="sr-only peer" 
                    />
                    <div className="text-center py-3 border border-slate-200 rounded-2xl peer-checked:bg-blue-50 peer-checked:border-[#007BFF] peer-checked:text-[#007BFF] transition font-medium text-slate-600">
                      Male
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Female" 
                      checked={gender === "Female"}
                      onChange={() => setGender("Female")}
                      className="sr-only peer" 
                    />
                    <div className="text-center py-3 border border-slate-200 rounded-2xl peer-checked:bg-blue-50 peer-checked:border-[#007BFF] peer-checked:text-[#007BFF] transition font-medium text-slate-600">
                      Female
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, NY"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007BFF]/50 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
                <input 
                  type="tel" 
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. +1 234 567 890"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007BFF]/50 transition"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#007BFF] hover:bg-blue-700 text-white font-semibold py-4 rounded-full mt-8 transition shadow-lg shadow-blue-200/50 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing Listing...
                </>
              ) : (
                "Publish Listing"
              )}
            </button>
            
          </form>
        </div>
      </main>
    </div>
  );
}
