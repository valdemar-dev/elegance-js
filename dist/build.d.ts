export declare const compile: (props: {
    writeToHTML?: boolean;
    watchServerPort?: number;
    postCompile?: () => any;
    preCompile?: () => any;
    environment: "production" | "development";
    pagesDirectory: string;
    outputDirectory: string;
    publicDirectory?: {
        path: string;
        method: "symlink" | "recursive-copy";
    };
}) => Promise<void>;
