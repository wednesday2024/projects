# Guide for repack   
 
_Read this only in github for better view,_
_Repack "may or may not" work with all ROMs_
_This guide is not for official or Stock ROMs_ 
_and I don't think I will be able to provide any repack GUIDE for NOUGHT(or try below method if it works)_

## INFORMATION 

  _If you are using cyanogenmod ROM, you may find something in the updater-script, That is **"if range_sha1(........."** this executs in the script after extraction of system.new.dat to the **"system partition"**, which verifies **SAH-1** values of the system.new.dat, if the values are the same, the scripts succeeds and the flashing completes, if not, then the script returns 
   **"abort("system partition has unexpected non-zero contents after OTA update");"**.
  This problem can be solved by changing the old values of the system.new.dat with the current one and here is how to do it._

**NOTE**
* **"if range_sha1(........."**  _a line found in the updater-script of android 6.x ROMs_
* **SHA-1** (Secure Hash Algorithm **1**)
* **system partition** _partition where your OTA flashes files_
* **If your updater-script does not contain the above lines, then don't follow this guide, simply just replace your old files with the recently created ones (old-files=system.new.dat, system.transfer.list)** 

## Download these for further need

  * Extractor.bat

  * ROM (with file_contexts, or it will be useless)

  * For nought try to convert file_contexts.bin(binary file) to file_contexts(readable file), for conversion tool search XDA

  * ZIP sign - already included in extractor
  
## Instructions

Sample of "updater-script" of cyanogenmod ROM (**INITIAL**)
(Note: Removed some lines of script)

```
if range_sha1("/dev/block/platform/msm_sdcc.1/by-name/system", "36,0,32770,32849,32851,33331,65535,65536,65538,98304,98306,98385,98387,98867,131071,131072,131074,163840,163842,163921,163923,164403,185342,196608,196610,229376,229378,229457,229459,262144,262146,294912,294914,294993,294995,295475,307199") == "0b20303394271424267e36a0ce7573f1b62ddc0d" then

if range_sha1("/dev/block/platform/msm_sdcc.1/by-name/system", "48,32770,32849,32851,33331,65535,65536,65538,66050,97792,98304,98306,98385,98387,98867,131071,131072,131074,131586,163328,163840,163842,163921,163923,164403,185342,185854,196096,196608,196610,197122,228864,229376,229378,229457,229459,229971,261632,262144,262146,262658,294400,294912,294914,294993,294995,295475,307199,307200") == "16902dcea1b74f8c9451cb2245c51465d949ec7e" then

ui_print("Verified the updated system image.");


else
   abort("system partition has unexpected non-zero contents after OTA update");
endif;
```
* As you can see, there is "if range_sha1" on the script, see below example-
```
 
if range_sha1("/dev/block/platform/msm_sdcc.1/by-name/system", "36,0,32770,32849,32851,33331,65535,65536,65538,98304,98306,98385,98387,98867,131071,131072,131074,163840,163842,163921,163923,164403,185342,196608,196610,229376,229378,229457,229459,262144,262146,294912,294914,294993,294995,295475,307199") == "0b20303394271424267e36a0ce7573f1b62ddc0d" then

if range_sha1("/dev/block/platform/msm_sdcc.1/by-name/system", "48,32770,32849,32851,33331,65535,65536,65538,66050,97792,98304,98306,98385,98387,98867,131071,131072,131074,131586,163328,163840,163842,163921,163923,164403,185342,185854,196096,196608,196610,197122,228864,229376,229378,229457,229459,229971,261632,262144,262146,262658,294400,294912,294914,294993,294995,295475,307199,307200") == "16902dcea1b74f8c9451cb2245c51465d949ec7e" then
```

* After **.../by-name/system"**, This line(from **"36,.....to 307199"**) was also found in system.trasfer.list of the same ROM
```  
  "36,0,32770,32849,32851..........294995,295475,307199") == "0b20303394271424267e36a0ce7573f1b62ddc0d" then
  
  "48,32770,32849,32851,..........,295475,307199,307200") == "16902dcea1b74f8c9451cb2245c51465d949ec7e" then
```     
* Also line
  ```
  "0b20303394271424267e36a0ce7573f1b62ddc0d" 
  ``` 
  is equal to the **SHA-1 value**  of the system.new.dat and 
  ```
  "16902dcea1b74f8c9451cb2245c51465d949ec7e"
  ```
  it is also equal to the **SAH-1 value** of the "same" **system.new.dat**
  
  (**SHA-1 value or Secure Hash Algorithm 1 value**)
  
 * From above, there are two different values of **SHA-1** of the same file, and two different **SHA-1** value of a **"single"** file is not possible or I don't know. So either these two values might of different things(files/or maybe numbers).
 

* In the system.transfer.list of the CM13 ROM, it contains -
```
3
130069
0
0
new 36,0,32770,32849,32851,33331,65535,65536,65538,98304,98306,98385,98387,98867,131071,131072,131074,163840,163842,163921,163923,164403,185544,196608,196610,229376,229378,229457,229459,262144,262146,294912,294914,294993,294995,295475,307199
zero 48,32770,32849,32851,33331,65535,65536,65538,66050,97792,98304,98306,98385,98387,98867,131071,131072,131074,131586,163328,163840,163842,163921,163923,164403,185544,186056,196096,196608,196610,197122,228864,229376,229378,229457,229459,229971,261632,262144,262146,262658,294400,294912,294914,294993,294995,295475,307199,307200
erase 12,66050,97792,131586,163328,186056,196096,197122,228864,229971,261632,262658,294400
```

* You can see here command 
```      
	new 36,0,32770,32849,32851.........to the end  
	  
	zero 48,32770,32849,32851,.........to the end  
```	  
	matches range_sha1 of the updater-script --------->  ```"36,0,32770,32849,32851,........294995,295475,307199") == "0b20303394271424267e36a0ce7573f1b62ddc0d" then
	
    matches range_sha1 of updater-script --------->  "48,32770,32849,32851,..........,295475,307199,307200") == "16902dcea1b74f8c9451cb2245c51465d949ec7e" then```

    (I hope that you get it)

* So the system.transfer.list and the updater-script has a link of "**SAH-1**" and "**transfer**" commands
* Now change this into right, after repack you have three files 
```
   system.new.dat
   system.transfer.list
   "sha1_system.txt" which contains sha1 check of system.new.dat
   
```
* **NOTE**:- **transfer** commands means numbers beside "new" & "zero" in system.transfer.list, refer to xpirit guide
 
## Let's repack ROM
 
* First open Extractor.bat

* Choose option "**2 Repack system.new.dat**"
 
* Choose **1 (manual mode)** --> **Repack ( file_contexts is required)**
 
* Copy your sub folders for example:- addon.d, app, bin, fonts, framework, buile.prop, etc., to system folder (this message will also displayed in the extractor).
   
* Then place the **"file_contexts"** beside the system folder
   
### Some info. on ROM zip 
* A "CUSTOM" ROM ZIP CONTAINS:
```

*   system                (FOLDER)
   
*   META-INF              (FOLDER)
   
*   install               (FOLDER)
   
*   system.transfer.list  (FILE)
   
*   system.patch.dat      (FILE)
   
*   system.new.dat        (FILE)
   
*   file_contexts         (FILE)
   
*   boot.img              (FILE)
   
```
_(In the Stock ROM, there may be more files that are present)_

   **(FOR MARSHMALLOW AN LOLLIPOP)**  If you unable to find the (file_contexts) in the zip file, then extract the ramdisk from the boot.img
   and look for the "file_contexts" inside the ramdisk folder (search XDA for methods) _or_ try to explore your **ROM/device_source**

   _IMP : Do not use other "file_contexts" or dummy "file_contexts", because, it can cause the device to bootloop_ 
 
* Hit enter if you have done above 
 
* The extractor creates three files as output :-
 ```  
   system.new.dat
   system.transfer.list
   sha1_system.txt      -->  A new fresh **SHA-1** value of system.new.dat
 ```
 * Now copy the system.new.dat & the system.transfer.list to the ROM folder
 
 * Open the system.transfer.list :-
 
### In my case it (system.transfer.list) looks like this
```

1
124680
erase 2,0,129024
new 76,0,32,33,164,539,692,696,13549,13550,14263,14264,14313,14314,14374,14375,14507,14520,14522,14527,14657,14670,14672,14677,14805,14818,14820,14825,16941,16942,32767,32768,32770,32801,32802,33307,36711,36714,42767,42774,42988,42989,50105,50107,50114,50120,50141,50142,50143,50162,52431,52432,55597,55600,65535,65536,65537,66042,89668,89674,93810,93811,97042,97043,97070,97122,98100,98304,98306,98337,98338,98843,98844,100859,128209,128212,129023
```

* This is totally different from the old system.transfer.list (FOUND ON THE START OF THIS GUIDE)
 
* On comparing, there is no "zero" command

* Now copy the new line --> **"76,0,32,33,............,128212,129023"** from the system.transfer.list to the updater-script (see below)
 
 * Part of the updater-script where "range_sha1" exists.
 ```

if range_sha1("/dev/block/platform/msm_sdcc.1/by-name/system", "76,0,32,33,164,539,692,696,13549,13550,14263,14264,14313,14314,14374,14375,14507,14520,14522,14527,14657,14670,14672,14677,14805,14818,14820,14825,16941,16942,32767,32768,32770,32801,32802,33307,36711,36714,42767,42774,42988,42989,50105,50107,50114,50120,50141,50142,50143,50162,52431,52432,55597,55600,65535,65536,65537,66042,89668,89674,93810,93811,97042,97043,97070,97122,98100,98304,98306,98337,98338,98843,98844,100859,128209,128212,129023") == "0b20303394271424267e36a0ce7573f1b62ddc0d" then

if range_sha1("/dev/block/platform/msm_sdcc.1/by-name/system", "76,0,32,33,164,539,692,696,13549,13550,14263,14264,14313,14314,14374,14375,14507,14520,14522,14527,14657,14670,14672,14677,14805,14818,14820,14825,16941,16942,32767,32768,32770,32801,32802,33307,36711,36714,42767,42774,42988,42989,50105,50107,50114,50120,50141,50142,50143,50162,52431,52432,55597,55600,65535,65536,65537,66042,89668,89674,93810,93811,97042,97043,97070,97122,98100,98304,98306,98337,98338,98843,98844,100859,128209,128212,129023") == "16902dcea1b74f8c9451cb2245c51465d949ec7e" then

```


* **As you can see above what I have done, I've replaced transfer commands in** 
 
``` if range_sha1("/dev/block/platform/msm_sdcc.1/by-name/system", ```"**REPLACED COMMANDS/paste above coiped lines**"```) == "16902dcea1b74f8c9451cb2245c51465d949ec7e" then```

_Please just replace your system.new.transfer list "new" values with the updater-script "if range_sha1" values_
 
* **Now just look at this**
```
........,129023") == "0b20303394271424267e36a0ce7573f1b62ddc0d" then

........,129023") == "16902dcea1b74f8c9451cb2245c51465d949ec7e" then 

```

* There are **two different SHA-1 values**  (ofc sha1_sums == 0b20303394271424267e36a0ce7573f1b62ddc0d and 16902dcea1b74f8c9451cb2245c51465d949ec7e) **"Here we are talking about unmodified updateR-script"**
   
 **1st-->  0b20303394271424267e36a0ce7573f1b62ddc0d**
   
 **2nd-->  16902dcea1b74f8c9451cb2245c51465d949ec7e**
 
* Now just open **"sha1_system.txt"** that was generated recently by the extractor, inside it, you will find something like this:
``` 

//
// File Checksum Integrity Verifier version 2.05.
//
bdd6a7e1352232b97db4286cc21fdc8ea91d40f7 system.new.dat

```
* Replace this value **bdd6a7e1352232b97db4286cc21fdc8ea91d40f7** with the old **"SHA-1"** values, 

* example/like this:
```
........,129023") == "bdd6a7e1352232b97db4286cc21fdc8ea91d40f7" then

........,129023") == "bdd6a7e1352232b97db4286cc21fdc8ea91d40f7" then 

```

_Both of the lines must be assigned with the same SHA-1 value_

* **After that, the updater-script script will somewhat look like this**:-
 (**FINAL**)
 
```
if range_sha1("/dev/block/platform/msm_sdcc.1/by-name/system", "76,0,32,33,164,539,692,696,13549,13550,14263,14264,14313,14314,14374,14375,14507,14520,14522,14527,14657,14670,14672,14677,14805,14818,14820,14825,16941,16942,32767,32768,32770,32801,32802,33307,36711,36714,42767,42774,42988,42989,50105,50107,50114,50120,50141,50142,50143,50162,52431,52432,55597,55600,65535,65536,65537,66042,89668,89674,93810,93811,97042,97043,97070,97122,98100,98304,98306,98337,98338,98843,98844,100859,128209,128212,129023") == "bdd6a7e1352232b97db4286cc21fdc8ea91d40f7" then

if range_sha1("/dev/block/platform/msm_sdcc.1/by-name/system", "76,0,32,33,164,539,692,696,13549,13550,14263,14264,14313,14314,14374,14375,14507,14520,14522,14527,14657,14670,14672,14677,14805,14818,14820,14825,16941,16942,32767,32768,32770,32801,32802,33307,36711,36714,42767,42774,42988,42989,50105,50107,50114,50120,50141,50142,50143,50162,52431,52432,55597,55600,65535,65536,65537,66042,89668,89674,93810,93811,97042,97043,97070,97122,98100,98304,98306,98337,98338,98843,98844,100859,128209,128212,129023") == "bdd6a7e1352232b97db4286cc21fdc8ea91d40f7" then

ui_print("Verified the updated system image.");


else
  abort("system partition has unexpected non-zero contents after OTA update");
endif;


else
  abort("system partition has unexpected contents after OTA update");
endif;
```

* **You can clearly point out the difference between the _INITIAL_ updater-script (see start of the guide) and the _FINAL_ upater-script (above)**

* The both "range_sha1" line in the **INITIAL updater-script** and the **FINAL updater-script** differs.

* Also in the final script, both the "**SHA-1**" values become equal to each other, and their transfer commands values becomes equal as well.
 (refer to the xpirit guide for the transfer commands)

* That's all, save the updater-script, repack the ROM to the ZIP (Use 7-zip) and sign xyz_ROM.zip (optional) for the official Recovery, for TWRP do not sign the file, disable zip signing from the settings of TWRP.

* Then flash it, and wait for 5 minutes for the device to boot. If it works, then you're good to go.

**I hope though you got it**

## NOTE  

**_And yes if you think this method is useless then please don't use it, I have tried my best to write this guide for the
noobs, so that they can understand how to edit the updater-script._**  -Ryzen5-3600
