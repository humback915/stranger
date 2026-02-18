"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

const DARK_MAP_ID = "stranger-dark";

interface MissionMapProps {
  lat: number;
  lng: number;
  placeName: string;
}

function GoogleMapsLink({ lat, lng, placeName }: MissionMapProps) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(placeName)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg bg-stranger-mid px-4 py-3 text-sm text-stranger-accent transition-colors hover:bg-stranger-mid/80"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
      Google Maps에서 길찾기
    </a>
  );
}

export default function MissionMap({ lat, lng, placeName }: MissionMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <GoogleMapsLink lat={lat} lng={lng} placeName={placeName} />;
  }

  return (
    <div className="space-y-2">
      <APIProvider apiKey={apiKey}>
        <div className="h-48 overflow-hidden rounded-lg">
          <Map
            defaultCenter={{ lat, lng }}
            defaultZoom={15}
            mapId={DARK_MAP_ID}
            disableDefaultUI
            gestureHandling="cooperative"
            className="h-full w-full"
          >
            <AdvancedMarker position={{ lat, lng }} title={placeName} />
          </Map>
        </div>
      </APIProvider>
      <GoogleMapsLink lat={lat} lng={lng} placeName={placeName} />
    </div>
  );
}
