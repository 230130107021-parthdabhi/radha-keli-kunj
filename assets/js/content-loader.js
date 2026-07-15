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



    // 2. Add bottom controller styles dynamically to the page head
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .verse-nav-sidebar {
            display: none !important;
        }
        .content h2 {
            margin-bottom: 30px;
            border-bottom: 2px solid #881337;
            padding-bottom: 15px;
            display: inline-block;
            max-width: 100%;
            overflow-wrap: break-word;
            word-wrap: break-word;
            box-sizing: border-box;
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
        .bottom-controller-bar {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: max-content;
            max-width: calc(100% - 40px);
            height: 60px;
            background-color: #ffffff;
            border: 1px solid #e7e5e4;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            padding: 0 16px;
            box-sizing: border-box;
            border-radius: 30px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
            z-index: 2000;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
        }
        .bottom-controller-bar.collapsed {
            transform: translate(-50%, 100px);
            opacity: 0;
            pointer-events: none;
        }
        .bottom-controller-btn {
            background: transparent;
            border: none;
            color: #881337;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 50%;
            transition: all 0.2s ease;
            text-decoration: none;
        }
        .bottom-controller-btn:hover:not(.disabled) {
            background-color: rgba(136, 19, 55, 0.08);
        }
        .bottom-controller-btn.disabled {
            opacity: 0.25;
            cursor: not-allowed;
            pointer-events: none;
        }
        .bottom-controller-btn svg {
            width: 24px;
            height: 24px;
        }
        .controller-expand-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 48px;
            height: 48px;
            background-color: #ffffff;
            border: 1px solid #e7e5e4;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #881337;
            cursor: pointer;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
            z-index: 1999;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: scale(0);
            pointer-events: none;
        }
        .controller-expand-btn.visible {
            transform: scale(1);
            pointer-events: auto;
        }
        .controller-expand-btn:hover {
            background-color: rgba(136, 19, 55, 0.08);
            transform: scale(1.1);
        }
        .controller-expand-btn svg {
            width: 24px;
            height: 24px;
        }
        body {
            padding-bottom: 100px !important;
        }
        .zoom-dropdown-container {
            position: fixed;
            top: 25px;
            right: 25px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            font-family: 'Outfit', sans-serif;
        }
        .zoom-dropdown-trigger {
            background-color: #ffffff;
            border: 1px solid #e7e5e4;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #881337;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            transition: all 0.25s ease;
        }
        .zoom-dropdown-trigger:hover {
            background-color: rgba(136, 19, 55, 0.08);
            transform: scale(1.05);
        }
        .zoom-dropdown-menu {
            position: absolute;
            top: 55px;
            right: 0;
            background-color: #ffffff;
            border: 1px solid #e7e5e4;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .zoom-dropdown-menu.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .zoom-dropdown-btn {
            background: transparent;
            border: none;
            color: #881337;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 50%;
            transition: all 0.2s ease;
        }
        .zoom-dropdown-btn:hover {
            background-color: rgba(136, 19, 55, 0.08);
        }
        .zoom-dropdown-btn svg {
            width: 20px;
            height: 20px;
        }
        #tocDropdown a.active {
            background-color: rgba(136, 19, 55, 0.08) !important;
            color: #881337 !important;
            font-weight: 600 !important;
        }
        @media (max-width: 1280px) {
            .zoom-dropdown-container {
                position: absolute;
                top: 20px;
                right: 20px;
            }
            #tocToggleBtn, .toc-toggle-btn {
                display: none !important;
            }
        }
        .global-video-toggle-container {
            position: fixed;
            top: 25px;
            right: 25px;
            z-index: 1000;
            display: flex;
            align-items: center;
            font-family: 'Outfit', sans-serif;
        }
        .global-video-toggle-btn {
            background-color: #ffffff;
            border: 1px solid #e7e5e4;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #881337;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            transition: all 0.25s ease;
        }
        .global-video-toggle-btn:hover {
            background-color: rgba(136, 19, 55, 0.08);
            transform: scale(1.05);
        }
        .global-video-toggle-btn svg {
            width: 22px;
            height: 22px;
        }
        @media (max-width: 1280px) {
            .global-video-toggle-container {
                position: absolute;
                top: 20px;
                right: 20px;
            }
        }
        @media (max-width: 767px) {
            #tocToggleBtn {
                display: none !important;
            }
            #tocDropdown, .toc-dropdown {
                position: fixed !important;
                top: auto !important;
                bottom: 90px !important;
                left: 50% !important;
                right: auto !important;
                transform: translateX(-50%) translateY(10px) !important;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                width: calc(100% - 40px) !important;
                max-width: 340px !important;
                max-height: 50vh !important;
            }
            #tocDropdown.open, .toc-dropdown.open {
                transform: translateX(-50%) translateY(0) !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            .content h2 {
                font-size: 1.3em !important;
            }
        }
        .project-resource-loader {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 250px;
            width: 100%;
        }
        .project-loader-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(136, 19, 55, 0.1);
            border-left-color: #881337;
            border-radius: 50%;
            animation: project-spin 0.8s linear infinite;
        }
        @keyframes project-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styleEl);

    // Zoom controller helper state and functions (default zoom based on user device)
    let currentZoom = window.innerWidth <= 767 ? 85 : 100;
    function zoomIn() {
        currentZoom = Math.min(200, currentZoom + 10);
        applyZoom();
    }
    function zoomOut() {
        currentZoom = Math.max(50, currentZoom - 10);
        applyZoom();
    }
    function resetZoom() {
        currentZoom = window.innerWidth <= 767 ? 85 : 100;
        applyZoom();
    }
    function applyZoom() {
        const contentEl = document.querySelector('.content');
        if (contentEl) {
            contentEl.style.fontSize = `${1.8 * (currentZoom / 100)}em`;
        }
    }

    // Global YouTube player visibility toggle state & handler
    let isVideoHidden = localStorage.getItem('globalVideoHidden') === 'true';
    window.toggleGlobalVideo = function () {
        isVideoHidden = !isVideoHidden;
        localStorage.setItem('globalVideoHidden', isVideoHidden);

        // Let onContentUpdate handle updating the DOM and button layout
        onContentUpdate();
    };



    // Hide/Show controller helpers
    function hideController() {
        const bar = document.getElementById('bottomControllerBar');
        const expandBtn = document.getElementById('controllerExpandBtn');
        if (bar && expandBtn) {
            bar.classList.add('collapsed');
            expandBtn.classList.add('visible');
            bar.style.setProperty('display', 'none', 'important');
            expandBtn.style.setProperty('display', 'flex', 'important');
        }
    }
    function showController() {
        const bar = document.getElementById('bottomControllerBar');
        const expandBtn = document.getElementById('controllerExpandBtn');
        if (bar && expandBtn) {
            bar.classList.remove('collapsed');
            expandBtn.classList.remove('visible');
            bar.style.setProperty('display', 'flex', 'important');
            expandBtn.style.setProperty('display', 'none', 'important');
        }
    }

    // Main Bottom Controller initializer
    let isBottomControllerInitialized = false;
    function initBottomController() {
        if (isBottomControllerInitialized) return;
        isBottomControllerInitialized = true;

        const bar = document.createElement('div');
        bar.id = 'bottomControllerBar';
        bar.className = 'bottom-controller-bar';

        // 1. Chapters button
        const tocBtn = document.createElement('button');
        tocBtn.id = 'controllerTocBtn';
        tocBtn.className = 'bottom-controller-btn';
        tocBtn.title = 'Chapters';
        tocBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>`;
        bar.appendChild(tocBtn);

        // 2. Zoom Out (-)
        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'bottom-controller-btn';
        zoomOutBtn.title = 'Zoom Out';
        zoomOutBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" /></svg>`;
        zoomOutBtn.addEventListener('click', zoomOut);
        bar.appendChild(zoomOutBtn);

        // 3. Zoom In (+)
        const zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'bottom-controller-btn';
        zoomInBtn.title = 'Zoom In';
        zoomInBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`;
        zoomInBtn.addEventListener('click', zoomIn);
        bar.appendChild(zoomInBtn);

        // 4. Reset zoom
        const resetBtn = document.createElement('button');
        resetBtn.className = 'bottom-controller-btn';
        resetBtn.title = 'Reset Zoom';
        resetBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>`;
        resetBtn.addEventListener('click', resetZoom);
        bar.appendChild(resetBtn);

        // 5. Scroll to Media button (🎵)
        const mediaBtn = document.createElement('button');
        mediaBtn.id = 'controllerMediaBtn';
        mediaBtn.className = 'bottom-controller-btn';
        mediaBtn.title = 'Scroll to Video';
        mediaBtn.style.display = 'none';
        mediaBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 10l12-3M9 19c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-3c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" /></svg>`;
        mediaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const videoEl = document.querySelector('.video-container');
            if (videoEl) {
                videoEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        bar.appendChild(mediaBtn);

        // 6. Prev Verse (<)
        const prevBtn = document.createElement('a');
        prevBtn.id = 'prevVerseBtn';
        prevBtn.className = 'bottom-controller-btn';
        prevBtn.title = 'Previous';
        prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`;
        bar.appendChild(prevBtn);

        // 7. Next Verse (>)
        const nextBtn = document.createElement('a');
        nextBtn.id = 'nextVerseBtn';
        nextBtn.className = 'bottom-controller-btn';
        nextBtn.title = 'Next';
        nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>`;
        bar.appendChild(nextBtn);

        // 8. Collapse controller (v)
        const collapseBtn = document.createElement('button');
        collapseBtn.className = 'bottom-controller-btn';
        collapseBtn.title = 'Hide Controller';
        collapseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" /></svg>`;
        collapseBtn.addEventListener('click', hideController);
        bar.appendChild(collapseBtn);

        document.body.appendChild(bar);

        // Expand float button
        const expandBtn = document.createElement('button');
        expandBtn.id = 'controllerExpandBtn';
        expandBtn.className = 'controller-expand-btn';
        expandBtn.title = 'Show Controller';
        expandBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>`;
        expandBtn.addEventListener('click', showController);
        document.body.appendChild(expandBtn);

        // Toggle drop down TOC listener
        const dropdown = document.getElementById('tocDropdown');
        if (dropdown) {
            tocBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && e.target !== tocBtn) {
                    dropdown.classList.remove('open');
                }
            });
        }

        // Create top-right zoom dropdown container
        const zoomContainer = document.createElement('div');
        zoomContainer.id = 'zoomDropdownContainer';
        zoomContainer.className = 'zoom-dropdown-container';
        zoomContainer.style.display = 'none';

        const zoomTrigger = document.createElement('button');
        zoomTrigger.className = 'zoom-dropdown-trigger';
        zoomTrigger.title = 'Text Zoom';
        zoomTrigger.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>`;
        zoomContainer.appendChild(zoomTrigger);

        const zoomMenu = document.createElement('div');
        zoomMenu.className = 'zoom-dropdown-menu';

        const dropdownZoomOutBtn = document.createElement('button');
        dropdownZoomOutBtn.className = 'zoom-dropdown-btn';
        dropdownZoomOutBtn.title = 'Zoom Out';
        dropdownZoomOutBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" /></svg>`;
        dropdownZoomOutBtn.addEventListener('click', zoomOut);
        zoomMenu.appendChild(dropdownZoomOutBtn);

        const dropdownZoomInBtn = document.createElement('button');
        dropdownZoomInBtn.className = 'zoom-dropdown-btn';
        dropdownZoomInBtn.title = 'Zoom In';
        dropdownZoomInBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`;
        dropdownZoomInBtn.addEventListener('click', zoomIn);
        zoomMenu.appendChild(dropdownZoomInBtn);

        const dropdownResetBtn = document.createElement('button');
        dropdownResetBtn.className = 'zoom-dropdown-btn';
        dropdownResetBtn.title = 'Reset Zoom';
        dropdownResetBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>`;
        dropdownResetBtn.addEventListener('click', resetZoom);
        zoomMenu.appendChild(dropdownResetBtn);

        zoomContainer.appendChild(zoomMenu);
        document.body.appendChild(zoomContainer);

        zoomTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            zoomMenu.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!zoomMenu.contains(e.target) && e.target !== zoomTrigger) {
                zoomMenu.classList.remove('open');
            }
        });

        // Create global video toggle container
        const videoToggleContainer = document.createElement('div');
        videoToggleContainer.id = 'globalVideoToggleContainer';
        videoToggleContainer.className = 'global-video-toggle-container';
        videoToggleContainer.style.display = 'none';

        const videoToggleBtn = document.createElement('button');
        videoToggleBtn.id = 'globalVideoToggleBtn';
        videoToggleBtn.className = 'global-video-toggle-btn';
        videoToggleBtn.title = 'Hide Video Players';
        videoToggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
        videoToggleBtn.addEventListener('click', toggleGlobalVideo);

        videoToggleContainer.appendChild(videoToggleBtn);
        document.body.appendChild(videoToggleContainer);
    }

    // Helper to refresh zoom, media, chapters, and nav button visibility on active content render
    function onContentUpdate() {
        applyZoom();

        // Apply global video hidden preference to any newly rendered containers
        const videoContainers = document.querySelectorAll('.video-container');
        videoContainers.forEach(container => {
            container.style.display = isVideoHidden ? 'none' : 'block';
        });

        // Sync the state/icon of the global toggle button in the top-right
        const toggleBtn = document.getElementById('globalVideoToggleBtn');
        if (toggleBtn) {
            if (isVideoHidden) {
                toggleBtn.title = "Show Video Players";
                toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>`;
            } else {
                toggleBtn.title = "Hide Video Players";
                toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
            }
        }

        // Update Media scroll button display
        const mediaBtn = document.getElementById('controllerMediaBtn');
        if (mediaBtn) {
            // Only show media button if player is present AND not hidden by user AND not on ashtyam page
            const hasVideo = document.querySelector('.video-container') !== null && document.querySelector('.video-container').style.display !== 'none';
            mediaBtn.style.display = (hasVideo && filename !== 'ashtyam') ? 'flex' : 'none';
        }

        // Update Chapters button display
        const tocBtn = document.getElementById('controllerTocBtn');
        if (tocBtn) {
            const hasToc = bookData && bookData.toc && bookData.toc.length > 0;
            tocBtn.style.display = hasToc ? 'flex' : 'none';
        }

        // Update Navigation buttons display (hide if no verses navigation is needed)
        const prevBtn = document.getElementById('prevVerseBtn');
        const nextBtn = document.getElementById('nextVerseBtn');
        let hasVerses = false;
        if (prevBtn && nextBtn) {
            hasVerses = bookData && bookData.verses && bookData.verses.length > 0;
            prevBtn.style.display = hasVerses ? 'flex' : 'none';
            nextBtn.style.display = hasVerses ? 'flex' : 'none';
        }

        // Update visibility of the global video toggle button in top-right
        const hasVideoContainer = document.querySelector('.video-container') !== null;
        const globalVideoToggle = document.getElementById('globalVideoToggleContainer');
        if (globalVideoToggle) {
            globalVideoToggle.style.display = hasVideoContainer ? 'flex' : 'none';
        }

        // Dynamically toggle between bottom bar & top-right zoom dropdown
        const hasToc = bookData && bookData.toc && bookData.toc.length > 0;
        // Only trigger bottom bar media control if video player is currently shown
        const hasVideo = document.querySelector('.video-container') !== null && document.querySelector('.video-container').style.display !== 'none';

        const isBottomControllerNeeded = hasToc || hasVideo || hasVerses;

        const bar = document.getElementById('bottomControllerBar');
        const expandBtn = document.getElementById('controllerExpandBtn');
        const zoomContainer = document.getElementById('zoomDropdownContainer');

        if (isBottomControllerNeeded) {
            // Show bottom controller (honoring user collapse state)
            if (bar && expandBtn) {
                if (bar.classList.contains('collapsed')) {
                    bar.style.setProperty('display', 'none', 'important');
                    expandBtn.style.setProperty('display', 'flex', 'important');
                } else {
                    bar.style.setProperty('display', 'flex', 'important');
                    expandBtn.style.setProperty('display', 'none', 'important');
                }
            }
            if (zoomContainer) {
                zoomContainer.style.setProperty('display', 'none', 'important');
            }
        } else {
            // Hide bottom controller completely & show top-right zoom dropdown instead
            if (bar) bar.style.setProperty('display', 'none', 'important');
            if (expandBtn) expandBtn.style.setProperty('display', 'none', 'important');
            if (zoomContainer) {
                zoomContainer.style.setProperty('display', 'flex', 'important');
            }
        }
        highlightCurrentChapter();
    }

    // Helper to highlight the active chapter in the TOC dropdown
    function highlightCurrentChapter() {
        const dropdown = document.getElementById('tocDropdown');
        if (!dropdown || !bookData) return;

        let hashId = window.location.hash.substring(1);
        const hasIntro = bookData.intro && bookData.intro.trim() !== '';
        if (!hashId || hashId === '') {
            hashId = hasIntro ? 'intro' : (bookData.verses && bookData.verses[0] ? bookData.verses[0].id : '');
        }

        const links = dropdown.querySelectorAll('a');
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (href === `#${hashId}`) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });
    }

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
            onContentUpdate();
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
            onContentUpdate();
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
            onContentUpdate();
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
        onContentUpdate();
    }

    // 4. Function to render content based on loaded data and selected language
    function render(data, lang) {
        if (!data) return;

        // Initialize bottom controller bar
        initBottomController();

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
                if (tocBtn) tocBtn.style.display = 'flex';

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
                if (tocBtn) tocBtn.style.display = 'none';
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

        // Render project theme-based resource loader (circle only)
        const contentDiv = document.querySelector('.content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div class="project-resource-loader">
                    <div class="project-loader-spinner"></div>
                </div>
            `;
        }

        const pathname = window.location.pathname;
        const pathParts = pathname.split('/');
        const parentDir = pathParts[pathParts.length - 2];
        const isGroupDir = filename !== 'hamare-rasik-sant-evam-bhaktajan' && filename !== 'index';
        const basePrefix = isGroupDir ? '../' : '';
        const fetchDir = isGroupDir ? `${parentDir}/` : '';

        const delayPromise = new Promise(resolve => setTimeout(resolve, 400));

        try {
            const fetchPromise = fetch(`${basePrefix}assets/data/${currentLang}/${fetchDir}${filename}.json`)
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`Failed to load content data: ${response.statusText}`);
                    }
                    return response.json();
                });

            const [data] = await Promise.all([fetchPromise, delayPromise]);
            bookData = data;
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
