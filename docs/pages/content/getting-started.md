# Getting Started
Before continuing, please make sure you have the latest LTS release of [Node.JS](httpsnodejs.org/en), understanding of the basics of [file system](https://en.wikipedia.org/wiki/File_system), and basic programming knowledge in [JavaScript](https://www.w3schools.com/js/)

## Installation
The easiest way to get started with elegance is using `npx create-elegance-app my-website` which will create a template project.

However, if you prefer manual installation, here is how to do it.

1. Create a directory to store your project in.
2. Navigate to that directory, and initialize npm with `npm init -y`
3. Install Elegance with `npm install elegance-js`
4. Create a `env.d.ts` at the root of your project.
5. Put `/// <reference types="elegance-js/global" />` inside that file.
6. Create a `pages` directory, which will contain the [pages](/pages) and [layouts](/layouts) of your project.
7. Create a `public` directory which will contain publicly accessible files you want to share.
8. Create the elegance runtime file, following the instructions from the manual section in the [compiler guide](/compiler)
9. Create an `index.ts` file which you will run with `npx ts-arc index.ts`
10. In that file, at some point, call `startEleganceRuntime()` from `elegance-js`.
11. Run your `index.ts` file with `npx ts-arc index.ts`. Other typescript runtimes may work, but `ts-arc` is the intended way.

## Manual Quick Install
If you want to use the preset files, but want access to customize the `index.ts` and `elegance.ts` files, you can use `--manual` mode in `npx create-elegance-app`