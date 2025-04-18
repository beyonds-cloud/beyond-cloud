import React from "react";
import {
  FaMagic,
  FaMapMarkerAlt,
  FaUsers,
  FaCompass,
  FaBrain,
} from "react-icons/fa";
import CircularGallery from "@/components/ui/gallery";

const Index = () => {
  return (
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
          <a
            href="/api/auth/signin"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#29A7D9] to-[#4BDC97] px-8 py-3 font-semibold transition-all hover:scale-105 hover:opacity-90"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Sign in
          </a>
        </div>
      </div>

      <div className="w-full px-32 mb-12" style={{ height: '600px', position: 'relative' }}>
        <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} />
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
