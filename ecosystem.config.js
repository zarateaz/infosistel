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
        DATABASE_URL: "file:/home/zarate/infosistel/prisma/dev.db",
        PORT: 3002,
        HOSTNAME: "0.0.0.0",
        // IMPORTANTE: JWT en este bloque 'env' (no env_production) para PM2
        JWT_SECRET: "infosistel-jwt-super-secret-key-2026!!",
        // 64 hex chars = 32 bytes para AES-256-GCM
        ENCRYPTION_KEY: "696e666f73697374656c2d656e63727970742d6b65792d333262797465733200",
        COOKIE_SECURE: "false",  // Cambiar a true SOLO después de instalar SSL
        // Ruta absoluta para uploads — fuera de .next/standalone (sobrevive rebuilds)
        UPLOADS_DIR: "/home/zarate/infosistel/public/uploads",
      }
    }
  ]
};
