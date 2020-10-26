const openFile = exports.openFile = () => {
  const files = dialog.showOpenDialog({
    title: 'Open File',
    properties: [ 'openFile' ],
    filters: [
      {name: 'Audio Files', extensions: ['mp3']},
    ]
  });

  if (!files) { return; }

  const filePath = files[0];
  return createSongObject(filePath);
};