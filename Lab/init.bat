@echo off
setlocal enabledelayedexpansion
mode con cols=113 lines=15 &color 9f
::node http://nodejs.org/dist/v0.6.5/node-v0.6.5.msi
::rails http://rubyforge.org/frs/download.php/75468/railsinstaller-2.0.1.exe
@echo install nodeJS
@path | findstr "nodejs" 
if not %errorlevel% == 0 (
  call :delay
  call :installNode
  set PATH=%PATH%;C:\Program Files\nodejs;
) else (
  @echo nodejs has insatalled! 
  @echo Start install node_moduler express jade coffeekup stylus
  npm install -g express jade coffeekup stylus
)
@echo install rails and git
path | find "RailsInstaller"
if not %errorlevel% == 0 (
  call :delay
  call :installRails 
) else (
  @echo rails and git has insatalled!
)
@echo get project
@if not exist "%~dp0/ET-Refactor" (
 git clone https://zjhiphop@github.com/zjhiphop/ET-Refactor.git
)
echo init Finished!
pause
goto :eof

:installNode
\\cns-812\e$\project\node-v0.6.5.msi & goto :eof
:installRails
\\cns-812\e$\project\railsinstaller-2.0.1.exe & goto :eof
:delay
cls
echo.
echo start parepareing. . .
echo.
echo ---------------------------
set/p= *<nul
for /L %%i in (1 1 10) do set /p a=**<nul&ping /n 1 127.0.0.1>nul
echo 100%%
echo ---------------------------
goto :eof
