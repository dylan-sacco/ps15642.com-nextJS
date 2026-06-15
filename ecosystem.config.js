module.exports = {
  apps: [
    {
      name: 'ps15642',
      script: 'npm',
      args: 'start',
      watch: false, // auto-deploy via GitHub webhook handles restarts
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 5000
      }
    }
  ]
};