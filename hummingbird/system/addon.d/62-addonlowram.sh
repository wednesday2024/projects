#!/sbin/sh
#
# Copyright 2017 Adrian DC
#

# Variables
PROPERTY='ro.config.low_ram';
VALUE='true';

# System path
if [ ! "$(getprop 'go.build.system_root_image')" = 'true' ]; then
  system_path='/system';
else
  system_path='/system/system';
fi;

# Backuptool
case "$1" in
  backup)
    # Stub
  ;;
  restore)
    # Modify or add propertyif
    if grep -q "${PROPERTY}" "${system_path}/build.prop"; then
      sed -i "s/\(${PROPERTY}\)=.*/\1=${VALUE}/g" "${system_path}/build.prop";
    else
      echo "${PROPERTY}=${VALUE}" >> "${system_path}/build.prop";
    fi;
  ;;
  pre-backup)
    # Stub
  ;;
  post-backup)
    # Stub
  ;;
  pre-restore)
    # Stub
  ;;
  post-restore)
    # Stub
  ;;
esac;
