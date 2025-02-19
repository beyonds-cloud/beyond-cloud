"use client";

import { useEffect, useRef, useState } from "react";
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
  const apiLoadedRef = useRef(false);

  useEffect(() => {
    if (!apiKey) {
      setError(
        "Google Maps API key is missing. Please set NEXT_PUBLIC_MAPS_KEY environment variable.",
      );
      return;
    }

    if (!apiLoadedRef.current) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => {
        apiLoadedRef.current = true;
        setIsMapReady(true);
      };
      script.onerror = (e) => {
        console.error("Failed to load Google Maps API", e);
        setError(
          "Failed to load Google Maps API. Please check your API key and ensure Maps JavaScript API is enabled in your Google Cloud Console.",
        );
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    } else {
      setIsMapReady(true);
    }
  }, [apiKey]);

  useEffect(() => {
    if (isMapReady && !panoramaRef.current && window.google) {
      try {
        const mapOptions = {
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

        const mapElement = document.getElementById("map");
        const streetViewElement = document.getElementById("street-view");
        if (!mapElement || !streetViewElement) {
          throw new Error("Map or Street View container elements not found");
        }

        mapRef.current = new window.google.maps.Map(mapElement, mapOptions);

        panoramaRef.current = new window.google.maps.StreetViewPanorama(
          streetViewElement,
          {
            pov: { heading: 0, pitch: 0 },
            zoom: 1,
            visible: false,
          }
        );

        mapRef.current.setStreetView(panoramaRef.current);

        panoramaRef.current.addListener("visible_changed", () => {
          const isVisible = panoramaRef.current?.getVisible();
          setStreetViewActive(!!isVisible);
          if (isVisible) {
            const newPosition = mapRef.current?.getStreetView().getLocation()?.latLng;
            if (newPosition) {
              panoramaRef.current?.setPosition(newPosition);
              mapRef.current?.setCenter(newPosition);
              setTimeout(() => {
                if (panoramaRef.current) {
                  window.google.maps.event.trigger(panoramaRef.current, "resize");
                }
                panoramaRef.current?.setVisible(true);
              }, 1000);
            }
          }
        });

        panoramaRef.current.addListener("position_changed", () => {
          const newPosition = panoramaRef.current?.getPosition();
          if (newPosition) {
            mapRef.current?.setCenter(newPosition);
          }
        });

        panoramaRef.current.addListener("status_changed", () => {
          const status = panoramaRef.current?.getStatus();
          if (status !== window.google.maps.StreetViewStatus.OK) {
            console.error("Street View failed to load. Location might not have coverage.");
            setError("Street View is not available at this location.");
          } else {
            setError(null);
          }
        });
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to initialize Google Maps. Please refresh the page or try again later.");
      }
    }
  }, [isMapReady]);

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

  const exitStreetView = () => {
    if (panoramaRef.current) {
      panoramaRef.current.setVisible(false);
      setStreetViewActive(false);
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
              id="map"
              className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
                streetViewActive ? "opacity-0" : "opacity-100"
              }`}
            ></div>
            <div
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