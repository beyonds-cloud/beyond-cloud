"use client";

import React from "react";
import { useMediaQuery } from "react-responsive";
import CircularGallery from "@/components/ui/gallery";

const GallerySwitcher = ({ isMobile }: { isMobile: boolean }) => {
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  return !isMobile && isDesktop ? (
    <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} />
  ) : (
    <div className="flex items-center justify-center h-full text-center text-white">
      <p>No gallery available on mobile devices.</p>
    </div>
  );
};

export default GallerySwitcher;
