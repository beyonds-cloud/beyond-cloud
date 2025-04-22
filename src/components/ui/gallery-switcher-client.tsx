"use client";

import React, { useEffect, useState } from "react";
import GallerySwitcher from "./gallery-switcher";

const GallerySwitcherClient = () => {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isClient ? <GallerySwitcher isMobile={isMobile} /> : null;
};

export default GallerySwitcherClient;
