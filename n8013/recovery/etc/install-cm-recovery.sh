#!/system/bin/sh
if [ -f /system/etc/recovery-transform.sh ]; then
  exec sh /system/etc/recovery-transform.sh 7051264 f435136e464cb86d467144dc69f4cf8277c8881c 4814848 1f2d64215b80b5ec907d1ff6de7855aac6a368fe
fi

if ! applypatch -c EMMC:/dev/block/mmcblk0p6:7051264:f435136e464cb86d467144dc69f4cf8277c8881c; then
  log -t recovery "Installing new recovery image"
  applypatch -b /system/etc/recovery-resource.dat EMMC:/dev/block/mmcblk0p5:4814848:1f2d64215b80b5ec907d1ff6de7855aac6a368fe EMMC:/dev/block/mmcblk0p6 f435136e464cb86d467144dc69f4cf8277c8881c 7051264 1f2d64215b80b5ec907d1ff6de7855aac6a368fe:/system/recovery-from-boot.p
else
  log -t recovery "Recovery image already installed"
fi
