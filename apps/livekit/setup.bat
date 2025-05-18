@echo off
setlocal enabledelayedexpansion

echo Setting up LiveKit Server for auto-start on Windows boot

:: Define variables
set LIVEKIT_DIR=%~dp0
set LIVEKIT_EXE=%LIVEKIT_DIR%livekit-server.exe
set TASK_NAME=LiveKitServer
set RUN_BAT=%LIVEKIT_DIR%run-livekit.bat

:: Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo This script requires administrator privileges.
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

:: Check if LiveKit executable exists
if not exist "%LIVEKIT_EXE%" (
    echo ERROR: LiveKit server executable not found at: %LIVEKIT_EXE%
    echo Please make sure livekit-server.exe is in the same directory as this script.
    pause
    exit /b 1
)

:: Create a batch file to run LiveKit
echo Creating LiveKit startup script
(
    echo @echo off
    echo cd /d "%LIVEKIT_DIR%"
    echo start "" "%LIVEKIT_EXE%" --dev
) > "%RUN_BAT%"

:: Set firewall permissions
echo Setting up firewall permissions
netsh advfirewall firewall add rule name="LiveKit Server" dir=in action=allow program="%LIVEKIT_EXE%" enable=yes profile=any >nul 2>&1

:: Remove existing task if it exists
schtasks /query /tn "%TASK_NAME%" >nul 2>&1
if %errorlevel% equ 0 (
    echo Removing existing scheduled task
    schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1
)

:: Create a startup shortcut as a fallback method
echo Creating startup shortcut for normal user login
set STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
if not exist "%STARTUP_DIR%" mkdir "%STARTUP_DIR%"
copy "%RUN_BAT%" "%STARTUP_DIR%\start-livekit.bat" >nul

:: Try creating a scheduled task using XML definition for better path handling
echo Creating scheduled task to run LiveKit at system startup
set "TASKXML=%TEMP%\livekit_task.xml"

(
    echo ^<?xml version="1.0" encoding="UTF-16"?^>
    echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^>
    echo   ^<RegistrationInfo^>
    echo     ^<Description^>Starts LiveKit server in development mode at system startup^</Description^>
    echo   ^</RegistrationInfo^>
    echo   ^<Triggers^>
    echo     ^<BootTrigger^>
    echo       ^<Enabled^>true^</Enabled^>
    echo     ^</BootTrigger^>
    echo   ^</Triggers^>
    echo   ^<Principals^>
    echo     ^<Principal id="Author"^>
    echo       ^<UserId^>S-1-5-18^</UserId^>
    echo       ^<RunLevel^>HighestAvailable^</RunLevel^>
    echo     ^</Principal^>
    echo   ^</Principals^>
    echo   ^<Settings^>
    echo     ^<MultipleInstancesPolicy^>IgnoreNew^</MultipleInstancesPolicy^>
    echo     ^<DisallowStartIfOnBatteries^>false^</DisallowStartIfOnBatteries^>
    echo     ^<StopIfGoingOnBatteries^>false^</StopIfGoingOnBatteries^>
    echo     ^<AllowHardTerminate^>true^</AllowHardTerminate^>
    echo     ^<StartWhenAvailable^>true^</StartWhenAvailable^>
    echo     ^<RunOnlyIfNetworkAvailable^>false^</RunOnlyIfNetworkAvailable^>
    echo     ^<IdleSettings^>
    echo       ^<StopOnIdleEnd^>false^</StopOnIdleEnd^>
    echo       ^<RestartOnIdle^>false^</RestartOnIdle^>
    echo     ^</IdleSettings^>
    echo     ^<AllowStartOnDemand^>true^</AllowStartOnDemand^>
    echo     ^<Enabled^>true^</Enabled^>
    echo     ^<Hidden^>false^</Hidden^>
    echo     ^<RunOnlyIfIdle^>false^</RunOnlyIfIdle^>
    echo     ^<WakeToRun^>false^</WakeToRun^>
    echo     ^<ExecutionTimeLimit^>PT0S^</ExecutionTimeLimit^>
    echo     ^<Priority^>4^</Priority^>
    echo   ^</Settings^>
    echo   ^<Actions Context="Author"^>
    echo     ^<Exec^>
    echo       ^<Command^>%RUN_BAT:\=\\%^</Command^>
    echo       ^<WorkingDirectory^>%LIVEKIT_DIR:\=\\%^</WorkingDirectory^>
    echo     ^</Exec^>
    echo   ^</Actions^>
    echo ^</Task^>
) > "%TASKXML%"

schtasks /create /tn "%TASK_NAME%" /xml "%TASKXML%" /f
if %errorlevel% neq 0 (
    echo WARNING: Failed to create scheduled task. 
    echo LiveKit will only start automatically when a user logs in.
) else (
    echo Scheduled task created successfully. 
    echo LiveKit will start automatically on system boot, even before login.
)

:: Start LiveKit now
echo Starting LiveKit server immediately
cd /d "%LIVEKIT_DIR%"
start "" "%LIVEKIT_EXE%" --dev

echo Setup complete!
echo LiveKit is now running and will start automatically when Windows boots.

endlocal