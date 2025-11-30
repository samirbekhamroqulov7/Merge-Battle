class RenderEngine {
    constructor() {
        this.lastRenderTime = 0;
        this.frameTime = 1000 / 60; // 60 FPS
        this.pendingFrame = null;
    }
    
    start() {
        this.render(performance.now());
    }
    
    stop() {
        if (this.pendingFrame) {
            cancelAnimationFrame(this.pendingFrame);
        }
    }
    
    render(timestamp) {
        if (timestamp - this.lastRenderTime < this.frameTime) {
            this.pendingFrame = requestAnimationFrame(this.render.bind(this));
            return;
        }
        
        this.lastRenderTime = timestamp;
        
        // Ваша логика рендеринга здесь
        this.renderGameObjects();
        this.renderUI();
        
        this.pendingFrame = requestAnimationFrame(this.render.bind(this));
    }
}