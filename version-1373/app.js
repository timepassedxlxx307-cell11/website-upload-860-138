(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('.menu-toggle');
    var nav = qs('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initArchiveTools() {
    var input = qs('.filter-input');
    var select = qs('.sort-select');
    var container = qs('[data-card-container]');
    if (!container) {
      return;
    }
    var cards = qsa('.movie-card', container);
    var original = cards.slice();

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('is-filtered-out', keyword && text.indexOf(keyword) === -1);
      });
    }

    function sortCards() {
      var value = select ? select.value : 'default';
      var sorted = original.slice();
      if (value === 'rating') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
        });
      }
      if (value === 'views') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
        });
      }
      if (value === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }
      sorted.forEach(function (card) {
        container.appendChild(card);
      });
      cards = qsa('.movie-card', container);
      filterCards();
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }
    if (select) {
      select.addEventListener('change', sortCards);
    }
  }

  function prepareVideo(video) {
    if (!video || video.getAttribute('data-ready') === '1') {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = stream;
    }
    video.setAttribute('data-ready', '1');
  }

  function startVideo(video) {
    prepareVideo(video);
    if (!video) {
      return;
    }
    var shell = video.closest('.player-shell');
    var overlay = shell ? qs('.play-overlay', shell) : null;
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {});
    }
  }

  function initPlayers() {
    qsa('.player-shell').forEach(function (shell) {
      var video = qs('.video-player', shell);
      var button = qs('[data-play-button]', shell);
      if (button) {
        button.addEventListener('click', function () {
          startVideo(video);
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            startVideo(video);
          }
        });
        video.addEventListener('play', function () {
          var overlay = qs('.play-overlay', shell);
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
      }
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-wrap" href="' + escapeHtml(item.link) + '" aria-label="' + escapeHtml(item.title) + '">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="duration">' + escapeHtml(item.duration) + '</span>',
      '<span class="type-badge">' + escapeHtml(item.type) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="' + escapeHtml(item.link) + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>★ ' + escapeHtml(item.rating) + '</span></div>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var results = qs('#searchResults');
    var input = qs('#searchInput');
    var summary = qs('#searchSummary');
    var empty = qs('#emptyState');
    if (!results || !input || !summary || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(keyword) {
      var query = keyword.trim().toLowerCase();
      if (!query) {
        results.innerHTML = '';
        summary.textContent = '输入关键词开始搜索';
        if (empty) {
          empty.style.display = '';
        }
        return;
      }
      var matched = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        return item.searchText.indexOf(query) !== -1;
      }).slice(0, 120);
      results.innerHTML = matched.map(cardTemplate).join('');
      summary.textContent = '搜索结果：' + keyword;
      if (empty) {
        empty.style.display = matched.length ? 'none' : '';
      }
    }

    input.addEventListener('input', function () {
      render(input.value);
    });
    render(initial);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initArchiveTools();
    initPlayers();
    initSearchPage();
  });
})();
