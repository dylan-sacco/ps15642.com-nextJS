module.exports = {
  apps: [
    {
      name: 'ps15642',
      script: 'npm',
      args: 'start',
      watch: false, // auto-deploy via GitHub webhook handles restarts
      env: {
        PORT: 8080
      }
    }
  ]
};