import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

// Do not cache endpoint result
export const revalidate = 0;

export async function GET(req: NextRequest) {
    const room = req.nextUrl.searchParams.get('room');
    const username = req.nextUrl.searchParams.get('username');
    const metadata = req.nextUrl.searchParams.get('metadata');

    if (!room) {
        return NextResponse.json({ error: 'Missing "room" query parameter' }, { status: 400 });
    } else if (!username) {
        return NextResponse.json({ error: 'Missing "username" query parameter' }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    try {
        // Create a new access token
        const at = new AccessToken(apiKey, apiSecret, {
            identity: username,
            metadata: metadata || undefined
        });

        // Add permissions to the token
        at.addGrant({
            room,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true
        });

        // Return token as JSON
        return NextResponse.json(
            {
                token: await at.toJwt(),
                url: wsUrl,
                room
            },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (error) {
        console.error('Error generating token:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        );
    }
}