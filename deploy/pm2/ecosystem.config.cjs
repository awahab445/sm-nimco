const path = require('path');

const root = path.resolve(__dirname, '../..');

module.exports = {
  apps: [
    {
      name: 'ecommerce-api',
      cwd: path.join(root, 'backend'),
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'ecommerce-storefront',
      cwd: path.join(root, 'frontend'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      autorestart: true,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'ecommerce-admin',
      cwd: path.join(root, 'admin'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      instances: 1,
      autorestart: true,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
};
