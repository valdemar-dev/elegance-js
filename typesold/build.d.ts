export function getAllSubdirectories(dir: string, baseDir?: string): string[];

export function renderElement(buildableElement: BuildableElement, pageScriptSrc: string): string;

type Metadata = () => BuildableElement<any>;

export function generateHTMLTemplate(metadata: Metadata, pageScriptSrc: string): string;

interface CompileOptions {
  pageDirectory: string;
  minify: boolean;
  suppressConsole: boolean;
}

export function compile(options: CompileOptions): Promise<void>;

export function writeToTempDir(content: string, fileName: string): Promise<string>;
