#!/usr/bin/env node
// CLI version to convert CNG to JPG

import { ImageFile } from "./cng-to-jpg";
import { program } from "@commander-js/extra-typings";
import { promises as fs } from "fs";
import path from "path";

async function convertFiles(files: string[], outputFolder: string): Promise<void> {
    process.stdout.write(`Converting ${files.length} files\n`);
    for (let file of files) {
        process.stdout.write(`Converting ${file} -> `);
        const imgFile = await ImageFile.load(file);
        const jpgFile = imgFile.toJpg();
        const outFile = path.join(outputFolder, jpgFile.name);
        process.stdout.write(`${outFile}\n`);

        await fs.writeFile(outFile, jpgFile.data);
    }
}

async function convertFolder(folder: string, outputFolder: string): Promise<void> {
    process.stdout.write(`Converting all CNG files in ${folder}\n`);
    // Recursively collect all NGM files
    const foundFiles = await fs.readdir(folder, { withFileTypes: true, recursive: true });
    const files = foundFiles.filter((f) => {
        return f.isFile() && f.name.toLowerCase().endsWith(".cng")
    }).map((f) => {
        return path.join(f.parentPath, f.name);
    });
    for (let file of files) {
        process.stdout.write(`Converting ${file} -> `);
        const imgFile = await ImageFile.load(file);
        const jpgFile = imgFile.toJpg();
        const pathPart = path.dirname(path.relative(folder, file));
        let outFolder = path.join(outputFolder, pathPart);
        // Check if folder exists
        const folderExists = await fs.stat(outFolder).then((stats) => stats.isDirectory()).catch(() => false);
        if (!folderExists) {
            process.stdout.write(`[mkdir]`);
            await fs.mkdir(outFolder, { recursive: true });
        }
        const outFile = path.join(outFolder, jpgFile.name);
        process.stdout.write(`${outFile}\n`);

        await fs.writeFile(outFile, jpgFile.data);
    }
}

program
    .command("convert")
    .requiredOption("-o, --output <output>", "Output directory to save the images to", process.cwd())
    .argument("<files...>", "Files to convert", )
    .description("Convert CNG files to JPG")
    .action((files, { output }) => convertFiles(files, output));
program
    .command("convertFolder <folder>")
    .requiredOption("-o, --output <output>", "Output directory to save the images to", process.cwd())
    .description("Recursively convert all CNG files in a folder to JPG")
    .action((folder, { output }) => convertFolder(folder, output));

program.parse();