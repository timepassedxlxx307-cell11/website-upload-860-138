(function () {
    var body = document.body;
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.hidden = !mobilePanel.hidden;
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function setHero(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            clearInterval(timer);
            timer = setInterval(function () {
                setHero(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setHero(index);
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                setHero(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setHero(current + 1);
                startHero();
            });
        }

        setHero(0);
        startHero();
    }

    var searchLayer = document.querySelector('.search-layer');
    var searchResults = document.querySelector('.search-results');
    var searchClose = document.querySelector('.search-close');

    function openSearch(query) {
        if (!searchLayer || !searchResults) {
            return;
        }
        var value = (query || '').trim().toLowerCase();
        var index = window.SEARCH_INDEX || [];
        var matches = index.filter(function (item) {
            return !value || item.text.toLowerCase().indexOf(value) !== -1;
        }).slice(0, 36);
        if (!matches.length) {
            searchResults.innerHTML = '<p>未找到相关影片</p>';
        } else {
            searchResults.innerHTML = matches.map(function (item) {
                return [
                    '<a class="search-result-card" href="' + item.href + '">',
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '海报" loading="lazy">',
                    '<span>',
                    '<strong>' + escapeHtml(item.title) + '</strong>',
                    '<span>' + escapeHtml(item.meta) + '</span>',
                    '<p>' + escapeHtml(item.summary) + '</p>',
                    '</span>',
                    '</a>'
                ].join('');
            }).join('');
        }
        searchLayer.hidden = false;
        body.classList.add('no-scroll');
    }

    function closeSearch() {
        if (searchLayer) {
            searchLayer.hidden = true;
            body.classList.remove('no-scroll');
        }
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[character];
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('form[role="search"]')).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[type="search"]');
            openSearch(input ? input.value : '');
        });
    });

    if (searchClose) {
        searchClose.addEventListener('click', closeSearch);
    }

    if (searchLayer) {
        searchLayer.addEventListener('click', function (event) {
            if (event.target === searchLayer) {
                closeSearch();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]')).forEach(function (root) {
        var input = root.querySelector('[data-local-search]');
        var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-filter-type]'));
        var grid = root.parentElement.querySelector('.movie-grid');
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-card]')) : [];
        var activeType = '';

        function filterCards() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var search = card.getAttribute('data-search') || '';
                var type = card.getAttribute('data-type') || '';
                var showByKeyword = !keyword || search.indexOf(keyword) !== -1;
                var showByType = !activeType || type === activeType;
                card.hidden = !(showByKeyword && showByType);
            });
        }

        if (input) {
            input.addEventListener('input', filterCards);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeType = button.getAttribute('data-filter-type') || '';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                filterCards();
            });
        });
    });

    var player = document.querySelector('[data-player]');
    if (player) {
        var overlay = document.querySelector('.player-overlay');
        var stream = player.getAttribute('data-stream');
        var initialized = false;
        var hlsInstance = null;

        function initPlayer() {
            if (initialized || !stream) {
                return;
            }
            initialized = true;
            if (player.canPlayType('application/vnd.apple.mpegurl')) {
                player.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(player);
            } else {
                player.src = stream;
            }
        }

        function playMovie() {
            initPlayer();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var result = player.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playMovie);
        }

        player.addEventListener('click', function () {
            if (!initialized) {
                playMovie();
            }
        });

        player.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        player.addEventListener('ended', function () {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        });
    }
})();
