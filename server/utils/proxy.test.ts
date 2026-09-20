import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { configureTrustProxy } from "./proxy.js";

test("only Render trusts its first reverse proxy", () => {
  const renderApp = express();
  configureTrustProxy(renderApp, { RENDER: "true" });
  assert.equal(renderApp.get("trust proxy"), 1);

  const localApp = express();
  configureTrustProxy(localApp, {});
  assert.equal(localApp.get("trust proxy"), false);
});
