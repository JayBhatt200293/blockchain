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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sample_execution = exports.removeData = exports.setData = exports.getData = exports.dataRetrive = exports.pushData = exports.configureClientAccount = exports.getProgram = exports.getLocalAccount = exports.connect = void 0;
const web3_js_1 = require("@solana/web3.js");
const util_1 = require("./util");
const fs_1 = __importDefault(require("mz/fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const yaml_1 = __importDefault(require("yaml"));
const todo_1 = require("./todo");
const todoStorage_1 = require("./todoStorage");
const borsh = __importStar(require("borsh"));
const uuid_1 = require("uuid");
/*
Path to Solana CLI config file.
*/
const CONFIG_FILE_PATH = path_1.default.resolve(os_1.default.homedir(), '.config', 'solana', 'cli', 'config.yml');
let connection;
let localKeypair;
let programKeypair;
let programId;
let clientPubKey;
const PROGRAM_PATH = path_1.default.resolve(__dirname, '../../dist/program');
/*
Connect to dev net.
*/
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        connection = new web3_js_1.Connection('http://127.0.0.1:8899/', 'confirmed');
        console.log(`Successfully connected to Solana dev net.`);
    });
}
exports.connect = connect;
/*
Use local keypair for client.
*/
function getLocalAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        const configYml = yield fs_1.default.readFile(CONFIG_FILE_PATH, { encoding: 'utf8' });
        const keypairPath = yield yaml_1.default.parse(configYml).keypair_path;
        localKeypair = yield (0, util_1.createKeypairFromFile)(keypairPath);
        // const airdropRequest = await connection.requestAirdrop(
        //     localKeypair.publicKey,
        //     LAMPORTS_PER_SOL*2,
        // );
        // await connection.confirmTransaction(airdropRequest);
        console.log(`Local account loaded successfully.`);
        console.log(`Local account's address is:`);
        console.log(`   ${localKeypair.publicKey}`);
    });
}
exports.getLocalAccount = getLocalAccount;
/*
Get the targeted program.
*/
function getProgram(programName) {
    return __awaiter(this, void 0, void 0, function* () {
        programKeypair = yield (0, util_1.createKeypairFromFile)(path_1.default.join(PROGRAM_PATH, programName + '-keypair.json'));
        programId = programKeypair.publicKey;
        console.log(`We're going to ping the ${programName} program.`);
        console.log(`It's Program ID is:`);
        console.log(`   ${programId.toBase58()}`);
    });
}
exports.getProgram = getProgram;
/*
Configure client account.
*/
function configureClientAccount(accountSpaceSize) {
    return __awaiter(this, void 0, void 0, function* () {
        const SEED = "jay-1";
        clientPubKey = yield web3_js_1.PublicKey.createWithSeed(localKeypair.publicKey, SEED, programId);
        // console.log(`For simplicity's sake, we've created an address using a seed.`);
        // console.log(`That seed is just the string "test(num)".`);
        console.log(`The generated address is:`);
        console.log(`   ${clientPubKey.toBase58()}`);
        console.log("accountSpaceSize =" + accountSpaceSize);
        // Make sure it doesn't exist already.
        const clientAccount = yield connection.getAccountInfo(clientPubKey);
        console.log(clientAccount);
        if (clientAccount === null) {
            console.log(`Looks like that account does not exist. Let's create it.`);
            const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccountWithSeed({
                fromPubkey: localKeypair.publicKey,
                basePubkey: localKeypair.publicKey,
                seed: SEED,
                newAccountPubkey: clientPubKey,
                lamports: web3_js_1.LAMPORTS_PER_SOL,
                space: 10240,
                programId,
            }));
            yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [localKeypair]);
            console.log(`Client account created successfully.`);
        }
        else {
            console.log(clientAccount);
            console.log(`Looks like that account exists already. We can just use it.`);
        }
    });
}
exports.configureClientAccount = configureClientAccount;
/*
Ping the program.
*/
function pushData(programName, data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`All right, let's run it.`);
        console.log(`Pinging ${programName} program...`);
        // console.log(`Running ${programName} in ${calcInstructions.length}`);
        // console.log(`We're going to ${await getStringForInstruction(operation, operatingValue)}`)
        // const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        //     units: 300,
        // });
        //
        // const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        //     microLamports: 20000,
        // });
        const instruction = new web3_js_1.TransactionInstruction({
            keys: [{ pubkey: clientPubKey, isSigner: false, isWritable: true }],
            programId,
            data: data,
        });
        console.log(JSON.stringify(instruction));
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, new web3_js_1.Transaction()
            // .add(modifyComputeUnits)
            // .add(addPriorityFee)
            .add(instruction), [localKeypair]);
        console.log("Ping successful...");
    });
}
exports.pushData = pushData;
function dataRetrive() {
    return __awaiter(this, void 0, void 0, function* () {
        const clientAccount = yield connection.getAccountInfo(clientPubKey);
        if (clientAccount !== null) {
            // console.log(clientAccount);
            console.log(clientAccount.data);
            // const TaskSchema = new Map([
            //     [Task, {kind: 'struct', fields: [['id', 'u32'], ['title', 'string'], ['operation', 'u8']]},],
            // ]);
            const TodoStorageSchema = new Map([
                [todoStorage_1.Task, { kind: 'struct', fields: [['id', 'string'], ['title', 'string']] }],
                [todoStorage_1.TodoStorage, {
                        kind: 'struct',
                        fields: [["tasks", [todoStorage_1.Task]]]
                    }]
            ]);
            const obj3 = borsh.deserializeUnchecked(TodoStorageSchema, todoStorage_1.TodoStorage, clientAccount.data);
            console.log(JSON.stringify(obj3));
            return obj3.tasks.tasks;
            // let tasks: Task[] = [];
            // return tasks;
        }
        else {
            let tasks = [];
            return tasks;
        }
    });
}
exports.dataRetrive = dataRetrive;
function getData(programName) {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultObject = new todo_1.TodoTask({ id: "", title: "", operation: 1 });
        yield connect();
        // console.log("Connection done");
        yield getLocalAccount();
        yield getProgram(programName);
        yield configureClientAccount(defaultObject.toBuffer().length);
        // console.log("configureClientAccount  done");
        let dataObj = yield dataRetrive();
        return dataObj;
    });
}
exports.getData = getData;
function setData(data, programName, operationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataObject = new todo_1.TodoTask({ id: data.id, title: data.title, operation: operationId });
        console.log(JSON.stringify(dataObject));
        yield connect();
        console.log("Connection done");
        yield getLocalAccount();
        yield getProgram(programName);
        yield configureClientAccount(dataObject.toBuffer().length);
        console.log("configureClientAccount  done");
        yield pushData(programName, dataObject.toBuffer());
        return yield getData(programName);
    });
}
exports.setData = setData;
function removeData(data, programName, operationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataObject = new todo_1.TodoTask({ id: data.id, title: "", operation: operationId });
        console.log(JSON.stringify(dataObject));
        yield connect();
        // console.log("Connection done");
        yield getLocalAccount();
        yield getProgram(programName);
        yield configureClientAccount(dataObject.toBuffer().length);
        // console.log("configureClientAccount  done");
        yield pushData(programName, dataObject.toBuffer());
        return yield getData(programName);
    });
}
exports.removeData = removeData;
function sample_execution(programName) {
    return __awaiter(this, void 0, void 0, function* () {
        // const defaultObject = new TodoTask({id: "", title: "", operation: 1});
        const limit = 35;
        console.log(limit);
        for (let i = 0; i < limit; i++) {
            const obj1 = new todoStorage_1.Task({ id: (0, uuid_1.v4)(), title: "auto_testing_" + i.toString() });
            // console.log(obj1);
            yield setData(obj1, programName, 1);
        }
        // let objData = await getData(programName);
        // let dataObj = await getData(programName);
        // console.log(JSON.stringify(dataObj));
        // data.length
        // const data = await getAccountData(
        //     connection, clientPubKey
        // )
        // console.log(data);
        // if (clientAccount === null) {
        // }
        // console.log("accountSpaceSize =" + defaultObject.toBuffer().length);
        // const obj2 = new TodoTask({id: 2, title: "abc_2",operation:1});
        // const obj3 = new TodoTask({id: 3, title: "abc_3",operation:1});
        // console.log(obj2);
        // await pingProgram(programName, obj2.toBuffer());
        // console.log(obj3);
        // await pingProgram(programName, obj3.toBuffer());
        // edit and delete operation
        // const obj4 = new TodoTask({id: 9, title: "abc_9",operation:1});
        // const obj5 = new TodoTask({id: 2, title: "abc_2",operation:2});
        // const obj6 = new TodoTask({id: 3, title: "testing_3",operation:3});
        // console.log(obj4);
        // await pingProgram(programName, obj4.toBuffer());
        // console.log(obj5);
        // await pingProgram(programName, obj5.toBuffer());
        // console.log(obj6);
        // await pingProgram(programName, obj6.toBuffer());
    });
}
exports.sample_execution = sample_execution;
