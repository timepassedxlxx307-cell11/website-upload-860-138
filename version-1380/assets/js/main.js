(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = one('.menu-toggle');
    var panel = one('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = all('.hero-slide');
    var dots = all('.hero-dot');
    var prev = one('.hero-arrow-prev');
    var next = one('.hero-arrow-next');
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function setSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === active);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        setSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(active - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(active + 1);
        startTimer();
      });
    }

    setSlide(0);
    startTimer();
  }

  function setupSearch() {
    var panels = all('.search-panel');
    panels.forEach(function (panel) {
      var input = one('.js-search', panel);
      var category = one('.js-category-filter', panel);
      var year = one('.js-year-filter', panel);
      var region = one('.js-region-filter', panel);
      var scope = panel.closest('.search-scope') || document;
      var cards = all('.movie-card', scope);
      var empty = one('.empty-result', scope);

      function apply() {
        var term = normalize(input && input.value);
        var categoryValue = normalize(category && category.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.keywords,
            card.dataset.region,
            card.dataset.year,
            card.dataset.category
          ].join(' '));
          var matched = true;

          if (term && haystack.indexOf(term) === -1) {
            matched = false;
          }
          if (categoryValue && normalize(card.dataset.category) !== categoryValue) {
            matched = false;
          }
          if (yearValue && normalize(card.dataset.year) !== yearValue) {
            matched = false;
          }
          if (regionValue && normalize(card.dataset.region) !== regionValue) {
            matched = false;
          }

          card.classList.toggle('is-filtered-out', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, category, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
}());
