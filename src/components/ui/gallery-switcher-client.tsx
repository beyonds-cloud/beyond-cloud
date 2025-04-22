"use client";

import React, { useEffect, useState } from "react";
import GallerySwitcher from "./gallery-switcher";

const GallerySwitcherClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <GallerySwitcher /> : null;
};

export default GallerySwitcherClient;
