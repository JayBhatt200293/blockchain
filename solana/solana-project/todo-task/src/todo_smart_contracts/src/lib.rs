use borsh::{BorshDeserialize, BorshSerialize};
use core::mem::size_of_val;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
struct TodoTask {
    id: String,
    title: String,
    operation: u8,
}

impl TodoTask {
    fn convertion(&self) -> Task {
        Task {
            id: self.id.clone(),
            title: self.title.clone(),
        }
    }
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
struct Task {
    id: String,
    title: String,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
struct TaskStorage {
    tasks: Vec<Task>,
}

impl TaskStorage {
    fn perform_operation(&mut self, todo_task: TodoTask) {
        match todo_task.operation {
            // Add Task
            1 => self.tasks.push(todo_task.convertion()),
            // Delete Task
            2 => {
                self.tasks.remove(
                    self.tasks
                        .iter()
                        .position(|t| t.id == todo_task.id)
                        .unwrap(),
                );
            }
            // Edit Task
            3 => {
                self.tasks.remove(
                    self.tasks
                        .iter()
                        .position(|t| t.id == todo_task.id)
                        .unwrap(),
                );
                self.tasks.push(todo_task.convertion());
            }
            _ => self.tasks.push(todo_task.convertion()),
        }
    }

    fn get_size(&self) -> usize {
        (size_of_val(&*self.tasks) + (size_of_val(&self) * 2)) * 10
    }
}

entrypoint!(process_instruction);
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;
    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("Account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // msg!("Debug output:");
    // msg!("Account ID: {}", account.key);
    // msg!("Executable?: {}", account.executable);
    // msg!("Lamports: {:#?}", account.lamports);
    // msg!("Debug output complete.");

    let task = TodoTask::try_from_slice(&instruction_data).expect("Invalid instruction data");
    // msg!("Task:");
    // msg!("task: {:?}", task);
    let mut task_storage: TaskStorage =
        TaskStorage::deserialize(&mut &account.data.borrow()[..]).expect("Deserialization failed");
    // msg!("task_storage: {:?}", task_storage);
    task_storage.perform_operation(task);
    let check_size: usize = task_storage.get_size();
    // size_of_val(&task_storage) * task_storage.tasks.len();
    // msg!("account.data_len:{}", account.data_len());
    // msg!("account length: {}:", &account.data.borrow().len());
    // msg!(
    //     "account.data size_of : {}",
    //     size_of_val(&account.data.borrow())
    // );
    // msg!(
    //     "size_of_val(&*account.data.borrow()) : {}",
    //     size_of_val(&*account.data)
    // );
    // msg!("size_of_val(task_storage):{}", size_of_val(&task_storage));
    // msg!("task_storage.tasks.len:{}", task_storage.tasks.len());
    // msg!(
    //     "size_of_val(&*task_storage.tasks):{}",
    //     size_of_val(&*task_storage.tasks)
    // );
    // // msg!(
    // //     "size_of_val(&*task_storage):{}",
    // //     size_of_val(&*task_storage)
    // // );
    // msg!("check_size: {}", check_size);

    if account.data_len() <= check_size {
        // msg!("Increase Size From:{:?}", account.data_len());
        // msg!("Task storage corrupted:{}", check_size);
        account
            .realloc(account.data_len() + 10240, false)
            .expect("Realloc failed");
        // msg!("Increase Size To :{:?}", account.data_len());
    }
    task_storage
        .serialize(&mut &mut account.data.borrow_mut()[..])
        .expect("Unable to serialize");

    // msg!("Debug output:");
    // msg!("last updated task_storage:{:?}", task_storage);
    Ok(())
}
