/** @type {import('jest').Config} */
module.exports = {
  displayName: "unit",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { strict: false } }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    // stub @studioradar/shared so ts-jest can resolve it
    "^@studioradar/shared$": "<rootDir>/../../packages/shared/src/index.ts",
  },
};
