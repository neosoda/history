'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { HistoryResearchInterface } from '@/components/history-research-interface';
import { Loader } from 'lucide-react';

function SharePageContent() {
  const params = useParams();
  const token = params.token as string;
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedResearch = async () => {
      try {
        const response = await fetch(`/api/research/public/${token}`);

        if (!response.ok) {
          throw new Error('Research not found or is no longer shared');
        }

        const data = await response.json();
        setTask(data.task);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shared research');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedResearch();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared research...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Research Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error || 'This research is no longer available or was not shared.'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background">
      <HistoryResearchInterface
        location={{
          name: task.locationName || task.location_name,
          lat: task.locationLat || task.location_lat,
          lng: task.locationLng || task.location_lng,
        }}
        onClose={() => window.location.href = '/'}
        initialTaskId={task.deepresearchId || task.deepresearch_id}
        initialImages={task.locationImages || task.location_images || []}
      />
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <SharePageContent />
    </Suspense>
  );
}
