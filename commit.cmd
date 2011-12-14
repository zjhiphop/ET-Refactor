@echo on
rmdir /s /q build-client
cd /d .
set /p c=please input comments:

git add . &  git commit -m "%c%" & git push
pause
