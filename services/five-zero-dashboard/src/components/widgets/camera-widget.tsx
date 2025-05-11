import { createRef, useEffect, useRef, useState } from 'react';
import { CameraWidgetConfig } from '@/types/dashboard';
import { useLiveKit } from '@/context/livekit-context';
import { Participant, Track, VideoQuality } from 'livekit-client';
import { AlertCircle, Video, VideoOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CameraWidgetProps = {
    widget: CameraWidgetConfig;
};

export function CameraWidget({ widget }: CameraWidgetProps) {
    const { room, isConnected, cameras } = useLiveKit();
    const videoRef = createRef<HTMLVideoElement>();
    const [isPlaying, setIsPlaying] = useState(widget.autoPlay !== false);
    const [isMuted, setIsMuted] = useState(widget.muted === true);
    const [error, setError] = useState<string | null>(null);

    // Extract widget configuration
    const { cameraName, showControls = true } = widget;

    // Find the camera participant and track
    const findCameraTrack = () => {
        if (!room) {
            console.error('Room not available');
            return null;
        }

        for (const participant of room.remoteParticipants.values()) {
            // Check participant metadata for camera name
            const identity = participant.identity;
            console.log(`Participant: [${participant.identity}]/[${cameraName}] [${participant.sid}]`);
            try {
                // const metadata = participant.metadata ? JSON.parse(participant.metadata) : {};
                if (participant.identity == cameraName) {
                    // Find the video track

                    console.log(' >> Found participant:', participant.identity);
                    for (const track of participant.videoTrackPublications.values()) {
                        console.log(' >> Track:', track.trackSid, track.kind, track.isSubscribed);
                        if (track.kind === Track.Kind.Video && track.isSubscribed) {
                            console.log(' >>> Found video track:', track.trackSid);
                            return { participant, track: track.videoTrack };
                        }
                    }
                }
            } catch (err) {
                console.error('Error parsing participant metadata:', err);
            }
        }

        return null;
    };

    // Effect to handle track subscription and attachment
    useEffect(() => {
        if (!room) {
            setError('Not connected to camera system');
            return;
        }

        if (!isConnected) {
            setError('Not connected to camera system');
            return;
        }

        // if (!videoRef.current) {
        //     setError('Video element not available');
        //     return;
        // }
        // if (!room || !isConnected || !videoRef.current) {
        //     setError('Not connected to camera system');
        //     return;
        // }

        const cameraInfo = findCameraTrack();

        if (!cameraInfo) {
            setError(`Camera "${cameraName}" not found`);
            return;
        }

        const { participant, track } = cameraInfo;

        // Attach video track to the element
        if (track) {
            track.attach(videoRef.current!);

            // Set video quality
            // track.setVideoQuality(VideoQuality.HIGH);
            // track.

            setError(null);

            return () => {
                // track.detach(videoRef.current!);
            };
        } else {
            setError('Video track not available');
        }
    }, [room, isConnected, cameraName]);

    // Handle play/pause
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(err => {
                    console.error('Error playing video:', err);
                    setError('Failed to play video');
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Handle mute/unmute
    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Render error state
    if (error) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{error}</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col">
            <div className="relative flex-1 bg-black rounded-md overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay={widget.autoPlay !== false}
                    muted={widget.muted === true}
                    playsInline
                    className="h-full w-full object-contain"
                />

                {/* Video status overlay - shown when video is paused */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <VideoOff className="h-12 w-12 text-white/80" />
                    </div>
                )}
            </div>

            {/* Controls */}
            {showControls && (
                <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground">
                        {cameraName}
                    </div>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={togglePlay}
                        >
                            {isPlaying ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={toggleMute}
                        >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}