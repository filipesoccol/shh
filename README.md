# 🤫 Shh

A secure web application for cryptographic operations using OpenPGP encryption. Shh 🤫 provides a clean, modern interface for generating encryption keys, retrieving public keys, and decrypting messages with client-side security.

## Features

- **Key Generation**: Generate ECC (Curve25519) key pairs with user-defined passphrases
- **Public Key Retrieval**: Get your public key from cached key pairs
- **Message Decryption**: Decrypt PGP-encrypted messages using cached private keys
- **Secure Processing**: All cryptographic operations run in Web Workers for enhanced security
- **Cache Management**: Clear cached keys when needed

## How to Run with Bun

### Running the Application

1. Clone or download this repository
2. Navigate to the SafeShare directory:
   ```bash
   cd SafeShare
   ```

3. Install Bun (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

4. Start the static file server:
   ```bash
   bun run dev
   ```
   
   Or run directly:
   ```bash
   bun server.js
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Docker Development Environment

For a containerized Node.js development environment:

### Quick Start

1. **Clone and navigate to the repository:**
   ```bash
   git clone <your-repo-url>
   cd SafeShare
   ```

2. **Build and run the container:**
   ```bash
   docker-compose up --build -d
   ```
   
4. **Development workflow** (in VS Code terminal connected to container):
   - Use the container as an isolated development environment
   - Run build commands: `npm run build`
   - Run tests and other development tasks
   - All development happens inside the secure container environment

### Alternative Docker Commands

**Build the image manually:**
```bash
docker build -t shh-dev .
```

**Run container with shell access:**
```bash
docker run -it --rm \
   -v $SSH_AUTH_SOCK:$SSH_AUTH_SOCK \
   -e SSH_AUTH_SOCK=$SSH_AUTH_SOCK \
   shh-dev /bin/bash
```

### Docker Environment Features

- **Ultra Lightweight**: Based on Alpine Linux with Node.js 20 (~40MB total)
- **VS Code Integration**: Use VS Code Dev Containers for seamless development
- **Live Reload**: Changes are reflected immediately with volume mounting
- **Isolated Environment**: Completely isolated Node.js environment with no external port exposure
- **Secure Development**: All development happens inside the container without network access

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
