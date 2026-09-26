import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Info, PawPrint, Heart, Mail, User, Share2, ChevronLeft, Phone } from "lucide-react";
import { getPetById, getUserById } from "../../../../services/petService";
import Header from "../../../../components/Header";
import PetImageGallery from "../../../../components/PetImageGallery";

export default async function PetDetailsPage({ params }: { params: { id: string } }) {
  // Await the entire params object before destructuring its properties in Next.js 15+
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const pet = await getPetById(id);

  if (!pet) {
    notFound();
  }

  const owner = await getUserById(pet.ownerId);

  const images = pet.imageUrls && pet.imageUrls.length > 0 ? pet.imageUrls : (pet.imageUrl ? [pet.imageUrl] : []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-20">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 lg:mt-12">
        
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-[#007BFF] font-medium transition mb-6">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to all pets
        </Link>

        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left: Image Gallery */}
            <div className="w-full h-full">
              <PetImageGallery images={images} name={pet.name} />
            </div>

            {/* Right: Details */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{pet.name}</h1>
                  <div className="flex items-center text-slate-500 font-medium">
                    <MapPin className="w-5 h-5 mr-1.5 text-blue-500" />
                    {pet.location || "Location not specified"}
                  </div>
                </div>
                <button className="p-3 bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col items-center text-center">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Category</span>
                  <span className="font-bold text-slate-800">{pet.category}</span>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col items-center text-center">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Breed</span>
                  <span className="font-bold text-slate-800">{pet.breed}</span>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col items-center text-center">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Gender</span>
                  <span className="font-bold text-slate-800">{pet.gender}</span>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col items-center text-center">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Age</span>
                  <span className="font-bold text-slate-800">{pet.age}</span>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  About {pet.name}
                </h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {pet.description || (
                    <>
                      Meet {pet.name}, a wonderful {pet.age.toLowerCase()} {pet.breed ? pet.breed.toLowerCase() : pet.category.toLowerCase()} waiting for a forever home. 
                      {pet.gender === 'Male' ? ' He is' : pet.gender === 'Female' ? ' She is' : ' They are'} located in {pet.location} and would make a perfect addition to a loving family. 
                      Please reach out to the owner below if you are interested in adopting {pet.name}!
                    </>
                  )}
                </p>
              </div>

              <div className="mt-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Owner</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm border border-slate-100">
                      {owner?.displayName ? owner.displayName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{owner?.displayName || "Anonymous User"}</div>
                      <div className="text-sm text-slate-500">Pet Owner</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {pet.contactNumber && (
                      <a href={`tel:${pet.contactNumber}`} className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-sm shadow-emerald-200 transition">
                        <Phone className="w-5 h-5" />
                      </a>
                    )}
                    {owner?.email ? (
                      <a href={`mailto:${owner.email}`} className="bg-[#007BFF] hover:bg-blue-700 text-white p-3 rounded-full shadow-sm shadow-blue-200 transition">
                        <Mail className="w-5 h-5" />
                      </a>
                    ) : (
                      <button disabled className="bg-slate-200 text-slate-400 p-3 rounded-full cursor-not-allowed">
                        <Mail className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
