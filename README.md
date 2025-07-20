# 🤫 Shh

A secure client-side cryptographic web application for OpenPGP encryption operations. Shh 🤫 provides a clean, modern interface for generating encryption keys, retrieving public keys, and decrypting messages with complete client-side security.

## ✨ Features

- **🔐 Key Generation**: Generate ECC (Curve25519) key pairs with user-defined passphrases
- **📤 Public Key Retrieval**: Export your public key from cached key pairs for sharing
- **📥 Message Decryption**: Decrypt PGP-encrypted messages using cached private keys
- **🛡️ Secure Processing**: All cryptographic operations run in isolated Web Workers
- **🧹 Cache Management**: Clear cached keys from memory when needed
- **🎨 Entropy Generation**: Interactive canvas-based entropy collection for key generation
- **🔒 Client-Side Only**: Zero server-side processing or key storage

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd shh
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:5173
   ```

### Production Build

```bash
npm run build
npm run preview
```

## 🏗️ Architecture

### Core Components

- **`main.js`**: Application controller and UI orchestration
- **`crypto.js`**: Web Worker interface and message routing bridge  
- **`ws.js`**: Web Worker containing all cryptographic operations using OpenPGP.js
- **`canvas.js`**: Canvas-based entropy generation system with drawing functionality
- **`index.html`**: Single-page application with form-based sections
- **`styles.css`**: Modern CSS with custom properties and responsive design

### Security Design

- **🔐 Web Worker Isolation**: All cryptographic operations run in isolated Web Workers
- **💬 Message-based Communication**: Main thread communicates with worker via secure message passing
- **🖥️ Client-Side Only**: Zero server-side cryptographic operations or key storage
- **🧠 Memory Management**: Explicit cleanup after operations, single key-pair cache
- **🔑 Passphrase Protection**: All private keys are passphrase-encrypted

## 🔒 Security Notes

- **Client-Side Only**: All cryptographic operations are performed entirely client-side
- **Memory Isolation**: Private keys are temporarily cached in Web Worker memory only
- **Zero Data Transmission**: No sensitive data is transmitted to external servers
- **Strong Passphrases**: Always use strong, unique passphrases for key generation
- **Secure Architecture**: Web Worker isolation prevents main thread access to cryptographic operations

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, ES6+ JavaScript modules
- **Cryptography**: OpenPGP.js (v6.1.1) for ECC/Curve25519 operations
- **Build Tool**: Vite for development and building
- **Architecture**: Web Workers for secure cryptographic operation isolation
- **Security**: Client-side-only processing with memory management

## 📝 Available Commands

- `npm run dev`: Start Vite development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## 🤝 Contributing

This project follows security-first development practices. When contributing:

- Maintain Web Worker isolation for all cryptographic operations
- Follow existing ES6+ module patterns
- Ensure proper cleanup of sensitive data from memory
- Test cross-browser compatibility for Web Workers

## 👨‍💻 Creator
