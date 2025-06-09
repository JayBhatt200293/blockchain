"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoStorage = exports.TestStorage = exports.Task = void 0;
class Task {
    constructor(fields = undefined) {
        this.id = "";
        this.title = "";
        if (fields) {
            this.id = fields.id;
            this.title = fields.title;
        }
    }
}
exports.Task = Task;
class TestStorage {
    constructor(tasks) {
        this.tasks = tasks;
    }
}
exports.TestStorage = TestStorage;
class TodoStorage {
    constructor(tasks) {
        this.tasks = tasks;
    }
}
exports.TodoStorage = TodoStorage;
