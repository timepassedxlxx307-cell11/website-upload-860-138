(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    onReady(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            function start() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-slide")) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            show(0);
            start();
        });

        document.querySelectorAll("[data-search-box]").forEach(function (box) {
            var input = box.querySelector("[data-site-search]");
            var results = box.querySelector("[data-search-results]");
            var index = window.siteSearchIndex || [];
            if (!input || !results) {
                return;
            }

            function render() {
                var query = normalize(input.value);
                if (query.length < 1) {
                    results.classList.remove("open");
                    results.innerHTML = "";
                    return;
                }
                var matches = index.filter(function (item) {
                    return normalize(item.title + " " + item.region + " " + item.type + " " + item.genre + " " + item.tags).indexOf(query) !== -1;
                }).slice(0, 12);
                results.innerHTML = matches.map(function (item) {
                    return '<a class="search-result-item" href="./' + item.url + '"><img src="./' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '"><span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span></a>';
                }).join("");
                results.classList.toggle("open", matches.length > 0);
            }

            input.addEventListener("input", render);
            document.addEventListener("click", function (event) {
                if (!box.contains(event.target)) {
                    results.classList.remove("open");
                }
            });
        });

        document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
            var grid = document.querySelector("[data-card-grid]");
            var input = bar.querySelector("[data-card-search]");
            var type = bar.querySelector("[data-card-type]");
            var year = bar.querySelector("[data-card-year]");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

            function applyFilter() {
                var query = normalize(input && input.value);
                var selectedType = normalize(type && type.value);
                var selectedYear = normalize(year && year.value);
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-tags"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var visible = true;
                    if (query && haystack.indexOf(query) === -1) {
                        visible = false;
                    }
                    if (selectedType && cardType.indexOf(selectedType) === -1) {
                        visible = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        visible = false;
                    }
                    card.classList.toggle("is-hidden", !visible);
                });
            }

            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
        });
    });
})();
