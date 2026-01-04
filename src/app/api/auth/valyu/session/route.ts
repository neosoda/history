import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;
const VALYU_APP_URL = process.env.VALYU_APP_URL || process.env.NEXT_PUBLIC_VALYU_APP_URL || 'https://platform.valyu.ai';

const SYSTEM_PW = 'v@lyu_s3cr3t_auth_123'; // Internal use only

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { valyu_access_token, access_token } = body;
    const token = valyu_access_token || access_token;

    if (!token) {
      return NextResponse.json({ error: 'missing_token' }, { status: 400 });
    }

    // 1. Fetch user info from Valyu
    const userInfoResponse = await fetch(`${VALYU_APP_URL}/api/oauth/userinfo`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.json({ error: 'userinfo_failed' }, { status: 401 });
    }

    const valyuUser = await userInfoResponse.json();

    // 2. Auth as Admin in PocketBase
    const pb = new PocketBase(PB_URL);
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL!, PB_ADMIN_PASSWORD!);

    // 3. Find or Create User
    let pbUser;
    try {
      pbUser = await pb.collection('users').getFirstListItem(`email="${valyuUser.email}"`);
      // Update info
      await pb.collection('users').update(pbUser.id, {
        name: valyuUser.name || valyuUser.given_name,
        avatar: valyuUser.picture,
      });
    } catch (e: any) {
      if (e.status === 404) {
        // Create user with system password
        pbUser = await pb.collection('users').create({
          email: valyuUser.email,
          password: SYSTEM_PW,
          passwordConfirm: SYSTEM_PW,
          name: valyuUser.name || valyuUser.given_name,
          emailVisibility: true,
          verified: true,
        });
      } else {
        throw e;
      }
    }

    // 4. Authenticate as the User to get a valid token
    const userPb = new PocketBase(PB_URL);
    const authData = await userPb.collection('users').authWithPassword(valyuUser.email, SYSTEM_PW);

    return NextResponse.json({
      token: authData.token,
      model: authData.record,
      user: authData.record,
    });
  } catch (error: any) {
    console.error('[Valyu Session] Error:', error.data || error.message);
    return NextResponse.json({ error: 'server_error', details: error.message }, { status: 500 });
  }
}
