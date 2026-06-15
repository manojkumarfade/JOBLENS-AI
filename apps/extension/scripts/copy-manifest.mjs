import { copyFileSync, writeFileSync } from "node:fs";

copyFileSync(new URL("../manifest.json", import.meta.url), new URL("../dist/manifest.json", import.meta.url));

writeFileSync(
  new URL("../dist/contentScript.js", import.meta.url),
  `import(chrome.runtime.getURL("contentScriptModule.js")).catch((error) => console.error("JobLens content script failed to load", error));\n`
);
