/**
 * Radha Keli Kunj - Dynamic Content Loader (Rebuilt From Scratch)
 * Handles client-side routing, layout updates, language font loading, and verse-by-verse navigation.
 */

(function () {
    // 1. Determine the filename of the current page
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop().replace('.html', '') || 'index';

    // If we're on the dashboard home page, do nothing (handled by index.html script)
    if (filename === 'index') {
        return;
    }



    // 2. Add verse navigation styles dynamically to the page head
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .verse-nav-sidebar {
            position: fixed;
            bottom: 40px;
            left: 25px;
            display: flex;
            gap: 12px;
            z-index: 1000;
            font-family: 'Outfit', sans-serif;
        }
        .verse-nav-btn {
            background-color: #ffffff;
            border: 1px solid #e7e5e4;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #881337;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            transition: all 0.25s ease;
            text-decoration: none;
        }
        .verse-nav-btn:hover:not(.disabled) {
            background-color: #881337;
            color: #ffffff;
            border-color: #881337;
            box-shadow: 0 8px 20px rgba(136, 19, 55, 0.15);
            transform: translateY(-2px);
        }
        .verse-nav-btn.disabled {
            opacity: 0.25;
            cursor: not-allowed;
            pointer-events: none;
        }
        .content h2.book-title {
            margin-bottom: 30px;
            border-bottom: 2px solid #881337;
            padding-bottom: 15px;
            display: inline-block;
        }
        .verse-heading-card {
            font-family: 'Outfit', 'Laila', sans-serif;
            color: #b45309;
            background-color: #fdfaf2;
            border: 1px solid #f6e3c5;
            border-radius: 14px;
            padding: 10px 24px;
            display: inline-block;
            margin-top: 10px;
            margin-bottom: 25px;
            font-size: 1.1em;
            font-weight: 600;
            box-shadow: 0 4px 10px rgba(180, 83, 9, 0.03);
            line-height: 1.4;
        }
        
        /* Floating layout on screens under 1280px */
        @media (max-width: 1280px) {
            .verse-nav-sidebar {
                bottom: 20px;
                right: 20px;
                left: auto;
            }
        }
    `;
    document.head.appendChild(styleEl);

    // 3. Global states
    let bookData = null;
    let currentLang = 'hi';

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

    // Update navigation buttons link targets and enabled/disabled state
    function updateNavButtons(state, data) {
        let navSidebar = document.querySelector('.verse-nav-sidebar');
        if (!navSidebar) {
            navSidebar = document.createElement('div');
            navSidebar.className = 'verse-nav-sidebar';
            
            const prevBtn = document.createElement('a');
            prevBtn.id = 'prevVerseBtn';
            prevBtn.className = 'verse-nav-btn';
            prevBtn.title = 'Previous';
            prevBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 20px; height: 20px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            `;
            
            const nextBtn = document.createElement('a');
            nextBtn.id = 'nextVerseBtn';
            nextBtn.className = 'verse-nav-btn';
            nextBtn.title = 'Next';
            nextBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 20px; height: 20px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            `;
            
            navSidebar.appendChild(prevBtn);
            navSidebar.appendChild(nextBtn);
            document.body.appendChild(navSidebar);
        }

        const prevBtn = document.getElementById('prevVerseBtn');
        const nextBtn = document.getElementById('nextVerseBtn');

        if (prevBtn && nextBtn) {
            let prevHref = '';
            let nextHref = '';

            if (state === 'intro') {
                prevHref = '';
                nextHref = data.verses[0] ? `#${data.verses[0].id}` : '';
            } else {
                const activeIdx = state;
                const hasIntro = data.intro && data.intro.trim() !== '';
                prevHref = activeIdx === 0 ? (hasIntro ? '#intro' : '') : `#${data.verses[activeIdx - 1].id}`;
                nextHref = activeIdx === data.verses.length - 1 ? '' : `#${data.verses[activeIdx + 1].id}`;
            }

            if (prevHref) {
                prevBtn.setAttribute('href', prevHref);
                prevBtn.classList.remove('disabled');
            } else {
                prevBtn.removeAttribute('href');
                prevBtn.classList.add('disabled');
            }

            if (nextHref) {
                nextBtn.setAttribute('href', nextHref);
                nextBtn.classList.remove('disabled');
            } else {
                nextBtn.removeAttribute('href');
                nextBtn.classList.add('disabled');
            }
        }

        // Scroll page content smoothly to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Helper to render structured verse content which could contain video elements or text
    function renderVerseContent(verse) {
        if (!verse) return '';
        if (Array.isArray(verse.content)) {
            let html = '';
            verse.content.forEach((item, idx) => {
                if (item.type === 'video') {
                    html += `<div class="video-container"><iframe src="https://www.youtube.com/embed/${item.videoId}" allowfullscreen allowtransparency allow="autoplay; encrypted-media; picture-in-picture"></iframe></div>`;
                } else if (item.type === 'text') {
                    const lines = item.value.split(/\r?\n/);
                    let textHtml = '';
                    let currentPara = [];
                    lines.forEach(line => {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('व्याख्या -') || trimmed.startsWith('વ્યાખ્યા -') || trimmed.startsWith('भावार्थ-') || trimmed.startsWith('ભાવાર્થ-')) {
                            if (currentPara.length > 0) {
                                textHtml += currentPara.join('\n') + '\n';
                                currentPara = [];
                            }
                            textHtml += `<div class="vyakhya">${trimmed}</div>\n`;
                        } else {
                            currentPara.push(line);
                        }
                    });
                    if (currentPara.length > 0) {
                        textHtml += currentPara.join('\n');
                    }
                    if (filename === 'ashtyam') {
                        html += `<div class="text-card">${textHtml}</div>`;
                    } else {
                        html += textHtml;
                        if (idx < verse.content.length - 1) {
                            html += '\n\n';
                        }
                    }
                }
            });
            return html;
        } else {
            return verse.content;
        }
    }

    // Render appropriate verse/intro or fallback to full content
    function updateActiveContent() {
        const contentDiv = document.querySelector('.content');
        if (!contentDiv || !bookData) return;

        // 1. Fallback for books without verse-specific splits (like short books)
        if (!bookData.verses) {
            // Remove navigation buttons if they exist
            const navSidebar = document.querySelector('.verse-nav-sidebar');
            if (navSidebar) navSidebar.remove();

            // Special dynamic rendering for saints slider page
            if (filename === 'hamare-rasik-sant-evam-bhaktajan' && bookData.saints) {
                let html = '<div class="slider-track" id="sliderTrack">';
                bookData.saints.forEach(saint => {
                    const altText = saint.name.replace(/\n/g, ' ');
                    const displayName = saint.name.replace(/\n/g, '<br />');
                    html += `
        <div class="card">
            <div class="image-container">
                <img src="${saint.image}" alt="${altText}" />
            </div>
            <p>${displayName}</p>
        </div>`;
                });
                html += '</div>';
                contentDiv.innerHTML = html;

                // Re-initialize slider if on the saints page
                if (typeof window.initSaintSlider === 'function') {
                    window.initSaintSlider();
                }
            } else if (filename === 'mangalacharan' && bookData.sections) {
                let html = `<h2>${bookData.title}</h2>\n`;
                bookData.sections.forEach(section => {
                    if (section.heading) {
                        html += `<h3>${section.heading}</h3>\n`;
                    }
                    if (section.verse) {
                        html += `${section.verse}\n`;
                    }
                    if (section.translation) {
                        html += `<div class="vyakhya">${section.translation}</div>\n`;
                    }
                    html += '\n';
                });
                contentDiv.innerHTML = html;
            } else if (bookData.content) {
                const lines = bookData.content.split(/\r?\n/);
                let html = `<h2>${bookData.title}</h2>\n`;
                let currentPara = [];
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('व्याख्या -') || trimmed.startsWith('વ્યાખ્યા -') || trimmed.startsWith('भावार्थ-') || trimmed.startsWith('ભાવાર્થ-')) {
                        if (currentPara.length > 0) {
                            html += currentPara.join('\n') + '\n';
                            currentPara = [];
                        }
                        html += `<div class="vyakhya">${trimmed}</div>\n`;
                    } else {
                        currentPara.push(line);
                    }
                });
                if (currentPara.length > 0) {
                    html += currentPara.join('\n');
                }
                contentDiv.innerHTML = html;
            } else if (bookData.htmlContent) {
                contentDiv.innerHTML = bookData.htmlContent;
            }
            return;
        }

        // 2. Render structured verse-split book (e.g. Shri Hit Chaurasi Ji)
        let hashId = window.location.hash.substring(1);
        const hasIntro = bookData.intro && bookData.intro.trim() !== '';

        if (!hashId || hashId === '') {
            hashId = hasIntro ? 'intro' : (bookData.verses[0] ? bookData.verses[0].id : 'intro');
        }

        if (hashId === 'intro' && hasIntro) {
            contentDiv.innerHTML = bookData.intro || '';
            updateNavButtons('intro', bookData);
            return;
        }

        let activeIdx = bookData.verses.findIndex(v => v.id === hashId);
        if (activeIdx === -1) {
            // Fallback to intro or verse 1
            if (hasIntro) {
                contentDiv.innerHTML = bookData.intro;
                updateNavButtons('intro', bookData);
            } else if (bookData.verses[0]) {
                const firstVerse = bookData.verses[0];
                let displayHtml = `<div style="text-align: center;"><h2 class="book-title">${bookData.title}</h2></div>`;
                if (filename === 'ashtyam' && bookData.toc) {
                    const tocItem = bookData.toc.find(t => t.id === firstVerse.id);
                    if (tocItem) {
                        displayHtml += `<div style="margin-bottom: 20px;"><h3>${tocItem.text}</h3></div>`;
                    }
                }
                displayHtml += renderVerseContent(firstVerse);
                contentDiv.innerHTML = displayHtml;
                updateNavButtons(0, bookData);
            }
            return;
        }

        const activeSection = bookData.verses[activeIdx];
        let displayHtml = `<div style="text-align: center;"><h2 class="book-title">${bookData.title}</h2></div>`;
        if (filename === 'ashtyam' && bookData.toc) {
            const tocItem = bookData.toc.find(t => t.id === activeSection.id);
            if (tocItem) {
                displayHtml += `<div style="margin-bottom: 20px;"><h3>${tocItem.text}</h3></div>`;
            }
        }
        displayHtml += renderVerseContent(activeSection);
        contentDiv.innerHTML = displayHtml;

        updateNavButtons(activeIdx, bookData);
    }

    // 4. Function to render content based on loaded data and selected language
    function render(data, lang) {
        if (!data) return;

        // Set document title
        document.title = data.title;

        // Set body font based on script requirements
        if (lang === 'gu') {
            if (!document.querySelector('link[href*="Noto+Serif+Gujarati"]')) {
                const fontLink = document.createElement('link');
                fontLink.rel = 'stylesheet';
                fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:wght@400;500;600;700&display=swap';
                document.head.appendChild(fontLink);
            }
            document.body.style.fontFamily = "'Noto Serif Gujarati', serif";
            
            // Override explicit font-family styles (like .vyakhya) for Gujarati
            let overrideStyle = document.getElementById('gu-font-override');
            if (!overrideStyle) {
                overrideStyle = document.createElement('style');
                overrideStyle.id = 'gu-font-override';
                overrideStyle.textContent = `
                    .vyakhya, .content, .content * {
                        font-family: 'Noto Serif Gujarati', serif !important;
                    }
                `;
                document.head.appendChild(overrideStyle);
            }
        } else {
            document.body.style.fontFamily = "'Laila', 'LailaSemiBold', serif";
            
            // Remove Gujarati font override style if it exists
            const overrideStyle = document.getElementById('gu-font-override');
            if (overrideStyle) {
                overrideStyle.remove();
            }
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

                // If this is a verse-split layout and has an intro, add the Intro link at the top of TOC
                const hasIntro = data.intro && data.intro.trim() !== '';
                if (data.verses && hasIntro) {
                    const introLink = document.createElement('a');
                    introLink.href = '#intro';
                    introLink.textContent = lang === 'gu' ? 'પ્રસ્તાવના / Intro' : 'प्रस्तावना / Intro';
                    introLink.addEventListener('click', () => {
                        dropdown.classList.remove('open');
                    });
                    dropdown.appendChild(introLink);
                }

                data.toc.forEach(item => {
                    const a = document.createElement('a');
                    a.href = `#${item.id}`;
                    a.textContent = item.text;
                    a.addEventListener('click', () => {
                        dropdown.classList.remove('open');
                    });
                    dropdown.appendChild(a);
                });

                // If this is a verse-split layout with an outro, add it at the bottom of TOC
                if (data.verses && data.verses.some(v => v.id === 'outro')) {
                    const outroLink = document.createElement('a');
                    outroLink.href = '#outro';
                    
                    let outroText = '';
                    if (filename === 'shri-hit-chaurasi-ji') {
                        outroText = lang === 'gu' ? 'ફલસ્તુતિ / Falstuti' : 'फलस्तुति / Falstuti';
                    } else {
                        outroText = lang === 'gu' ? 'વિશ્રામ / Concluding Prayers' : 'विश्राम / Concluding Prayers';
                    }
                    
                    outroLink.textContent = outroText;
                    outroLink.addEventListener('click', () => {
                        dropdown.classList.remove('open');
                    });
                    dropdown.appendChild(outroLink);
                }

                // Initialize TOC open/close click listeners
                setupTocListeners();
            } else {
                document.body.classList.remove('has-toc');
                if (tocBtn) tocBtn.style.setProperty('display', 'none', 'important');
            }
        }

        // Update active content (handles verse routing)
        updateActiveContent();

        // Re-initialize slider if on the saints page
        if (filename === 'hamare-rasik-sant-evam-bhaktajan' && typeof window.initSaintSlider === 'function') {
            window.initSaintSlider();
        }
    }

    // 5. Fetch and load the JSON data
    async function loadBookData() {
        currentLang = localStorage.getItem('preferredLanguage') || 'hi';

        try {
            const response = await fetch(`assets/data/${currentLang}/${filename}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load content data: ${response.statusText}`);
            }
            bookData = await response.json();
            render(bookData, currentLang);
        } catch (err) {
            console.error('Error loading content data:', err);
        }
    }

    // 6. Listen to Hash Changes to update verse page content
    window.addEventListener('hashchange', () => {
        updateActiveContent();
    });

    // 7. Listen to keydown events for Left and Right Arrow navigation
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }
        if (e.key === 'ArrowLeft') {
            const prevBtn = document.getElementById('prevVerseBtn');
            if (prevBtn && !prevBtn.classList.contains('disabled')) {
                const href = prevBtn.getAttribute('href');
                if (href) {
                    window.location.hash = href;
                }
            }
        } else if (e.key === 'ArrowRight') {
            const nextBtn = document.getElementById('nextVerseBtn');
            if (nextBtn && !nextBtn.classList.contains('disabled')) {
                const href = nextBtn.getAttribute('href');
                if (href) {
                    window.location.hash = href;
                }
            }
        }
    });

    // Init load on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadBookData);
    } else {
        loadBookData();
    }
})();
