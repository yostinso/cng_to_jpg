class LoadedFile {
    static async create(file) {
        let promise = new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            fileReader.addEventListener('loadend', (event) => {
                resolve({
                    name: file.name,
                    size: file.size,
                    data: new Uint8Array(fileReader.result)
                });
            });
            fileReader.addEventListener('error', (event) => {
                reject(event);
            });
            fileReader.addEventListener('abort', (event) => {
                reject(event);
            });
            fileReader.readAsArrayBuffer(file);
        });
        let data = await promise;
        return new LoadedFile(data);
    }
    constructor({ name, size, data }) {
        this.name = name;
        this.size = size;
        this.data = data;
    }
    extname() {
        return this.name.split('.').pop().toLowerCase();
    }
    type() {
        return this.extname() === 'cng' ? 'application/octet-stream' : 'image/jpeg';
    }
    toJpg() {
        if (this.extname() === 'cng') {
            this.xor();
            this.name = this.name.replace(/.cng/i, '.jpg');
        }
        return this;
    }
    toCng() {
        if (this.extname() === 'jpg') {
            this.xor();
            this.name = this.name.replace(/.jpg/i, '.cng');
        }
        return this;
    }
    xor() {
        this.data = this.data.map((byte) => byte ^ 0xef);
    }
}

async function processFiles(fileList) {
    let loadedFiles = [];
    for (let file of fileList) {
        let loadedFile = await LoadedFile.create(file);
        loadedFile.toJpg();
        loadedFiles.push(loadedFile);
    }
    return loadedFiles.map((loadedFile) => {
        let jpeg = new Blob([loadedFile.data], { type: loadedFile.type() });
        let jpegUrl = URL.createObjectURL(jpeg);
        let img = document.createElement('img');
        img.alt = loadedFile.name;
        img.src = jpegUrl;
        return img;
    });
}

function layoutImages(imgs) {
    var jpegs = document.getElementById('jpegs');
    document.querySelectorAll('#jpegs img').forEach((img) => URL.revokeObjectURL(img.src));
    jpegs.innerHTML = '';
    imgs.forEach((img, i) => {
        var container = document.createElement('div');
        jpegs.appendChild(container);
        container.appendChild(img);
    });
    var downloadButton = document.getElementById('downloadAll');
    if (imgs.length > 0 && imgs.length <= 10) {
        downloadButton.style.display = 'block';
        if (imgs.length > 1) {
            downloadButton.value = 'Download All ' + imgs.length + ' images';
        } else {
            downloadButton.value = 'Download Image';
        }
    } else {
        downloadButton.style.display = 'none';
    }

    var downloadZipButton = document.getElementById('downloadZip');
    var hasZip = window.hasOwnProperty('zip');
    if (imgs.length > 1 && hasZip) {
        downloadZipButton.style.display = 'block';
    } else {
        downloadZipButton.style.display = 'none';
    }
}

async function readDirectory(folderPromise, path = '') {
    var cngFiles = [];
    const folderHandle = await folderPromise;
    path = path + folderHandle.name + '/';
    for await (let entry of folderHandle.values()) {
        if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.cng')) {
            file = await LoadedFile.create(await entry.getFile());
            file.path = path;
            cngFiles.push(file);
        } else if (entry.kind === 'directory') {
            cngFiles = [ ...cngFiles, ...await readDirectory(entry, path)];
        }
    }
    return cngFiles;
}

async function convertAndZipDirectory(folderPromise) {
    let files = await readDirectory(folderPromise);
    var hasZip = window.hasOwnProperty('zip');
    if (hasZip) {
        var blobWriter = new zip.BlobWriter("application/zip");
        var zipWriter = new zip.ZipWriter(blobWriter);
        for (let i in files) {
            let file = files[i];
            file.toJpg();
            await zipWriter.add(
                file.path + file.name,
                new zip.Uint8ArrayReader(file.data),
                { level: 0 }
            )
        }
        await zipWriter.close();
        await blobWriter.getData().then((blob) => {
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'images.zip';
            a.click();
            URL.revokeObjectURL(a.href);
        });
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    var dropzone = document.getElementById('dropzone');

    dropzone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
        var files = e.dataTransfer.files;
        processFiles(files).then((imgs) => {
            layoutImages(imgs);
        });
    });

    dropzone.addEventListener('click', function(e) {
        var input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.cng';
        input.addEventListener('change', function(e) {
            var files = e.target.files;
            processFiles(files).then((imgs) => {
                layoutImages(imgs);
            });
        });
        input.click();
    });

    var hasZip = window.hasOwnProperty('zip');
    if (hasZip) {
        var chooseFolderButton = document.getElementById('chooseFolder');
        chooseFolderButton.addEventListener('click', function() {
            convertAndZipDirectory(
                window.showDirectoryPicker({ id: "cngs", startIn: "downloads" })
            )
        });
    } else {
        chooseFolderButton.style.display = 'none';
    }

    var downloadAll = document.getElementById('downloadAll');
    downloadAll.addEventListener('click', function() {
        var imgs = document.querySelectorAll('#jpegs img');
        imgs.forEach((img) => {
            var a = document.createElement('a');
            a.href = img.src;
            a.download = img.alt.replace(/.cng/i, '.jpg');
            a.click();
        });
    });

    if (hasZip) {
        var downloadZip = document.getElementById('downloadZip');
        downloadZip.addEventListener('click', function() {
            var imgs = document.querySelectorAll('#jpegs img');
            var blobWriter = new zip.BlobWriter("application/zip");
            var zipWriter = new zip.ZipWriter(blobWriter);
            var imgs = document.querySelectorAll('#jpegs img');

            Promise.all(
                Array.from(imgs).map((img) => {
                    let filename = img.alt.replace(/.cng/i, '.jpg');
                    return fetch(img.src).then((r) => r.blob()).then((blob) => {
                        zipWriter.add(filename, blob.stream(), { level: 0 });
                    });
                })
            ).then(() => {
                zipWriter.close();
            }).then(() => {
                blobWriter.getData().then((blob) => {
                    var a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'images.zip';
                    a.click();
                    URL.revokeObjectURL(a.href);
                });
            });
        });
    }
});