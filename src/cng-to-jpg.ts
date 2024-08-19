function baseName(path: string): string {
    return path.split(/[\\/]/).pop()!;
}

async function readFileFromFile(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.addEventListener("loadend", (evt) => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(new Uint8Array(reader.result));
            } else {
                reject("Unable to read file.");
            }
        });
        reader.addEventListener("error", (evt) => {
            reject(evt);
        });
        reader.addEventListener("abort", (evt) => {
            reject(evt);
        });
        reader.readAsArrayBuffer(file);
    });
}

function readFileFromFilename(filename: string): Promise<Uint8Array> {
    if (typeof process == "object") {
        // We're in node, not a browser
        return new Promise((resolve, reject) => {
            let fs = require("fs");
            fs.readFile(filename, (err: any, data: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    } else {
        throw new Error("Can only read directly from disk when running under Node.");
    }
}

function rot0xEF(data: Uint8Array): Uint8Array {
    let result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i] ^ 0xEF;
    }
    return result;
}

enum FileMode {
    CNG,
    JPG
}

export class ImageFile {
    name: string;
    data: Uint8Array;
    mode: FileMode;

    static async load(file: File): Promise<ImageFile>;
    static async load(filename: string): Promise<ImageFile>;
    static async load(file: File | string): Promise<ImageFile> {
        if (file instanceof File) {
            let data = await readFileFromFile(file);
            return new ImageFile(file.name, data);
        } else {
            let data = await readFileFromFilename(file);
            let basename = baseName(file);
            return new ImageFile(basename, data);
        }
    }

    private constructor(name: string, data: Uint8Array, mode: FileMode = FileMode.CNG) {
        this.name = name;
        this.data = data;
        this.mode = mode;
    }

    toJpg(): ImageFile {
        if (this.mode == FileMode.JPG) {
            return this;
        }

        let jpgData = rot0xEF(this.data);
        return new ImageFile(
            this.name.replace(/\.cng$/i, ".jpg"),
            jpgData,
            FileMode.JPG
        );
    }

    toCng(): ImageFile {
        if (this.mode == FileMode.CNG) {
            return this;
        }

        let cngData = rot0xEF(this.data);
        return new ImageFile(
            this.name.replace(/\.jpg$/i, ".cng"),
            cngData,
            FileMode.CNG
        );
    }
}