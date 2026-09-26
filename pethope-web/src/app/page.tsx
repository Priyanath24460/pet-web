import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Bell,
  User,
  PawPrint,
  Heart,
  ChevronRight,
  MapPin,
  Home,
  LayoutGrid
} from "lucide-react";

import { getRecentPets } from "../services/petService";
import Header from "../components/Header";

const categories = [
  { name: "All", icon: <LayoutGrid className="w-5 h-5" />, active: true },
  { name: "Dogs", icon: "🐶", active: false },
  { name: "Cats", icon: "🐱", active: false },
  { name: "Birds", icon: "🐦", active: false },
  { name: "Rabbits", icon: "🐰", active: false },
  { name: "Others", icon: <Heart className="w-5 h-5 text-blue-500 fill-blue-500" />, active: false },
];

export default async function HomePage() {
  // Fetch real pets from Firebase
  const pets = await getRecentPets();

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-800">
      {/* Header Component */}
      <Header />

      {/* Hero Section (Matched to Header Width) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-2">
        <section className="relative w-full mb-16 min-h-[400px] lg:min-h-[550px] flex items-center bg-blue-50/20 rounded-[40px] overflow-hidden shadow-sm border border-slate-100">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/banners/bannerhero3.png"
              alt="PetHope Hero Banner"
              fill
              className="object-cover object-center lg:object-right"
              priority
            />
          </div>
          
          <div className="w-full relative z-10 flex flex-col lg:flex-row items-center px-8 lg:px-16">
          <div className="lg:w-1/2 py-12 lg:py-16">
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Adopt <span className="text-blue-600">Love,</span> <br />
              Change a Life
            </h1>
            <p className="text-2xl text-slate-600 mb-8 max-w-md leading-relaxed">
              Give a pet a loving home and get unconditional love.
            </p>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-medium text-lg transition shadow-lg shadow-blue-200/50">
              <PawPrint className="w-5 h-5 fill-white" />
              Start Adopting
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
          {/* Empty right column to let the background image dog be visible */}
          <div className="hidden lg:block lg:w-1/2"></div>
        </div>
        </section>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Categories */}
        <section className="mb-16 flex flex-wrap justify-center gap-4">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition shadow-sm ${
                cat.active
                  ? "bg-blue-600 text-white shadow-blue-200"
                  : "bg-white text-slate-700 border border-slate-100 hover:border-blue-200 hover:shadow-md"
              }`}
            >
              {typeof cat.icon === "string" ? (
                <span className="text-xl">{cat.icon}</span>
              ) : (
                cat.icon
              )}
              {cat.name}
            </button>
          ))}
        </section>

        {/* Pets Listing */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Pets looking for a home
            </h2>
            <Link
              href="/explore"
              className="flex items-center text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              See all <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-xl transition-shadow flex flex-col group"
              >
                <div className="relative h-56 w-full rounded-2xl overflow-hidden mb-4 bg-slate-100">
                  {pet.imageUrl ? (
                    <Image
                      src={pet.imageUrl}
                      alt={pet.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <PawPrint className="w-10 h-10 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    Available
                  </div>
                  <button className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition shadow-sm">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold text-slate-900">{pet.name}</h3>
                  <span className={`text-xl font-bold ${pet.gender === 'Female' ? 'text-pink-500' : pet.gender === 'Both' ? 'text-purple-500' : 'text-blue-500'}`}>
                    {pet.gender === 'Female' ? '♀' : pet.gender === 'Both' ? '♂♀' : '♂'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 font-medium">
                  <span>{pet.category}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>{pet.gender}</span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full">
                    {pet.age}
                  </div>
                  <div className="flex items-center text-slate-500 text-sm font-medium line-clamp-1 flex-1">
                    <MapPin className="w-4 h-4 mr-1 shrink-0 text-slate-400" />
                    <span className="truncate">{pet.location}</span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
                  Meet {pet.name}! A beautiful {pet.breed || pet.category} ready for a forever home.
                </p>

                <Link href={`/pet/${pet.id}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition shadow-sm shadow-blue-200">
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-[#F0F7FF] rounded-[40px] p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden border border-blue-50 shadow-sm">
          <div className="absolute left-[-20px] bottom-[-20px] opacity-10">
             <PawPrint className="w-32 h-32 text-blue-500 fill-blue-500 transform -rotate-12" />
          </div>
          <div className="absolute right-20 top-[-20px] opacity-10">
             <PawPrint className="w-24 h-24 text-blue-500 fill-blue-500 transform rotate-45" />
          </div>

          <div className="flex items-start gap-6 lg:w-1/2 relative z-10">
            <Heart className="w-16 h-16 text-blue-500 shrink-0 mt-1" />
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                Every Pet Deserves <br />
                a <span className="text-blue-600">Second Chance</span>
              </h2>
              <p className="text-slate-600 text-lg">
                Through adoption, you&apos;re not just giving a home — you&apos;re changing a life.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap justify-center lg:justify-end gap-12 lg:w-1/2 relative z-10 w-full">
            <div className="text-center flex flex-col items-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-blue-600">
                <PawPrint className="w-8 h-8 fill-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-1">1,200+</div>
              <div className="text-slate-500 font-medium">Pets Adopted</div>
            </div>
            
            <div className="text-center flex flex-col items-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-blue-600">
                <Heart className="w-8 h-8 fill-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-1">950+</div>
              <div className="text-slate-500 font-medium">Happy Families</div>
            </div>
            
            <div className="text-center flex flex-col items-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-blue-600">
                <Home className="w-8 h-8 fill-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-1">100%</div>
              <div className="text-slate-500 font-medium">Love & Care</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Link href="/" className="flex items-center gap-2">
                <PawPrint className="w-9 h-9 text-[#007BFF] fill-[#007BFF] stroke-[#007BFF]" />
                <span className="text-3xl font-extrabold tracking-tight">
                  <span className="text-[#007BFF]">Pet</span>
                  <span className="text-[#0D1B2A]">Hope</span>
                </span>
              </Link>
              <span className="text-slate-500 text-sm font-medium">
                Better Homes. Happier Tails.
              </span>
            </div>

            <nav className="flex flex-wrap justify-center gap-8 font-semibold text-slate-700">
              <Link href="/" className="hover:text-blue-600 transition">Home</Link>
              <Link href="/explore" className="hover:text-blue-600 transition">Explore</Link>
              <Link href="/about" className="hover:text-blue-600 transition">About</Link>
              <Link href="/gallery" className="hover:text-blue-600 transition">Gallery</Link>
              <Link href="/contact" className="hover:text-blue-600 transition">Contact</Link>
            </nav>

            <div className="flex items-center gap-4 text-slate-400">
              <a href="#" className="hover:text-blue-600 transition p-2 bg-slate-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="hover:text-blue-600 transition p-2 bg-slate-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="hover:text-blue-600 transition p-2 bg-slate-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
              <a href="#" className="hover:text-blue-600 transition p-2 bg-slate-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-100 text-sm text-slate-500 font-medium">
            <p>© 2025 PetHope. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <Link href="/adopt" className="hover:text-blue-600 transition">Adopt</Link>
              <Link href="/foster" className="hover:text-blue-600 transition">Foster</Link>
              <Link href="/volunteer" className="hover:text-blue-600 transition">Volunteer</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
