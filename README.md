# A Web-based IDE for C language

⚠---------------PROJECT IS UNDER CONSTRUCTION----------⚠

## Introduction
This project is aimed to become an easily accessible IDE environment for C language.
Built with expandability in mind, the project has the potential to support more languages over time.

This repository is the backend source code of the project. Built with JavaScript and koa.

## Requirements
`exec.js` uses [clang](https://clang.llvm.org/) as C compiler. You need to have it available in your shell.

### Linux
If you are using a linux distribution, clang should be available in apt.
```shell
sudo apt update
sudo apt install clang
```
### Windows
Windows setup is more complicated.

- Download LLVM for Windows from [here](https://github.com/llvm/llvm-project/releases)
- Have it unzipped to a folder, preferably root directory
- Add its `bin` and `lib` folders to system PATH variables
- Open a powershell window, run the following command to verify installation:
```shell
clang -v
```
- Since Windows does not provide C libraries by default, you will also have to install
[Visual Studio](https://visualstudio.microsoft.com/) in order to compile source code successfully.
- To be specific, you need to have MSVC and Windows SDK installed using Visual Studio installer.

## How to run
Please refer to the [front-end](https://github.com/LQF39466/web-ide-front) repository