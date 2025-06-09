import express, {Request, Response} from 'express';
import cors from 'cors';
import path from 'path';
import {getData, removeData, setData} from "./connection";
import {Task} from "./todoStorage";
import {v4 as uuid} from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());


let tasks: Task[] = [];
// let todoStore = new TodoStorage();
const programName = "todo_smart_contracts";
const addOperationId: number = 1;
const editOperationId: number = 3;
const deleteOperationId: number = 2;
app.get('/', (req: Request, res: Response): void => {
    console.log(path.join(__dirname, 'index.html'));
    // connect();
    // console.log("Connection done");
    // getLocalAccount();
    // getProgram(programName);
    // const defaultObject = new TodoTask({id: 0, title: "", operation: 1});
    // console.log(JSON.stringify(defaultObject));
    // configureClientAccount(defaultObject.toBuffer().length);
    // console.log("configureClientAccount  done");
    // sample_execution(programName);
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/tasks', (req: Request, res: Response): void => {
    getData(programName).then(data => {
        res.json(data);
    });
});

app.post('/api/tasks', (req: Request, res: Response): void => {
    const task: Task = new Task({id: uuid().toString(), title: req.body.text});
    setData(task, programName, addOperationId)
        .then(data => {
            // console.log(JSON.stringify(data));
            res.status(200).json(data);
        });
});

app.put('/api/tasks/:id', (req: Request, res: Response): void => {
    // console.log("putting task");
    // console.log("req.params.id =" + req.params.id);
    // console.log("req.params.id =" + req.body.text);
    // console.log(JSON.stringify(tasks));
    const task: Task = new Task({id: req.params.id, title: req.body.text});
    // const task = tasks.find((t) => t.id === req.params.id);
    console.log("Edit task", task);
    if (task != undefined) {
        // console.log(task.title);
        setData(task, programName, editOperationId)
            .then(data => {
                // console.log(JSON.stringify(data));
                res.status(200).json(data);
            });
    }
});

app.delete('/api/tasks/:id', (req: Request, res: Response): void => {
    console.log("Delete task = ", req.params.id);
    // console.log(req.body.text);
    const task = new Task({id: req.params.id, title: ""});
    // = tasks.find((t) => t.id === req.params.id);
    if (task != undefined) {
        removeData(task, programName, deleteOperationId).then(data => {
            console.log("Delete Updated Data=" + JSON.stringify(data));
            res.status(200).json(data);
        });
    }
});

app.listen(3000, (): void => console.log('Server running on http://localhost:3000/'));