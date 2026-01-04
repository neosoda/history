/**
 * Unified database interface for PocketBase
 */

import { pb, getPocketBaseServerParams } from "./pocketbase";
import { cookies } from "next/headers";

// ============================================================================
// AUTH & SESSION HELPERS
// ============================================================================

async function getPb() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('pb_auth')?.value;
  return getPocketBaseServerParams(cookie || null);
}

export async function getUser() {
  const serverPb = await getPb();
  if (serverPb.authStore.isValid) {
    return { data: { user: serverPb.authStore.model }, error: null };
  }
  return { data: { user: null }, error: null };
}

export async function getSession() {
  const serverPb = await getPb();
  if (serverPb.authStore.isValid) {
    return {
      data: {
        session: {
          user: serverPb.authStore.model,
          access_token: serverPb.authStore.token,
        },
      },
      error: null,
    };
  }
  return { data: { session: null }, error: null };
}

// ============================================================================
// USER PROFILE FUNCTIONS
// ============================================================================

export async function getUserProfile(userId: string) {
  try {
    const record = await pb.collection('users').getOne(userId);
    return { data: record, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

// ============================================================================
// RATE LIMIT FUNCTIONS
// ============================================================================

export async function getUserRateLimit(userId: string) {
  try {
    const record = await pb.collection('user_rate_limits').getFirstListItem(`user="${userId}"`);
    return { data: record, error: null };
  } catch (error: any) {
    if (error.status === 404) return { data: null, error: null };
    return { data: null, error };
  }
}

export async function updateUserRateLimit(
  userId: string,
  updates: { usage_count?: number; reset_date?: string; last_request_at?: Date }
) {
  try {
    const existing = await getUserRateLimit(userId);
    const data = {
      user: userId,
      usage_count: updates.usage_count,
      reset_date: updates.reset_date,
      last_request_at: updates.last_request_at,
    };

    if (existing.data) {
      await pb.collection('user_rate_limits').update(existing.data.id, data);
    } else {
      await pb.collection('user_rate_limits').create(data);
    }
    return { error: null };
  } catch (error: any) {
    return { error };
  }
}

// ============================================================================
// CHAT SESSION FUNCTIONS
// ============================================================================

export async function getChatSessions(userId: string) {
  try {
    const records = await pb.collection('chat_sessions').getFullList({
      filter: `user="${userId}"`,
      sort: '-updated',
    });
    return { data: records, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function getChatSession(sessionId: string) {
  try {
    const record = await pb.collection('chat_sessions').getOne(sessionId);
    return { data: record, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function createChatSession(userId: string, title?: string) {
  try {
    const record = await pb.collection('chat_sessions').create({
      user: userId,
      title: title || 'New Research Session',
      last_message_at: new Date(),
    });
    return { data: record, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function updateChatSession(
  sessionId: string,
  userId: string,
  updates: { title?: string; last_message_at?: Date }
) {
  try {
    const record = await pb.collection('chat_sessions').update(sessionId, {
      ...updates,
      user: userId,
    });
    return { data: record, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function deleteChatSession(sessionId: string) {
  try {
    await pb.collection('chat_sessions').delete(sessionId);
    return { error: null };
  } catch (error: any) {
    return { error };
  }
}

// ============================================================================
// CHAT MESSAGE FUNCTIONS
// ============================================================================

export async function getChatMessages(sessionId: string) {
  try {
    const records = await pb.collection('chat_messages').getFullList({
      filter: `session_id="${sessionId}"`,
      sort: '+created',
    });
    return { data: records, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function addChatMessage(
  sessionId: string,
  message: {
    id: string;
    role: string;
    content: any;
    processing_time_ms?: number;
  }
) {
  try {
    const record = await pb.collection('chat_messages').create({
      session_id: sessionId,
      role: message.role,
      content: message.content,
      processing_time_ms: message.processing_time_ms,
    });
    return { error: null };
  } catch (error: any) {
    return { error };
  }
}

export async function saveChatMessages(
  sessionId: string,
  messages: Array<{
    id: string;
    role: string;
    content: any;
    processing_time_ms?: number;
  }>
) {
  // Bulk operations in PocketBase are usually done via separate calls or a custom route
  // To keep it simple, we'll delete and re-insert if needed, but the project now uses addChatMessage mostly.
  try {
    const existing = await getChatMessages(sessionId);
    if (existing.data) {
      for (const msg of existing.data) {
        await pb.collection('chat_messages').delete(msg.id);
      }
    }
    for (const msg of messages) {
      await addChatMessage(sessionId, msg);
    }
    return { error: null };
  } catch (error: any) {
    return { error };
  }
}

// ============================================================================
// RESEARCH TASK FUNCTIONS
// ============================================================================

export async function getResearchTasks(userId: string) {
  try {
    const records = await pb.collection('research_tasks').getFullList({
      filter: `user="${userId}"`,
      sort: '-created',
    });
    return { data: records, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function getResearchTask(taskId: string) {
  try {
    const record = await pb.collection('research_tasks').getOne(taskId);
    return { data: record, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function createResearchTask(task: {
  id: string;
  user_id?: string;
  deepresearch_id: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  status?: string;
  anonymous_id?: string;
  session_id?: string;
}) {
  try {
    const record = await pb.collection('research_tasks').create({
      user: task.user_id,
      deepresearch_id: task.deepresearch_id,
      location_name: task.location_name,
      location_lat: task.location_lat,
      location_lng: task.location_lng,
      status: task.status || 'queued',
      anonymous_id: task.anonymous_id,
      session_id: task.session_id,
    });
    return { error: null };
  } catch (error: any) {
    return { error };
  }
}

export async function updateResearchTaskByDeepResearchId(
  deepresearchId: string,
  updates: {
    status?: string;
    completed_at?: Date;
    location_images?: string[];
  }
) {
  try {
    const record = await pb.collection('research_tasks').getFirstListItem(`deepresearch_id="${deepresearchId}"`);
    const updateData: any = { ...updates };
    if (updates.location_images) {
      updateData.location_images = updates.location_images;
    }
    const updated = await pb.collection('research_tasks').update(record.id, updateData);
    return { data: updated, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function getPublicResearchTask(shareToken: string) {
  try {
    const record = await pb.collection('research_tasks').getFirstListItem(`share_token="${shareToken}" && is_public=true`);
    return { data: record, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function shareResearchTask(taskId: string, shareToken: string) {
  try {
    await pb.collection('research_tasks').update(taskId, {
      share_token: shareToken,
      is_public: true,
      shared_at: new Date(),
    });
    return { error: null };
  } catch (error: any) {
    return { error };
  }
}

export async function unshareResearchTask(taskId: string) {
  try {
    await pb.collection('research_tasks').update(taskId, {
      share_token: null,
      is_public: false,
      shared_at: null,
    });
    return { error: null };
  } catch (error: any) {
    return { error };
  }
}
