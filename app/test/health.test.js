const { spawn } = require("node:child_process");
const { once } = require("node:events");
const test = require("node:test");
const assert = require("node:assert/strict");

test("GET /health returns a healthy CloudNotes API response", async (t) => {
  const port = 18080 + Math.floor(Math.random() * 1000);
  const server = spawn(process.execPath, ["server.js"], {
    cwd: __dirname + "/..",
    env: { ...process.env, PORT: String(port), API_KEY: "" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  server.stdout.on("data", (chunk) => { output += chunk.toString(); });
  server.stderr.on("data", (chunk) => { output += chunk.toString(); });
  t.after(() => { if (!server.killed) server.kill("SIGTERM"); });

  const deadline = Date.now() + 8000;
  let response;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error("CloudNotes server exited early: " + output);
    }
    try {
      response = await fetch(`http://127.0.0.1:${port}/health`);
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  assert.ok(response, "server should become reachable within 8 seconds");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "ok");
  assert.equal(body.service, "cloudnotes-api");
});
