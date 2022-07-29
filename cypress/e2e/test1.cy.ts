/// <reference types="cypress" />
import { should } from "chai";
import "cypress-react-selector";

interface MockIpcRenderer {
  listeners: Map<[key: string], Function[]>;
  on(event: string, listener: Function): void;
  send(event: string, ...args: any[]): void;
  removeAllListeners(event?: string): void;
}

interface Window {
  appIpcRenderer: MockIpcRenderer;
}

describe("Hello World", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });
  it("should pass", () => {
    cy.window().contains("Share Your Text With Custom Encryption");
  });
  // test for mockIpc renderer to defined
  it("should pass", () => {
    // should().exist(window.mockIpcRenderer);
  });

  it("should send event0", () => {
    cy.window().should("have.property", "mockIpcRenderer");
    cy.wait(4000);
    cy.window().then((win) => {
      (win as any).appIpcRenderer.send("share-data", "hello");
      console.log("From Cypress", (win as any).mockIpcRenderer);
    });
  });
});
