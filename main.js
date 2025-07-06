// Import crypto functions
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

// Event handlers
function handleGenerateKeys() {
    const form = document.getElementById('generateKeysForm');
    const formData = new FormData(form);
    const scribble = formData.get('scribble');
    const userId = formData.get('userId');

    if (!scribble || !userId) {
        showError('Please fill in all fields');
        return;
    }

    const button = form.querySelector('.btn');
    const loading = button.querySelector('.loading');
    loading.style.display = 'inline-block';
    button.disabled = true;

    hideResults();
    generateKeys(scribble, userId);
}

function handleGetPublicKey() {
    const button = document.querySelector('#publicKeyResult').previousElementSibling;
    const loading = button.querySelector('.loading');
    loading.style.display = 'inline-block';
    button.disabled = true;

    hideResults();
    getPublicKey();
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
    const resultDiv = document.getElementById('generateResult');
    const keysDiv = document.getElementById('generatedKeys');

    keysDiv.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4>Public Key:</h4>
            <div class="key-display">${escapeHtml(result.publicKey)}</div>
        </div>
        <div>
            <h4>Private Key:</h4>
            <div class="key-display">${escapeHtml(result.privateKey)}</div>
        </div>
    `;

    resultDiv.classList.add('show');
    resultDiv.classList.remove('error');
}

function showPublicKey(publicKey) {
    const resultDiv = document.getElementById('publicKeyResult');
    const keyDiv = document.getElementById('publicKeyDisplay');

    keyDiv.textContent = publicKey;
    resultDiv.classList.add('show');
    resultDiv.classList.remove('error');
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
window.addEventListener('load', () => {
    initializeCryptoHandlers();

    // Clear forms on page load
    document.querySelectorAll('form').forEach(form => form.reset());

    // Set up event delegation for buttons
    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action]');
        if (!button) return;

        const action = button.dataset.action;

        switch (action) {
            case 'generateKeys':
                handleGenerateKeys();
                break;
            case 'getPublicKey':
                handleGetPublicKey();
                break;
            case 'decrypt':
                handleDecrypt();
                break;
            case 'clearCache':
                handleClearCache();
                break;
        }
    });
});
