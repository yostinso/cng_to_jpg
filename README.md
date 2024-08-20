# National Geographic CNG to JPG converter

## I'm in a hurry
[Click here](https://yostinso.github.io/cng_to_jpg/dist/cng_to_jpg.html) to launch the converter.

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

This repository contains a node module (not currently published to npm) with a built-in CLI tool, and an `.exe` for Windows x64 users.

#### To use from your own Javascript
Something like this should work before I get it all packaged up:
1. Clone the repo
2. `import { ImageFile } from "cng_to_jpg/cng-to-jpg.ts"
   or
   `const { ImageFile } = require("cng_to_jpg/cng-to-jpg.js");

#### To use the node CLI tool (requires node installed already)
1. Clone the repo
2. `npx cng-to-jpg --help`

#### To use the .exe on windows
1. Download [the exe](https://yostinso.github.io/cng_to_jpg/dist/cng_to_jpg.exe)
2. `.\cng-to-jpg.exe --help`
   e.g.
   `.\cng-to-jpg.exe convertFolder c:\ngm_files -o c:\jpg_files`
   or
   `.\cng-to-jpg.exe convert c:\ngm_files\001.cng c:\ngm_files\002.cng -o c:\jpg_files`