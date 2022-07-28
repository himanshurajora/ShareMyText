import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    "cypress-react-selector": {
      root: "#__cy_root",
    },
  },
  e2e: {
    setupNodeEvents() {},
    specPattern: "cypress/e2e/**/*.cy.{js,ts,jsx,tsx}",
    excludeSpecPattern: ["**/__snapshots__/*", "**/__image_snapshots__/*"],
  },
});
