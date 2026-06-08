(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mainNav = document.querySelector("[data-main-nav]");
    if (menuToggle && mainNav) {
      menuToggle.addEventListener("click", function () {
        mainNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      }

      function start() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });
      show(0);
      start();
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var form = scope.querySelector("[data-filter-form]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");
      if (!form || !cards.length) {
        return;
      }
      var input = form.querySelector("[data-search-input]");
      var region = form.querySelector("[data-filter-region]");
      var type = form.querySelector("[data-filter-type]");
      var year = form.querySelector("[data-filter-year]");

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var visibleCount = 0;

        cards.forEach(function (card) {
          var keywords = card.getAttribute("data-keywords") || "";
          var title = card.getAttribute("data-title") || "";
          var matchKeyword = !keyword || keywords.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
          var matchRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var visible = matchKeyword && matchRegion && matchType && matchYear;
          card.style.display = visible ? "" : "none";
          if (visible) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      [input, region, type, year].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      apply();
    });
  });
}());
