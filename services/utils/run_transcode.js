const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const processVideoToHLS = (inputPath, videoId) => {
  // RUTA ABSOLUTA CORRECTA PARA DOCKER
  const outputDir = path.join('/app', 'private_videos', videoId);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-profile:v baseline',
        '-level 3.0',
        '-start_number 0',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls'
      ])
      .output(path.join(outputDir, 'index.m3u8'))
      .on('start', (cmd) => console.log('Ffmpeg started:', videoId))
      .on('end', () => {
        console.log('Transcoding finished:', videoId);
        resolve(path.join(outputDir, 'index.m3u8'));
      })
      .on('error', (err) => {
        console.error('Ffmpeg Error:', err);
        reject(err);
      })
      .run();
  });
};

module.exports = { processVideoToHLS };
