import { mdToElegance } from "@/pages/utils/mdToElegance";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const page: Page = () => {
    const target = path.join(__dirname, "content.md");
    
    const content = fs.readFileSync(target).toString();
    
    const parsed = mdToElegance(content);
    
    return article(...parsed);
};

export const metadata: Metadata = () => {
    return title("Elegance.JS");
};
