class MergeGame {
    constructor() {
        // Инициализация систем
        this.performanceMonitor = window.performanceMonitor;
        this.objectPool = new ObjectPool(
            () => ({ 
                id: '', 
                type: '', 
                level: 1, 
                x: 0, 
                y: 0,
                element: null 
            }),
            (item) => {
                item.type = '';
                item.level = 1;
                item.x = 0;
                item.y = 0;
                if (item.element) {
                    item.element.remove();
                    item.element = null;
                }
            },
            16 // Размер пула для сетки 4x4
        );
        
        this.items = [];
        this.selectedItem = null;
        this.isBattleMode = false;
        this.gridSize = 4;
        
        // Системы
        this.mergeSystem = new MergeSystem();
        this.renderEngine = new RenderEngine();
        
        this.init();
    }
    
    init() {
        console.log('Initializing Merge Game...');
        
        // Инициализация UI
        this.setupEventListeners();
        this.createGrid();
        this.generateInitialItems();
        
        // Запуск рендеринга
        this.renderEngine.start();
        
        console.log('Game initialized successfully');
    }
    
    setupEventListeners() {
        // Обработчики для drag & drop, кликов и т.д.
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('touchstart', this.handleTouch.bind(this), { passive: false });
        
        // Обработчики для кнопок интерфейса
        const battleBtn = document.getElementById('battle-btn');
        if (battleBtn) {
            battleBtn.addEventListener('click', this.startBattle.bind(this));
        }
    }
    
    createGrid() {
        const grid = document.getElementById('game-grid');
        if (!grid) {
            console.error('Game grid element not found!');
            return;
        }
        
        grid.innerHTML = '';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        grid.style.gap = '10px';
        grid.style.padding = '20px';
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.style.cssText = `
                    width: 80px;
                    height: 80px;
                    background: #34495e;
                    border: 2px solid #2c3e50;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                `;
                
                cell.addEventListener('click', () => this.handleCellClick(x, y));
                grid.appendChild(cell);
            }
        }
    }
    
    generateInitialItems() {
        // Генерация начальных предметов
        const initialItems = [
            { type: 'sword', level: 1, x: 0, y: 0 },
            { type: 'sword', level: 1, x: 1, y: 0 },
            { type: 'potion', level: 1, x: 0, y: 1 },
            { type: 'shield', level: 1, x: 1, y: 1 }
        ];
        
        initialItems.forEach(itemData => {
            this.addItem(itemData);
        });
    }
    
    addItem(itemData) {
        const item = this.objectPool.acquire();
        Object.assign(item, itemData);
        item.id = `${item.type}-${item.level}-${Date.now()}`;
        
        this.items.push(item);
        this.mergeSystem.addItem(item);
        this.createItemElement(item);
        
        return item;
    }
    
    createItemElement(item) {
        const cell = document.querySelector(`[data-x="${item.x}"][data-y="${item.y}"]`);
        if (!cell) return;
        
        const element = document.createElement('div');
        element.className = `game-item ${item.type} level-${item.level}`;
        element.dataset.itemId = item.id;
        element.style.cssText = `
            width: 70px;
            height: 70px;
            background: ${this.getItemColor(item.type, item.level)};
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            cursor: grab;
            user-select: none;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
        
        element.textContent = `${item.type[0].toUpperCase()}${item.level}`;
        
        // Drag & Drop события
        element.addEventListener('mousedown', (e) => this.startDrag(e, item));
        element.addEventListener('touchstart', (e) => this.startDrag(e, item));
        
        cell.appendChild(element);
        item.element = element;
    }
    
    getItemColor(type, level) {
        const colors = {
            sword: ['#e74c3c', '#c0392b', '#a93226', '#922b21', '#7b241c'],
            shield: ['#3498db', '#2980b9', '#2471a3', '#1f618d', '#1a5276'],
            potion: ['#9b59b6', '#8e44ad', '#7d3c98', '#6c3483', '#5b2c6f']
        };
        
        return colors[type]?.[level - 1] || '#95a5a6';
    }
    
    handleCellClick(x, y) {
        if (this.isBattleMode) {
            this.handleBattleAction(x, y);
            return;
        }
        
        const existingItem = this.items.find(item => item.x === x && item.y === y);
        
        if (this.selectedItem) {
            if (existingItem) {
                // Попытка слияния
                this.tryMerge(this.selectedItem, existingItem);
            } else {
                // Перемещение предмета
                this.moveItem(this.selectedItem, x, y);
            }
            this.deselectItem();
        } else if (existingItem) {
            this.selectItem(existingItem);
        }
    }
    
    selectItem(item) {
        this.deselectItem();
        this.selectedItem = item;
        if (item.element) {
            item.element.style.transform = 'scale(1.1)';
            item.element.style.boxShadow = '0 0 15px gold';
        }
    }
    
    deselectItem() {
        if (this.selectedItem && this.selectedItem.element) {
            this.selectedItem.element.style.transform = 'scale(1)';
            this.selectedItem.element.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        }
        this.selectedItem = null;
    }
    
    tryMerge(item1, item2) {
        if (item1.type === item2.type && item1.level === item2.level && item1.level < 5) {
            this.mergeItems(item1, item2);
        } else {
            this.showMessage('Нельзя объединить эти предметы!');
        }
    }
    
    mergeItems(item1, item2) {
        const newLevel = item1.level + 1;
        const newX = item2.x;
        const newY = item2.y;
        
        // Удаляем старые предметы
        this.removeItem(item1.x, item1.y);
        this.removeItem(item2.x, item2.y);
        
        // Создаем новый улучшенный предмет
        this.addItem({
            type: item1.type,
            level: newLevel,
            x: newX,
            y: newY
        });
        
        this.showMessage(`Объединено! Уровень ${newLevel}`);
        this.checkForAutoMerges();
    }
    
    removeItem(x, y) {
        const index = this.items.findIndex(item => item.x === x && item.y === y);
        if (index !== -1) {
            const item = this.items[index];
            this.objectPool.release(item);
            this.items.splice(index, 1);
            this.mergeSystem.removeItem(x, y);
            
            if (item.element) {
                item.element.remove();
            }
        }
    }
    
    moveItem(item, newX, newY) {
        const existingItem = this.items.find(i => i.x === newX && i.y === newY);
        if (existingItem) return; // Клетка занята
        
        item.x = newX;
        item.y = newY;
        
        if (item.element) {
            const cell = document.querySelector(`[data-x="${newX}"][data-y="${newY}"]`);
            if (cell) {
                cell.appendChild(item.element);
            }
        }
    }
    
    checkForAutoMerges() {
        const merges = this.mergeSystem.findMergePairs();
        if (merges.length > 0) {
            this.showMessage(`Доступно ${merges.length} автоматических объединений!`);
        }
    }
    
    startBattle() {
        this.isBattleMode = true;
        this.showMessage('Режим битвы активирован!');
        
        // Здесь будет логика начала битвы
        document.getElementById('game-container').classList.add('battle-mode');
    }
    
    handleBattleAction(x, y) {
        // Логика действий в режиме битвы
        const item = this.items.find(i => i.x === x && i.y === y);
        if (item) {
            this.showMessage(`Атака предметом: ${item.type} уровня ${item.level}`);
        }
    }
    
    showMessage(text) {
        // Простая система сообщений
        const messageDiv = document.getElementById('game-message') || this.createMessageElement();
        messageDiv.textContent = text;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 2000);
    }
    
    createMessageElement() {
        const messageDiv = document.createElement('div');
        messageDiv.id = 'game-message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            display: none;
        `;
        document.body.appendChild(messageDiv);
        return messageDiv;
    }
    
    startDrag(e, item) {
        e.preventDefault();
        this.selectItem(item);
        // Здесь будет логика drag & drop
    }
    
    handleTouch(e) {
        e.preventDefault();
        // Обработка тач событий
    }
    
    handleClick(e) {
        // Глобальная обработка кликов
    }
    
    // Метод для сохранения игры
    saveGame() {
        const saveData = {
            items: this.items.map(item => ({
                type: item.type,
                level: item.level,
                x: item.x,
                y: item.y
            })),
            timestamp: Date.now()
        };
        
        localStorage.setItem('mergeBattleSave', JSON.stringify(saveData));
        this.showMessage('Игра сохранена!');
    }
    
    // Метод для загрузки игры
    loadGame() {
        const saved = localStorage.getItem('mergeBattleSave');
        if (saved) {
            try {
                const saveData = JSON.parse(saved);
                
                // Очищаем текущее состояние
                this.items.forEach(item => this.removeItem(item.x, item.y));
                
                // Загружаем сохраненные предметы
                saveData.items.forEach(itemData => {
                    this.addItem(itemData);
                });
                
                this.showMessage('Игра загружена!');
            } catch (error) {
                console.error('Error loading game:', error);
                this.showMessage('Ошибка загрузки сохранения');
            }
        }
    }
}

// Инициализация игры когда DOM готов
document.addEventListener('DOMContentLoaded', () => {
    window.game = new MergeGame();
});