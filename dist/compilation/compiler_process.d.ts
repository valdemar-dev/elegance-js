/** This file is essentially script, that is spawned by compile(), which uses tools from ./compilation to build the project of the user. */
/** It's a separate process, so that we can avoid memory leaks due to us using cache-busting for importing the page files (you cannot un-import things in esm) */
export {};
