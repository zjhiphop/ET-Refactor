@echo off
cls
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
