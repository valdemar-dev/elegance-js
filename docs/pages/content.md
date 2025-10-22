# What is Elegance.JS?  
In short, a simple, opinionated, primarily server-side-rendered web-framework.  
It keeps it's dependency list small (1), and prides itself on it's ease-of-adoption.  
It has fast build times, and ships very little JS to the browser.  

## Assumed Truths  
You possess a 64-bit Posix / Windows based system.  
You have knowledge of Node.JS 16+, and TypeScript.  

## Try Elegance
To create an Elegance app, run:
`npx create-elegance-app my-app`  
This creates a directory, my-app.    
Inside of this directory, the build script creates a **few more** directories.  
A pages directory, which contains *page.ts* and *layout.ts* files.  
A public directory, which will contain static files that will be public, like images.

## Running Elegance  
To run elegance, run:
`npx dev`  
This transpiles your project, compiles your pages, and start's the development web server.  
Your project is now available at:
`http://localhost:3000/`

## Next Steps
We *highly* recommend that you read the *page.ts* file that the create-script made.    
It will teach you all of the fundamentals of Elegance,  
like state, loadHooks, observers, and eventListeners.