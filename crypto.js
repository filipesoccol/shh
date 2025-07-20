// Create and export cryptoWorker
export const cryptoWorker = new Worker("ws.js");

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

// Check if a private key is available for decryption
export function checkPrivateKey() {
    return new Promise((resolve) => {
        const originalHandler = cryptoWorker.onmessage;
        
        cryptoWorker.onmessage = (event) => {
            if (event.data.success) {
                resolve(event.data.result);
            } else {
                resolve(false);
            }
            cryptoWorker.onmessage = originalHandler;
        };
        
        cryptoWorker.postMessage({
            action: "CHECK_PRIVATE_KEY",
            payload: {}
        });
    });
}

