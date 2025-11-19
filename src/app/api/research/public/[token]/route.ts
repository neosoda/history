import * as db from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return new Response(JSON.stringify({ error: "Missing share token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { data: task, error } = await db.getPublicResearchTask(token);

  if (error || !task) {
    return new Response(JSON.stringify({ error: "Research not found or is not shared" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Parse location_images if it exists (it's double-encoded JSON)
  let parsedTask = { ...task };
  if (task.location_images || task.locationImages) {
    try {
      const imagesField = task.location_images || task.locationImages;
      // First parse gets us a JSON string, second parse gets the array
      const parsed = JSON.parse(imagesField);
      const images = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
      parsedTask.locationImages = images;
      parsedTask.location_images = images;
    } catch (err) {
      console.error('[Share] Failed to parse location_images:', err);
    }
  }

  return new Response(JSON.stringify({ task: parsedTask }), {
    headers: { "Content-Type": "application/json" }
  });
}
