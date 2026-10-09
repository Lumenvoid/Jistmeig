
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("nexora", {
  appName: "Nexora",
  version: "1.0.0"
});
