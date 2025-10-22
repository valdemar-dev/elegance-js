import { mdToElegance } from "@/pages/utils/mdToElegance";

import fs from "fs";
import path from "path";

export const page: Page = () => {
    const target = path.join(
        process.cwd(),
        "pages",
        "middleware",
        "content.md",
    );
    
    const content = fs.readFileSync(target).toString();
    
    const parsed = mdToElegance(content);
    
    return article(...parsed);
};

export const metadata: Metadata = () => {
    return title("Page!");
};