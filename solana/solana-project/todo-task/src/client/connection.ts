import {
    ComputeBudgetProgram,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
import {createKeypairFromFile} from './util';
import fs from 'mz/fs';
import os from 'os';
import path from 'path';
import yaml from 'yaml';
// import {Buffer} from 'buffer';
import {Buffer} from 'node:buffer';
import {TodoTask} from "./todo";
import {Task, TodoStorage} from "./todoStorage";
import * as borsh from 'borsh';
import {v4 as uuid} from 'uuid';
/*
Path to Solana CLI config file.
*/
const CONFIG_FILE_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml',
);


let connection: Connection;
let localKeypair: Keypair;
let programKeypair: Keypair;
let programId: PublicKey;
let clientPubKey: PublicKey;


const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program');


/*
Connect to dev net.
*/
export async function connect() {
    connection = new Connection('http://127.0.0.1:8899/', 'confirmed');

    console.log(`Successfully connected to Solana dev net.`);
}


/*
Use local keypair for client.
*/
export async function getLocalAccount() {
    const configYml = await fs.readFile(CONFIG_FILE_PATH, {encoding: 'utf8'});
    const keypairPath = await yaml.parse(configYml).keypair_path;
    localKeypair = await createKeypairFromFile(keypairPath);
    // const airdropRequest = await connection.requestAirdrop(
    //     localKeypair.publicKey,
    //     LAMPORTS_PER_SOL*2,
    // );
    // await connection.confirmTransaction(airdropRequest);

    console.log(`Local account loaded successfully.`);
    console.log(`Local account's address is:`);
    console.log(`   ${localKeypair.publicKey}`);
}


/*
Get the targeted program.
*/
export async function getProgram(programName: string) {
    programKeypair = await createKeypairFromFile(
        path.join(PROGRAM_PATH, programName + '-keypair.json')
    );
    programId = programKeypair.publicKey;

    console.log(`We're going to ping the ${programName} program.`);
    console.log(`It's Program ID is:`);
    console.log(`   ${programId.toBase58()}`)
}


/*
Configure client account.
*/
export async function configureClientAccount(accountSpaceSize: number) {
    const SEED = "jay-1";
    clientPubKey = await PublicKey.createWithSeed(
        localKeypair.publicKey,
        SEED,
        programId,
    );

    // console.log(`For simplicity's sake, we've created an address using a seed.`);
    // console.log(`That seed is just the string "test(num)".`);
    console.log(`The generated address is:`);
    console.log(`   ${clientPubKey.toBase58()}`);
    console.log("accountSpaceSize =" + accountSpaceSize);

    // Make sure it doesn't exist already.
    const clientAccount = await connection.getAccountInfo(clientPubKey);
    console.log(clientAccount);
    if (clientAccount === null) {

        console.log(`Looks like that account does not exist. Let's create it.`);

        const transaction = new Transaction().add(
            SystemProgram.createAccountWithSeed({
                fromPubkey: localKeypair.publicKey,
                basePubkey: localKeypair.publicKey,
                seed: SEED,
                newAccountPubkey: clientPubKey,
                lamports: LAMPORTS_PER_SOL,
                space: 10240,
                programId,
            }),
        );
        await sendAndConfirmTransaction(connection, transaction, [localKeypair]);

        console.log(`Client account created successfully.`);
    } else {
        console.log(clientAccount);
        console.log(`Looks like that account exists already. We can just use it.`);
    }
}


/*
Ping the program.
*/
export async function pushData(programName: string, data: Buffer) {
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

    const instruction = new TransactionInstruction({
        keys: [{pubkey: clientPubKey, isSigner: false, isWritable: true}],
        programId,
        data: data,
    });
    console.log(JSON.stringify(instruction));
    await sendAndConfirmTransaction(
        connection,
        new Transaction()
            // .add(modifyComputeUnits)
            // .add(addPriorityFee)
            .add(instruction),
        [localKeypair],
    );

    console.log("Ping successful...");

}

export async function dataRetrive(): Promise<Task[]> {
    const clientAccount = await connection.getAccountInfo(clientPubKey);
    if (clientAccount !== null) {
        // console.log(clientAccount);
        console.log(clientAccount.data);
        // const TaskSchema = new Map([
        //     [Task, {kind: 'struct', fields: [['id', 'u32'], ['title', 'string'], ['operation', 'u8']]},],
        // ]);
        const TodoStorageSchema = new Map<any, any>([
            [Task, {kind: 'struct', fields: [['id', 'string'], ['title', 'string']]}],
            [TodoStorage, {
                kind: 'struct',
                fields: [["tasks", [Task]]]
            }]
        ]);
        const obj3: TodoStorage = borsh.deserializeUnchecked(TodoStorageSchema, TodoStorage, clientAccount.data);
        console.log(JSON.stringify(obj3));
        return obj3.tasks.tasks;
        // let tasks: Task[] = [];
        // return tasks;
    } else {
        let tasks: Task[] = [];
        return tasks;
    }


}

export async function getData(programName: string) {
    const defaultObject = new TodoTask({id: "", title: "", operation: 1});
    await connect();
    // console.log("Connection done");
    await getLocalAccount();
    await getProgram(programName);
    await configureClientAccount(defaultObject.toBuffer().length);
    // console.log("configureClientAccount  done");
    let dataObj: Task[] = await dataRetrive();
    return dataObj;
}

export async function setData(data: Task, programName: string, operationId: number) {
    const dataObject = new TodoTask({id: data.id, title: data.title, operation: operationId});
    console.log(JSON.stringify(dataObject));
    await connect();
    console.log("Connection done");
    await getLocalAccount();
    await getProgram(programName);
    await configureClientAccount(dataObject.toBuffer().length);
    console.log("configureClientAccount  done");
    await pushData(programName, dataObject.toBuffer());
    return await getData(programName);
}

export async function removeData(data: Task, programName: string, operationId: number) {
    const dataObject = new TodoTask({id: data.id, title: "", operation: operationId});
    console.log(JSON.stringify(dataObject));
    await connect();
    // console.log("Connection done");
    await getLocalAccount();
    await getProgram(programName);
    await configureClientAccount(dataObject.toBuffer().length);
    // console.log("configureClientAccount  done");
    await pushData(programName, dataObject.toBuffer());
    return await getData(programName);
}


export async function sample_execution(programName: string) {

    // const defaultObject = new TodoTask({id: "", title: "", operation: 1});
    const limit = 35;
    console.log(limit);
    for (let i = 0; i < limit; i++) {
        const obj1 = new Task({id: uuid(), title: "auto_testing_" + i.toString()});
        // console.log(obj1);
        await setData(obj1, programName, 1);
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
}
