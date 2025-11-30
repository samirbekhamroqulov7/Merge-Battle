class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            memory: 0,
            frameTime: 0
        };
        this.setupMonitoring();
    }
    
    setupMonitoring() {
        this.monitorFPS();
        this.monitorMemory();
    }
    
    monitorFPS() {
        let frames = 0;
        let lastTime = performance.now();
        
        const countFrames = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
                
                if (this.metrics.fps < 30) {
                    console.warn(`Low FPS: ${this.metrics.fps}`);
                }
            }
            
            requestAnimationFrame(countFrames);
        };
        
        requestAnimationFrame(countFrames);
    }
    
    monitorMemory() {
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memory = performance.memory.usedJSHeapSize;
                
                if (this.metrics.memory > 100000000) { // 100MB
                    console.warn('High memory usage:', this.metrics.memory);
                }
            }, 5000);
        }
    }
    
    startMeasure(name) {
        performance.mark(`${name}-start`);
    }
    
    endMeasure(name) {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        const duration = performance.getEntriesByName(name).pop().duration;
        if (duration > 16) {
            console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
        }
        
        performance.clearMarks(`${name}-start`);
        performance.clearMarks(`${name}-end`);
        performance.clearMeasures(name);
    }
}