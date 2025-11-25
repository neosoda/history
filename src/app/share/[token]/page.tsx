import Link from 'next/link';
import * as db from '@/lib/db';
import { fetchCompletedResearch } from '@/lib/fetch-research';
import { SharePageClient } from '@/components/share-page-client';

async function SharePageContent({ token }: { token: string }) {
  // Fetch task metadata from database
  const { data: task, error } = await db.getPublicResearchTask(token);

  if (error || !task) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Research Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This research is no longer available or was not shared.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Parse location_images if it exists (it's double-encoded JSON)
  let parsedTask = { ...task };
  if (task.location_images || task.locationImages) {
    try {
      const imagesField = task.location_images || task.locationImages;
      const parsed = JSON.parse(imagesField);
      const images = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
      parsedTask.locationImages = images;
      parsedTask.location_images = images;
    } catch (err) {
      // Fail silently - non-critical operation
    }
  }

  // Fetch completed research content for SEO (only if completed)
  let researchContent: string | null = null;
  if (task.status === 'completed') {
    const deepResearchId = task.deepresearch_id || task.deepresearchId;
    if (deepResearchId) {
      const research = await fetchCompletedResearch(deepResearchId);
      if (research?.output) {
        researchContent = research.output;
      }
    }
  }

  const locationName = task.location_name || task.locationName || 'Unknown Location';

  return (
    <>
      {/* Hidden content for crawlers (SEO & social media link previews) */}
      {researchContent && (
        <article className="sr-only" aria-hidden="true">
          <h1>{locationName} - Historical Research</h1>
          <div>
            <p>
              Explore the fascinating history of {locationName}. Deep research powered by AI,
              sourced from historical databases, academic archives, and verified sources.
            </p>
          </div>
          {/* Render markdown content as plain text for crawlers */}
          <div>
            {researchContent}
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: `${locationName} - Historical Research`,
                description: `Explore the fascinating history of ${locationName}. Deep research powered by AI, sourced from historical databases, academic archives, and verified sources.`,
                author: {
                  '@type': 'Organization',
                  name: 'History - AI Deep Research',
                },
                publisher: {
                  '@type': 'Organization',
                  name: 'History',
                },
              }),
            }}
          />
        </article>
      )}

      {/* Visible interactive UI for users */}
      <SharePageClient task={parsedTask} />
    </>
  );
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Don't use Suspense here - we want the content in the initial HTML for crawlers
  return <SharePageContent token={token} />;
}
