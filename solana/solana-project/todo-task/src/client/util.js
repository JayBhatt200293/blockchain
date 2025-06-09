"use strict";
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
exports.createKeypairFromFile = void 0;
const web3_js_1 = require("@solana/web3.js");
const fs_1 = __importDefault(require("mz/fs"));
function createKeypairFromFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const secretKeyString = yield fs_1.default.readFile(filePath, { encoding: 'utf8' });
        const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        return web3_js_1.Keypair.fromSecretKey(secretKey);
    });
}
exports.createKeypairFromFile = createKeypairFromFile;
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
