# Elegance.JS

Elegance.JS is an opinionated, server-rendered, compiled, type-safe web framework with minimal dependencies (esbuild), written entirely in vanilla TypeScript.


## Getting Started
**NOTE!** Elegance is in an *extremely* early beta, none of this documentation is finished, and literally everything is subject to change.  
Elegance hasn't been published to NPM or any other registry yet, so it's only available locally.  

1. Clone this repo: `git clone https://github.com/valdemar-dev/elegance-js`  
2. Make a project (in your programming folder preferably) `mkdir elegance-js-project && cd elegance-js-project && sudo npm link [where you cloned elegance-js to]`  
3. Write a simple server configuration, example below:  
```ts
import fs from "fs"
import path from "path";
import express from "express";

import { compile, } from "elegance-js/build";

import { exec } from "child_process";
import { GenerateMetadata, } from "elegance-js/types/Metadata";
import compression from "compression";
import { generateHTMLTemplate } from "elegance-js/helpers/generateHTMLTemplate";
import { serverSideRenderPage } from "elegance-js/server/render";
import { createPageInfo } from "elegance-js/server/createPageInfo";

const app = express();

app.use(express.static('public'));

const PORT = 3000;

const DIST_DIR = path.join(process.cwd(), '.elegance/dist');
const PUBLIC_DIR = path.join(process.cwd(), '.elegance/public');
const SERVER_DIR = path.join(process.cwd(), ".elegance/server");

app.use('/public', express.static(PUBLIC_DIR));

app.use(compression());

app.use((req, res, next) => {
    const start = performance.now();

    res.on("finish", () => {
        const end = performance.now();

        console.log(`${res.statusCode} : ${Math.ceil(end - start)}ms - ${req.url}`);
    })

    next();
});

const getExtraServerData = async (req: express.Request, res: express.Response, executeOnServer: (req: express.Request, res: express.Response) => any) => {
    const extraReturnData = await executeOnServer(req, res);

    const isOk = res.statusCode >= 200 && res.statusCode < 300;
    if (!isOk) return;

    const extraReturnDataString = JSON.stringify(extraReturnData); 

    return `<script>globalThis.__ELEGANCE_SERVER_DATA__ = ${extraReturnDataString};</script>`;
};

app.get("*", async (req, res) => {
    const requestedPath = path.join(DIST_DIR, req.path);

    const isPageRequest = req.path.includes(".") === false;

    const filenameLessReqUrl = req.url.replace(/\/[^/]+\.[a-zA-Z0-9]+$/, '')
    const infoFilePath = path.join(SERVER_DIR, filenameLessReqUrl, "info.js");

    if (!isPageRequest) {
        if (!fs.existsSync(requestedPath)) {
            res.status(404)
            res.send("Not Found");
            res.end();

            return;
        }

        return res.sendFile(requestedPath);
    }

    if (!fs.existsSync(infoFilePath)) {
        res.status(404)
        res.send("Not Found");
        res.end();

        return;
    }

    // must be a page request
    const { 
        executeOnServer = null,
        generateMetadata = GenerateMetadata.ON_BUILD,
        metadata,
    } = await import(infoFilePath); 

    const pagePath = path.join(requestedPath, "/page.js");

    if (!fs.existsSync(pagePath)) {
        res.status(404)
        res.end("<p>Page Not Found.</p>");

        return;
    };

    const { page } = await import(pagePath);

    const { 
        storedEventListeners, 
        storedState,
        bodyHTML,
        onHydrateFinish,
        storedObservers,
    } = await serverSideRenderPage(page, req.path); 

    res.setHeader("Content-Type", "text/html");

    let responseHTML = "<!DOCTYPE html><html><head>";

    if (generateMetadata === GenerateMetadata.ON_BUILD) {
        responseHTML += `${fs.readFileSync(path.join(requestedPath, "/metadata.html"))}`;
    } else {
        responseHTML += generateHTMLTemplate({ 
            pageURL: req.path, 
            head: metadata,
            addPageScriptTag: true,
        });
    } 

    if (executeOnServer) {
        const extraServerData = await getExtraServerData(req, res, executeOnServer);
        if (!extraServerData) return;

        responseHTML += extraServerData;
    }

    responseHTML += createPageInfo({ 
        pathname: req.path,
        storedEventListeners: storedEventListeners,
        storedState: storedState,
        storedObservers: storedObservers,
        onHydrateFinish,
    }); 

    responseHTML += `</head>${bodyHTML}</html>`;

    res.end(responseHTML);

    return;
});

compile({
    pagesDirectory: "app",
    environment: "development",
}).then(async () => {
    exec (`npx tailwindcss -i ./app/styles.css -o ./.elegance/dist/styles.css --watch --minify`)

    app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`);
    });
})
```  
4. Make a `/pages` directory in the root directory of your project.
5. Create a `/pages/page.ts` file. Example:  
```ts
import { createState, } from "elegance-js/server/createState";  
import { observe } from "elegance-js/server/observe";

const state = createState({
    width: 0,
    currentDate: Date.now().toString(),
    intervalID: 0,

    onmousedown: () => {
        const clientState = getState<typeof state>();

        const intervalSubject = clientState.subjects.intervalID;

        const timerID = setInterval(() => {
            const width = clientState.subjects.width;

            clientState.set(width, width.value + 1);
            clientState.signal(width);
        }, 100);

        clientState.set(intervalSubject, timerID);
    },

    onmouseup: () => {
        const clientState = getState<typeof state>();

        clearInterval(clientState.subjects.intervalID.value);
    },
});

const page = body ({
    class: "",
},
    div ({
        style: "background: #000000; color: white;",
    },
        "Strings can be children, too!",
    ),
    button ({
        style: observe(
            [state.width],
            (width) => `background-color: #000000; color: white; width: ${width}px;`,
        ),

        innerText: observe(
            [state.width, state.currentDate],
            (width, date) => (`Width: ${width}px. Current Time: ${date}`),
        ),

        onmousedown: state.onmousedown,
        onmouseup: state.onmouseup,
   }),
)

export { page, state };
```  
  
6. Create a `/pages/info.ts` file. Example:  
```ts
export const metadata = () => head({}, 
    title("Hello World!"),
);
```

7. Add this script into your `package.json` (or wherever you like to store project scripts.)  
`"start": "esbuild server.ts --bundle --platform=node --format=esm --packages=external --outfile=server.js && node server.js",`  

8. Run `server.js`. This will compile elegance, and start a server on `localhost:3000` (hopefully)
