class MergeSystem {
    constructor() {
        this.grid = new Map();
        this.spatialGrid = new Map();
        this.mergeCache = null;
        this.cacheDirty = true;
    }
    
    addItem(item) {
        const key = `${item.x},${item.y}`;
        this.grid.set(key, item);
        this.addToSpatialGrid(item);
        this.cacheDirty = true;
    }
    
    removeItem(x, y) {
        const key = `${x},${y}`;
        const item = this.grid.get(key);
        if (item) {
            this.grid.delete(key);
            this.removeFromSpatialGrid(item);
            this.cacheDirty = true;
        }
    }
    
    addToSpatialGrid(item) {
        const cellX = Math.floor(item.x / 2);
        const cellY = Math.floor(item.y / 2);
        const cellKey = `${cellX},${cellY}`;
        
        if (!this.spatialGrid.has(cellKey)) {
            this.spatialGrid.set(cellKey, []);
        }
        
        this.spatialGrid.get(cellKey).push(item);
    }
    
    findMergePairs() {
        if (!this.cacheDirty && this.mergeCache) {
            return this.mergeCache;
        }
        
        const merges = [];
        const processed = new Set();
        
        for (let [key, item] of this.grid) {
            if (processed.has(item)) continue;
            
            const similar = this.findSimilarItems(item);
            if (similar.length >= 2) {
                merges.push(similar);
                similar.forEach(i => processed.add(i));
            }
        }
        
        this.mergeCache = merges;
        this.cacheDirty = false;
        
        return merges;
    }
    
    findSimilarItems(targetItem) {
        const similar = [targetItem];
        const cellX = Math.floor(targetItem.x / 2);
        const cellY = Math.floor(targetItem.y / 2);
        
        // Проверяем только соседние клетки
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const cellKey = `${cellX + dx},${cellY + dy}`;
                const cellItems = this.spatialGrid.get(cellKey) || [];
                
                for (const item of cellItems) {
                    if (item !== targetItem && 
                        item.type === targetItem.type && 
                        item.level === targetItem.level) {
                        similar.push(item);
                    }
                }
            }
        }
        
        return similar;
    }
}