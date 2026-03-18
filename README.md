# Shh

Secure secret sharing in the browser. Shh uses the Web Crypto API to generate ephemeral key pairs, share public keys via URL, and encrypt/decrypt messages — all client-side, with zero dependencies.

## How It Works

1. **Open Shh** — a fresh ECDH key pair (P-384) is generated automatically in your browser.
2. **Share your link** — copy the public-key URL and send it to whoever needs to message you.
3. **They encrypt** — the recipient opens your link, types a message, and Shh encrypts it with an ephemeral ECDH exchange + AES-256-GCM.
4. **You decrypt** — paste the encrypted payload back into your Shh session to read the message.

Keys live only in memory for the duration of the page session. Nothing is stored on disk or sent to a server.

## Running Locally

Requires [Bun](https://bun.sh).

```bash
bun run dev
```

Then open `http://localhost:3000`.

## Security Notes

- All cryptographic operations run client-side using the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- Each encryption uses an ephemeral ECDH key pair so the sender's private key is never reused or shared
- Private keys are held in memory only and discarded when the page is closed
- No data is transmitted to any server — the Bun server only serves static files
- A strict Content-Security-Policy header limits script and style sources

## Technology Stack

- **Frontend**: HTML5, CSS3, vanilla JavaScript (ES modules)
- **Cryptography**: Web Crypto API — ECDH (P-384) key agreement + AES-GCM (256-bit) encryption
- **Server**: Bun static file server
