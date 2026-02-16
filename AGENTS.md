# AGENTS.md - Development Guidelines

## Build/Run Commands
- **Start dev server**: `bun run dev` or `bun server.js`
- **Production start**: `bun run start`
- **No tests configured** - this is a client-side crypto app with no test framework

## Code Style & Conventions
- **Runtime**: Bun for server, vanilla JavaScript for client
- **Imports**: Use ES6 imports (`import { x } from './file.js'`)
- **File extensions**: Always include `.js` in imports
- **Naming**: camelCase for functions/variables, PascalCase for classes
- **Error handling**: Use try/catch blocks, show user-friendly errors via `showError()`
- **Security**: All crypto operations in Web Workers, no sensitive data in main thread
- **DOM**: Use `document.createElement()` and `textContent` for safe DOM manipulation
- **Comments**: Minimal comments, only for complex crypto/security logic

## Architecture
- **Client-side**: Vanilla JS with Web Workers for crypto operations
- **Server**: Bun static file server with CORS enabled
- **Crypto**: OpenPGP.js v6.1.1 loaded via CDN in Web Worker
- **UI**: Flip card animations, form-based interactions
- **State**: Cached key pairs in Web Worker memory only