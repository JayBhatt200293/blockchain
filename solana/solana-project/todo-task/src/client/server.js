"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const connection_1 = require("./connection");
const todoStorage_1 = require("./todoStorage");
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let tasks = [];
// let todoStore = new TodoStorage();
const programName = "todo_smart_contracts";
const addOperationId = 1;
const editOperationId = 3;
const deleteOperationId = 2;
app.get('/', (req, res) => {
    console.log(path_1.default.join(__dirname, 'index.html'));
    // connect();
    // console.log("Connection done");
    // getLocalAccount();
    // getProgram(programName);
    // const defaultObject = new TodoTask({id: 0, title: "", operation: 1});
    // console.log(JSON.stringify(defaultObject));
    // configureClientAccount(defaultObject.toBuffer().length);
    // console.log("configureClientAccount  done");
    // sample_execution(programName);
    res.sendFile(path_1.default.join(__dirname, 'index.html'));
});
app.get('/api/tasks', (req, res) => {
    (0, connection_1.getData)(programName).then(data => {
        res.json(data);
    });
});
app.post('/api/tasks', (req, res) => {
    const task = new todoStorage_1.Task({ id: (0, uuid_1.v4)().toString(), title: req.body.text });
    (0, connection_1.setData)(task, programName, addOperationId)
        .then(data => {
        // console.log(JSON.stringify(data));
        res.status(200).json(data);
    });
});
app.put('/api/tasks/:id', (req, res) => {
    // console.log("putting task");
    // console.log("req.params.id =" + req.params.id);
    // console.log("req.params.id =" + req.body.text);
    // console.log(JSON.stringify(tasks));
    const task = new todoStorage_1.Task({ id: req.params.id, title: req.body.text });
    // const task = tasks.find((t) => t.id === req.params.id);
    console.log("Edit task", task);
    if (task != undefined) {
        // console.log(task.title);
        (0, connection_1.setData)(task, programName, editOperationId)
            .then(data => {
            // console.log(JSON.stringify(data));
            res.status(200).json(data);
        });
    }
});
app.delete('/api/tasks/:id', (req, res) => {
    console.log("Delete task = ", req.params.id);
    // console.log(req.body.text);
    const task = new todoStorage_1.Task({ id: req.params.id, title: "" });
    // = tasks.find((t) => t.id === req.params.id);
    if (task != undefined) {
        (0, connection_1.removeData)(task, programName, deleteOperationId).then(data => {
            console.log("Delete Updated Data=" + JSON.stringify(data));
            res.status(200).json(data);
        });
    }
});
app.listen(3000, () => console.log('Server running on http://localhost:3000/'));
