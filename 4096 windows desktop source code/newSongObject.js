const getDuration = (filePath) => {
  const durationPromise = new Promise((resolve, reject) => {
    mp3Duration(filePath, (err, duration) => {
      if (duration) {
        resolve(duration);
      }
      if (err) { reject(err); }
    });
  });
  return durationPromise;
};

const getTags = (track) => {
  const { filePath } = track;
  const tagsPromise = new Promise((resolve, reject) => {
    id3({ file: filePath, type: id3.OPEN_LOCAL }, (err, tags) => {
      if (tags) {
        const { title, album, artist } = tags;
        Object.assign(track, { title, album, artist, track: tags.v1.track });
        resolve(track);
      }
      if (err) { reject(err); }
    });
  });
  return tagsPromise;
};

const createSongObject = (filePath) => {
  const track = {};
  return getDuration(filePath)
  .then((duration) => Object.assign(track, { duration, filePath }))
  .then((track) => getTags(track));
};