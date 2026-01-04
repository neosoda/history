'use client';

import { HistoryResearchInterface } from '@/components/history-research-interface';

interface SharePageClientProps {
  task: {
    locationName?: string;
    location_name?: string;
    locationLat?: number;
    location_lat?: number;
    locationLng?: number;
    location_lng?: number;
    deepresearchId?: string;
    deepresearch_id?: string;
    locationImages?: string[];
    location_images?: string[];
    status?: string;
  };
}

export function SharePageClient({ task }: SharePageClientProps) {
  return (
    <div className="h-screen w-full bg-background">
      <HistoryResearchInterface
        location={{
          name: task.locationName || task.location_name || 'Lieu inconnu',
          lat: task.locationLat || task.location_lat || 0,
          lng: task.locationLng || task.location_lng || 0,
        }}
        onClose={() => window.location.href = '/'}
        initialTaskId={task.deepresearchId || task.deepresearch_id}
        initialImages={task.locationImages || task.location_images || []}
      />
    </div>
  );
}
