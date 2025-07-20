// Note: Web Workers don't support SRI hashes with importScripts
// This is a known limitation. For better security, consider bundling OpenPGP
importScripts("https://unpkg.com/openpgp@6.1.1/dist/openpgp.min.js");

// Single key-pair cache - persists until worker is terminated
let cachedKeyPair = null;
let scribble = null;

// Secure memory clearing function
function securelyWipeVariable(variable) {
    if (typeof variable === 'string') {
        // Overwrite string data with random values
        const length = variable.length;
        for (let i = 0; i < 3; i++) {
            variable = crypto.getRandomValues(new Uint8Array(length))
                .reduce((str, byte) => str + String.fromCharCode(byte), '');
        }
    } else if (variable && typeof variable === 'object') {
        // Recursively clear object properties
        Object.keys(variable).forEach(key => {
            if (typeof variable[key] === 'string') {
                const length = variable[key].length;
                for (let i = 0; i < 3; i++) {
                    variable[key] = crypto.getRandomValues(new Uint8Array(length))
                        .reduce((str, byte) => str + String.fromCharCode(byte), '');
                }
            }
            delete variable[key];
        });
    }
    return null;
}

self.onmessage = async (event) => {
    const { action, payload } = event.data;

    try {
        let result;
        switch (action) {
            case "GENERATE_KEY":

                // Generate new keys and cache them
                result = await openpgp.generateKey({
                    type: "ecc",
                    curve: "curve25519",
                    passphrase: payload.scribble,
                    userIDs: [{ name: payload.userId }]
                });
                // Cache the key-pair
                cachedKeyPair = result;
                scribble = payload.scribble;
                break;

            case "GET_PUBLIC_KEY":
                // Check if we have a key-pair cached
                if (!cachedKeyPair) {
                    throw new Error("No key-pair cached. Generate keys first.");
                }
                result = cachedKeyPair.publicKey;
                break;

            case "DECRYPT":
                // Use the cached private key for decryption
                if (!cachedKeyPair) {
                    throw new Error("No key-pair cached. Generate keys first.");
                }

                const privKey = await openpgp.decryptKey({
                    privateKey: await openpgp.readPrivateKey({
                        armoredKey: cachedKeyPair.privateKey
                    }),
                    passphrase: scribble
                });
                const decrypted = await openpgp.decrypt({
                    message: await openpgp.readMessage({ armoredMessage: payload.ciphertext }),
                    decryptionKeys: privKey,
                    config: { allowInsecureDecryptionWithSigningKeys: false }
                });
                result = decrypted.data;
                break;

            case "CLEAR_CACHE":
                // Securely clear the cached key-pair and passphrase
                if (cachedKeyPair) {
                    cachedKeyPair = securelyWipeVariable(cachedKeyPair);
                }
                if (scribble) {
                    scribble = securelyWipeVariable(scribble);
                }
                result = "Cache cleared";
                break;


            case "STORE_PUBLIC_KEY":
                // Store a public key for encryption purposes
                // This creates a minimal key-pair object with only the public key
                cachedKeyPair = {
                    publicKey: payload.publicKey,
                    privateKey: null // No private key when storing external public key
                };
                result = "Public key stored successfully";
                break;

            case "ENCRYPT":
                // Encrypt a message using the cached public key
                if (!cachedKeyPair || !cachedKeyPair.publicKey) {
                    throw new Error("No public key available for encryption.");
                }

                const pubKey = await openpgp.readKey({
                    armoredKey: cachedKeyPair.publicKey
                });
                const encrypted = await openpgp.encrypt({
                    message: await openpgp.createMessage({ text: payload.message }),
                    encryptionKeys: pubKey
                });
                result = encrypted;
                break;

            case "CHECK_PRIVATE_KEY":
                // Check if we have a private key available for decryption
                result = !!(cachedKeyPair && cachedKeyPair.privateKey);
                break;
        }

        // Securely send result back
        self.postMessage({ success: true, result });

    } catch (error) {
        // Sanitize error messages to avoid information leakage
        let sanitizedError;
        switch (action) {
            case "GENERATE_KEY":
                sanitizedError = "Failed to generate key pair";
                break;
            case "GET_PUBLIC_KEY":
                sanitizedError = "Public key not available";
                break;
            case "DECRYPT":
                sanitizedError = "Failed to decrypt message";
                break;
            case "CLEAR_CACHE":
                sanitizedError = "Failed to clear cache";
                break;
            case "STORE_PUBLIC_KEY":
                sanitizedError = "Failed to store public key";
                break;
            case "ENCRYPT":
                sanitizedError = "Failed to encrypt message";
                break;
            case "CHECK_PRIVATE_KEY":
                sanitizedError = "Failed to check private key status";
                break;
            default:
                sanitizedError = "Unknown operation failed";
        }
        
        // Log actual error for debugging (not sent to client)
        console.error(`Worker error in ${action}:`, error);
        
        self.postMessage({ success: false, error: sanitizedError });
    }
};