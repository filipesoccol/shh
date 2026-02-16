// Crypto module - using browser's native Web Crypto API
// ECDH for key exchange + AES-GCM for encryption

let cachedKeyPair = null;
let cachedPublicKey = null; // For storing external public keys (encrypt-only mode)

// Generate ECDH key pair using Web Crypto API
export async function generateKeys() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-384",
        },
        true, // extractable - needed to export public key
        ["deriveKey"]
    );

    cachedKeyPair = keyPair;

    // Export public key for sharing
    const publicKeyExported = await exportPublicKey(keyPair.publicKey);

    return {
        publicKey: publicKeyExported,
        privateKey: "[stored securely in memory]"
    };
}

// Export public key to base64 format for sharing
async function exportPublicKey(publicKey) {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);
    const exportedArray = new Uint8Array(exported);
    return arrayBufferToBase64(exportedArray);
}

// Import public key from base64 format
async function importPublicKey(base64Key) {
    const keyData = base64ToArrayBuffer(base64Key);
    return await window.crypto.subtle.importKey(
        "spki",
        keyData,
        {
            name: "ECDH",
            namedCurve: "P-384",
        },
        true,
        []
    );
}

// Get public key in shareable format
export async function getPublicKey() {
    if (cachedKeyPair && cachedKeyPair.publicKey) {
        return await exportPublicKey(cachedKeyPair.publicKey);
    }
    return cachedPublicKey;
}

// Derive shared AES-GCM key from ECDH key exchange
async function deriveSharedKey(privateKey, publicKey) {
    return await window.crypto.subtle.deriveKey(
        {
            name: "ECDH",
            public: publicKey,
        },
        privateKey,
        {
            name: "AES-GCM",
            length: 256,
        },
        false,
        ["encrypt", "decrypt"]
    );
}

// Encrypt a message using the stored public key
// Uses ephemeral key pair for each encryption
export async function encryptMessage(message) {
    let recipientPublicKey;

    // Get the recipient's public key
    if (cachedPublicKey) {
        // Encrypt-only mode: use stored external public key
        recipientPublicKey = await importPublicKey(cachedPublicKey);
    } else if (cachedKeyPair && cachedKeyPair.publicKey) {
        // Self-encryption: use own public key
        recipientPublicKey = cachedKeyPair.publicKey;
    } else {
        throw new Error("No public key available for encryption");
    }

    // Generate ephemeral key pair for this encryption
    const ephemeralKeyPair = await window.crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-384",
        },
        true,
        ["deriveKey"]
    );

    // Derive shared secret using ephemeral private key and recipient's public key
    const sharedKey = await deriveSharedKey(ephemeralKeyPair.privateKey, recipientPublicKey);

    // Generate random IV for AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the message
    const encoded = new TextEncoder().encode(message);
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        sharedKey,
        encoded
    );

    // Export ephemeral public key to include with ciphertext
    const ephemeralPublicKeyExported = await exportPublicKey(ephemeralKeyPair.publicKey);

    // Combine: ephemeralPublicKey + iv + ciphertext
    const result = {
        ephemeralPublicKey: ephemeralPublicKeyExported,
        iv: arrayBufferToBase64(iv),
        ciphertext: arrayBufferToBase64(new Uint8Array(ciphertext))
    };

    return JSON.stringify(result);
}

// Decrypt message using cached private key
export async function decryptMessage(encryptedData) {
    if (!cachedKeyPair || !cachedKeyPair.privateKey) {
        throw new Error("No private key available for decryption");
    }

    // Parse the encrypted data
    const data = JSON.parse(encryptedData);

    // Import the ephemeral public key
    const ephemeralPublicKey = await importPublicKey(data.ephemeralPublicKey);

    // Derive the shared secret using our private key and sender's ephemeral public key
    const sharedKey = await deriveSharedKey(cachedKeyPair.privateKey, ephemeralPublicKey);

    // Decrypt the message
    const iv = base64ToArrayBuffer(data.iv);
    const ciphertext = base64ToArrayBuffer(data.ciphertext);

    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        sharedKey,
        ciphertext
    );

    return new TextDecoder().decode(decrypted);
}

// Clear the key cache
export function clearKeyCache() {
    cachedKeyPair = null;
    cachedPublicKey = null;
}

// Store a public key (for external public keys in encrypt-only mode)
export function storePublicKey(publicKey) {
    cachedPublicKey = publicKey;
    cachedKeyPair = null; // Clear any existing key pair
}

// Check if a private key is available for decryption
export function checkPrivateKey() {
    const hasPrivateKey = cachedKeyPair !== null && cachedKeyPair.privateKey !== null;
    return Promise.resolve(hasPrivateKey);
}

// Utility: Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Utility: Convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
