export declare const compile: ({ writeToHTML, pagesDirectory, outputDirectory, environment }: {
    writeToHTML?: boolean;
    environment: "production" | "development";
    pagesDirectory: string;
    outputDirectory: string;
}) => Promise<void>;
