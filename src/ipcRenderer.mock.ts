export interface IMockIpcRenderer {
  listeners: Map<string, Function[]>;
  on(event: string, listener: Function): void;
  send(event: string, ...args: any[]): void;
  removeAllListeners(event?: string): void;
}

declare global {
  interface Window {
    mockIpcRenderer: MockIpcRenderer;
  }
}

export class MockIpcRenderer implements IMockIpcRenderer {
  public listeners: Map<string, Function[]> = new Map();
  public on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }
  public send(event: string, ...args: any[]): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((listener) => listener(...args));
    }
  }
  public removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// export const mockIpcRenderer: MockIpcRenderer = {
//   listeners: new Map<string, Function[]>(),
//   on: (event: string, listener: Function) => {
//     console.log("on called");
//     if (!(this as MockIpcRenderer)?.listeners?.has(event)) {
//       console.log("no previous event");
//       (this as MockIpcRenderer)?.listeners.set(event, []);
//       console.log("added event", event);
//     }
//     console.log((this as any).listeners);
//     (this as MockIpcRenderer)?.listeners.get(event).push(listener);
//     // console.log((this as any).listeners);
//   },
//   send: (event: string, payload: Function) => {
//     console.log("yes I set for send pe Call", event, "and", payload);
//     if ((this as MockIpcRenderer)?.listeners.has(event)) {
//       (this as MockIpcRenderer)?.listeners.get(event).forEach((listener) => "");
//     }
//   },
//   removeAllListeners: (event?: string) => {
//     if (event) {
//       (this as MockIpcRenderer)?.listeners.delete(event);
//     } else {
//       (this as MockIpcRenderer)?.listeners.clear();
//     }
//   },
// };

// export const mockIpcRenderer = {
//     listeners: new Map(),
//     on: (eventName: string, listener: any) => {
//       if (!this.listeners.has(eventName)) {
//         this.listeners.add(eventName, []);
//       }
//       // check if listener is a function or not
//       // check if listerner is already present in the event's listeners
//       this.listeners.get(eventName).push(listener);
//     },
//     sendEvent: (eventName, payload) => {
//       const listeners = this.listeners.get(eventName);

//       if (listeners && listeners.length) {
//         listeners.forEach((listener) => listener(payload));
//       }
//     },
//   };
