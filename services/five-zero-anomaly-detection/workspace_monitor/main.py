import logging

import cv2
import tyro
from dotenv import load_dotenv
from rich.logging import RichHandler

from workspace_monitor.config import Config, LiveKitConfig, MqttConfig, MonitorConfig
from workspace_monitor.video_stream.livekit_video_stream import LiveKitVideoStream
from workspace_monitor.workers.workspace_state_publisher import (
    WorkspaceStatePublisher,
)
from workspace_monitor.workers.workspace_monitor import WorkspaceMonitor


log = logging.getLogger(__name__)


def main(cfg: Config):
    """
    Tool to monitor a LiveKit video stream for objects of interest and publish the detections to an MQTT broker.
    """

    streamer = LiveKitVideoStream(
        url=cfg.livekit.url,
        identity=cfg.livekit.identity,
        room_name=cfg.livekit.room_name,
        track_name=cfg.livekit.track_name,
        timeout=5,
    )
    streamer.start()

    monitor = WorkspaceMonitor(
        tracked_objects=["person"],
    )

    publisher = WorkspaceStatePublisher(
        broker_address=cfg.mqtt.broker,
        broker_port=cfg.mqtt.port,
        topic=cfg.mqtt.topic,
        username=cfg.mqtt.username,
        password=cfg.mqtt.password,
    )
    publisher.connect()

    while True:
        frame = streamer.get_latest_frame()
        if frame is None:
            # video stream is over
            break

        # process the frame
        workspace_state = monitor.process(frame)
        if len(workspace_state.intrusions) <= 0:
            log.info("Processed workspace state: no intrusions")
        else:
            intrusion_names = [
                i.class_name for i in workspace_state.intrusions]
            log.info(
                f"Processed workspace state: {len(workspace_state.intrusions)} intrusions\n"
                f"  {intrusion_names}"
            )

        # send detection results to the MQTT endpoint
        publisher.publish_state(workspace_state)
        log.info("Published update to MQTT broker")

        if cfg.debug:
            # display the frame
            cv2.imshow(str(streamer), frame)
            cv2.waitKey(1)


def cli():
    logging.basicConfig(
        level=logging.INFO,
        format="%(message)s",
        handlers=[RichHandler(omit_repeated_times=False)],
    )

    load_dotenv()

    # cfg = tyro.cli(Config)

    """
    MQTT_BROKER_URL=ws://localhost:8083/mqtt
    MQTT_CLIENT_ID=dashboard-client
    MQTT_USERNAME=dev
    MQTT_PASSWORD=dev

    LIVEKIT_URL=wss://cnc-demo-7wj97mwz.livekit.cloud
    LIVEKIT_API_KEY=APIeNJYiSJnTXTD
    LIVEKIT_API_SECRET=3kTnOeRPRfXyenmRcjlGXg57obwcEL9mSljHyzEn1RYA

    """

    cfg = Config(
        debug=True,
        livekit=LiveKitConfig(
            url="wss://cnc-demo-7wj97mwz.livekit.cloud",
            identity="camera-1-50robotics-cameras",
            room_name="50robotics-cameras",
            track_name="camera-1-50robotics-cameras",
            api_key="APIeNJYiSJnTXTD",
            api_secret="3kTnOeRPRfXyenmRcjlGXg57obwcEL9mSljHyzEn1RYA",
        ),
        mqtt=MqttConfig(
            broker="localhost",
            port=1883,
            topic="/machines/anomaly-tracker/reading/detected-objects",
            username="example_user",
            password="example_password",
        ),
        monitor=MonitorConfig(
            tracked_objects=["person"]
        ),
    )

    main(cfg)


if __name__ == "__main__":
    cli()
