'use client'
import Mapbox from '@/components/map/Mapbox'
import './styles.css'
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LocationSearchInput from '@/components/map/LocationSearchInput';

export default function FootprintsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const res = await fetch(`/api/posts/user/${user.id}/with-coordinates`);
        const data = await res.json();
        setPosts(data?.data || []);
      } catch (err) {
        console.error('Failed to fetch posts with coordinates:', err);
      }
    })();
  }, [user?.id]);

  return (
    <div className="w-full h-screen flex flex-col">
      {/* <LocationSearchInput onSelect={result => console.log('Selected place:', result)} /> */}
      <div className="flex-1">
        <Mapbox 
          interactive={true}
          posts={posts}
          searchBar={true}
          toolbar={true}
        />
      </div>
    </div>
  )
}
