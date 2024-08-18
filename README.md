# National Geographic CNG to JPG converter

## I'm in a hurry
[Click here](https://yostinso.github.io/cng_to_jpg/cng_to_jpg.html) to launch the converter.

## What is this?
Some years ago, National Geographic released CD box sets with archived images of their entire magazine catalog. The files are in a proprietary format with the extension `.cng`.

There was a viewer included, written with [Adobe AIR](https://en.wikipedia.org/wiki/Adobe_AIR), a now-abandoned cross-platform runtime.

Some people still have the box set around and would like to view their information, and this lets them do so.

## Some backstory:

### A solution is found

Fortunately, [Aging Engineer](https://www.youtube.com/@AgingEngineer) on YouTube [discovered](https://www.youtube.com/watch?v=3iDEh3cSqHs) that `.cng` files are just obfuscated `.jpg` files. Each byte has been XORed with `0xef`. Aging Engineer wrote an Excel macro to help people convert their CNG files into JPGs for folks not comfortable with doing it themselves in any programming languages.

Unfortunately, that macro doesn't work in modern versions of Excel. (And so time marches on.)

### Another solution is found

Well, if Excel changes too much, what might not? Perhaps web browsers will provide a more stable platform. (Time will tell.)

This [repository](https://github.com/yostinso/cng_to_jpg) contains three files you can download to use offline:
* [`cng_to_jpg.html`](https://raw.githubusercontent.com/yostinso/cng_to_jpg/main/cng_to_jpg.html)
* [`cng_to_jpg.js`](https://raw.githubusercontent.com/yostinso/cng_to_jpg/main/cng_to_jpg.js)
* [`zip.min.js`](https://raw.githubusercontent.com/yostinso/cng_to_jpg/main/zip.min.js)

Just download the files into a folder together, and open `cng_to_jpg.html` in your favorite browser circa 2020 or newer, drop your `.cng`s  onto the handy target, and voila. If you don't want support for downloading multiple files as a zip, you can leave off `zip.min.js`.
