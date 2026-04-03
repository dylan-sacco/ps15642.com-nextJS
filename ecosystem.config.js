module.exports = {
  apps: [
    {
      name: 'ps15642',
      script: 'node_modules/.bin/next',
      args: 'start',
      watch: false, // auto-deploy via GitHub webhook handles restarts
      instances: 2,
      exec_mode: 'cluster',
      env: {
        PORT: 8080
      }
    }
  ]
};