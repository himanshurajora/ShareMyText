/// <reference types="cypress" />
import "cypress-react-selector";

interface MockIpcRenderer {
  listeners: Map<[key: string], Function[]>;
  on(event: string, listener: Function): void;
  send(event: string, ...args: any[]): void;
  removeAllListeners(event?: string): void;
}

interface Window {
  mockIpcRenderer: MockIpcRenderer;
}

describe("Hello World", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
    cy.waitForReact();
  });
  it("should pass", () => {
    cy.window().contains("Share Your Text With Custom Encryption");
  });
  it("should open freely", () => {
    cy.window().wait(2000);
    cy.window().then((win) => {
      (win as any).mockIpcRenderer.send("share-data", "hello");
    });
  });
});
