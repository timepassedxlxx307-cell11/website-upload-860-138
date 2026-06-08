function initPlayer(source) {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playerOverlay');
    var button = document.getElementById('playButton');
    var attached = false;
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }
      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        return new Promise(function (resolve) {
          hlsInstance = new Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hlsInstance.on(Hls.Events.ERROR, function () {
            resolve();
          });
        });
      }
      video.src = source;
      return Promise.resolve();
    }

    function start() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      attach().then(function () {
        var playAction = video.play();
        if (playAction && typeof playAction.catch === 'function') {
          playAction.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}
