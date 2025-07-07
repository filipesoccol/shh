// Create and export cryptoWorker
export const cryptoWorker = new Worker("ws.js");

// Make cryptoWorker globally accessible for backward compatibility
window.cryptoWorker = cryptoWorker;

// Generate keys using scribble
export function generateKeys(scribble, userId) {
    cryptoWorker.postMessage({
        action: "GENERATE_KEY",
        payload: { scribble, userId }
    });
}

// Get public key using scribble
// Not require any payload cause return the stored key from the worker
export function getPublicKey() {
    cryptoWorker.postMessage({
        action: "GET_PUBLIC_KEY",
        payload: {}
    });
}

// Handle worker responses
cryptoWorker.onmessage = (event) => {
    if (event.data.success) {
        const result = event.data.result;

        // Check if result has both publicKey (full key generation)
        if (result && result.publicKey) {
            console.log("Keys generated:", {
                publicKey: result.publicKey
            });
        }
        // Check if result is just a public key string
        else if (typeof result === 'string' && result.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
            console.log("Public key:", result);
        }
        // Otherwise it's decrypted data
        else {
            console.log("Decrypted:", result);
        }
    } else {
        console.error("Crypto failed:", event.data.error);
    }
};

// Trigger decryption using cached keys
export function decryptMessage(ciphertext) {
    console.log("Decrypting message:", ciphertext);
    cryptoWorker.postMessage({
        action: "DECRYPT",
        payload: { ciphertext }
    });
}

// Clear the key cache in the worker
export function clearKeyCache() {
    cryptoWorker.postMessage({
        action: "CLEAR_CACHE",
        payload: {}
    });
}

// Store a public key in the worker (for external public keys)
export function storePublicKey(publicKey) {
    cryptoWorker.postMessage({
        action: "STORE_PUBLIC_KEY",
        payload: { publicKey }
    });
}

// Encrypt a message using the stored public key
export function encryptMessage(message) {
    cryptoWorker.postMessage({
        action: "ENCRYPT",
        payload: { message }
    });
}

// Get the number of cached key pairs
export function getCacheSize() {
    cryptoWorker.postMessage({
        action: "GET_CACHE_SIZE",
        payload: {}
    });
}