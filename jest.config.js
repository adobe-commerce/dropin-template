const baseConfig = require('@adobe/elsie/config/jest');

module.exports = {
  ...baseConfig,
  
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
