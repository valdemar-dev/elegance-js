export declare const compile: ({ writeToHTML, pagesDirectory, outputDirectory, environment, watchServerPort, postCompile, publicDirectory, }: {
    writeToHTML?: boolean;
    watchServerPort?: number;
    postCompile?: () => any;
    environment: "production" | "development";
    pagesDirectory: string;
    outputDirectory: string;
    publicDirectory?: {
        path: string;
        method: "symlink" | "recursive-copy";
    };
}) => Promise<{
    shouldClientHardReload: boolean;
}>;
