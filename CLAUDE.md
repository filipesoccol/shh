
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

**Shh 🤫** is a client-side cryptographic web application with a security-focused architecture using Web Workers for isolation.

### Core Architecture Pattern
- **Web Worker Isolation**: All cryptographic operations run in `ws.js` Web Worker for security
- **Message-based Communication**: Main thread communicates with worker via `crypto.js` bridge
- **Single Key-Pair Cache**: Worker maintains one key-pair in memory until cleared
- **Client-Side Processing**: Zero server-side cryptographic operations

### Key Files and Responsibilities
- **`main.js`**: Application controller, UI orchestration, event handling
- **`crypto.js`**: Web Worker interface, message routing between main thread and worker
- **`ws.js`**: Web Worker containing all cryptographic operations using OpenPGP.js
- **`canvas.js`**: Canvas-based entropy generation system with drawing functionality
- **`index.html`**: Single-page application structure with form-based sections
- **`styles.css`**: Modern CSS with custom properties and responsive design

### Data Flow Architecture
```mermaid
flowchart LR
    A[User Input] --> B[main.js]
    B --> C[crypto.js]
    C --> D[Web Worker (ws.js)]
    D --> E[OpenPGP.js]
    E -- Result/Response --> D
    D -- PostMessage --> C
    C -- Result Processing --> B
    B -- UI Updates --> A
```

### Web Worker Operations
The worker handles four main operations via message passing:
- `GENERATE_KEY`: Creates ECC/Curve25519 key pairs with user passphrase
- `GET_PUBLIC_KEY`: Retrieves cached public key for sharing
- `DECRYPT`: Decrypts PGP messages using cached private key
- `CLEAR_CACHE`: Removes keys from worker memory

### Canvas Entropy System
- **`CanvasPainter`**: Manages HTML5 canvas drawing for entropy generation
- **Pixel tracking**: Counts painted pixels for randomness input
- **Hash generation**: Converts canvas drawings to SHA-256 Base64 passwords
- **Multi-platform**: Supports both mouse and touch events

### Security Patterns
- **Principle of Least Privilege**: Worker has minimal necessary permissions
- **Memory Management**: Explicit cleanup after decryption operations
- **Client-Side Only**: No server-side key storage or processing
- **Passphrase Protection**: All private keys are passphrase-encrypted

### State Management
- **`currentResults`**: Global state for last operation results
- **DOM-based UI state**: Interface reflects current operation status
- **Worker memory**: Key cache persists in worker until explicitly cleared

## Branch Structure
- **`master`**: Vite-based development setup
- **`docker-instructions`**: Docker containerization with Bun server

## Technology Stack
- **Frontend**: HTML5, CSS3, ES6+ JavaScript modules
- **Cryptography**: OpenPGP.js (v6.1.1) for ECC/Curve25519 operations
- **Build Tool**: Vite for development and building
- **Security**: Web Workers for cryptographic operation isolation