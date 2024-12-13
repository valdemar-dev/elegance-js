import { BuildOptions } from "esbuild";
export declare const compile: ({ pagesDirectory, buildOptions, environment }: {
    environment: "production" | "development";
    pagesDirectory: string;
    buildOptions: BuildOptions;
}) => Promise<void>;
