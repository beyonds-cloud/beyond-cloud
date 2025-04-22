import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import {
  FaMagic,
  FaMapMarkerAlt,
  FaUsers,
  FaCompass,
  FaBrain,
  FaDiscord,
} from "react-icons/fa";
import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import GallerySwitcherClient from "@/components/ui/gallery-switcher-client";

const Index = async () => {
  const session = await auth();

  if (session?.user) {
    redirect("/main");
  }

  return (
    <HydrateClient>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1A1F2C] to-[#0D1117] text-white">
        <div className="absolute inset-0 -z-10 h-full w-full">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#29A7D9] to-[#4BDC97] opacity-20 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-8">
          <h1 className="bg-gradient-to-r from-[#29A7D9] to-[#4BDC97] bg-clip-text pt-12 text-center text-6xl font-extrabold tracking-tight text-transparent sm:text-[7rem]">
            Beyonds Cloud
          </h1>

          <p className="mx-auto mb-12 mt-6 max-w-3xl text-center text-2xl text-[#A0AEC0] sm:text-3xl">
            Transform the world around you with AI-powered imagination. Create,
            explore, and share augmented realities on real-world locations.
          </p>

          <div className="flex justify-center">
            <Link
              href="/api/auth/signin"
              className="flex items-center gap-2 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            >
              <FaDiscord className="h-6 w-6" />
              Sign in with Discord
            </Link>
          </div>
        </div>

        <div className="w-full px-32 mb-12" style={{ height: '600px', position: 'relative' }}>
          <GallerySwitcherClient />
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
            <FeatureCard
              icon={<FaMagic className="h-8 w-8 text-[#29A7D9]" />}
              title="Storytelling"
              description="Transform real locations into scenes from your stories. Create immersive narratives tied to actual places."
            />
            <FeatureCard
              icon={<FaMapMarkerAlt className="h-8 w-8 text-[#4BDC97]" />}
              title="Urban Dreams"
              description="Visualize how spaces could evolve. Perfect for urban planners and dreamers alike."
            />
            <FeatureCard
              icon={<FaUsers className="h-8 w-8 text-[#29A7D9]" />}
              title="Event Planning"
              description="Preview venues with your ideal decorations and themes before the big day."
            />
            <FeatureCard
              icon={<FaCompass className="h-8 w-8 text-[#4BDC97]" />}
              title="Adventure Creation"
              description="Design location-based games and treasure hunts in your neighborhood."
            />
            <FeatureCard
              icon={<FaBrain className="h-8 w-8 text-[#29A7D9]" />}
              title="AI Enhancement"
              description="Let AI help you transform spaces with creative suggestions and realistic renders."
            />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="rounded-xl border border-[#2D3748]/30 bg-[#1E2530]/50 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-[#1E2530]/70">
    <div className="mb-4 flex items-center justify-center text-3xl">
      {icon ?? <span className="text-sm text-red-500">Missing icon</span>}
    </div>
    <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
    <p className="text-[#A0AEC0]">{description}</p>
  </div>
);

export default Index;
