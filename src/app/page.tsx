'use client';

declare global {
  interface Window {
    initMap: () => void;
  }
}

import React, { useEffect, useState } from 'react';
import { APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_KEY || "";

  const [isClient, setIsClient] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (!apiKey) {
      console.error('Google Maps API key is missing');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.onload = () => {
      console.log('Google Maps API has loaded.');
      setIsMapReady(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };
    document.head.appendChild(script);

    window.initMap = () => {
      console.log('Maps API has initialized.');
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  if (!isClient || !isMapReady) {
    return <div>Loading Map...</div>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900">
      <APIProvider apiKey={apiKey} onLoad={() => console.log('Maps API has loaded.')}>
        <div className="w-[800px] h-[600px] rounded-xl shadow-lg overflow-hidden">
          <Map
            defaultZoom={13}
            defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
            streetViewControl={true}
            streetViewControlOptions={{
              position: window.google.maps.ControlPosition.TOP_LEFT,
            }}
            onCameraChanged={(ev: MapCameraChangedEvent) =>
              console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
            }
          />
        </div>
      </APIProvider>
    </main>
  );
}
