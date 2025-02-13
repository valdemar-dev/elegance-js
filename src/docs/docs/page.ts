import { PageHeading } from "./components/PageHeading";
import { RootLayout } from "./components/RootLayout";

export const page = body ({
    class: "bg-background-900 text-text-50 font-inter select-none text-text-50"
},
    RootLayout(
        PageHeading("Getting Started"), 
    ),
);
