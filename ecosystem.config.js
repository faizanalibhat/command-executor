module.exports = {
    apps: [{
        name: "cmdexec",
        script: "app.js",
        instances: 1,
        exec_mode: "cluster",
        autorestart: true,
        max_memory_restart: "1G",
        watch: false,
        env: {
            NODE_ENV: "production"
        }
    }]
}
