"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Loader2, X, LogOut, AlertCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import StreetViewDescriber from "./StreetViewDescriber";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google: typeof google;
  }
}

// Define the User type
type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isPro?: boolean;
};

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg">
      <AlertCircle className="h-5 w-5" />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 rounded-full p-1 hover:bg-red-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function Main({
  user,
  mapsKey,
}: {
  user?: User;
  mapsKey: string;
}) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streetViewActive, setStreetViewActive] = useState(false);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const streetViewElementRef = useRef<HTMLDivElement>(null);
  const positionUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const [showToast, setShowToast] = useState(false);
  const [showDescriber, setShowDescriber] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number | null;
    longitude: number | null;
    heading: number;
    pitch: number;
  }>({
    latitude: null,
    longitude: null,
    heading: 0,
    pitch: 0,
  });

  const handleGoogleMapsLoad = () => {
    setIsMapReady(true);
  };

  const exitStreetView = useCallback(() => {
    if (!panoramaRef.current || !mapRef.current) return;
    const currentPosition = panoramaRef.current.getPosition();
    panoramaRef.current.setVisible(false);
    setStreetViewActive(false);
    if (currentPosition) {
      mapRef.current.setCenter(currentPosition);
    }
  }, []);

  // Log the current Street View parameters.
  const captureStreetView = () => {
    if (panoramaRef.current?.getVisible()) {
      const position = panoramaRef.current.getPosition();
      const pov = panoramaRef.current.getPov();
      const zoom = panoramaRef.current.getZoom();
      const fov = 180 / Math.pow(2, zoom ?? 1);

      // Update the current position state
      if (position) {
        setCurrentPosition({
          latitude: position.lat(),
          longitude: position.lng(),
          heading: pov?.heading ?? 0,
          pitch: pov?.pitch ?? 0,
        });

        // Show the describer component
        setShowDescriber(true);
      }

      console.log("Street View Data:", {
        latitude: position?.lat(),
        longitude: position?.lng(),
        heading: pov?.heading,
        pitch: pov?.pitch,
        fov,
      });
    }
  };

  useEffect(() => {
    if (
      !isMapReady ||
      !window.google ||
      !mapElementRef.current ||
      !streetViewElementRef.current
    ) {
      return;
    }

    try {
      // Set your default center.
      const defaultCenter = { lat: 48.85790621222511, lng: 2.2949450397944915 };

      // Disable the default Street View control (pegman) so it won't auto-trigger.
      const mapOptions: google.maps.MapOptions = {
        center: defaultCenter,
        zoom: 13,
        streetViewControl: false,
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#ffffff" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#000000" }, { lightness: 13 }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#0e1626" }],
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#1e303d" }],
          },
        ],
      };

      const map = new window.google.maps.Map(mapElementRef.current, mapOptions);
      mapRef.current = map;

      const panorama = new window.google.maps.StreetViewPanorama(
        streetViewElementRef.current,
        {
          position: defaultCenter,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          visible: false,
          enableCloseButton: false,
          motionTracking: false,
          motionTrackingControl: false,
          addressControl: false,
          fullscreenControl: false,
          linksControl: true,
          clickToGo: false,
          panControl: true,
          zoomControl: true,
          showRoadLabels: false,
          disableDefaultUI: false,
        },
      );
      panoramaRef.current = panorama;
      map.setStreetView(panorama);

      // Initialize the Street View service.
      const streetViewService = new google.maps.StreetViewService();

      // When the user clicks on the map, attempt to load Street View at that location.
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const zoom = map.getZoom() ?? 0;
          if (zoom < 10) {
            setError("Please zoom in closer to view Street View");
            void setShowToast(true);
            return;
          }
          void streetViewService.getPanorama(
            {
              location: e.latLng,
              radius: 50,
              preference: google.maps.StreetViewPreference.NEAREST,
            },
            (data, status) => {
              if (
                status === google.maps.StreetViewStatus.OK &&
                data?.location?.latLng
              ) {
                panorama.setPosition(data.location.latLng);
                panorama.setVisible(true);
                void setStreetViewActive(true);
              } else {
                setError("No Street View available at this location.");
                void setShowToast(true);
              }
            },
          );
        }
      });

      const positionListener = panorama.addListener("position_changed", () => {
        if (positionUpdateTimeoutRef.current) {
          clearTimeout(positionUpdateTimeoutRef.current);
        }
        const position = panorama.getPosition();
        if (position && map) {
          positionUpdateTimeoutRef.current = setTimeout(() => {
            map.setCenter(position);
          }, 50);
        }
      });

      return () => {
        if (positionUpdateTimeoutRef.current) {
          clearTimeout(positionUpdateTimeoutRef.current);
        }
        google.maps.event.clearListeners(map, "click");
        google.maps.event.removeListener(positionListener);
      };
    } catch (err) {
      console.error("Error initializing map:", err);
      setError(
        "Failed to initialize Google Maps. Please refresh the page or try again later.",
      );
    }
  }, [isMapReady]);

  if (!mapsKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="max-w-md p-6 text-center">
          <div className="mb-4 text-red-500">
            <X className="mx-auto h-12 w-12" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">
            Error Loading Map
          </h2>
          <p className="text-gray-300">
            Google Maps API key is missing. Please check your environment
            configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`}
        onLoad={handleGoogleMapsLoad}
      />
      {showToast && error && (
        <Toast message={error} onClose={() => setShowToast(false)} />
      )}

      {showDescriber && (
        <StreetViewDescriber
          latitude={currentPosition.latitude}
          longitude={currentPosition.longitude}
          heading={currentPosition.heading}
          pitch={currentPosition.pitch}
          onClose={() => setShowDescriber(false)}
        />
      )}

      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900">
        {!isMapReady ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <span className="ml-2 text-xl text-white">Loading Map...</span>
          </div>
        ) : (
          <>
            {user?.isPro && (
              <div className="group fixed bottom-4 left-4 z-50 rounded-lg bg-white/50 px-3 py-1 text-sm font-bold backdrop-blur-sm transition-all duration-300 hover:rotate-[-5deg] hover:scale-110 hover:bg-white/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.7)]">
                <span className="inline-block animate-[wiggle_2s_ease-in-out_infinite] group-hover:animate-[bounce_0.5s_ease-in-out_infinite]">
                  P
                </span>
                <span className="inline-block animate-[wiggle_2s_ease-in-out_infinite] [animation-delay:0.1s] group-hover:animate-[bounce_0.5s_ease-in-out_infinite]">
                  R
                </span>
                <span className="inline-block animate-[wiggle_2s_ease-in-out_infinite] [animation-delay:0.2s] group-hover:animate-[bounce_0.5s_ease-in-out_infinite]">
                  O
                </span>
                <style jsx>{`
                  @keyframes wiggle {
                    0%,
                    100% {
                      transform: rotate(0deg);
                    }
                    25% {
                      transform: rotate(3deg);
                    }
                    75% {
                      transform: rotate(-3deg);
                    }
                  }
                  @keyframes bounce {
                    0%,
                    100% {
                      transform: translateY(0);
                    }
                    50% {
                      transform: translateY(-4px);
                    }
                  }
                `}</style>
              </div>
            )}
            <div className="w-full max-w-4xl p-4">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">
                  Street View Explorer
                </h1>
                <Link
                  href="/api/auth/signout"
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white transition-colors duration-200 hover:bg-white/20"
                >
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? "User"}
                      width={20}
                      height={20}
                      className="h-5 w-5 rounded-full"
                    />
                  ) : (
                    <FcGoogle className="h-5 w-5" />
                  )}
                  <LogOut className="h-5 w-5" />
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
                <Button
                  onClick={exitStreetView}
                  className={`rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-red-600 ${
                    streetViewActive
                      ? "opacity-100"
                      : "pointer-events-none opacity-0"
                  }`}
                >
                  Exit Street View
                </Button>

                <Button
                  onClick={captureStreetView}
                  className={`rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-blue-600 ${
                    streetViewActive
                      ? "opacity-100"
                      : "pointer-events-none opacity-0"
                  }`}
                >
                  Choose This View
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
