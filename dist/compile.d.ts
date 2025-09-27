type CompilationOptions = {
    postCompile?: () => any;
    preCompile?: () => any;
    environment: "production" | "development";
    pagesDirectory: string;
    outputDirectory: string;
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
export declare const processPageElements: (element: Child, objectAttributes: Array<any>, parent: Child) => Child;
export declare const compile: (props: CompilationOptions) => Promise<void>;
export {};
