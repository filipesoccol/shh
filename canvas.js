// Canvas painting functionality
class CanvasPainter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.pixelCount = 0;
        this.initialImageData = null;

        this.initializeCanvas();
        this.setupEventListeners();
    } initializeCanvas() {
        // Set canvas background to white
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set drawing properties
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Store initial image data for pixel counting
        this.initialImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    setupEventListeners() {
        // Bind methods to preserve 'this' context and enable proper removal
        this.boundStartDrawing = (e) => this.startDrawing(e);
        this.boundDraw = (e) => this.draw(e);
        this.boundStopDrawing = () => this.stopDrawing();
        this.boundHandleTouchStart = (e) => this.handleTouch(e, 'start');
        this.boundHandleTouchMove = (e) => this.handleTouch(e, 'move');
        this.boundHandleTouchEnd = (e) => this.handleTouch(e, 'end');
        this.boundPreventDefault = (e) => e.preventDefault();

        // Mouse events
        this.canvas.addEventListener('mousedown', this.boundStartDrawing);
        this.canvas.addEventListener('mousemove', this.boundDraw);
        this.canvas.addEventListener('mouseup', this.boundStopDrawing);
        this.canvas.addEventListener('mouseout', this.boundStopDrawing);

        // Touch events for mobile support
        this.canvas.addEventListener('touchstart', this.boundHandleTouchStart);
        this.canvas.addEventListener('touchmove', this.boundHandleTouchMove);
        this.canvas.addEventListener('touchend', this.boundHandleTouchEnd);

        // Prevent scrolling when touching the canvas
        this.canvas.addEventListener('touchstart', this.boundPreventDefault);
        this.canvas.addEventListener('touchend', this.boundPreventDefault);
        this.canvas.addEventListener('touchmove', this.boundPreventDefault);
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

    async countPaintedPixels() {
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

        // Dispatch custom event when pixel count reaches 5000
        if (paintedPixels >= 5000) {
            const pixelThresholdEvent = new CustomEvent('PasswordReady', {
                detail: {
                    pixelCount: paintedPixels,
                    password: await this.imageToPassword()
                }
            });
            console.log(`Pixel count reached:`, pixelThresholdEvent);
            document.dispatchEvent(pixelThresholdEvent);
        }
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

    async imageToPassword() {
        const imageData = this.ctx.getImageData(0, 0, 300, 300);
        const byteArray = this.serializePixels(imageData.data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', byteArray);
        return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
    }

    // Destructor method to clean up resources and event listeners
    destroy() {
        // Remove mouse event listeners
        this.canvas.removeEventListener('mousedown', this.boundStartDrawing);
        this.canvas.removeEventListener('mousemove', this.boundDraw);
        this.canvas.removeEventListener('mouseup', this.boundStopDrawing);
        this.canvas.removeEventListener('mouseout', this.boundStopDrawing);

        // Remove touch event listeners
        this.canvas.removeEventListener('touchstart', this.boundHandleTouchStart);
        this.canvas.removeEventListener('touchmove', this.boundHandleTouchMove);
        this.canvas.removeEventListener('touchend', this.boundHandleTouchEnd);

        // Remove preventDefault listeners
        this.canvas.removeEventListener('touchstart', this.boundPreventDefault);
        this.canvas.removeEventListener('touchend', this.boundPreventDefault);
        this.canvas.removeEventListener('touchmove', this.boundPreventDefault);

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Clear references
        this.canvas = null;
        this.ctx = null;
        this.initialImageData = null;
        this.boundStartDrawing = null;
        this.boundDraw = null;
        this.boundStopDrawing = null;
        this.boundHandleTouchStart = null;
        this.boundHandleTouchMove = null;
        this.boundHandleTouchEnd = null;
        this.boundPreventDefault = null;

        // Remove from global scope if present
        if (window.canvasPainter === this) {
            window.canvasPainter = null;
        }
    }
}

// Initialize canvas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const painter = new CanvasPainter('paintCanvas');

    // Make painter globally available for potential future use
    window.canvasPainter = painter;
});
