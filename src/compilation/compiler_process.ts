type IPCRequest = {
    /** Send this back using process.send() and a reply in order to resolve a request. */
    id: number;

    /** What the parent process wants us to do. */
    action: string;

    /** Arbitrary data set by the parent process. */
    content: any;
};

const PAGE_MAP = new Map();
const LAYOUT_MAP = new Map();

async function gatherPages(requestId: number) {}

async function compileStaticPages(requestId: number) {}

async function compileDynamicPage(requestId:number, pathname: string) {}

function resolveRequest(requestId: number, content: any) {
    process.send?.({ requestId, content, });
}

process.on("message", (request: IPCRequest) => {
    switch (request.action) {
        case "compile-static-pages":
            compileStaticPages(request.id);

            break;
        case "gather-pages":
            gatherPages(request.id);

            break;
        case "compile-dynamic-page":
            compileDynamicPage(request.id, request.content);

            break;
    }
});

// This prevents node from exiting.
// The compiler only exits after the parent process tells it to.
setTimeout(() => {}, 1000);