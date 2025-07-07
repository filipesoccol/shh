import {
    cryptoWorker,
    generateKeys,
    getPublicKey,
    decryptMessage,
    clearKeyCache,
} from './crypto.js';

// Global variables to store results
let currentResults = {};

// Wait for crypto.js to load and cryptoWorker to be available
function initializeCryptoHandlers() {
    if (!cryptoWorker) {
        // Wait a bit more for crypto.js to load
        setTimeout(initializeCryptoHandlers, 100);
        return;
    }

    // Override the crypto worker message handler to work with our UI
    cryptoWorker.onmessage = (event) => {
        const button = document.querySelector('.btn .loading').parentElement;
        const loading = button.querySelector('.loading');
        if (loading) loading.style.display = 'none';
        button.disabled = false;

        if (event.data.success) {
            const result = event.data.result;
            currentResults.lastResult = result;

            // Handle different types of results
            if (result && result.publicKey && result.privateKey) {
                // Full key generation
                showGeneratedKeys(result);
            } else if (typeof result === 'string' && result.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
                // Public key only
                showPublicKey(result);
            } else if (result === "Cache cleared") {
                // Cache cleared
                showCacheCleared();
            } else {
                // Decrypted data
                showDecryptedMessage(result);
            }
        } else {
            showError(event.data.error);
        }
    };
}

function handleDecrypt() {
    const form = document.getElementById('decryptForm');
    const formData = new FormData(form);
    const ciphertext = formData.get('ciphertext');

    if (!ciphertext) {
        showError('Please enter the encrypted message');
        return;
    }

    const button = form.querySelector('.btn');
    const loading = button.querySelector('.loading');
    loading.style.display = 'inline-block';
    button.disabled = true;

    hideResults();
    decryptMessage(ciphertext);
}

function handleClearCache() {
    const button = document.querySelector('#cacheResult').previousElementSibling;
    const loading = button.querySelector('.loading');
    loading.style.display = 'inline-block';
    button.disabled = true;

    hideResults();
    clearKeyCache();
}

// Display functions
function showGeneratedKeys(result) {
    const canvasContainer = document.querySelector('.canvas-container');

    // Animate canvas painter div - scale down and fade out
    if (canvasContainer) {
        gsap.to(canvasContainer, {
            scale: 0,
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                getPublicKey();
                if (window.canvasPainter) {
                    window.canvasPainter.destroy();
                }
            }
        });
    }

}

function showPublicKey(publicKey) {
    const resultDiv = document.getElementById('generateResult');
    // Create and show copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'btn';
    copyButton.innerHTML = '<span>Copy Public Key</span>';
    copyButton.onclick = () => {
        if (publicKey) {
            // Convert public key to base64
            const base64PublicKey = btoa(publicKey);

            navigator.clipboard.writeText(base64PublicKey).then(() => {
                copyButton.innerHTML = '<span>Copied!</span>';
                setTimeout(() => {
                    copyButton.innerHTML = '<span>Copy Public Key</span>';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    };

    resultDiv.innerHTML = '';
    resultDiv.appendChild(copyButton);
}

function showDecryptedMessage(message) {
    const resultDiv = document.getElementById('decryptResult');
    const messageDiv = document.getElementById('decryptedMessage');

    messageDiv.innerHTML = `<div class="key-display">${escapeHtml(message)}</div>`;
    resultDiv.classList.add('show');
    resultDiv.classList.remove('error');
}

function showCacheCleared() {
    const resultDiv = document.getElementById('cacheResult');
    const messageDiv = document.getElementById('cacheMessage');

    messageDiv.innerHTML = `<strong>Success:</strong> Key cache has been cleared successfully.`;
    resultDiv.classList.add('show');
    resultDiv.classList.remove('error');
}

function showError(error) {
    // Show error in the most recently used section
    const sections = ['generateResult', 'publicKeyResult', 'decryptResult', 'cacheResult'];
    const activeSection = sections.find(id => {
        const section = document.getElementById(id);
        return section && section.classList.contains('show');
    }) || 'generateResult';

    const resultDiv = document.getElementById(activeSection);
    resultDiv.innerHTML = `<strong>Error:</strong> ${escapeHtml(error)}`;
    resultDiv.classList.add('show', 'error');
}

function hideResults() {
    const results = document.querySelectorAll('.result');
    results.forEach(result => {
        result.classList.remove('show', 'error');
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize handlers when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCryptoHandlers();

    // Clear forms on page load
    document.querySelectorAll('form').forEach(form => form.reset());

    document.addEventListener('PasswordReady', (event) => {
        const { password } = event.detail;
        if (password) {
            generateKeys(password, 'username');
        }
    });

    // Set up event delegation for buttons
    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action]');
        if (!button) return;

        const action = button.dataset.action;

        switch (action) {
            case 'decrypt':
                handleDecrypt();
                break;
            case 'clearCache':
                handleClearCache();
                break;
        }
    });
});
