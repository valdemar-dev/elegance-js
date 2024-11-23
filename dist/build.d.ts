declare function compile({ pageDirectory, minify, suppressConsole }: {
    pageDirectory: string;
    minify: boolean;
    suppressConsole: boolean;
}): Promise<void>;
export { compile, };
