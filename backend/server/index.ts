import dotenv from "dotenv";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";

// Load .env file, overriding empty environment variables
const envConfig = dotenv.config();
if (envConfig.parsed) {
  Object.keys(envConfig.parsed).forEach((key) => {
    if (!process.env[key] || process.env[key]?.trim() === '') {
      process.env[key] = envConfig.parsed![key];
    }
  });
}

const app = express();
app.set('trust proxy', 1);


// CORS configuration for separated frontend/backend
const allowedOrigins = [
  'https://erp.vision.dev.br',
  'http://erp.vision.dev.br',
  'https://erp.vision.dev.br:5051',
  'http://erp.vision.dev.br:5051',
  'https://erpapi.vision.dev.br',
  'http://erpapi.vision.dev.br',
  'https://erpapi.vision.dev.br:5052',
  'http://erpapi.vision.dev.br:5052',
  'http://localhost:5051',
  'http://localhost:5052',
  'http://127.0.0.1:5051',
  'http://127.0.0.1:5052',
  process.env.FRONTEND_URL,
  process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : null,
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null
].filter(Boolean);

console.log('🔧 CORS Origins permitidas:', allowedOrigins);

// Function to check if origin is allowed
function isOriginAllowed(origin: string): boolean {
  // Check exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Check if it's a Replit dev domain (with any port)
  if (origin.includes('.replit.dev')) {
    return true;
  }
  
  // Check localhost with any port
  if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
    return true;
  }
  
  return false;
}

// OPTIONS preflight handler ANTES do CORS (prioridade máxima)
app.options('*', (req, res) => {
  const origin = req.headers.origin || '';
  const ok = isOriginAllowed(origin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Origin', ok ? origin : 'https://erp.vision.dev.br');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400');

  return res.sendStatus(204);
});


app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log('🌐 Requisição de origin:', origin);

    // Permitir requisições sem origin (mobile apps, postman, etc)
    if (!origin) {
      console.log('✅ Origin undefined - permitindo');
      return callback(null, true);
    }

    // Verificar se a origin está permitida
    if (isOriginAllowed(origin)) {
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

  const port = parseInt(process.env.PORT || "5000");
  server.listen(port, "0.0.0.0", () => {
    log(`Server running on port ${port} (${process.env.NODE_ENV || 'development'} mode)`);
  });
})();