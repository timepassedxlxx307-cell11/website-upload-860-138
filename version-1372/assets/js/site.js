(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    show(0);
    play();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function renderResults(input, box) {
    var query = normalize(input.value);
    var data = window.MOVIE_SEARCH_INDEX || [];
    if (!query) {
      box.innerHTML = "";
      box.classList.remove("is-open");
      return;
    }
    var results = data.filter(function (item) {
      return [item.title, item.genre, item.tags, item.region, item.year, item.category].some(function (value) {
        return normalize(value).indexOf(query) !== -1;
      });
    }).slice(0, 12);
    if (!results.length) {
      box.innerHTML = '<div class="search-result-item"><span><strong>暂无匹配内容</strong><span>换个关键词试试</span></span></div>';
      box.classList.add("is-open");
      return;
    }
    box.innerHTML = results.map(function (item) {
      return '<a class="search-result-item" href="' + item.href + '">' +
        '<img src="' + item.image + '" alt="' + escapeText(item.title) + '">' +
        '<span><strong>' + escapeText(item.title) + '</strong><span>' + escapeText(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></span>' +
        '</a>';
    }).join("");
    box.classList.add("is-open");
  }

  function escapeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupGlobalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".global-search"));
    inputs.forEach(function (input) {
      var box = input.parentElement.querySelector(".search-results");
      if (!box) {
        return;
      }
      input.addEventListener("input", function () {
        renderResults(input, box);
      });
      input.addEventListener("focus", function () {
        renderResults(input, box);
      });
      document.addEventListener("click", function (event) {
        if (!input.parentElement.contains(event.target)) {
          box.classList.remove("is-open");
        }
      });
    });
  }

  function setupLocalFilters() {
    var list = document.querySelector("[data-card-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var search = document.querySelector("[data-local-search]");
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var empty = document.querySelector("[data-empty-state]");

    function update() {
      var query = normalize(search ? search.value : "");
      var activeFilters = filters.map(function (filter) {
        return {
          key: filter.getAttribute("data-filter"),
          value: normalize(filter.value)
        };
      });
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesFilters = activeFilters.every(function (filter) {
          if (!filter.value) {
            return true;
          }
          return normalize(card.getAttribute("data-" + filter.key)).indexOf(filter.value) !== -1;
        });
        var show = matchesQuery && matchesFilters;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (search) {
      search.addEventListener("input", update);
    }
    filters.forEach(function (filter) {
      filter.addEventListener("change", update);
    });
    update();
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    window.addEventListener("scroll", function () {
      button.classList.toggle("is-visible", window.scrollY > 620);
    });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilters();
    setupBackTop();
  });
})();
