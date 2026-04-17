module.exports = {
  testDir: 'e2e',
  use: {
    baseURL: 'http://127.0.0.1:8000'
  },
  webServer: {
    command: 'npm run serve',
    url: 'http://127.0.0.1:8000',
    reuseExistingServer: true,
    timeout: 120000
  }
};
