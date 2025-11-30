class GameInitializer {
    static async initialize() {
        try {
            // Система обработки ошибок должна быть первой!
            if (typeof ErrorHandler !== 'undefined') {
                ErrorHandler.init();
            }
            
            await this.preloadCriticalAssets();
            await this.initializeCoreSystems();
            this.startGameLoop();
            
        } catch (error) {
            console.error('Game initialization failed:', error);
            if (typeof ErrorHandler !== 'undefined') {
                ErrorHandler.handleGlobalError({ error });
            }
        }
    }
    
    static async preloadCriticalAssets() {
        // Загрузка критически важных ресурсов
        const assets = [
            'css/core/reset.css',
            'css/core/variables.css', 
            'css/main.css'
        ];
        
        await Promise.all(assets.map(url => this.loadCSS(url)));
    }
    
    static loadCSS(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
}