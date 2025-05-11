# LiveKit Camera Streaming

Stream camera feed to LiveKit rooms with interactive selection menu.

## Prerequisites

- Python 3.7+
- LiveKit account
- Connected camera

## Setup

1. Install dependencies:
```
pip install opencv-python livekit livekit-api python-dotenv readchar
```

2. Create `.env` file:
```
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
```

## Connect Camera
- USB cameras: Plug into USB port
- Built-in cameras: No setup needed
- IP cameras: Ensure on same network

## Run
```
python camera_streamer.py
```

## Use
1. Select/create room using arrow keys + ENTER
2. Select camera using arrow keys + ENTER
3. Press 'q' to exit stream

## View Stream
Connect to same LiveKit room with any compatible client
