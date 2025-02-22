export declare const compile: ({ writeToHTML, pagesDirectory, outputDirectory, environment, watchServerPort, }: {
    writeToHTML?: boolean;
    watchServerPort?: number;
    environment: "production" | "development";
    pagesDirectory: string;
    outputDirectory: string;
}) => Promise<{
    shouldClientHardReload: boolean;
}>;
