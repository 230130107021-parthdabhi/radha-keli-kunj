/**
 * Transliterates Devanagari (Hindi/Sanskrit) text into Gujarati script.
 * Unicode Devanagari (0900-097F) is shifted to Gujarati (0A80-0AFF) by adding 0x0180.
 * Preserves HTML tags, attributes, and common punctuation marks like dandas (। and ॥).
 */
function transliterateDevanagariToGujarati(text) {
    if (!text) return '';
    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        // Devanagari range is U+0900 to U+097F
        if (code >= 0x0900 && code <= 0x097F) {
            // Preserve Devanagari danda (। U+0964) and double danda (॥ U+0965) as they are used in both scripts
            if (code === 0x0964 || code === 0x0965) {
                return char;
            }
            return String.fromCharCode(code + 0x0180);
        }
        return char;
    }).join('');
}

// Export to window for browser use and module.exports for Node.js use
if (typeof window !== 'undefined') {
    window.transliterateDevanagariToGujarati = transliterateDevanagariToGujarati;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { transliterateDevanagariToGujarati };
}
