import { useEffect, useState } from 'react';
import { Visitor } from '@/app/(dashboard)/visitors/list/page'; // adjust import path if needed

export function useVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVisitors() {
      try {
        const res = await fetch('/api/visitors');
        if (!res.ok) {
          throw new Error(`Failed to fetch visitors: ${res.status}`);
        }
        const data = await res.json();
        // API may return { data: Visitor[] } or raw array
        const visitorsData: Visitor[] = Array.isArray(data) ? data : data.data || [];
        setVisitors(visitorsData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchVisitors();
  }, []);

  return { visitors, loading, error };
}
