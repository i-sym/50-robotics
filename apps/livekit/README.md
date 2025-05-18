# LiveKit App

As the following system is running on Windows, it is impossible to run LiveKit on Docker and has to be started as Windows Service or on the cloud (on premise or LiveKit hosted)

## Running as a Windows Service

In order to start LiveKit as a Windows service, the setup script `setup.bat` is prepared. It launches LiveKit server ans creates a scheduled task that would run whenever computer is restarted

To run the set up:
1. Start command port (CMD) as administrator
2. Navigate to this directory:
```
cd "\Users\6 AXIS ATC\Desktop\aire\apps\livekit"
```
3. Runs setup script
```
setup.bat
```
4. Validate is fervice is running. Go to http://localhost:7880/ from your browser. You should see text "OK" in browser