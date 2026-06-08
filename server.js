import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./src/server/db.js";
import authRoutes from "./src/server/routes/auth.js";
import employeeRoutes from "./src/server/routes/employees.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Connect to MongoDB
  await connectDB();

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/employees", employeeRoutes);

  // Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development & Static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support single page application routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
