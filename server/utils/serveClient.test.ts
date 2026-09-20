import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import express, { type ErrorRequestHandler } from "express";
import { serveClient } from "./serveClient.js";

test("Express 5 serves deep links and assets while preserving API responses and async errors", async (t) => {
  const dist = await mkdtemp(path.join(tmpdir(), "home-app-http-"));
  t.after(() => rm(dist, { recursive: true, force: true }));
  await writeFile(path.join(dist, "index.html"), "<!doctype html><title>Home</title>");
  await writeFile(path.join(dist, "app.js"), "console.log('ready');");
  const app = express();
  app.get("/api/status", (_req, res) => { res.json({ ready: true }); });
  app.get("/api/failure", async () => { throw new Error("async failure"); });
  serveClient(app, dist);
  const handleError: ErrorRequestHandler = (err, _req, res, _next) => {
    res.status(500).json({ error: err.message });
  };
  app.use(handleError);
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, "listening");
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  for (const route of ["/", "/nono", "/reset-password?token=test"]) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/);
    assert.match(await response.text(), /<title>Home<\/title>/);
  }
  assert.equal(await (await fetch(base + "/app.js")).text(), "console.log('ready');");
  assert.deepEqual(await (await fetch(base + "/api/status")).json(), { ready: true });
  for (const method of ["GET", "POST"]) {
    const missing = await fetch(base + "/api/missing", { method });
    assert.equal(missing.status, 404);
    assert.match(missing.headers.get("content-type") ?? "", /application\/json/);
  }
  const failed = await fetch(base + "/api/failure");
  assert.equal(failed.status, 500);
  assert.deepEqual(await failed.json(), { error: "async failure" });
});
