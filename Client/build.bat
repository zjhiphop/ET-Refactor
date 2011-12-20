@echo off
setlocal enabledelayedexpansion
set PATH=%PATH%;C:\Program Files\nodejs;
rd  /s /q build-client
cd /d .
call :coffee
call :less
call :stlus
node script/lib/r.js -o app.build.js
pause

:coffee
for /r script %%i in (*.coffee) do if exist %%i coffee -c %%i
:less
for /r css %%i in (*.less) do if exist %%i lessc %%i css/less/%%~ni.css
::for /r css %%i in (*.less) do if exist %%i lessc %%i css/%%~ni-less.css
:stlus
for /r css %%i in (*.styl) do if exist %%i stylus %%i
