import {Keypair,} from '@solana/web3.js';
import fs from 'mz/fs';
// import * as fs from 'fs';
import * as BufferLayout from '@solana/buffer-layout';
import {Buffer} from 'buffer';


export async function createKeypairFromFile(
    filePath: string,
): Promise<Keypair> {
    const secretKeyString = await fs.readFile(filePath, {encoding: 'utf8'});
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
}

// export async function createTodoTask(
//     id: number, title: string): Promise<Buffer> {
//
//     const bufferLayout: BufferLayout.Structure<any> = BufferLayout.struct(
//         [
//             BufferLayout.u32("id"),
//             // BufferLayout.,
//             // BufferLayout.seq(BufferLayout.cstr("title"), title.length),
//             // BufferLayout.Layout.apply("title", Buffer.from(title, 'utf8').length)
//             // Buffer.from(title, 'utf8').length
//             BufferLayout.cstr("title")
//             // seq(BufferLayout.u8("title"), 100),
//         ]
//     );
//
//     const buffer = Buffer.alloc(bufferLayout.span);
//     console.log(title);
//     bufferLayout.encode({
//         id: id,
//         title: title
//     }, buffer);
//
//     return buffer;
// }