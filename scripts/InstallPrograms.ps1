<# Just a simple script to install Windows programs. #>


echo "Now installing the selected programs! This should only take a couple of minutes!"


<# misc. programs list. #>


start-process programs/misc/NotePad++.exe

start-process programs/misc/Discord.exe /s 

start-process programs/misc/FireFox.exe /s 

start-process programs/misc/Minecraft.exe /s

start-process programs/misc/Java8.exe

start-process programs/misc/Java17.exe

start-process programs/misc/Python.exe

start-process programs/misc/UnityHub.exe /s

start-process programs/misc/GitHubDesktop.exe /s

start-process programs/misc/iTunes.exe /s

start-process programs/misc/Origin.exe

start-process programs/misc/Ubisoft.exe /s

start-process programs/misc/Steam.exe /s

start-process programs/misc/EpicGames.exe /s

start-process programs/misc/RockstarGames.exe /s


<# end misc. programs list. #>


<# VS Studio, studio code, and visual C++ list. #>


start-process programs/MS/VSCode.exe /s

start-process programs/MS/VS19x64.exe /s

start-process programs/MS/VS19x86.exe /s

start-process programs/MS/VS17.exe /s

start-process programs/MS/VS19.exe /s

start-process programs/MS/VS22.exe /s


<# end MS VS programs list. #>


echo "All of the selected programs has been installed successfully!"


<# End of the script. #>
