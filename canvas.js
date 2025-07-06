// Canvas painting functionality
class CanvasPainter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.penColor = '#fff';
        this.penWidth = 2;
        this.pixelCount = 0;
        this.initialImageData = null;

        this.initializeCanvas();
        this.setupEventListeners();
    } initializeCanvas() {
        // Set canvas background to white
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set drawing properties
        this.ctx.strokeStyle = this.penColor;
        this.ctx.lineWidth = this.penWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Store initial image data for pixel counting
        this.initialImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile support
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e, 'start'));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e, 'move'));
        this.canvas.addEventListener('touchend', (e) => this.handleTouch(e, 'end'));

        // Prevent scrolling when touching the canvas
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchend', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
    }

    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const coords = this.getCanvasCoordinates(e);

        this.ctx.beginPath();
        this.ctx.moveTo(coords.x, coords.y);
    }

    draw(e) {
        if (!this.isDrawing) return;

        const coords = this.getCanvasCoordinates(e);

        this.ctx.lineTo(coords.x, coords.y);
        this.ctx.stroke();
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.ctx.beginPath();

            // Count painted pixels after drawing stops
            this.countPaintedPixels();
        }
    }

    handleTouch(e, action) {
        e.preventDefault();

        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent({
                start: 'mousedown',
                move: 'mousemove',
                end: 'mouseup'
            }[action], {
                clientX: touch.clientX,
                clientY: touch.clientY
            });

            this.canvas.dispatchEvent(mouseEvent);
        }
    }


    countPaintedPixels() {
        const currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const initialData = this.initialImageData.data;
        const currentData = currentImageData.data;

        let paintedPixels = 0;

        // Compare each pixel (RGBA values)
        for (let i = 0; i < currentData.length; i += 4) {
            const initialR = initialData[i];
            const initialG = initialData[i + 1];
            const initialB = initialData[i + 2];
            const initialA = initialData[i + 3];

            const currentR = currentData[i];
            const currentG = currentData[i + 1];
            const currentB = currentData[i + 2];
            const currentA = currentData[i + 3];

            // Check if pixel has changed from initial state
            if (initialR !== currentR || initialG !== currentG ||
                initialB !== currentB || initialA !== currentA) {
                paintedPixels++;
            }
        }

        this.pixelCount = paintedPixels;
    }

    setPenColor(color) {
        this.penColor = color;
        this.ctx.strokeStyle = color;
    }

    setPenWidth(width) {
        this.penWidth = width;
        this.ctx.lineWidth = width;
    }

    async imageToPassword(file) {

        const imageData = this.canvas.getImageData(0, 0, 300, 300);

        // Step 2: Convert to monochrome and serialize
        const byteArray = serializePixels(imageData.data);

        // Step 3: Compute SHA-256 hash
        const hashBuffer = await crypto.subtle.digest('SHA-256', byteArray);

        // Step 4: Convert to URL-safe Base64
        return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
    }

    serializePixels(pixelData) {
        const bits = [];

        // Process pixels (4 bytes per pixel: RGBA)
        for (let i = 0; i < pixelData.length; i += 4) {
            const r = pixelData[i];
            bits.push(r < 128 ? 1 : 0);
        }

        // Pack bits into bytes
        const bytes = new Uint8Array(11250); // 300*300/8 = 11,250 bytes
        for (let i = 0; i < bits.length; i++) {
            const byteIndex = Math.floor(i / 8);
            const bitIndex = 7 - (i % 8); // MSB first
            bytes[byteIndex] |= bits[i] << bitIndex;
        }

        return bytes;
    }
}

// Initialize canvas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const painter = new CanvasPainter('paintCanvas');

    // Make painter globally available for potential future use
    window.canvasPainter = painter;
});
