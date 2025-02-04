import { createState } from "../server/createState"
import { Sidebar } from "./components/sidebar";

export const state = createState({});

export const page = body({
    class: "bg-background-100 text-text-900 flex flex-row h-screen w-screen overflow-hidden"
},    
    Sidebar(),
)
