"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase/config";
import { PawPrint, Image as ImageIcon, Loader2 } from "lucide-react";
import Header from "../../../components/Header";
import ImageCropperModal from "../../../components/ImageCropperModal";
import toast from "react-hot-toast";

export default function AddPetPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Both">("Male");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [category, setCategory] = useState("Dog");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);
  const [cropQueue, setCropQueue] = useState<{file: File, url: string, targetIndex: number}[]>([]);

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

  const activeCrop = cropQueue.length > 0 ? cropQueue[0] : null;

  const handleCropComplete = (croppedFile: File) => {
    if (!activeCrop) return;
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles[activeCrop.targetIndex] = croppedFile;
    newPreviews[activeCrop.targetIndex] = URL.createObjectURL(croppedFile);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    setCropQueue(prev => prev.slice(1));
  };

  const handleCropCancel = () => {
    setCropQueue(prev => prev.slice(1));
  };

  const handleImageChange = (clickedIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newQueue = [...cropQueue];
      
      let currentFileIdx = 0;
      newQueue.push({
        file: files[currentFileIdx],
        url: URL.createObjectURL(files[currentFileIdx]),
        targetIndex: clickedIndex
      });
      currentFileIdx++;
      
      for (let i = 0; i < 3 && currentFileIdx < files.length; i++) {
        const isFilled = imageFiles[i] !== null;
        const isQueued = newQueue.some(q => q.targetIndex === i);
        if (i !== clickedIndex && !isFilled && !isQueued) {
          newQueue.push({
            file: files[currentFileIdx],
            url: URL.createObjectURL(files[currentFileIdx]),
            targetIndex: i
          });
          currentFileIdx++;
        }
      }
      
      if (currentFileIdx < files.length) {
        toast.error("Maximum 3 images allowed. Extras were discarded.");
      }
      
      setCropQueue(newQueue);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    newPreviews[index] = null;
    setImagePreviews(newPreviews);
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
    
    const validFiles = imageFiles.filter((f): f is File => f !== null);
    
    if (validFiles.length === 0) {
      toast.error("Please select at least one pet image.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload images
      const uploadPromises = validFiles.map(file => uploadImageToCloudinary(file));
      const imageUrls = await Promise.all(uploadPromises);

      // 2. Save to Firestore
      const petsCollection = collection(db, "pets");
      await addDoc(petsCollection, {
        name,
        age,
        gender,
        location,
        contactNumber,
        category,
        description,
        imageUrls,
        imageUrl: imageUrls[0] || "",
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
        {activeCrop && (
          <ImageCropperModal
            imageSrc={activeCrop.url}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Pet Photos (Up to 3)</label>
              <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-3xl bg-slate-50/50 transition">
                <div className="flex flex-wrap gap-4 justify-center">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="relative w-32 h-32 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition flex items-center justify-center overflow-hidden bg-white group">
                      {imagePreviews[index] ? (
                        <>
                          <Image src={imagePreviews[index] as string} alt={`Preview ${index + 1}`} fill className="object-cover" />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-[#007BFF] transition">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs font-semibold">Add Image</span>
                          <input 
                            type="file" 
                            multiple
                            className="sr-only" 
                            accept="image/*" 
                            onChange={(e) => handleImageChange(index, e)} 
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-6 text-center">
                  PNG, JPG, GIF up to 10MB per image.<br/>
                  <span className="font-medium text-slate-600">Tip:</span> 1:1 (Square) aspect ratio works best!
                </p>
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
                  <label className="flex-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Both" 
                      checked={gender === "Both"}
                      onChange={() => setGender("Both")}
                      className="sr-only peer" 
                    />
                    <div className="text-center py-3 border border-slate-200 rounded-2xl peer-checked:bg-blue-50 peer-checked:border-[#007BFF] peer-checked:text-[#007BFF] transition font-medium text-slate-600">
                      Both
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us a bit about the pet's personality, habits, and what kind of home they need..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007BFF]/50 transition min-h-[120px] resize-y"
              ></textarea>
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
