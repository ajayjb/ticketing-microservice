module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  collectCoverageFrom: ["<rootDir>/src/**/*.ts", "!**/node_modules/**"],
};
