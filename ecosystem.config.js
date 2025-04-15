module.exports = {
    apps: [{
        name: "cmdexec",
        script: "app.js",
        instances: 1,
        exec_mode: "cluster",
        autorestart: true,
        max_memory_restart: '6G',
        interpreter_args: '--max-old-space-size=4096',
        watch: false,
        env: {
            NODE_ENV: "production"
        }
    }]
}
