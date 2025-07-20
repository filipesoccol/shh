# AGENTS.md

This file provides guidance for AI agents working with the Shh 🤫 cryptographic web application.

## Project Overview

**Shh 🤫** is a client-side cryptographic web application that provides secure encryption/decryption capabilities using OpenPGP.js. The application emphasizes security through Web Worker isolation and client-side-only processing.

## Architecture

### Core Components
- **`main.js`**: Application controller and UI orchestration
- **`crypto.js`**: Web Worker interface and message routing bridge
- **`ws.js`**: Web Worker containing all cryptographic operations using OpenPGP.js
- **`canvas.js`**: Canvas-based entropy generation system with drawing functionality
- **`index.html`**: Single-page application with form-based sections
- **`styles.css`**: Modern CSS with custom properties and responsive design

### Security Architecture
- **Web Worker Isolation**: All cryptographic operations run in isolated Web Worker (`ws.js`)
- **Message-based Communication**: Main thread communicates with worker via `crypto.js` bridge
- **Client-Side Only**: Zero server-side cryptographic operations or key storage
- **Memory Management**: Explicit cleanup after operations, single key-pair cache

### Key Operations
The Web Worker handles four main operations:
- `GENERATE_KEY`: Creates ECC/Curve25519 key pairs with user passphrase
- `GET_PUBLIC_KEY`: Retrieves cached public key for sharing
- `DECRYPT`: Decrypts PGP messages using cached private key
- `CLEAR_CACHE`: Removes keys from worker memory

## Development Guidelines

### Technology Stack
- **Frontend**: HTML5, CSS3, ES6+ JavaScript modules
- **Cryptography**: OpenPGP.js (v6.1.1) for ECC/Curve25519 operations
- **Build Tool**: Vite for development and building
- **Security**: Web Workers for cryptographic operation isolation

### Commands
- `npm run dev`: Start Vite development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

### Branch Structure
- **`master`**: Vite-based development setup

### Security Principles
- **Principle of Least Privilege**: Worker has minimal necessary permissions
- **No Server-Side Secrets**: All cryptographic operations are client-side
- **Passphrase Protection**: All private keys are passphrase-encrypted
- **Memory Cleanup**: Explicit key clearing after operations

## Agent Instructions

### Code Style
- Follow existing ES6+ module patterns
- Maintain Web Worker message-passing architecture
- Use existing CSS custom properties for styling
- Follow security-first development practices

### Testing
- Test cryptographic operations in Web Worker isolation
- Verify proper memory cleanup after operations
- Test cross-browser compatibility for Web Workers
- Validate entropy generation on canvas interactions

### Security Considerations
- Never log or expose private keys or passphrases
- Maintain Web Worker isolation for all crypto operations
- Ensure proper cleanup of sensitive data from memory
- Follow client-side-only architecture principles

### Common Tasks
- Adding new cryptographic operations: Extend `ws.js` worker and `crypto.js` bridge
- UI modifications: Update `main.js` controller and corresponding HTML/CSS
- Canvas entropy improvements: Modify `canvas.js` painter functionality
- Security enhancements: Focus on Web Worker isolation and memory management

## Creator Information
- **Creator**: filipesoccol (filipe.soccol@gmail.com)
- **Repository**: Shh 🤫 cryptographic web application