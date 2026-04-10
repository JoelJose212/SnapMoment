@echo off
:: Request Admin Privileges
if not "%1"=="am_admin" (
    powershell -Command "Start-Process -Verb RunAs -FilePath '%0' -ArgumentList 'am_admin'"
    exit /b
)

echo.
echo ========================================================
echo SnapMoment Docker Disk Compactor
echo ========================================================
echo Shutting down Docker and WSL background processes...
wsl --shutdown

echo Creating diskpart instructions...
echo select vdisk file="C:\Users\Joel\AppData\Local\Docker\wsl\disk\docker_data.vhdx" > "%TEMP%\compact.txt"
echo attach vdisk readonly >> "%TEMP%\compact.txt"
echo compact vdisk >> "%TEMP%\compact.txt"
echo detach vdisk >> "%TEMP%\compact.txt"

echo.
echo Compacting Docker Virtual Disk to reclaim space...
echo This will take a few seconds. Do not close this window!
diskpart /s "%TEMP%\compact.txt"

echo Cleaning up...
del "%TEMP%\compact.txt"

echo.
echo ========================================================
echo SUCCESS! Your Docker virtual disk has been squeezed back down.
echo You should see 40+ Gigabytes return to your C: drive.
echo.
echo Restarting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
echo.
echo Once the Docker whale stops spinning in your task bar, 
echo your SnapMoment containers will automatically resume.
echo ========================================================
echo.
pause
