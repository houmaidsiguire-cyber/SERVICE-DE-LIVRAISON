@echo off
title Serveur Livreur Faso
echo ===================================================
echo   DEMARRAGE DU SERVEUR LIVREUR FASO (OUAGADOUGOU)
echo ===================================================
echo.
echo Le serveur demarre sur : http://localhost:8080
echo Appuyez sur Ctrl+C pour arreter le serveur.
echo.
start http://localhost:8080
powershell.exe -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
