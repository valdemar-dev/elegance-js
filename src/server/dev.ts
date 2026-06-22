import { isRichError, printError } from "../error";
import { serve, } from "./server";

serve().catch((err) => {
    if (isRichError(err)) {
        printError(err);
    } else {
        console.error(err);
    }
    process.exit(1);
});