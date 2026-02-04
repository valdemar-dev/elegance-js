# Compiler
The compiler is the thing that takes your [pages](/pages) and [layouts](/layouts), turning them into **HTML** & **JavaScript**. The compiler generally executes it's procedures within the [server runtime](/server-runtime); which is abstracted away from you unless you used `--manual` in the [getting started](/getting-started) section.

The rest of this page will *assume* you are using the `--manual` mode, and have both the `index.ts` and `elegance.ts` files that it creates.

## How to Compile
First, you'll want to set the **compiler options**, so the compiler knows what it should do.

Do this via the `setCompilerOptions` function, which takes in an options object. The options persist per process, so you don't need to set them again.

Then, you'll want to call the function `compileEntireProject`. 

Which, first, will ensure the [element constructors](/elements) for all elements are available.

Secondly, read the pages directory, and compile all static pages (pages with `isDynamic = false | undefined`) and static layouts to *disk*.

For dynamic pages and layouts, simply take note of where they are, and gathering their exports.

Then, will transpile the [Elegance Client](/elegance-client) and place it in the dist directory.

Finally, it will then recursively copy the contents of your `public` directory, directly into the dist directory.

### Returned Values
- `allPages`: A map of every [page](/pages) that was found during compilation (dynamic & static)
- `allLayouts`: A map of every [layout](/layouts) that was found during compilation (dynamic & static)
- `allStatusCodePages`: A map of every [status code page](/pages#status-code-pages) that was found during compilation
- `compiledStaticLayouts`: A map of pre-compiled static layouts
- `compiledStaticPages`: A map of pre-compiled static pages

If you're compiling something simple, like a **static site**, and you *don't want to use* the [Elegance Server](/elegance-server), you can stop here. The output files will be in `compilerOptions.outputDirectory/dist`.

If you **are** using the included Elegance Server, however, please proceed.

Take all of the returned values of `compileEntireProject` and store them somewhere.

If you want, you can mutate them (to make pages inaccessible, or at different pathnames).

Now call `serveProject`, with these values, and the [server options](/elegance-server#server-options)