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
exports.configureDropzone = void 0;
const cng_to_jpg_1 = require("./cng-to-jpg");
const { BlobWriter, ZipWriter } = require('@zip.js/zip.js');
function processFiles(files) {
    return __awaiter(this, void 0, void 0, function* () {
        let imgFiles = [];
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let img = yield cng_to_jpg_1.ImageFile.load(file);
            imgFiles.push(img.toJpg());
        }
        return imgFiles;
    });
}
function layoutImages(imgs) {
    const container = document.getElementById('jpegs');
    if (container === null) {
        throw new Error('Could not find element with id "jpegs"');
    }
    // Clean up any existing images' Object URLs which otherwise would leak memory
    document.querySelectorAll('#jpegs img').forEach((img) => URL.revokeObjectURL(img.src));
    // Render all the images
    container.innerHTML = '';
    for (let img of imgs) {
        let imgElement = document.createElement('img');
        imgElement.alt = img.name;
        imgElement.title = img.name;
        imgElement.src = URL.createObjectURL(new Blob([img.data], { type: 'image/jpeg' }));
        let div = document.createElement('div');
        div.appendChild(imgElement);
        container.appendChild(div);
    }
    showDownloadButtons(imgs.length);
}
function showDownloadButtons(numImages) {
    // Show normal download button if there are 1-10 images
    const downloadButton = document.getElementById('downloadAll');
    if (downloadButton === null) {
        throw new Error('Could not find element with id "downloadAll"');
    }
    downloadButton.style.display = numImages > 0 && numImages <= 10 ? 'block' : 'none';
    downloadButton.value = numImages > 1 ? `Download all ${numImages} images` : 'Download image';
    // Attach click handler to download button
    downloadButton.onclick = () => {
        let imgs = document.querySelectorAll('#jpegs img');
        for (let img of imgs) {
            let a = document.createElement('a');
            a.href = img.src;
            a.download = img.title;
            a.click();
        }
    };
    // Show download zip button if there are > 1 images
    const downloadZipButton = document.getElementById('downloadZip');
    if (downloadZipButton === null) {
        throw new Error('Could not find element with id "downloadZip"');
    }
    downloadZipButton.style.display = numImages > 1 ? 'block' : 'none';
    // Attach click handler to download zip button
    downloadZipButton.onclick = () => __awaiter(this, void 0, void 0, function* () {
        let imgs = document.querySelectorAll('#jpegs img');
        let blobWriter = new BlobWriter("application/zip");
        let zipWriter = new ZipWriter(blobWriter);
        for (let img of imgs) {
            let resp = yield fetch(img.src);
            let blob = yield resp.blob();
            yield zipWriter.add(img.title, blob.stream(), { level: 0 });
        }
        zipWriter.close();
        blobWriter.getData((blob) => {
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'images.zip';
            a.click();
            URL.revokeObjectURL(a.href);
        });
    });
}
function configureDropzone(dropzoneId) {
    const dropzone = document.getElementById(dropzoneId);
    if (dropzone === null) {
        throw new Error(`Could not find element with id ${dropzoneId}`);
    }
    dropzone.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer != null) {
            let files = e.dataTransfer.files;
            processFiles(files).then((imgs) => {
                layoutImages(imgs);
            });
        }
    });
    dropzone.addEventListener('click', function (e) {
        var input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.cng';
        input.addEventListener('change', function (e) {
            if (e.target instanceof HTMLInputElement && e.target.files != null) {
                var files = e.target.files;
                processFiles(files).then((imgs) => {
                    layoutImages(imgs);
                });
            }
        });
        input.click();
    });
}
exports.configureDropzone = configureDropzone;
