import json
import os
import cv2
import sys
import asyncio
import logging
import numpy as np
from dotenv import load_dotenv
from livekit import rtc

# Try to import the correct LiveKit API package
try:
    from livekit import api  # This is the correct import for newer versions
except ImportError:
    try:
        import livekit_api as api  # Alternative import for older versions
    except ImportError:
        print("ERROR: Cannot import LiveKit API module.")
        print("Please install it using: pip install livekit-api")
        sys.exit(1)

# Set up logging
logging.basicConfig(level=logging.INFO)

# Load environment variables
load_dotenv()


def load_rooms_data(filename="rooms.json"):
    """Load rooms data from the JSON file or create a new file if not exists."""
    try:
        if os.path.exists(filename):
            with open(filename, "r") as file:
                return json.load(file)
        else:
            # Create a new empty rooms file
            empty_data = {"rooms": []}
            with open(filename, "w") as file:
                json.dump(empty_data, file, indent=4)
            return empty_data
    except Exception as e:
        print(f"Error loading rooms data: {e}")
        return {"rooms": []}


def save_rooms_data(data, filename="rooms.json"):
    """Save rooms data to the JSON file."""
    try:
        with open(filename, "w") as file:
            json.dump(data, file, indent=4)
        return True
    except Exception as e:
        print(f"Error saving rooms data: {e}")
        return False


def list_available_cameras():
    """List all available cameras connected to the system."""
    available_cameras = []
    # Try to open each camera index until we get an error
    index = 0
    while True:
        cap = cv2.VideoCapture(index)
        if not cap.isOpened():
            break
        ret, frame = cap.read()
        if ret:
            # Get camera name if possible
            camera_name = f"Camera {index}"  # Camera name
            available_cameras.append({"id": index, "name": camera_name})
        cap.release()
        index += 1

    return available_cameras


def select_room(rooms_data):
    """Prompt user to select an existing room or create a new one using arrow keys."""
    rooms = rooms_data.get("rooms", [])

    if not rooms:
        print("No rooms found. Let's create a new one.")
        room_name = input("Enter a name for the new room: ")
        new_room = {"name": room_name}
        rooms.append(new_room)
        rooms_data["rooms"] = rooms
        save_rooms_data(rooms_data)
        return room_name

    # Add "Create a new room" option
    options = [room["name"] for room in rooms] + ["Create a new room"]
    selected = 0  # Default selected option

    # Display options with the first one highlighted
    def display_options():
        print("\nAvailable rooms:")
        for i, option in enumerate(options):
            if i == selected:
                print(f" > {option}")  # Highlight the selected option
            else:
                print(f"   {option}")
        print("\nUse UP/DOWN arrows to navigate, ENTER to select")

    # Handle arrow key navigation
    while True:
        display_options()

        # Read key input
        key = readchar.readkey()

        # Handle arrow up
        if key == readchar.key.UP:
            selected = (selected - 1) % len(options)
        # Handle arrow down
        elif key == readchar.key.DOWN:
            selected = (selected + 1) % len(options)
        # Handle enter key
        elif key == readchar.key.ENTER:
            if selected == len(options) - 1:  # "Create a new room" option
                # Clear the screen for better UX
                os.system("cls" if os.name == "nt" else "clear")
                print("Create a new room")
                room_name = input("Enter a name for the new room: ")
                new_room = {"name": room_name}
                rooms.append(new_room)
                rooms_data["rooms"] = rooms
                save_rooms_data(rooms_data)
                return room_name
            else:
                return options[selected]

        # Clear the screen for better UI experience
        os.system("cls" if os.name == "nt" else "clear")


def select_camera():
    """Prompt user to select a camera from the available ones using arrow keys."""
    cameras = list_available_cameras()

    if not cameras:
        print("No cameras found. Please connect a camera and try again.")
        sys.exit(1)

    selected = 0  # Default selected option

    # Display options with the first one highlighted
    def display_options():
        print("\nAvailable cameras:")
        for i, camera in enumerate(cameras):
            if i == selected:
                print(
                    f" > {camera['name']} (ID: {camera['id']})"
                )  # Highlight the selected option
            else:
                print(f"   {camera['name']} (ID: {camera['id']})")
        print("\nUse UP/DOWN arrows to navigate, ENTER to select")

    # Handle arrow key navigation
    while True:
        display_options()

        # Read key input
        key = readchar.readkey()

        # Handle arrow up
        if key == readchar.key.UP:
            selected = (selected - 1) % len(cameras)
        # Handle arrow down
        elif key == readchar.key.DOWN:
            selected = (selected + 1) % len(cameras)
        # Handle enter key
        elif key == readchar.key.ENTER:
            return cameras[selected]["id"]

        # Clear the screen for better UI experience
        os.system("cls" if os.name == "nt" else "clear")


async def stream_camera_to_livekit(room_name, camera_id):
    """Connect to LiveKit and stream camera feed."""
    # Initialize video capture from selected camera
    cap = cv2.VideoCapture(camera_id)

    # Check if camera opened successfully
    if not cap.isOpened():
        logging.error(f"Could not open camera ID: {camera_id}")
        return

    # Get camera resolution
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    logging.info(f"Starting camera stream: {frame_width}x{frame_height}")

    # Get LiveKit credentials from environment variables
    livekit_url = os.getenv("LIVEKIT_URL")
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")

    if not all([livekit_url, api_key, api_secret]):
        logging.error("Missing LiveKit environment variables")
        return

    # Create a direct room connection
    room = rtc.Room()

    # Connect to the room
    try:
        # Create connection options
        room_options = rtc.RoomOptions(
            auto_subscribe=True,  # Auto-subscribe to all tracks
        )

        # Create a token for connecting to the room using the LiveKit API
        # Create access token with the API key and secret
        token = api.AccessToken(api_key, api_secret)

        # Set identity and name for this participant
        token = token.with_identity(f"camera-{camera_id}-{room_name}")
        token = token.with_name(f"Camera {camera_id}")

        # Set grants for room access
        grants = api.VideoGrants(
            room_join=True, room=room_name, can_publish=True, can_subscribe=True
        )
        token = token.with_grants(grants)

        # Convert to JWT token
        jwt_token = token.to_jwt()

        logging.info(f"Got token, connecting to room: {room_name}")
        await room.connect(livekit_url, jwt_token, room_options)
        logging.info(f"Connected to room: {room_name}")

        # Create video source and track
        source = rtc.VideoSource(frame_width, frame_height)
        track = rtc.LocalVideoTrack.create_video_track("camera-feed", source)

        # Set publish options and publish track
        options = rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_CAMERA)
        publication = await room.local_participant.publish_track(track, options)
        logging.info(f"Published track: {publication.sid}")

        try:
            # Main loop to capture and stream frames
            while True:
                # Capture frame-by-frame
                ret, frame = cap.read()

                # If frame is read correctly, ret is True
                if not ret:
                    logging.error("Can't receive frame (stream end?). Exiting...")
                    break

                # Convert the frame to RGBA for LiveKit
                argb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGBA)

                # Create video frame and capture
                video_frame = rtc.VideoFrame(
                    frame_width,
                    frame_height,
                    rtc.VideoBufferType.RGBA,
                    argb_frame.tobytes(),
                )
                source.capture_frame(video_frame)

                # Show preview window if desired
                cv2.imshow("Camera Preview", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break

                # Small delay to prevent CPU overuse
                await asyncio.sleep(0.01)  # 10ms

        finally:
            # Clean up resources
            cap.release()
            cv2.destroyAllWindows()
            await room.disconnect()
            logging.info("Disconnected from LiveKit room")

    except Exception as e:
        logging.error(f"Error in LiveKit connection: {str(e)}")
        cap.release()
        cv2.destroyAllWindows()


async def main_async():
    """Async main function to handle LiveKit connection."""
    # Select room and camera first
    rooms_data = load_rooms_data()
    selected_room = select_room(rooms_data)
    selected_camera_id = select_camera()

    # Clear screen for final display
    os.system("cls" if os.name == "nt" else "clear")

    # Print the final selection
    print("\n=== Selection Complete ===")
    print(f"Selected Room: {selected_room}")
    print(f"Selected Camera ID: {selected_camera_id}")
    print("\nConnecting to LiveKit...")

    # Start streaming to LiveKit
    await stream_camera_to_livekit(selected_room, selected_camera_id)


def main():
    """Main application function."""
    # Try to import readchar
    try:
        global readchar
        import readchar
    except ImportError:
        print("The 'readchar' package is required for this application.")
        print("Please install it using: pip install readchar")
        sys.exit(1)

    # Clear screen at start
    os.system("cls" if os.name == "nt" else "clear")
    print("=== LiveKit Camera Streaming Application ===\n")

    # Check for required dependencies
    required_packages = ["opencv-python", "livekit", "livekit-api", "python-dotenv"]
    missing_packages = []

    try:
        import cv2
    except ImportError:
        missing_packages.append("opencv-python")

    try:
        import livekit
    except ImportError:
        missing_packages.append("livekit")

    try:
        import dotenv
    except ImportError:
        missing_packages.append("python-dotenv")

    if missing_packages:
        print("ERROR: Missing required packages:")
        for pkg in missing_packages:
            print(f"  - {pkg}")
        print("\nPlease install them using:")
        print(f"pip install {' '.join(missing_packages)}")
        sys.exit(1)

    # Check for LiveKit environment variables
    required_vars = ["LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        print("ERROR: Missing required environment variables:")
        for var in missing_vars:
            print(f"  - {var}")
        print("\nPlease add them to your .env file in the format:")
        for var in missing_vars:
            print(f"{var}=your_{var.lower()}_here")
        sys.exit(1)

    # Run the async main function
    try:
        asyncio.run(main_async())
    except KeyboardInterrupt:
        print("\nApplication stopped by user.")
    except Exception as e:
        print(f"\nError: {str(e)}")
        print("\nApplication stopped due to an error.")


if __name__ == "__main__":
    main()
