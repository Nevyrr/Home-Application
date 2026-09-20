import express, { type Express } from "express";
import path from "node:path";
import { sendError } from "./apiResponse.js";

export function serveClient(app: Express, clientDistPath: string): void {
  // Unknown API URLs must remain JSON errors, never the SPA's HTML page.
  app.use("/api", (_req, res) => {
    sendError(res, "Route API introuvable", 404);
  });
  app.use(express.static(clientDistPath));
  // Express 5 requires a named wildcard; braces include the root path too.
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}
