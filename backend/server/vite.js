import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
const viteLogger = createLogger();
// __dirname compatível com ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export function log(message, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}
export async function setupVite(app, server) {
    const frontendRoot = path.resolve(__dirname, "..", "..", "frontend");
    const serverOptions = {
        middlewareMode: true,
        hmr: { server },
        allowedHosts: true,
    };
    const vite = await createViteServer({
        root: path.join(frontendRoot, "client"),
        configFile: path.join(frontendRoot, "vite.config.ts"),
        customLogger: {
            ...viteLogger,
            error: (msg, options) => {
                viteLogger.error(msg, options);
                process.exit(1);
            },
        },
        server: serverOptions,
        appType: "custom",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
        const url = req.originalUrl;
        try {
            const clientTemplate = path.resolve(__dirname, "..", "..", "frontend", "client", "index.html");
            // sempre recarrega o index.html do disco
            let template = await fs.promises.readFile(clientTemplate, "utf-8");
            template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
            const page = await vite.transformIndexHtml(url, template);
            res.status(200).set({ "Content-Type": "text/html" }).end(page);
        }
        catch (e) {
            vite.ssrFixStacktrace(e);
            next(e);
        }
    });
}
export function serveStatic(app) {
    const caminhosPossiveis = [
        process.env.FRONT_DIST || "", // <<< permite apontar absoluto
        path.resolve(__dirname, "..", "..", "frontend", "client", "dist"),
        path.resolve(__dirname, "..", "..", "frontend", "dist"),
        "/var/www/erp/front", // <<< teu caminho atual
    ].filter(Boolean);
    const distEncontrado = caminhosPossiveis.find((p) => fs.existsSync(p));
    if (!distEncontrado) {
        throw new Error(`Build não encontrado. Rode o build do front:
- cd /var/www/erp/frontend && npm ci && npm run build
Tentado: 
${caminhosPossiveis.join("\n")}`);
    }
    app.use(express.static(distEncontrado));
    app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distEncontrado, "index.html"));
    });
}
