import * as borsh from 'borsh';
import {Buffer} from 'node:buffer';
// class Assignable {
//     constructor(properties) {
//         for (const [key, value] of Object.entries(properties)) {
//             this[key] = value;
//         }
//     }
// }

export class TodoTask {
    id = "";
    title = "";
    operation = 1;

    constructor(fields: { id: string, title: string, operation: number } | undefined = undefined) {
        if (fields) {
            this.id = fields.id;
            this.title = fields.title;
            this.operation = fields.operation;
        }
    }

    toBuffer() {
        return Buffer.from(borsh.serialize(TodoTaskSchema, this));
    }
}

const TodoTaskSchema = new Map([
    [TodoTask, {kind: 'struct', fields: [['id', 'string'], ['title', 'string'], ['operation', 'u8']]},],
]);
// const defaultObject = new TodoTask({id: 0, title: ""});
// const TodoTask_SIZE = defaultObject.toBuffer().length
//     borsh.serialize(
//     TodoTaskSchema,
//     new TodoTask(),
// ).length;


// const obj2 = new TodoTask({id: 1, title: "abc_1"});

