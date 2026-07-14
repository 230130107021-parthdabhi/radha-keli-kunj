/**
 * Radha Keli Kunj - Dynamic Content Loader
 * Loads Hindi or Gujarati content dynamically from JSON database assets.
 * Respects the language chosen on the home page (stored in localStorage).
 */

(function () {
    // 1. Determine the filename of the current page
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop().replace('.html', '') || 'index';

    if (filename === 'index') {
        return;
    }

    // 2. Keep cache of loaded book data
    let bookData = null;

    // 3. Function to render content based on selected language
    function render(data, lang) {
        if (!data) return;

        // Set document title
        document.title = data.title;

        // Set body font based on script requirements
        if (lang === 'gu') {
            // Dynamically load Google Font for Noto Serif Gujarati if not already present
            if (!document.querySelector('link[href*="Noto+Serif+Gujarati"]')) {
                const fontLink = document.createElement('link');
                fontLink.rel = 'stylesheet';
                fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:wght@400;500;600;700&display=swap';
                document.head.appendChild(fontLink);
            }
            document.body.style.fontFamily = "'Noto Serif Gujarati', serif";
        } else {
            document.body.style.fontFamily = "'Laila', 'LailaSemiBold', serif";
        }

        // Update Back Button
        const backBtn = document.querySelector('.back-dashboard-btn');
        if (backBtn) {
            const svg = backBtn.querySelector('svg');
            backBtn.innerHTML = '';
            if (svg) backBtn.appendChild(svg);
            backBtn.appendChild(document.createTextNode(' ' + data.backText));
        }

        // Update Page Heading (H2) if it is outside the content block (saints page)
        const pageH2 = document.querySelector('h2');
        if (pageH2) {
            pageH2.textContent = data.title;
            if (lang === 'gu') {
                pageH2.style.fontFamily = "'Noto Serif Gujarati', serif";
            } else {
                pageH2.style.fontFamily = "'Outfit', 'Laila', sans-serif";
            }
        }

        // Update TOC Button
        const tocBtn = document.getElementById('tocToggleBtn');
        if (tocBtn) {
            const svg = tocBtn.querySelector('svg');
            tocBtn.innerHTML = '';
            if (svg) tocBtn.appendChild(svg);
            tocBtn.appendChild(document.createTextNode(' ' + data.tocBtnText));
        }

        // Update TOC Dropdown
        const dropdown = document.getElementById('tocDropdown');
        if (dropdown) {
            dropdown.innerHTML = '';
            if (data.toc && data.toc.length > 0) {
                document.body.classList.add('has-toc');
                if (tocBtn) tocBtn.style.setProperty('display', 'flex', 'important');

                data.toc.forEach(item => {
                    const a = document.createElement('a');
                    a.href = `#${item.id}`;
                    a.textContent = item.text;
                    a.addEventListener('click', () => {
                        dropdown.classList.remove('open');
                    });
                    dropdown.appendChild(a);
                });

                // Initialize TOC open/close click listeners
                setupTocListeners();
            } else {
                document.body.classList.remove('has-toc');
                if (tocBtn) tocBtn.style.setProperty('display', 'none', 'important');
            }
        }

        // Update Content innerHTML
        const contentDiv = document.querySelector('.content');
        if (contentDiv && data.htmlContent) {
            contentDiv.innerHTML = data.htmlContent;
        }

        // Re-initialize slider if on the saints page
        if (filename === 'hamare-rasik-sant-evam-bhaktajan' && typeof window.initSaintSlider === 'function') {
            window.initSaintSlider();
        }
    }

    // Helper to setup TOC toggle button and document dismiss click listeners
    function setupTocListeners() {
        const toggleBtn = document.getElementById('tocToggleBtn');
        const dropdown = document.getElementById('tocDropdown');
        if (!toggleBtn || !dropdown) return;

        if (toggleBtn.getAttribute('data-listener-setup')) return;
        toggleBtn.setAttribute('data-listener-setup', 'true');

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== toggleBtn) {
                dropdown.classList.remove('open');
            }
        });
    }

    // 4. Fetch and load the JSON data
    async function loadBookData() {
        const lang = localStorage.getItem('preferredLanguage') || 'hi';

        try {
            const response = await fetch(`assets/data/${lang}/${filename}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load content data: ${response.statusText}`);
            }
            bookData = await response.json();
            render(bookData, lang);
        } catch (err) {
            console.error('Error loading content data:', err);
        }
    }

    // Init load on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadBookData);
    } else {
        loadBookData();
    }
})();
