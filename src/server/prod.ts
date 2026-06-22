import cluster from "node:cluster";
import { cpus } from "node:os";

import { serve, } from "./server";
import { c, logger } from "../logger";
import { isRichError, printError } from "../error";

const PROCESS_ARGS = JSON.parse(process.env.ARGS ?? "[]") as string[];

(async () => {
    if (!cluster.isPrimary) {
        await serve().catch((err) => {
            if (isRichError(err)) {
                printError(err);
            } else {
                console.error(err);
            }

            process.exit(1);
        });
        return;
    }

    const workersArg  = PROCESS_ARGS.find(a => a.startsWith("-w="));
    const workerCount = workersArg ? parseInt(workersArg.split("=")[1]!) : cpus().length;

    logger.info(`Primary ${process.pid}, forking ${c.bold}${workerCount}${c.reset} workers`);

    let readyCount = 0;

    for (let i = 0; i < workerCount; i++) {
        const worker = cluster.fork();
        worker.once("message", (msg: any) => {
            if (msg?.type !== "ready") return;
            readyCount++;
            if (readyCount === 1 && process.send) process.send({ type: "ready" });
        });
    }

    // this could be bad, i'm not super familiar with workers.
    cluster.on("exit", (worker, code, signal) => {
        logger.error(`Worker ${worker.process.pid} exited (${signal ?? code}) unexpectedly.`);

        if (readyCount === 0) {
            for (const worker of Object.values(cluster.workers!)) {
                worker?.destroy();
            }

            logger.error("No workers were ready when this worker errored; exiting..");

            process.exit(0);
        }

        cluster.fork();
    });
})();