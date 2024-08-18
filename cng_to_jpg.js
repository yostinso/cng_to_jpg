function loadFile(file) {
    return new Promise((resolve, reject) => {
        let fileReader = new FileReader();
        fileReader.addEventListener('loadend', (event) => {
            resolve({
                name: file.name,
                type: file.type,
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
}
function xorFile(loadedFile) {
    return {
        ...loadedFile,
        data: loadedFile.data.map((byte) => byte ^ 0xef)
    }
}
function processFiles(fileList) {
    return Array.from(fileList).map((file) => {
        var xoredFiles = loadFile(file).then((file) => xorFile(file));
        return xoredFiles.then((xoredFile) => {
            var jpeg = new Blob([xoredFile.data], {type: xoredFile.type});
            var jpegUrl = URL.createObjectURL(jpeg);
            var img = document.createElement('img');
            img.alt = xoredFile.name;
            img.src = jpegUrl;
            return img;
        }).catch((error) => {
            console.error(error);
        });
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
    if (imgs.length > 0) {
        var controls = document.getElementById('controls');
        var downloadButton = document.getElementById('downloadAll');
        downloadButton.value = 'Download All ' + imgs.length + ' image(s)';
        controls.style.display = 'flex';
    }

    var downloadZipButton = document.getElementById('downloadZip');
    var hasZip = window.hasOwnProperty('zip');
    if (imgs.length > 1 && hasZip) {
        downloadZipButton.style.display = 'block';
    } else {
        downloadZipButton.style.display = 'none';
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
        Promise.all(processFiles(files)).then((imgs) => {
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
            Promise.all(processFiles(files)).then((imgs) => {
                layoutImages(imgs);
            });
        });
        input.click();
    });

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

    var hasZip = window.hasOwnProperty('zip');
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