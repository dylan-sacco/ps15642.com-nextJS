module.exports = {
  apps: [
    {
      name: 'ps15642',
      script: 'npm',
      args: 'start',
      // watch: false, // auto-deploy via GitHub webhook handles restarts
      watch: true,
      ignore_watch: ['content', 'node_modules', '.next'],
      env: {
        PORT: 8080
      }
    }
  ]
};