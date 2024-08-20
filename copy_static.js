const fs = require("fs/promises");
const path = require("path");

const STATIC_FILES = [
    "src/static/cng_to_jpg.css",
    "src/static/cng_to_jpg.html",
    "src/static/zip.min.js"
];

async function getDistDir() {
    return fs.readFile("tsconfig.json").then((data) => {
        const tsconfig = JSON.parse(data);
        return tsconfig.compilerOptions.outDir;
    });
}

async function copyToDist() {
    const distDir = await getDistDir();
    for (const file of STATIC_FILES) {
        const fileName = path.basename(file);
        await fs.copyFile(file, `${distDir}/${fileName}`);
    }
}

copyToDist();