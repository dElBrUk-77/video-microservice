// HLS Player Setup (Snippet para el frontend)
function initSecurePlayer(videoId, tempJwtToken) {
  const video = document.getElementById('secure-video');
  const streamUrl = `/api/stream/${videoId}/index.m3u8`;

  // Prevenir click derecho
  video.addEventListener('contextmenu', e => e.preventDefault());

  if (Hls.isSupported()) {
    const hls = new Hls({
      xhrSetup: function(xhr, url) {
        // Inyectar JWT en cada petición de fragmento
        xhr.setRequestHeader('Authorization', `Bearer ${tempJwtToken}`);
      }
    });
    
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Para Safari nativo (se asume JWT en cookie o params)
    video.src = `${streamUrl}?token=${tempJwtToken}`;
  }
}
