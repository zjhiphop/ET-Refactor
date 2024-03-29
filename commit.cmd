@echo off
cls
@echo --------------------------
@echo 1.get project
@echo 2.push project
@echo --------------------------
:continue
set /p t=make your chose:
if %t%==1 (
	git fetch
	git diff > .diff 
	cls
	color A
	echo difference from your brunch to server:
 	echo...........................................
	type .diff
	echo...........................................
	pause & goto :eof
)
if %t%==2 (
	call  :commit
	git diff > .diff 
	color A
	cls
	echo difference from your brunch to server:
	echo...........................................
	type .diff
	echo...........................................
	pause & goto :eof
) else (
 @echo your chose is invalid!
 goto :continue
)

:commit
cd /d %cmd%
set /p c=please input comments:
if "%c%"=="" (
  set /p c=you must input commit msg first:
)
if "%c%"=="" (
  echo commit failed!
  goto :eof
)
git add . &  git commit -m "%c%" & git push
pause
