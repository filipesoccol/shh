# 🤫 Shh

A secure web application for cryptographic operations using OpenPGP encryption. Shh 🤫 provides a clean, modern interface for generating encryption keys, retrieving public keys, and decrypting messages with client-side security.

## Features

- **Key Generation**: Generate ECC (Curve25519) key pairs with user-defined passphrases
- **Public Key Retrieval**: Get your public key from cached key pairs
- **Message Decryption**: Decrypt PGP-encrypted messages using cached private keys
- **Secure Processing**: All cryptographic operations run in Web Workers for enhanced security
- **Cache Management**: Clear cached keys when needed

## How to Run with Bun

### Prerequisites
- Install [Bun](https://bun.sh/) on your system

### Running the Application

1. Clone or download this repository
2. Navigate to the Shh directory:
   ```bash
   cd Shh
   ```

3. Start a local server using Bun:
   ```bash
   bun --bun serve . --port 3000
   ```
   
   Or alternatively:
   ```bash
   bunx serve . -p 3000
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Usage

1. **Generate Keys**: Enter a secure passphrase and user ID to generate your encryption key pair
2. **Get Public Key**: Retrieve your public key to share with others for encrypted communication
3. **Decrypt Messages**: Paste encrypted messages to decrypt them using your cached private key
4. **Clear Cache**: Remove cached keys from memory when done

## Security Notes

- All cryptographic operations are performed client-side
- Private keys are temporarily cached in Web Worker memory only
- No sensitive data is transmitted to external servers
- Always use strong, unique passphrases for key generation

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, HTMX
- **Cryptography**: OpenPGP.js (v6.1.1)
- **Architecture**: Web Workers for secure key operations
- **Server**: Bun static file server