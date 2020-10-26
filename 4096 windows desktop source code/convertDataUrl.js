const convertSong = (filePath) => {
  const songPromise = new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) { reject(err); }
      resolve(dataurl.convert({ data, mimetype: 'audio/mp3' }));
    });
  });
  return songPromise;
};