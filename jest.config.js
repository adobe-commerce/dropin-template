require('dotenv').config({ path: '.env.local' });

const baseConfig = require('@adobe/elsie/config/jest');

module.exports = {
  ...baseConfig,

  moduleNameMapper: { ...baseConfig.moduleNameMapper },

  coverageThreshold: {
    global: {
      branches: 68,
      functions: 63,
      lines: 70,
      statements: 70,
    },
  },
};
