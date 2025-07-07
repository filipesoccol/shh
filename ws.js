importScripts("https://unpkg.com/openpgp@6.1.1/dist/openpgp.min.js");

// Single key-pair cache - persists until worker is terminated
let cachedKeyPair = null;
let scribble = null;

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
                // Clear the cached key-pair
                cachedKeyPair = null;
                result = "Cache cleared";
                break;

            case "GET_CACHE_SIZE":
                // Return 1 if key-pair is cached, 0 if not
                result = cachedKeyPair ? 1 : 0;
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
        }

        // Securely send result back
        self.postMessage({ success: true, result });

    } catch (error) {
        self.postMessage({ success: false, error: error.message });
    }
};