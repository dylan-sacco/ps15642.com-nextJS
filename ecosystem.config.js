module.exports = {
  apps: [
    {
      name: 'ps15642',
      script: 'npm',
      args: 'start',
      watch: true, // or true if you want automatic reloads on file changes
      env: {
        PORT: 8080
      }
    }
  ]
};