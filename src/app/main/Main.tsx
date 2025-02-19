"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { MapPin, Loader2, X, LogOut } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function Main() {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_KEY ?? "";
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streetViewActive, setStreetViewActive] = useState(false);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const streetViewElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apiKey) {
      setError("Google Maps API key is missing. Please set NEXT_PUBLIC_MAPS_KEY environment variable.");
      return;
    }
    setIsMapReady(true);
  }, [apiKey]);

  useEffect(() => {
    if (!isMapReady || !window.google || !mapElementRef.current || !streetViewElementRef.current) return;

    try {
      // Initialize map
      const mapOptions: google.maps.MapOptions = {
        center: { lat: 48.85790621222511, lng: 2.2949450397944915 },
        zoom: 13,
        streetViewControl: true,
        styles: [
          { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
          { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#000000" }, { lightness: 13 }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
          { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#1e303d" }] },
        ],
      };

      // Create map instance
      const map = new window.google.maps.Map(mapElementRef.current, mapOptions);
      mapRef.current = map;

      // Create street view panorama
      const panorama = new window.google.maps.StreetViewPanorama(streetViewElementRef.current, {
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        visible: false,
        enableCloseButton: false,
        motionTracking: false,
        motionTrackingControl: false,
        addressControl: false,
        fullscreenControl: false,
        linksControl: true,
        clickToGo: true,
      });
      panoramaRef.current = panorama;

      // Connect map and street view
      map.setStreetView(panorama);

      // Set up event listeners
      const visibilityListener = panorama.addListener("visible_changed", () => {
        const isVisible = panorama.getVisible();
        setStreetViewActive(isVisible);
        
        if (isVisible) {
          const location = map.getStreetView().getLocation();
          const position = location?.latLng;
          
          if (position) {
            panorama.setPosition(position);
            map.setCenter(position);
            map.setOptions({ streetViewControl: false });
          }
        }
      });

      const positionListener = panorama.addListener("position_changed", () => {
        const position = panorama.getPosition();
        if (position) {
          map.setCenter(position);
        }
      });

      const statusListener = panorama.addListener("status_changed", () => {
        if (panorama.getStatus() !== google.maps.StreetViewStatus.OK) {
          setError("Street View is not available at this location.");
        } else {
          setError(null);
        }
      });

      // Cleanup function
      return () => {
        google.maps.event.removeListener(visibilityListener);
        google.maps.event.removeListener(positionListener);
        google.maps.event.removeListener(statusListener);
        if (mapRef.current) {
          mapRef.current.setStreetView(null);
        }
      };
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize Google Maps. Please refresh the page or try again later.");
    }
  }, [isMapReady]);

  const exitStreetView = useCallback(() => {
    if (!panoramaRef.current || !mapRef.current) return;

    // Disable street view control first
    mapRef.current.setOptions({ streetViewControl: false });
    
    // Hide street view
    panoramaRef.current.setVisible(false);
    
    // Disconnect street view from map
    mapRef.current.setStreetView(null);
    
    // Update state
    setStreetViewActive(false);
    
    // Re-enable street view control after a delay
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.setOptions({ streetViewControl: true });
        // Reconnect street view
        mapRef.current.setStreetView(panoramaRef.current);
      }
    }, 100);
  }, []);

  const captureStreetView = () => {
    if (panoramaRef.current?.getVisible()) {
      const position = panoramaRef.current?.getPosition();
      const pov = panoramaRef.current?.getPov();
      const zoom = panoramaRef.current?.getZoom();
      const fov = 180 / Math.pow(2, zoom ?? 1);

      console.log("Street View Data:", {
        latitude: position?.lat(),
        longitude: position?.lng(),
        heading: pov.heading,
        pitch: pov.pitch,
        fov,
      });
    } else {
      console.log("Street View is not active.");
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="max-w-md p-6 text-center">
          <div className="mb-4 text-red-500">
            <X className="mx-auto h-12 w-12" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">
            Error Loading Map
          </h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!isMapReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <span className="ml-2 text-xl text-white">Loading Map...</span>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900">
      <APIProvider apiKey={apiKey}>
        <div className="w-full max-w-4xl p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">
              Street View Explorer
            </h1>
            <Link
              href="/api/auth/signout"
              className="flex items-center rounded-lg bg-red-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-600"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sign Out
            </Link>
          </div>
          
          <div className="relative h-[70vh] w-full overflow-hidden rounded-xl border-4 border-blue-500 shadow-lg">
            <div
              ref={mapElementRef}
              id="map"
              className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
                streetViewActive ? "opacity-0" : "opacity-100"
              }`}
            ></div>
            <div
              ref={streetViewElementRef}
              id="street-view"
              className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
                streetViewActive
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            ></div>
          </div>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={captureStreetView}
              className="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!streetViewActive}
            >
              <MapPin className="mr-2 h-5 w-5" />
              Capture Pegman Location
            </button>
            {streetViewActive && (
              <button
                onClick={exitStreetView}
                className="flex items-center rounded-lg bg-red-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-600"
                aria-label="Exit Street View"
              >
                <X className="mr-2 h-5 w-5" />
                Exit Street View
              </button>
            )}
          </div>
        </div>
      </APIProvider>
    </main>
  );
} 