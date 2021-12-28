<# Just a simple script to install Windows programs. #>


echo "Now installing the selected programs and/or drivers! This should only take a couple of minutes!"


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

start-process programs/misc/iTunes.exe

start-process programs/misc/Origin.exe

start-process programs/misc/Ubisoft.exe /s

start-process programs/misc/Steam.exe /s

start-process programs/misc/EpicGames.exe /s

start-process programs/misc/RockstarGames.exe /s

start-process programs/misc/VLC.exe

start-process programs/misc/LibreOffice.exe

start-process programs/misc/MakeMKV.exe /s

start-process programs/misc/Gimp.exe /s

start-process programs/misc/OBS.exe /s

start-process programs/misc/SilverLightx64.exe

start-process programs/misc/AdobePDF.exe /s

start-process programs/misc/HarmanAirRuntime.exe /s

start-process programs/msic/Transformice.exe

start-process programs/misc/DirectXInstaller.exe

start-process prgrams/misc/PowerToys.exe

start-process programs/misc/RainMeter.exe

start-process programs/misc/PowerShellPreview.exe


<# end misc. programs list. #>


<# PC specific drivers, to commit out, just add "<# TEXT HERE on both sides but at the end of the command put # > with no space" without the " TEXT HERE " #>


start-process programs/drivers/RoccatVulcanDriver.exe

start-process programs/drivers/SamsungNVME-Driver.exe /s

start-process programs/drivers/WIN10/RTX2060-GameReady-WIN10-DisplayDriver.exe

start-process programs/drivers/WIN10/TPLink-T6E-V2-WIN10-Driver.exe

start-process programs/drivers/WIN7/RTX2060-GameReady-WIN7-DisplayDriver.exe

start-process programs/drivers/WIN7/TPLink-T6E-V2-WIN7-Driver.exe


<# end drivers list. #>


<# VS Studio, studio code, and visual C++ list. #>


start-process programs/MS/VSCodePreview.exe /s

start-process programs/MS/VSC++19x64.exe /s

start-process programs/MS/VSC++19x86.exe /s

start-process programs/MS/VSC++13x86.exe /s

start-process programs/MS/VSC++19x64.exe /s

start-process programs/MS/VSC++12x86.exe /s

start-process programs/MS/VSC++12x64.exe /s

start-process programs/MS/VSC++10x86.exe /s

start-process programs/MS/VSC++10x64.exe /s

start-process programs/MS/VSC++08x86.exe /s

start-process programs/MS/VSC++08x64.exe /s

start-process programs/MS/VSC++05x86.exe /s

start-process programs/MS/VSC++05x64.exe /s

start-process programs/MS/VS17.exe /s

start-process programs/MS/VS19.exe /s

start-process programs/MS/VS22.exe /s


<# end MS VS programs list. #>


echo "All of the selected programs and/or drivers has been installed successfully! You may have to restart your PC for changes to take effect!"


<# End of the script. #>
