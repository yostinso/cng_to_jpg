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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageFile = void 0;
function baseName(path) {
    return path.split(/[\\/]/).pop();
}
function readFileFromFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.addEventListener("loadend", (evt) => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(new Uint8Array(reader.result));
                }
                else {
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
    });
}
function readFileFromFilename(filename) {
    if (typeof process == "object") {
        // We're in node, not a browser
        return new Promise((resolve, reject) => {
            let fs = require("fs");
            fs.readFile(filename, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    else {
        throw new Error("Can only read directly from disk when running under Node.");
    }
}
function rot0xEF(data) {
    let result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i] ^ 0xEF;
    }
    return result;
}
var FileMode;
(function (FileMode) {
    FileMode[FileMode["CNG"] = 0] = "CNG";
    FileMode[FileMode["JPG"] = 1] = "JPG";
})(FileMode || (FileMode = {}));
class ImageFile {
    static load(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (file instanceof File) {
                let data = yield readFileFromFile(file);
                return new ImageFile(file.name, data);
            }
            else {
                let data = yield readFileFromFilename(file);
                let basename = baseName(file);
                return new ImageFile(basename, data);
            }
        });
    }
    constructor(name, data, mode = FileMode.CNG) {
        this.name = name;
        this.data = data;
        this.mode = mode;
    }
    toJpg() {
        if (this.mode == FileMode.JPG) {
            return this;
        }
        let jpgData = rot0xEF(this.data);
        return new ImageFile(this.name.replace(/\.cng$/i, ".jpg"), jpgData, FileMode.JPG);
    }
    toCng() {
        if (this.mode == FileMode.CNG) {
            return this;
        }
        let cngData = rot0xEF(this.data);
        return new ImageFile(this.name.replace(/\.jpg$/i, ".cng"), cngData, FileMode.CNG);
    }
}
exports.ImageFile = ImageFile;
//# sourceMappingURL=cng-to-jpg.js.map