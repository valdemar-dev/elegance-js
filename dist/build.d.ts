type CompilationOptions = {
    postCompile?: () => any;
    preCompile?: () => any;
    environment: "production" | "development";
    pagesDirectory: string;
    outputDirectory: string;
    quiet?: boolean;
    publicDirectory?: {
        path: string;
        method: "symlink" | "recursive-copy";
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
    };
};
export declare const compile: (props: CompilationOptions) => Promise<void>;
export {};
