export declare function transformSource(source: string, filePath?: string, targetFunctionName?: string, targetLine?: number, targetChar?: number): string;
export declare function getCallerFile(): {
    ourCaller: any;
    targetCaller: {
        fileName: any;
        line: any;
        char: any;
    };
};
export declare function getProcessedFunctionBody(): string;
