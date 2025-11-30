// Точка входа в игру
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Показываем экран загрузки
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
        
        // Инициализируем игру
        if (typeof GameInitializer !== 'undefined') {
            await GameInitializer.initialize();
        } else {
            // Fallback: запускаем вашу существующую инициализацию
            if (typeof MergeGame !== 'undefined') {
                window.game = new MergeGame();
            }
        }
        
        // Скрываем экран загрузки
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Failed to start game:', error);
        if (typeof ErrorHandler !== 'undefined') {
            ErrorHandler.showErrorToUser('Не удалось запустить игру');
        }
    }
});