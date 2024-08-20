import { ImageFile as ImageFileT } from './cng-to-jpg';
let ImgFile: typeof ImageFileT;
let BlobWriter: any, ZipWriter: any;
declare global {
    let ImageFile: typeof ImageFileT;
    interface Window {
        zip: {
            BlobWriter: any;
            ZipWriter: any;
        }
    }
}
if (typeof window === 'undefined') {
    ImgFile = require("./cng-to-jpg");
    const zip = require('@zip.js/zip.js');
    BlobWriter = zip.BlobWriter;
    ZipWriter = zip.ZipWriter;
} else {
    ImgFile = ImageFile;
    ZipWriter = window.zip.ZipWriter;
    BlobWriter = window.zip.BlobWriter;
}

async function processFiles(files: FileList): Promise<ImageFileT[]> {
    let imgFiles: ImageFileT[] = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let img = await ImgFile.load(file);
        imgFiles.push(img.toJpg());
    }
    return imgFiles;
}

function layoutImages(imgs: ImageFileT[]) {
    const container = document.getElementById('jpegs');
    if (container === null) {
        throw new Error('Could not find element with id "jpegs"');
    }

    // Clean up any existing images' Object URLs which otherwise would leak memory
    document.querySelectorAll('#jpegs img').forEach((img) => URL.revokeObjectURL((img as HTMLImageElement).src));

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

function showDownloadButtons(numImages: number) {
    // Show normal download button if there are 1-10 images
    const downloadButton = document.getElementById('downloadAll') as HTMLButtonElement | null;
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
            a.href = (img as HTMLImageElement).src;
            a.download = (img as HTMLImageElement).title;
            a.click();
        }
    };

    // Show download zip button if there are > 1 images
    const downloadZipButton = document.getElementById('downloadZip') as HTMLButtonElement | null;
    if (downloadZipButton === null) {
        throw new Error('Could not find element with id "downloadZip"');
    }
    downloadZipButton.style.display = numImages > 1 ? 'block' : 'none';

    // Attach click handler to download zip button
    downloadZipButton.onclick = async () => {
        let imgs = document.querySelectorAll('#jpegs img') as NodeListOf<HTMLImageElement>;
        let blobWriter = new BlobWriter("application/zip");
        let zipWriter = new ZipWriter(blobWriter);
        for (let img of imgs) {
            let resp = await fetch(img.src);
            let blob = await resp.blob();
            await zipWriter.add(img.title, blob.stream(), { level: 0 });
        }
        zipWriter.close();
        blobWriter.getData().then((blob: Blob) => {
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'images.zip';
            a.click();
            URL.revokeObjectURL(a.href);
        });
    };
}

export function configureDropzone(dropzoneId: string) {
    const dropzone = document.getElementById(dropzoneId);
    if (dropzone === null) {
        throw new Error(`Could not find element with id ${dropzoneId}`);
    }

    dropzone.addEventListener('dragover', function (e) {
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
        if (e.dataTransfer != null) {
            let files = e.dataTransfer.files;
            processFiles(files).then((imgs) => {
                layoutImages(imgs);
            });
        }
    });

    dropzone.addEventListener('click', function(e) {
        var input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.cng';
        input.addEventListener('change', function(e) {
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