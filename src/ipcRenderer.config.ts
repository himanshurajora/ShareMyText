import { MockIpcRenderer } from "./ipcRenderer.mock";

export const appIpcRenderer =
  window && window.require && window.require("electron").ipcRenderer;

console.log(process.env.NODE_ENV);

function getMockIpcRendererInstance(window: Window) {
  const mockIpcRenderer = new MockIpcRenderer();
  return mockIpcRenderer;
}

export const getIpcRenderer = (window: Window) =>
  process.env.NODE_ENV !== "development"
    ? appIpcRenderer
    : getMockIpcRendererInstance(window);
  