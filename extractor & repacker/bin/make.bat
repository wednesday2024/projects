@echo off
echo Extracting your LZ4 images
pause
echo Extracting all images with .lz4 extension
pause
lz4.exe -d system.img.lz4 system.img.ext4
pause
lz4.exe -d boot.img.lz4 boot.img
pause
lz4.exe -d recovery.img.lz4 recovery.img
pause
lz4.exe -d cache.img.lz4 cache.img
pause
lz4.exe -d hidden.img.lz4 hidden.img
pause
echo Extraction done
echo Script made by henrylife
pause