import {
    generateKeys,
    getPublicKey,
    decryptMessage,
    clearKeyCache,
    storePublicKey,
    encryptMessage,
    checkPrivateKey,
} from './crypto.js';

// Track if we're in encrypt-only mode (external public key loaded)
let isEncryptOnlyMode = false;
let cachedPublicKeyString = null;

async function initializeKeys() {
    try {
        await generateKeys();
        cachedPublicKeyString = await getPublicKey();
        showPublicKeySection();
        await updateSectionsVisibility();
    } catch (error) {
        showError(error.message || 'Key generation failed');
    }
}

function showPublicKeySection() {
    const publicKeySection = document.getElementById('publicKeySection');
    const copyBtn = document.getElementById('copyPublicKeyBtn');

    if (publicKeySection) {
        publicKeySection.style.display = 'flex';
    }

    if (copyBtn) {
        copyBtn.onclick = () => {
            if (cachedPublicKeyString) {
                const link = `${window.location.href}?key=${encodeURIComponent(cachedPublicKeyString)}`;
                console.log('Public Key Link:', link);
                navigator.clipboard.writeText(link).then(() => {
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy Public Key Link';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            }
        };
    }
}

async function handleDecrypt() {
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

    try {
        const result = await decryptMessage(ciphertext);
        if (result) {
            showDecryptedMessage(result);
        }
    } catch (error) {
        showError(error.message || 'Decryption failed');
    } finally {
        loading.style.display = 'none';
        button.disabled = false;
    }
}

async function handleEncrypt() {
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

    try {
        const result = await encryptMessage(plaintext);
        if (result) {
            showEncryptedMessage(result);
        }
    } catch (error) {
        showError(error.message || 'Encryption failed');
    } finally {
        loading.style.display = 'none';
        button.disabled = false;
    }
}

function showDecryptedMessage(message) {
    const messageDiv = document.getElementById('decryptedMessage');

    const displayDiv = document.createElement('div');
    displayDiv.className = 'key-display';
    displayDiv.textContent = message;

    messageDiv.innerHTML = '';
    messageDiv.appendChild(displayDiv);

    flipSectionContainer('decryptFlipContainer', '<strong>Message Decrypted Successfully!</strong>');
    addFlipBackButton('flipBackButtonDecrypt', 'decryptFlipContainer');
}

function showEncryptMode() {
    const publicKeySection = document.getElementById('publicKeySection');
    const encryptSection = document.getElementById('encryptSection');
    const decryptSection = document.getElementById('decryptSection');

    isEncryptOnlyMode = true;

    if (publicKeySection) {
        publicKeySection.style.display = 'none';
    }

    if (encryptSection) {
        encryptSection.style.display = 'flex';
    }

    if (decryptSection) {
        decryptSection.style.display = 'none';
    }
}

function showEncryptedMessage(encryptedMessage) {
    const messageDiv = document.getElementById('encryptedMessage');
    const copyButton = document.getElementById('copyEncrypted');

    const displayDiv = document.createElement('div');
    displayDiv.className = 'key-display';
    displayDiv.textContent = encryptedMessage;

    messageDiv.innerHTML = '';
    messageDiv.appendChild(displayDiv);
    copyButton.style.display = 'inline-block';
    copyButton.onclick = () => {
        navigator.clipboard.writeText(encryptedMessage).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy Encrypted Message';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    flipSectionContainer('encryptFlipContainer', '<strong>Message Encrypted Successfully!</strong>');
    addFlipBackButton('flipBackButtonEncrypt', 'encryptFlipContainer');
}

function showError(error) {
    const resultDiv = document.getElementById('error-container');
    resultDiv.classList.add('enabled');
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    const errorLabel = document.createElement('strong');
    errorLabel.textContent = 'Error: ';
    const errorMessage = document.createElement('span');
    errorMessage.textContent = error;

    errorContainer.appendChild(errorLabel);
    errorContainer.appendChild(errorMessage);

    resultDiv.innerHTML = '';
    resultDiv.appendChild(errorContainer);
}

function hideResults() {
    const results = document.querySelectorAll('.result');
    results.forEach(result => {
        result.classList.remove('show', 'error');
    });
}

async function updateSectionsVisibility() {
    const decryptSection = document.getElementById('decryptSection');
    const encryptSection = document.getElementById('encryptSection');

    if (!decryptSection ) return;

    if (isEncryptOnlyMode) {
        decryptSection.style.display = 'none';
        return;
    }

    try {
        const hasPrivateKey = await checkPrivateKey();

        if (hasPrivateKey) {
            decryptSection.style.display = 'flex';
            if (encryptSection) {
                encryptSection.style.display = 'none';
            }
        } else {
            decryptSection.style.display = 'none';
            if (encryptSection) {
                encryptSection.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error checking private key status:', error);
        decryptSection.style.display = 'none';
    }
}

function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const keyParam = urlParams.get('key');

    if (keyParam) {
        try {
            const decoded = decodeURIComponent(keyParam);

            if (decoded.length < 10 || decoded.length > 10000) {
                throw new Error('Invalid public key size');
            }

            storePublicKey(decoded);
            showEncryptMode();

            const url = new URL(window.location);
            url.searchParams.delete('key');
            window.history.replaceState({}, document.title, url.pathname);

            return true; // Key was found and processed
        } catch (error) {
            showError('Invalid public key in URL parameter');
            return false;
        }
    }
    return false; // No key in URL
}

function flipSectionContainer(containerId, message) {
    const flipContainer = document.getElementById(containerId);

    if (flipContainer) {
        flipContainer.classList.add('flipped');

        setTimeout(() => {
            const messageElement = flipContainer.querySelector('.section-back .message');
            if (messageElement && message) {
                messageElement.innerHTML = message;
            }
        }, 400);
    }
}

function addFlipBackButton(buttonContainerId, flipContainerId) {
    const flipBackButton = document.getElementById(buttonContainerId);

    const backButton = document.createElement('button');
    backButton.className = 'btn';
    backButton.innerHTML = 'Decrypt another message';
    backButton.onclick = () => {
        const flipContainer = document.getElementById(flipContainerId);
        if (flipContainer && flipContainer.classList.contains('flipped')) {
            flipContainer.classList.remove('flipped');
            flipBackButton.innerHTML = '';
        }
    };

    flipBackButton.innerHTML = '';
    flipBackButton.appendChild(backButton);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Clear forms on page load
    document.querySelectorAll('form').forEach(form => form.reset());

    // Check if there's a public key in URL (encrypt-only mode)
    const hasExternalKey = checkUrlParameters();

    // If no external key, auto-generate keys
    if (!hasExternalKey) {
        await initializeKeys();
    }

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
        }
    });
});
