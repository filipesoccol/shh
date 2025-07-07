import {
    cryptoWorker,
    generateKeys,
    getPublicKey,
    decryptMessage,
    clearKeyCache,
    storePublicKey,
    encryptMessage,
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
            } else if (result === "Public key stored successfully") {
                // Public key stored
                console.log("Public key stored successfully");
            } else if (typeof result === 'string' && result.includes('-----BEGIN PGP MESSAGE-----')) {
                // Encrypted message
                showEncryptedMessage(result);
            } else {
                console.log(result)
                // Decrypted data
                showDecryptedMessage(result);
            }
        } else {
            console.error("Crypto worker error:", event.data.error);
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

function handleEncrypt() {
    const form = document.getElementById('encryptForm');
    const formData = new FormData(form);
    const plaintext = formData.get('plaintext');

    if (!plaintext) {
        showError('Please enter a message to encrypt');
        return;
    }

    const button = form.querySelector('.btn');
    const loading = button.querySelector('.loading');
    loading.style.display = 'inline-block';
    button.disabled = true;

    hideResults();
    encryptMessage(plaintext);
}

// Display functions
function showGeneratedKeys(result) {
    const flipContainer = document.getElementById('canvasFlipContainer');

    if (flipContainer) {
        // Trigger the flip animation
        flipContainer.classList.add('flipped');

        // Get the public key and show it on the back
        setTimeout(() => {
            getPublicKey();
            if (window.canvasPainter) {
                window.canvasPainter.destroy();
            }
        }, 400); // Wait for half the flip animation
    }
}

function showPublicKey(publicKey) {
    const flipBackButton = document.getElementById('flipBackButton');

    // Create and show copy button on the back of the card
    const copyButton = document.createElement('button');
    copyButton.className = 'btn';
    copyButton.innerHTML = '<span>Copy Public Key</span>';
    copyButton.onclick = () => {
        if (publicKey) {
            // Convert public key to base64
            const base64PublicKey = btoa(publicKey);

            const link = `${window.location.host}/?key=${base64PublicKey}`;

            navigator.clipboard.writeText(link).then(() => {
                copyButton.innerHTML = '<span>Copied!</span>';
                setTimeout(() => {
                    copyButton.innerHTML = '<span>Copy Public Key</span>';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    };

    flipBackButton.innerHTML = '';
    flipBackButton.appendChild(copyButton);

    // Also clear the generateResult div since we're showing the button on the card back
    const resultDiv = document.getElementById('generateResult');
    resultDiv.innerHTML = '';
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

    // Flip the card back to show canvas again
    const flipContainer = document.getElementById('canvasFlipContainer');
    if (flipContainer && flipContainer.classList.contains('flipped')) {
        flipContainer.classList.remove('flipped');

        // Clear the back button
        const flipBackButton = document.getElementById('flipBackButton');
        if (flipBackButton) {
            flipBackButton.innerHTML = '';
        }
    }
}

function flipBackToCanvas() {
    const flipContainer = document.getElementById('canvasFlipContainer');
    if (flipContainer) {
        flipContainer.classList.remove('flipped');

        // Clear the back button
        const flipBackButton = document.getElementById('flipBackButton');
        if (flipBackButton) {
            flipBackButton.innerHTML = '';
        }
    }
}

function showEncryptMode() {
    const canvasContainer = document.querySelector('.canvas-container');
    const generateResult = document.getElementById('generateResult');
    const encryptSection = document.getElementById('encryptSection');

    // Hide the canvas container since we're in encrypt mode
    if (canvasContainer) {
        canvasContainer.style.display = 'none';
    }

    // Show the encrypt section
    if (encryptSection) {
        encryptSection.style.display = 'block';
    }

    // Show message that we're ready to encrypt
    generateResult.innerHTML = `
        <div class="key-display">
            <strong>Encrypt Mode Active</strong><br>
            Public key loaded from URL. You can now encrypt messages to send to the key owner.
        </div>
    `;
    generateResult.classList.add('show');
    generateResult.classList.remove('error');
}

function showEncryptedMessage(encryptedMessage) {
    const resultDiv = document.getElementById('encryptResult');
    const messageDiv = document.getElementById('encryptedMessage');
    const copyButton = document.getElementById('copyEncrypted');

    messageDiv.innerHTML = `<div class="key-display">${escapeHtml(encryptedMessage)}</div>`;
    copyButton.style.display = 'inline-block';
    copyButton.onclick = () => {
        navigator.clipboard.writeText(encryptedMessage).then(() => {
            copyButton.innerHTML = 'Copied!';
            setTimeout(() => {
                copyButton.innerHTML = 'Copy Encrypted Message';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

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

// Function to check and handle URL parameters
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const keyParam = urlParams.get('key');

    if (keyParam) {
        try {
            // Decode the base64 public key
            const publicKey = atob(keyParam);

            // Store the public key in the worker
            storePublicKey(publicKey);

            // Update UI to show we're in "encrypt mode" with external key
            showEncryptMode();

            // Clean up URL to remove the key parameter
            const url = new URL(window.location);
            url.searchParams.delete('key');
            window.history.replaceState({}, document.title, url.pathname);

        } catch (error) {
            showError('Invalid public key in URL parameter');
        }
    }
}

// Initialize handlers when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCryptoHandlers();
    checkUrlParameters();

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
            case 'encrypt':
                handleEncrypt();
                break;
            case 'clearCache':
                handleClearCache();
                break;
        }
    });
});
