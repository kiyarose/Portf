@echo off
rem Run during a merge when package.json has conflict markers (npm cannot parse it).
node "%~dp0resolve-upstream-conflicts.mjs" %*