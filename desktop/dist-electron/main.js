import { app as t, BrowserWindow as r } from "electron";
import { fileURLToPath as a } from "node:url";
import o from "node:path";
const l = o.dirname(a(import.meta.url));
process.env.APP_ROOT = o.join(l, "..");
const n = process.env.VITE_DEV_SERVER_URL, m = o.join(process.env.APP_ROOT, "dist-electron"), s = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = n ? o.join(process.env.APP_ROOT, "public") : s;
let e;
function c() {
  if (e = new r({
    width: 1200,
    height: 800,
    icon: o.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: o.join(l, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), process.env.OPEN_DEVTOOLS === "true" && e.webContents.openDevTools(), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), n)
    console.log("Loading from dev server:", n), e.loadURL(n);
  else {
    const i = o.join(s, "index.html");
    console.log("Loading from file:", i), console.log("RENDERER_DIST:", s), e.loadFile(i);
  }
}
t.on("window-all-closed", () => {
  process.platform !== "darwin" && (t.quit(), e = null);
});
t.on("activate", () => {
  r.getAllWindows().length === 0 && c();
});
t.whenReady().then(c);
export {
  m as MAIN_DIST,
  s as RENDERER_DIST,
  n as VITE_DEV_SERVER_URL
};
