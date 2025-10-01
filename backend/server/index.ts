import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";

const app = express();

// CORS configuration for separated frontend/backend
const allowedOrigins = [
  'https://erp.vision.dev.br',
  'https://erpapi.vision.dev.br', 
  'http://localhost:5051',
  'http://localhost:5052',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : null,
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null
].filter(Boolean);

console.log('🔧 CORS Origins permitidas:', allowedOrigins);

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log('🌐 Requisição de origin:', origin);
    
    // Permitir requisições sem origin (mobile apps, postman, etc)
    if (!origin) {
      console.log('✅ Origin undefined - permitindo');
      return callback(null, true);
    }
    
    // Verificar se a origin está na lista de permitidas
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin permitida:', origin);
      return callback(null, true);
    }
    
    console.log('❌ Origin rejeitada:', origin);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  console.log(`${formattedTime} [express] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const port = parseInt(process.env.BACKEND_PORT || process.env.PORT || "5052");
  server.listen(port, "0.0.0.0", () => {
    log(`Backend API serving on port ${port}`);
  });
})();
