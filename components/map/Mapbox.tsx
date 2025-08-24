"use client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useRef, useEffect, useState } from "react";
import UserMapMarker from "./UserMapMarker";
import { createRoot, Root } from "react-dom/client";
import LocationSearchInput from "./LocationSearchInput";
import "./styles.css";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BookType } from "lucide-react";
import { toDMS } from "./utils";
import PostMarkerCard from "./PostMarkerCard";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface MapboxProps {
  interactive?: boolean;
  rotateCamera?: boolean;
  posts?: Array<{ 
    id?: string;
    title?: string;
    coverMediaUrl?: string | null;
    coordinate?: { coordinates: [number, number] }; 
    markerMediaUrl?: string 
  }>;
  onLocationSelect?: (result: any) => void;
  searchBar?: boolean;
  toolbar?: boolean;
}

export default function Mapbox({
  interactive = false,
  rotateCamera = false,
  posts = [],
  onLocationSelect,
  searchBar = false,
}: MapboxProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng] = useState(-70.9);
  const [lat] = useState(42.35);
  const [addingMarker, setAddingMarker] = useState(false);
  const { user } = useAuth();
  const [creatingPost, setCreatingPost] = useState(false);
  // New state for card overlay
  const [showPlacemarkCard, setShowPlacemarkCard] = useState(false);
  const [placemarkCardPosition, setPlacemarkCardPosition] = useState<{lng: number, lat: number} | null>(null);
  const [placemarkCardLocationName, setPlacemarkCardLocationName] = useState<string | null>(null);
  // New state for PostMarkerCard
  const [showPostMarkerCard, setShowPostMarkerCard] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  /* ---------- Map init ---------- */
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      projection: { name: "globe" },
      center: [lng, lat],
      zoom: 1.5,
      interactive,
      attributionControl: false,
    });

    map.current.on("load", () => {
      map.current!.setFog({
        color: "rgb(186, 210, 235)",
        "high-color": "rgb(36, 92, 223)",
        "horizon-blend": 0.02,
        "space-color": "rgb(11, 11, 25)",
        "star-intensity": 0.6,
      });

      if (!interactive && rotateCamera) {
        let id: number;
        const spin = () => {
          if (!map.current) return;
          const c = map.current.getCenter();
          map.current.setCenter([c.lng - 0.2, c.lat]);
          id = requestAnimationFrame(spin);
        };
        id = requestAnimationFrame(spin);
        return () => cancelAnimationFrame(id);
      }
    });
  }, [interactive, rotateCamera, lat, lng]);

  /* ---------- Load post markers ---------- */
  useEffect(() => {
    if (!map.current) return;
    (map.current as any)._postMarkers = (map.current as any)._postMarkers || [];
    (map.current as any)._postMarkers.forEach((m: mapboxgl.Marker) => m.remove());
    (map.current as any)._postMarkers = [];

    posts.forEach((p) => {
      if (p.coordinate && Array.isArray(p.coordinate.coordinates)) {
        const [lng, lat] = p.coordinate.coordinates;
        // const el = document.createElement("div");
        // createRoot(el).render(
        //   <UserMapMarker src={p.markerMediaUrl || "/nenki-icon.png"} />,
        // );
        const marker = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map.current!);
        
        // Add click handler to show PostMarkerCard
        marker.getElement().addEventListener('click', () => {
          setSelectedPost(p);
          setShowPostMarkerCard(true);
        });
        
        // Add cursor pointer style to indicate clickable
        marker.getElement().style.cursor = 'pointer';
        
        (map.current as any)._postMarkers.push(marker);
      }
    });
  }, [posts]);

  /* ---------- Marker-adding mode ---------- */
  useEffect(() => {
    if (!map.current || !addingMarker) return;
    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      // Add marker at clicked location
      const marker = new mapboxgl.Marker({color: 'green'}).setLngLat([lng, lat]).addTo(map.current!);
      setPlacemarkCardPosition({ lng, lat });
      setPlacemarkCardLocationName(null); // No location name for manual marker
      // show a popup with coordinates in DMS and a button
      const dmsLat = toDMS(lat, true);
      const dmsLng = toDMS(lng, false);
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setLngLat([lng, lat])
        .setHTML(`
            <div style="font-size:14px;min-width:160px;">
              <div style="text-align:center;"><span style='font-family:monospace;'>${dmsLat} ${dmsLng}</span></div>
              <button id="go-to-new-post" style="margin-top:8px;padding:6px 12px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;width:100%;font-weight:600;">Create post here</button>
            </div>
          `);
      // Attach popup to marker
      marker.setPopup(popup);
      // Show popup immediately
      popup.addTo(map.current!);
      // Add click event to marker to show popup again if closed
      marker.getElement().addEventListener('click', () => {
        popup.addTo(map.current!);
      });
      // Add event listener for the button
      setTimeout(() => {
        const btn = document.getElementById("go-to-new-post");
        if (btn) {
          btn.onclick = () => {
            window.location.href = `/new-post?lat=${lat}&lng=${lng}`;
          };
        }
      }, 0);
      setAddingMarker(false);
    };
    map.current.on("click", handleClick);
    return () => {
      map.current?.off("click", handleClick);
    };
  }, [addingMarker]);

  /* ---------- Location search ---------- */
  const handleLocationSelect = (result: any) => {
    if (onLocationSelect) onLocationSelect(result);
    if (result?.coordinate && map.current) {
      const [lng, lat] = result.coordinate.coordinates;
      map.current.flyTo({ center: [lng, lat], zoom: 2, duration: 800 });
      if ((map.current as any)._searchMarker) (map.current as any)._searchMarker.remove();
      const marker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([lng, lat])
        .addTo(map.current!);

              // show a popup with coordinates in DMS and a button
      const dmsLat = toDMS(lat, true);
      const dmsLng = toDMS(lng, false);
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setLngLat([lng, lat])
        .setHTML(`
            <div style="font-size:14px;min-width:160px;">
              <div style="text-align:center;font-weight:600;margin-bottom:4px;color:#1d4ed8;">${result.placeName}</div>
              <div style="text-align:center;"><span style='font-family:monospace;'>${dmsLat} ${dmsLng}</span></div>
              <a href="/new-post?lat=${lat}&lng=${lng}${result.placeName ? `&location=${encodeURIComponent(result.placeName)}` : ''}" 
                 style="display:block;margin-top:8px;padding:6px 12px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;width:100%;font-weight:600;text-align:center;text-decoration:none;">
                Create post here
              </a>
            </div>
          `);
      // Attach popup to marker
      marker.setPopup(popup);
      popup.addTo(map.current!);
    }
  };

  useEffect(() => {
    if (addingMarker) {
      setShowPlacemarkCard(false);
    }
  }, [addingMarker]);

  return (
    <div className="w-full h-full flex flex-col relative">
      {searchBar && (
        <LocationSearchInput
          onSelect={handleLocationSelect}
          toolbar
          onMarkerIconClick={() => setAddingMarker(true)}
          markerIconActive={addingMarker}
        />
      )}
      <div ref={mapContainer} className="map-container w-full flex-1" />
      {/* PlacemarkCard overlay */}
      {showPlacemarkCard && placemarkCardPosition && (
        <PlacemarkCard
          creatingPost={creatingPost}
          onClose={() => setShowPlacemarkCard(false)}
          position={placemarkCardPosition}
          locationName={placemarkCardLocationName}
        />
      )}
      {/* PostMarkerCard overlay */}
      {showPostMarkerCard && selectedPost && (
        <PostMarkerCard
          post={selectedPost}
          onClose={() => setShowPostMarkerCard(false)}
        />
      )}
      <style jsx global>{`
        .mapboxgl-ctrl-logo {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

// PlacemarkCard overlay (formerly PlacemarkPopup)
function PlacemarkCard({ onClose, creatingPost, position, locationName }: { onClose: () => void; creatingPost: boolean; position: { lng: number, lat: number }, locationName?: string | null }) {
  const [title, setTitle] = React.useState<string>("");
  const [tab, setTab] = React.useState<"content" | "media">("content");
  const [customMarkerImage, setCustomMarkerImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCustomMarkerImage(ev.target?.result as string);
    reader.readAsDataURL(f);
  };
  // Responsive card position: top-right on desktop, bottom on mobile
  return (
    <div
      className="fixed z-50 bg-white shadow-xl rounded-xl p-4 w-screen md:w-96 md:max-w-md transition-all"
      style={{
        right: '1rem',
        top: '78px',
        left: 'auto',
        bottom: 'auto',
        // On mobile, stick to bottom above navbar (navbar is 100px)
        ...(window.innerWidth < 768 ? { top: 'auto', bottom: '52px', left: 0, right: 0, borderRadius: '1rem 1rem 0 0', width: '100vw' } : {}),
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <input
            className="font-semibold text-lg bg-transparent border-none outline-none flex-1"
            placeholder="Add title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          ff
        </button>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 mb-3">
        <button
          className={`text-sm font-medium pb-2 border-b-2 ${tab === "content" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}
          onClick={() => setTab("content")}
        >
          + Content
        </button>
      </div>
      {/* Content / Media panes */}
      {tab === "content" ? (
        <textarea
          className="w-full border border-gray-200 rounded-lg p-2 mb-3 min-h-[60px] text-sm"
          placeholder="Add content..."
        />
      ) : (
        <div className="mb-3 text-sm text-gray-400">Media upload coming soon…</div>
      )}
      {/* Custom marker upload */}
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">Custom marker</div>
          <button
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50 flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {customMarkerImage ? "Change image" : "Upload image"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
      {/* Location name display */}
      {locationName && (
        <div className="text-center text-sm font-semibold mb-1 text-blue-700">{locationName}</div>
      )}
      {/* Coordinate display */}
      {position && (
        <div className="text-center text-sm font-normal mb-1">
          {toDMS(position.lat, true)} {toDMS(position.lng, false)}
        </div>
      )}
      {/* Done */}
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-2 text-sm w-full"
        onClick={onClose}
        disabled={creatingPost || !title.trim()}
      >
        {creatingPost ? "Creating…" : " Create"}
      </button>
    </div>
  );
}