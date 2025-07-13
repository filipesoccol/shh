#!/usr/bin/env bun

import { serve } from "bun";
import { file } from "bun";
import path from "path";

const PORT = 3000;
const PUBLIC_DIR = import.meta.dir; // Current directory

// MIME type mapping for common file extensions
const getMimeType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.pdf': 'application/pdf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.otf': 'font/otf'
    };

    return mimeTypes[ext] || 'application/octet-stream';
};

const server = serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);
        let pathname = url.pathname;

        // Serve index.html for root path
        if (pathname === '/') {
            pathname = '/index.html';
        }

        // Security: prevent directory traversal
        if (pathname.includes('..')) {
            return new Response('Forbidden', { status: 403 });
        }

        // Construct the file path
        const filePath = path.join(PUBLIC_DIR, pathname);

        try {
            // Check if file exists and serve it
            const fileContent = file(filePath);

            if (await fileContent.exists()) {
                const mimeType = getMimeType(filePath);

                return new Response(fileContent, {
                    headers: {
                        'Content-Type': mimeType,
                        'Cache-Control': 'public, max-age=3600', // 1 hour cache
                        'Access-Control-Allow-Origin': '*', // Enable CORS for development
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                    }
                });
            }

            // File not found
            return new Response('File not found', { status: 404 });

        } catch (error) {
            console.error(`Error serving ${pathname}:`, error);
            return new Response('Internal Server Error', { status: 500 });
        }
    },

    error(error) {
        console.error('Server error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
});

console.log(`🤫 Shh server is running on http://localhost:${PORT}`);
console.log(`📁 Serving files from: ${PUBLIC_DIR}`);
console.log(`🚀 Visit http://localhost:${PORT} to access the application`);
console.log('Press Ctrl+C to stop the server');
