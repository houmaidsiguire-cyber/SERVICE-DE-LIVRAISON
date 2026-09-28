@echo off
title Publication sur GitHub - Livreur Faso
echo ========================================================
echo   PUBLICATION VERS GITHUB : SERVICE-DE-LIVRAISON
echo ========================================================
echo.

set GIT_EXE="%LOCALAPPDATA%\Programs\Git\cmd\git.exe"

if not exist %GIT_EXE% (
    echo Erreur : Git introuvable dans %GIT_EXE%
    pause
    exit /b 1
)

echo 1. Initialisation du depot Git local...
if not exist ".git" (
    %GIT_EXE% init -b main
) else (
    echo Le depot Git local existe deja.
)

echo 2. Configuration du remote GitHub...
%GIT_EXE% remote remove origin >nul 2>&1
%GIT_EXE% remote add origin https://github.com/houmaidsiguire-cyber/SERVICE-DE-LIVRAISON.git

echo 3. Ajout des fichiers au suivi...
%GIT_EXE% add .

echo 4. Creation du commit...
%GIT_EXE% commit -m "feat: application Livreur Faso (Ouagadougou) - formulaire, liste, mode plein soleil et PWA"

echo 5. Envoi vers GitHub (branche main)...
%GIT_EXE% branch -M main
%GIT_EXE% push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   SUCCES ! Le projet est publie sur GitHub avec succes :
    echo   https://github.com/houmaidsiguire-cyber/SERVICE-DE-LIVRAISON
    echo ========================================================
) else (
    echo ========================================================
    echo   Note d'authentification GitHub :
    echo   Si GitHub vous demande un mot de passe, utilisez votre
    echo   Personal Access Token (PAT) GitHub.
    echo ========================================================
)
echo.
pause
