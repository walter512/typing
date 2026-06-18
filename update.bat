@echo off
echo ==========================================
echo   TypeCraft Updater
echo   Voortgang blijft bewaard!
echo ==========================================
echo.
cd /d "%~dp0"
git pull origin master
echo.
echo Update voltooid! Start TypeCraft opnieuw.
pause
