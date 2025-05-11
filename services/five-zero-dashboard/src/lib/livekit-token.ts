/**
 * Helper function to generate a LiveKit token
 */
export async function generateLiveKitToken(options: {
    room: string;
    username: string;
    metadata?: Record<string, any>;
}): Promise<{
    token: string;
    url: string;
    room: string;
}> {
    const { room, username, metadata } = options;

    // Create URL with query parameters
    const url = new URL('/api/livekit-token', window.location.origin);
    url.searchParams.append('room', room);
    url.searchParams.append('username', username);

    if (metadata) {
        url.searchParams.append('metadata', JSON.stringify(metadata));
    }

    // Fetch token from API
    const response = await fetch(url.toString());

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get token');
    }

    return await response.json();
}