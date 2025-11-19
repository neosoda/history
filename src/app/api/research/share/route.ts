import * as db from '@/lib/db';

// Share a research task
export async function POST(req: Request) {
  const { data: { user } } = await db.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { taskId, images } = await req.json();

  if (!taskId) {
    return new Response(JSON.stringify({ error: "Missing taskId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Store images if provided (for sharing)
  if (images && images.length > 0) {
    try {
      await db.updateResearchTask(taskId, {
        location_images: JSON.stringify(images),
      });
    } catch (err) {
      console.error('[Share] Failed to save images:', err);
    }
  }

  const { data, error } = await db.shareResearchTask(taskId, user.id);

  if (error || !data) {
    return new Response(JSON.stringify({ error: error?.message || 'Failed to share' }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${data.share_token}`;

  return new Response(JSON.stringify({ shareUrl, shareToken: data.share_token }), {
    headers: { "Content-Type": "application/json" }
  });
}

// Unshare a research task
export async function DELETE(req: Request) {
  const { data: { user } } = await db.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return new Response(JSON.stringify({ error: "Missing taskId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { error } = await db.unshareResearchTask(taskId, user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
