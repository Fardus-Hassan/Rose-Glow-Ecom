/** PM2 process for Rose Glow Ecom — port 3001 (legacy rose-glow uses 4000; laam uses 3000/3333). */
module.exports = {
  apps: [
    {
      name: "rose-glow-ecom",
      cwd: "/opt/rose-glow-ecom",
      script: "pnpm",
      args: ["--filter", "web", "start"],
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
  ],
};
