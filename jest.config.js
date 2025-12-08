/**
 * Root Jest config for monorepo
 * Lists each backend package as a project so VS Code Jest extension
 * runs tests with each package's own jest config (including ts-jest).
 */
module.exports = {
  projects: [
    '<rootDir>/backend/api-gateway',
    '<rootDir>/backend/service-auth',
    '<rootDir>/backend/service-user',
    '<rootDir>/backend/service-chat',
    '<rootDir>/backend/service-game'
  ]
};
