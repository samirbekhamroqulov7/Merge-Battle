class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = new Set();
        
        this.initialize(initialSize);
    }
    
    initialize(size) {
        for (let i = 0; i < size; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    acquire() {
        let obj = this.pool.pop() || this.createFn();
        this.active.add(obj);
        return obj;
    }
    
    release(obj) {
        if (this.active.has(obj)) {
            this.resetFn(obj);
            this.pool.push(obj);
            this.active.delete(obj);
        }
    }
    
    get activeCount() {
        return this.active.size;
    }
    
    get availableCount() {
        return this.pool.length;
    }
}