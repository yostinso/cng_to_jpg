#!/usr/bin/env node
"use strict";
// CLI version to convert CNG to JPG
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
const cng_to_jpg_1 = require("./cng-to-jpg");
const extra_typings_1 = require("@commander-js/extra-typings");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
function convertFiles(files, outputFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        process.stdout.write(`Converting ${files.length} files\n`);
        for (let file of files) {
            process.stdout.write(`Converting ${file} -> `);
            const imgFile = yield cng_to_jpg_1.ImageFile.load(file);
            const jpgFile = imgFile.toJpg();
            const outFile = path_1.default.join(outputFolder, jpgFile.name);
            process.stdout.write(`${outFile}\n`);
            yield fs_1.promises.writeFile(outFile, jpgFile.data);
        }
    });
}
function convertFolder(folder, outputFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        process.stdout.write(`Converting all CNG files in ${folder}\n`);
        // Recursively collect all NGM files
        const foundFiles = yield fs_1.promises.readdir(folder, { withFileTypes: true, recursive: true });
        const files = foundFiles.filter((f) => {
            return f.isFile() && f.name.toLowerCase().endsWith(".cng");
        }).map((f) => {
            return path_1.default.join(f.parentPath, f.name);
        });
        for (let file of files) {
            process.stdout.write(`Converting ${file} -> `);
            const imgFile = yield cng_to_jpg_1.ImageFile.load(file);
            const jpgFile = imgFile.toJpg();
            const pathPart = path_1.default.dirname(path_1.default.relative(folder, file));
            let outFolder = path_1.default.join(outputFolder, pathPart);
            // Check if folder exists
            const folderExists = yield fs_1.promises.stat(outFolder).then((stats) => stats.isDirectory()).catch(() => false);
            if (!folderExists) {
                process.stdout.write(`[mkdir]`);
                yield fs_1.promises.mkdir(outFolder, { recursive: true });
            }
            const outFile = path_1.default.join(outFolder, jpgFile.name);
            process.stdout.write(`${outFile}\n`);
            yield fs_1.promises.writeFile(outFile, jpgFile.data);
        }
    });
}
extra_typings_1.program
    .command("convert")
    .requiredOption("-o, --output <output>", "Output directory to save the images to", process.cwd())
    .argument("<files...>", "Files to convert")
    .description("Convert CNG files to JPG")
    .action((files, { output }) => convertFiles(files, output));
extra_typings_1.program
    .command("convertFolder <folder>")
    .requiredOption("-o, --output <output>", "Output directory to save the images to", process.cwd())
    .description("Recursively convert all CNG files in a folder to JPG")
    .action((folder, { output }) => convertFolder(folder, output));
extra_typings_1.program.parse();
//# sourceMappingURL=index.js.map