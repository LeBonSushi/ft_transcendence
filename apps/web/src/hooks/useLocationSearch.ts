'use client';

import { useState, useEffect, useRef } from 'react';

export interface LocationResult {
  displayName: string;
  shortName: string;
  country: string;
  type: string;
  lat: string;
  lon: string;
}

async function searchLocations(query: string): Promise<LocationResult[]> {
  if (query.length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    limit: '8',
    lang: 'fr',
  });

  const res = await fetch(`https://photon.komoot.io/api/?${params}`);

  if (!res.ok) return [];

  const data = await res.json();

  return (data.features ?? [])
    .filter((f: any) => {
      const type = f.properties?.type;
      return ['city', 'town', 'village', 'municipality', 'state', 'country', 'locality'].includes(type);
    })
    .map((f: any) => {
      const p = f.properties ?? {};
      const shortName = p.name ?? '';
      const country = p.country ?? '';
      const state = p.state ?? '';
      const displayName = [shortName, state, country].filter(Boolean).join(', ');
      return {
        displayName,
        shortName,
        country,
        type: p.type ?? '',
        lat: String(f.geometry?.coordinates?.[1] ?? ''),
        lon: String(f.geometry?.coordinates?.[0] ?? ''),
      };
    });
}

export function useLocationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchLocations(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function reset() {
    setQuery('');
    setResults([]);
  }

  return { query, setQuery, results, loading, reset };
}
