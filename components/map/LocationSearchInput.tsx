import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/use-debounced';
import { MapPinPlus } from 'lucide-react';

interface LocationSearchInputProps {
  onSelect?: (result: { placeName: string | null, coordinate: { type: string, coordinates: [number, number] } | null, rawPlaceDetails?: any }) => void;
  placeholder?: string;
  className?: string;
  toolbar?: boolean;
  onMarkerIconClick?: () => void;
  markerIconActive?: boolean;
}

export default function LocationSearchInput({ onSelect, placeholder = 'Search location', className = '', toolbar = false, onMarkerIconClick, markerIconActive = false }: LocationSearchInputProps) {
  const [locationSearch, setLocationSearch] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState<any[]>([]);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  // const [shouldSearchLocation, setShouldSearchLocation] = useState(true);
  const debouncedLocationSearch = useDebounce(locationSearch, 600);

  const shouldSearchLocation = useRef(true);

  useEffect(() => {

    if (!debouncedLocationSearch ) {
      setAutocompleteResults([]);
      return;
    }
    if (!shouldSearchLocation.current) return;
    
    setAutocompleteLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/google/maps/autocomplete?input=${encodeURIComponent(debouncedLocationSearch)}`);
        const data = await res.json();
        // Handle both array and object with suggestions
        if (Array.isArray(data)) {
          setAutocompleteResults(data);
        } else if (Array.isArray(data?.suggestions)) {
          setAutocompleteResults(data.suggestions);
        } else if (Array.isArray(data?.predictions)) {
          setAutocompleteResults(data.predictions);
        } else {
          setAutocompleteResults([]);
        }
      } catch (e) {
        setAutocompleteResults([]);
      } finally {
        setAutocompleteLoading(false);
      }
    })();
  }, [debouncedLocationSearch]);

  // Handle place selection
  const handlePlaceSelect = async (s: any) => {
    shouldSearchLocation.current = false;
    
    const placeName = s.placePrediction?.text?.text || s.text?.text || s.description || null;
    const placeId = s.placePrediction?.placeId || s.place_id || s.placeId;

    setLocationSearch(placeName || '');
    setShowDropdown(false);
    let coordinate = null;
    let rawPlaceDetails = null;
    if (placeId) {
      try {
        const res = await fetch(`/api/google/maps/place-details?placeId=${encodeURIComponent(placeId)}`);
        const data = await res.json();
        rawPlaceDetails = data;
        if (
          data &&
          typeof data.location?.latitude === 'number' &&
          typeof data.location?.longitude === 'number'
        ) {
          coordinate = {
            type: 'Point',
            coordinates: [
              Number(data.location.longitude),
              Number(data.location.latitude)
            ] as [number, number],
          };
        }
      } catch (e) {
        coordinate = null;
      }
    }
    if (onSelect) onSelect({ placeName, coordinate, rawPlaceDetails });
  };

  return (
    <div className={`w-full max-w-xl mx-auto p-4 relative ${className}`}>
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search location"
            value={locationSearch}
            onChange={e => {
              setLocationSearch(e.target.value);
              setShowDropdown(true);
              shouldSearchLocation.current = true;
            }}
            className="w-full border border-gray-200 rounded-full px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {/* Search icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </span>
        </div>
        {toolbar && <div className="flex items-center gap-2">
          {/* Toolbar icons */}
          <button
            className={`p-2 rounded-full transition ${markerIconActive ? 'bg-blue-100 hover:bg-blue-200' : 'hover:bg-gray-100'}`}
            aria-label="Location"
            onClick={onMarkerIconClick}
          >
            <MapPinPlus className={`w-6 h-6 ${markerIconActive ? 'text-blue-600' : 'text-gray-700'}`} />
          </button>
        </div>}
      </div>
      {showDropdown && locationSearch && (
        <ul className="absolute left-0 right-0 z-50 divide-y divide-gray-100 bg-white rounded-xl shadow-lg mt-2">
          {autocompleteLoading && (
            <li className="px-4 py-3 text-gray-400">Loading...</li>
          )}
          {!autocompleteLoading && autocompleteResults.length === 0 && (
            <li className="px-4 py-3 text-gray-400">No results</li>
          )}
          {autocompleteResults.map((s: any, idx: number) => (
            <li key={s.placePrediction?.placeId || s.place_id || s.placeId || idx}>
              <button
                className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition font-medium text-gray-700"
                onClick={() => handlePlaceSelect(s)}
              >
                {s.placePrediction?.text?.text || s.text?.text || s.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 