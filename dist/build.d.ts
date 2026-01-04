type CompilationOptions = {
    postCompile?: () => any;
    preCompile?: () => any;
    environment: "production" | "development";
    pagesDirectory: string;
    outputDirectory: string;
    /** Suppress native elegance logs. */
    quiet?: boolean;
    publicDirectory?: {
        path: string;
    };
    server?: {
        runServer: boolean;
        root?: string;
        port?: number;
        host?: string;
    };
    hotReload?: {
        port: number;
        hostname: string;
        /** Directories to watch for hot-reloading other than just the pagesDirectory. */
        extraWatchDirectories?: string[];
    };
};
export declare const compile: (props: CompilationOptions) => Promise<void>;
export {};
