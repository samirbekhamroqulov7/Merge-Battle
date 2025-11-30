class ErrorHandler {
    static init() {
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
        
        // Также перехватываем console.error
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.logError({
                type: 'CONSOLE_ERROR',
                message: args.join(' '),
                timestamp: Date.now()
            });
            originalConsoleError.apply(console, args);
        };
    }
    
    static handleGlobalError(event) {
        const errorData = {
            type: 'GLOBAL_ERROR',
            message: event.error?.message || 'Unknown error',
            stack: event.error?.stack,
            timestamp: Date.now(),
            url: window.location.href
        };
        
        this.logError(errorData);
        this.showErrorToUser('Критическая ошибка. Перезагружаем игру...');
        
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
    
    static handlePromiseRejection(event) {
        const errorData = {
            type: 'PROMISE_REJECTION',
            message: event.reason?.message || 'Promise rejected',
            timestamp: Date.now()
        };
        
        this.logError(errorData);
        console.warn('Unhandled Promise rejection:', event.reason);
    }
    
    static showErrorToUser(message) {
        // Создаем простой UI для ошибки, если его нет
        let errorDiv = document.getElementById('error-modal');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-modal';
            errorDiv.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.8); color: white; 
                display: flex; align-items: center; justify-content: center;
                z-index: 9999; font-family: Arial, sans-serif;
            `;
            errorDiv.innerHTML = `
                <div style="background: #333; padding: 20px; border-radius: 10px; text-align: center;">
                    <h3 style="color: #ff4444;">Ошибка</h3>
                    <p id="error-message">${message}</p>
                    <button onclick="window.location.reload()" style="
                        background: #007bff; color: white; border: none; 
                        padding: 10px 20px; border-radius: 5px; cursor: pointer;
                        margin-top: 10px;
                    ">Перезагрузить игру</button>
                </div>
            `;
            document.body.appendChild(errorDiv);
        } else {
            document.getElementById('error-message').textContent = message;
            errorDiv.style.display = 'flex';
        }
    }
    
    static logError(errorData) {
        // Сохраняем ошибки в localStorage для отладки
        const errors = JSON.parse(localStorage.getItem('game-errors') || '[]');
        errors.push(errorData);
        localStorage.setItem('game-errors', JSON.stringify(errors.slice(-50))); // Последние 50 ошибок
        
        // Можно также отправлять на сервер для анализа
        if (navigator.onLine) {
            this.sendToAnalytics(errorData);
        }
    }
    
    static sendToAnalytics(errorData) {
        // Отправка ошибок на ваш сервер/аналитику
        fetch('/api/error-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(errorData)
        }).catch(() => { /* Игнорируем ошибки отправки */ });
    }
}