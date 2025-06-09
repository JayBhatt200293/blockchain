"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoTask = void 0;
const borsh = __importStar(require("borsh"));
const node_buffer_1 = require("node:buffer");
// class Assignable {
//     constructor(properties) {
//         for (const [key, value] of Object.entries(properties)) {
//             this[key] = value;
//         }
//     }
// }
class TodoTask {
    constructor(fields = undefined) {
        this.id = "";
        this.title = "";
        this.operation = 1;
        if (fields) {
            this.id = fields.id;
            this.title = fields.title;
            this.operation = fields.operation;
        }
    }
    toBuffer() {
        return node_buffer_1.Buffer.from(borsh.serialize(TodoTaskSchema, this));
    }
}
exports.TodoTask = TodoTask;
const TodoTaskSchema = new Map([
    [TodoTask, { kind: 'struct', fields: [['id', 'string'], ['title', 'string'], ['operation', 'u8']] },],
]);
// const defaultObject = new TodoTask({id: 0, title: ""});
// const TodoTask_SIZE = defaultObject.toBuffer().length
//     borsh.serialize(
//     TodoTaskSchema,
//     new TodoTask(),
// ).length;
// const obj2 = new TodoTask({id: 1, title: "abc_1"});
