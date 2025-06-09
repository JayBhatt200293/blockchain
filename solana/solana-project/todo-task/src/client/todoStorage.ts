export class Task {
    id: string = "";
    title: string = "";

    constructor(fields: { id: string, title: string } | undefined = undefined) {
        if (fields) {
            this.id = fields.id;
            this.title = fields.title;
        }
    }
}

export class TestStorage {
    tasks: Task[];

    constructor(tasks: Task[]) {
        this.tasks = tasks;
    }
}

export class TodoStorage {
    tasks: TestStorage;

    constructor(tasks: TestStorage) {
        this.tasks = tasks;
    }
}