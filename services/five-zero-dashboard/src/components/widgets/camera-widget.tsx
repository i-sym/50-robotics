import { useRef, useEffect, useState } from 'react';
import { CameraWidgetConfig } from '@/types/dashboard';
import { useLiveKit } from '@/store/use-livekit-store';
import { Participant, Track, VideoQuality } from 'livekit-client';
import { AlertCircle, VideoOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CameraWidgetProps = {
    widget: CameraWidgetConfig;
};

export function CameraWidget({ widget }: CameraWidgetProps) {
    const { room, isConnected, cameras } = useLiveKit();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasVideo, setHasVideo] = useState(false);
    const [muted, setMuted] = useState(widget.muted ?? true);
    const [error, setError] = useState<string | null>(null);

    // Find the camera by name
    const camera = cameras.find(cam =>
        cam.name.toLowerCase() === widget.cameraName.toLowerCase()
    );

    useEffect(() => {
        if (!room || !isConnected || !camera) {
            setHasVideo(false);
            return;
        }

        // Find participant that published this track
        let trackPublication: Track | null = null;
        let publisher: Participant | null = null;

        // Search through all participants for the matching track
        for (const participant of room.remoteParticipants.values()) {
            for (const track of participant.videoTrackPublications.values()) {
                if (track.trackSid === camera.id) {
                    trackPublication = track.track!;
                    publisher = participant;
                    break;
                }
            }
            if (trackPublication) break;
        }

        if (!trackPublication || !publisher) {
            setHasVideo(false);
            setError('Camera stream not found');
            return;
        }

        // Attach track to video element
        const videoElement = videoRef.current;
        if (videoElement && trackPublication) {
            // Set video element properties
            videoElement.muted = muted;
            videoElement.autoplay = widget.autoPlay !== false;

            // Attach the track
            if ((trackPublication as Track).attach) {
                (trackPublication as Track).attach(videoElement);
                setHasVideo(true);
                setError(null);

                // Set preferred quality if supported
                if ((trackPublication as any).setVideoQuality) {
                    (trackPublication as any).setVideoQuality(VideoQuality.HIGH);
                }
            }
        }

        // Cleanup function
        return () => {
            if (trackPublication && (trackPublication as Track).detach) {
                (trackPublication as Track).detach();
                setHasVideo(false);
            }
        };
    }, [room, isConnected, camera, widget.cameraName, muted, widget.autoPlay]);

    const toggleMute = () => {
        setMuted(!muted);
        if (videoRef.current) {
            videoRef.current.muted = !muted;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 relative bg-muted rounded overflow-hidden">
                {!isConnected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-4">
                            <VideoOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground/70" />
                            <p className="text-sm text-muted-foreground">
                                Not connected to camera system
                            </p>
                        </div>
                    </div>
                )}

                {isConnected && !camera && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-4">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                            <p className="text-sm text-muted-foreground">
                                Camera "{widget.cameraName}" not found
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute top-0 left-0 right-0 bg-red-500/90 text-white text-xs p-1">
                        {error}
                    </div>
                )}

                <video
                    ref={videoRef}
                    className={`h-full w-full object-contain ${!hasVideo ? 'hidden' : ''}`}
                    playsInline
                />

                {widget.showControls && (
                    <div className="absolute bottom-2 right-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={toggleMute}
                            className="h-7 w-7 bg-background/80 backdrop-blur"
                        >
                            {muted ? (
                                <VolumeX className="h-4 w-4" />
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}