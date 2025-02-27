import { createEventListener, createState } from "../../server/createState";

const skibidi = createState({
    skibidi: "sigmal,"
});

createEventListener({
    dependencies: [skibidi],
    eventListener: (params, skibidi) => {
        skibidi.value.skibidi
    },
});

export const page = body ();
