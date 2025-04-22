"use client";

import React from "react";
import { useMediaQuery } from "react-responsive";
import CircularGallery from "@/components/ui/gallery";

const GallerySwitcher = () => {
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  return isDesktop ? (
    <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} />
  ) : (
    <div className="flex items-center justify-center h-full text-center text-white">
      <p>Mobile Gallery Placeholder</p>
    </div>
  );
};

export default GallerySwitcher;
