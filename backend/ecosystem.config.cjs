module.exports = {
  apps: [
    {
      name: "erp",
      script: "server/index.ts",
      interpreter: "node",
      node_args: "--import tsx",
      env: {
        NODE_ENV: "production",
        PORT: 5052,
        BACKEND_PORT: 5052,
        FRONTEND_URL: "https://erp.vision.dev.br",
        SERVER_HOST: "0.0.0.0"
      }
    }
  ]
};
