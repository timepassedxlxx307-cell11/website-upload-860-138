(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    onReady(function () {
        document.querySelectorAll("[data-player]").forEach(function (panel) {
            var video = panel.querySelector("video");
            var button = panel.querySelector("[data-play]");
            var hls = null;
            if (!video || !button) {
                return;
            }
            var stream = video.getAttribute("data-stream") || "";

            function attachStream() {
                if (!stream) {
                    return;
                }
                if (video.getAttribute("src")) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        maxBufferLength: 40,
                        backBufferLength: 30,
                        enableWorker: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    return;
                }
                video.src = stream;
            }

            function startPlayback() {
                attachStream();
                panel.classList.add("is-playing");
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {
                        panel.classList.remove("is-playing");
                    });
                }
            }

            button.addEventListener("click", startPlayback);
            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            video.addEventListener("play", function () {
                panel.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.seeking) {
                    panel.classList.remove("is-playing");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    });
})();
