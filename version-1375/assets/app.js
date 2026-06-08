(function() {
    const navButton = document.querySelector('[data-mobile-nav-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let activeIndex = 0;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                setSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function() {
                setSlide(activeIndex + 1);
            }, 5200);
        }
    }

    const filterPanel = document.querySelector('[data-filter-panel]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const emptyState = document.querySelector('[data-empty-state]');

    if (filterPanel && cards.length) {
        const input = filterPanel.querySelector('[data-filter-input]');
        const typeSelect = filterPanel.querySelector('[data-filter-type]');
        const regionSelect = filterPanel.querySelector('[data-filter-region]');
        const genreSelect = filterPanel.querySelector('[data-filter-genre]');
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';

        if (query && input) {
            input.value = query;
        }

        function includesValue(source, value) {
            return !value || source.indexOf(value.toLowerCase()) !== -1;
        }

        function applyFilters() {
            const searchValue = input ? input.value.trim().toLowerCase() : '';
            const typeValue = typeSelect ? typeSelect.value.trim().toLowerCase() : '';
            const regionValue = regionSelect ? regionSelect.value.trim().toLowerCase() : '';
            const genreValue = genreSelect ? genreSelect.value.trim().toLowerCase() : '';
            let visibleCount = 0;

            cards.forEach(function(card) {
                const text = [
                    card.dataset.title || '',
                    card.dataset.type || '',
                    card.dataset.region || '',
                    card.dataset.genre || '',
                    card.dataset.year || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                const isVisible = includesValue(text, searchValue) &&
                    includesValue((card.dataset.type || '').toLowerCase(), typeValue) &&
                    includesValue((card.dataset.region || '').toLowerCase(), regionValue) &&
                    includesValue((card.dataset.genre || '').toLowerCase(), genreValue);

                card.hidden = !isVisible;
                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        [input, typeSelect, regionSelect, genreSelect].forEach(function(element) {
            if (element) {
                element.addEventListener('input', applyFilters);
                element.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }
}());
