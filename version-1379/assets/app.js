
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-nav-links]");
    var search = document.querySelector(".top-search");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      if (search) {
        search.classList.toggle("is-open");
      }
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      slides[index].classList.remove("is-active");
      if (dots[index]) {
        dots[index].classList.remove("active");
      }
      index = next;
      slides[index].classList.add("is-active");
      if (dots[index]) {
        dots[index].classList.add("active");
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5600);
  }

  function initSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var empty = document.querySelector("[data-search-empty]");
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute("data-text") || "";
        var matched = keyword === "" || text.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    input.addEventListener("input", apply);
    apply();
  }

  function initPlayers() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    panels.forEach(function (panel) {
      var video = panel.querySelector("video");
      var button = panel.querySelector("[data-play-button]");
      var status = panel.querySelector("[data-player-status]");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-source");
      if (source) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && status) {
              status.textContent = "视频加载异常，请稍后再试";
            }
          });
        } else {
          video.src = source;
        }
      }
      function togglePlay() {
        if (video.paused) {
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              if (status) {
                status.textContent = "请再次点击播放";
              }
            });
          }
        } else {
          video.pause();
        }
      }
      if (button) {
        button.addEventListener("click", togglePlay);
      }
      video.addEventListener("click", togglePlay);
      video.addEventListener("play", function () {
        panel.classList.add("is-playing");
        if (status) {
          status.textContent = "";
        }
      });
      video.addEventListener("pause", function () {
        panel.classList.remove("is-playing");
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
}());
