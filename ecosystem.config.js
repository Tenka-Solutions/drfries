module.exports = {
  apps: [{
    name: "drfries-backend",
    script: "./backend/server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}