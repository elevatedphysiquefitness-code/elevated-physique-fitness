import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendMessageNotificationEmail, ADMIN_EMAIL } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, senderName, messagePreview } = await request.json();

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID required' }, { status: 400 });
    }

    // Get receiver's profile
    const { data: receiver } = await supabase
      .from('profiles')
      .select('email, full_name, role')
      .eq('id', receiverId)
      .single();

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://elevatedphysiquefitness.com';
    const dashboardUrl = receiver.role === 'admin' ? `${baseUrl}/admin/messages` : `${baseUrl}/dashboard/messages`;

    // Send push notification to receiver
    try {
      const pushResponse = await fetch(`${baseUrl}/api/push/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          userId: receiverId,
          notificationType: 'message',
          payload: {
            title: `New message from ${senderName}`,
            body: (messagePreview && messagePreview !== 'Sent a photo' ? messagePreview.substring(0, 100) : messagePreview) || 'You have a new message',
            url: dashboardUrl,
            tag: 'message',
          },
        }),
      });

      if (!pushResponse.ok) {
        console.log('Push notification not sent (user may not have notifications enabled)');
      }
    } catch (pushError) {
      console.error('Push notification error:', pushError);
    }

    // Send email notification
    if (receiver.email) {
      try {
        // For admin, always send email
        // For clients, send email too so they don't miss messages
        const emailResult = await sendMessageNotificationEmail(
          receiver.role === 'admin' ? (ADMIN_EMAIL || receiver.email) : receiver.email,
          receiver.full_name || 'there',
          senderName,
          messagePreview || 'You have a new message',
          dashboardUrl
        );

        if (!emailResult.success) {
          console.log('Email notification not sent:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Message notify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
