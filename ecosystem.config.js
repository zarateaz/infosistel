module.exports = {
  apps: [
    {
      name: "infosistel",
      script: ".next/standalone/server.js",
      cwd: "/home/zarate/infosistel",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        // Ruta absoluta a la base de datos SQLite en producción
        DATABASE_URL: "file:/home/zarate/infosistel/prisma/dev.db",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        // IMPORTANTE: JWT_SECRET y ENCRYPTION_KEY DEBEN estar en este bloque 'env'
        // (no en env_production) para que PM2 las cargue siempre sin --env production
        JWT_SECRET: "infosistel-jwt-super-secret-key-2026!!",
        // 64 caracteres hex exactos = 32 bytes para AES-256-GCM
        ENCRYPTION_KEY: "696e666f73697374656c2d656e63727970742d6b65792d333262797465733200"
      }
    }
  ]
};
