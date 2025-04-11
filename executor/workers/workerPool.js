const { Worker } = require('worker_threads');
const os = require('os');

class WorkerPool {
    constructor(workerPath, numWorkers = os.cpus().length - 1) {
        this.taskQueue = [];
        this.workers = [];
        this.freeWorkers = [];
        this.activeWorkers = new Map(); // Track active workers and their tasks
        
        for (let i = 0; i < numWorkers; i++) {
            const worker = new Worker(workerPath);
            
            worker.on('message', result => {
                this.handleTaskComplete(worker, result);
            });
            
            worker.on('error', error => {
                const taskWrapper = this.activeWorkers.get(worker);
                if (taskWrapper) {
                    taskWrapper.reject(error);
                    this.activeWorkers.delete(worker);
                }
                this.handleWorkerError(worker, error);
            });
            
            worker.on('exit', code => {
                this.handleWorkerExit(worker, code);
            });
            
            this.workers.push(worker);
            this.freeWorkers.push(worker);
        }
    }

    async runTask(task) {
        return new Promise((resolve, reject) => {
            const taskWrapper = {
                task,
                resolve,
                reject,
                timestamp: Date.now()
            };

            if (this.freeWorkers.length > 0) {
                this.runTaskOnWorker(this.freeWorkers.pop(), taskWrapper);
            } else {
                this.taskQueue.push(taskWrapper);
            }
        });
    }

    runTaskOnWorker(worker, taskWrapper) {
        try {
            this.activeWorkers.set(worker, taskWrapper);
            worker.postMessage(taskWrapper.task);
        } catch (error) {
            this.handleWorkerError(worker, error);
            taskWrapper.reject(error);
        }
    }

    handleTaskComplete(worker, result) {
        const taskWrapper = this.activeWorkers.get(worker);
        
        if (!taskWrapper) {
            console.warn('Received result from worker with no active task');
            return this.recycleWorker(worker);
        }

        this.activeWorkers.delete(worker);

        try {
            if (result && result.error) {
                taskWrapper.reject(new Error(result.error));
            } else {
                taskWrapper.resolve(result);
            }
        } catch (error) {
            console.error('Error handling task completion:', error);
        }

        this.recycleWorker(worker);
    }

    recycleWorker(worker) {
        // Check if worker is still alive before recycling
        if (worker && !worker.isDead) {
            if (this.taskQueue.length > 0) {
                this.runTaskOnWorker(worker, this.taskQueue.shift());
            } else {
                this.freeWorkers.push(worker);
            }
        } else {
            this.replaceWorker(worker);
        }
    }

    handleWorkerError(worker, error) {
        console.error('Worker error:', error);
        this.replaceWorker(worker);
    }

    handleWorkerExit(worker, code) {
        const taskWrapper = this.activeWorkers.get(worker);
        if (taskWrapper) {
            taskWrapper.reject(new Error(`Worker exited with code ${code}`));
            this.activeWorkers.delete(worker);
        }
        
        this.workers = this.workers.filter(w => w !== worker);
        this.freeWorkers = this.freeWorkers.filter(w => w !== worker);
        
        // Replace the dead worker if it wasn't terminated intentionally
        if (code !== 0) {
            this.replaceWorker(worker);
        }
    }

    replaceWorker(deadWorker) {
        // Remove the dead worker from all collections
        this.workers = this.workers.filter(w => w !== deadWorker);
        this.freeWorkers = this.freeWorkers.filter(w => w !== deadWorker);
        this.activeWorkers.delete(deadWorker);

        // Create a new worker
        const newWorker = new Worker(deadWorker.filename);
        
        newWorker.on('message', result => {
            this.handleTaskComplete(newWorker, result);
        });
        
        newWorker.on('error', error => {
            const taskWrapper = this.activeWorkers.get(newWorker);
            if (taskWrapper) {
                taskWrapper.reject(error);
                this.activeWorkers.delete(newWorker);
            }
            this.handleWorkerError(newWorker, error);
        });
        
        newWorker.on('exit', code => {
            this.handleWorkerExit(newWorker, code);
        });

        this.workers.push(newWorker);
        this.recycleWorker(newWorker);
    }

    async terminate() {
        // Reject any pending tasks
        this.taskQueue.forEach(taskWrapper => {
            taskWrapper.reject(new Error('Worker pool is shutting down'));
        });
        this.taskQueue = [];

        // Reject any active tasks
        for (const [worker, taskWrapper] of this.activeWorkers) {
            taskWrapper.reject(new Error('Worker pool is shutting down'));
        }
        this.activeWorkers.clear();

        // Terminate all workers
        const terminations = this.workers.map(worker => worker.terminate());
        await Promise.all(terminations);

        this.workers = [];
        this.freeWorkers = [];
    }
}

module.exports = WorkerPool;