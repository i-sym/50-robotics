'use client';

import {
    isTrackReference,
    LiveKitRoom,
    TrackReference,
    TrackReferenceOrPlaceholder,
    useTracks,
    VideoTrack,
} from '@livekit/components-react';

import '@livekit/components-styles';

import { createRef, use, useEffect, useRef, useState } from 'react';
import { Track } from 'livekit-client';

export default function Page() {


    return (
        <GoProLiveKitBlock />
    );
}

export function GoProLiveKitBlock() {
    const room = '50Robotics';
    const name = `user-${Math.floor(Math.random() * 1000)}`;
    const [token, setToken] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch(`/api/token?room=${room}&username=${name}`);
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

    if (token === '') {
        return <div>Getting token...</div>;
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            // Use the default LiveKit theme for nice styles.
            data-lk-theme="default"

        >
            {/* Your custom component with basic video conferencing functionality. */}
            <GoproVideo />
            {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
            {/* <RoomAudioRenderer />
            {/* Controls for the user to start/stop audio, video, and screen
            {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
            {/* <RoomAudioRenderer />
            {/* Controls for the user to start/stop audio, video, and screen
      share tracks and to leave the room. */}
            {/* <ControlBar /> */}
        </LiveKitRoom>
    );
}


function GoproVideo() {

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );

    const [tokyoCamTrackRef, setTokyoCamTrackRef] = useState<TrackReference | undefined>(undefined);

    // const tokyoCamTrackRef = tracks.find((trackRef) => trackRef.participant.name === 'gopro-agent');

    useEffect(() => {
        const tokyoCamTrack = tracks.find((trackRef) => trackRef.participant.name === 'gopro-agent');
        if (tokyoCamTrack && isTrackReference(tokyoCamTrack)) {
            setTokyoCamTrackRef(tokyoCamTrack);

        }
    }, [tracks]);
    return (
        <div>
            <div>

                {tokyoCamTrackRef && (
                    <VideoTrack trackRef={tokyoCamTrackRef} />
                )}
            </div>
        </div>
    );
}