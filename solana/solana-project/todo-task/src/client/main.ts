import * as data from "./connection";

async function main() {
    console.log("Program begain");
    // console.debug("TodoTask_Size", TodoTask_SIZE);
    await data.sample_execution("todo_smart_contracts");
}


main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);