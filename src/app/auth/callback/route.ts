import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { transferAnonymousToUser } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session?.user) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, subscription_tier')
        .eq('id', data.session.user.id)
        .single();

      if (!existingUser) {
        await supabase
          .from('users')
          .insert({
            id: data.session.user.id,
            email: data.session.user.email,
            subscription_tier: 'free'
          });
      } else {
        await supabase
          .from('users')
          .update({
            email: data.session.user.email
          })
          .eq('id', data.session.user.id);
      }

      try {
        await transferAnonymousToUser(data.session.user.id);
      } catch (transferError) {
        // Fail silently
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}