export declare const compile: ({ writeToHTML, pagesDirectory, outputDirectory, environment, watch, }: {
    writeToHTML?: boolean;
    environment: "production" | "development";
    pagesDirectory: string;
    outputDirectory: string;
    watch?: boolean;
}) => Promise<{
    shouldClientHardReload: boolean;
}>;
