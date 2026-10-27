@echo off
:: ============================================================================
:: SAFE JOURNEYS - 1-CLICK LOCAL WEB SERVER LAUNCHER
:: ============================================================================
:: Double-click this file to start the website locally.
:: It automatically:
:: 1. Launches the lightweight local web server on port 8085
:: 2. Opens the website in your default web browser
:: ============================================================================

title Safe Journeys Local Web Server
cls

echo ===============================================================
echo     SAFE JOURNEYS HAPPY MEMORIES - LOCAL SERVER
echo ===============================================================
echo.
echo Website URL : http://127.0.0.1:8085/index.html
echo Admin URL   : http://127.0.0.1:8085/admin.html
echo.
echo Opening browser...
start http://127.0.0.1:8085/index.html
echo Server is running! (Keep this window open while testing)
echo To stop the server, simply close this window.
echo ===============================================================
echo.

:: Try using Node.js first (enables full Brevo transactional email API locally)
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Using Node.js server with Brevo API support...
    node "%~dp0server.js"
    goto end
)

:: Fallback to XAMPP PHP if available
if exist "C:\xampp\php\php.exe" (
    "C:\xampp\php\php.exe" -S 127.0.0.1:8085 -t "%~dp0"
    goto end
)

:: Fallback to system PHP if in PATH
where php >nul 2>nul
if %ERRORLEVEL% equ 0 (
    php -S 127.0.0.1:8085 -t "%~dp0"
    goto end
)

:: Fallback to Python if neither Node nor PHP is found
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    python -m http.server 8085 --directory "%~dp0"
    goto end
)

echo ERROR: Neither Node.js, PHP, nor Python was found on your computer.
echo Please make sure XAMPP is installed at C:\xampp.
pause

:end
