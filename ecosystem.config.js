module.exports = {
  apps: [
    {
      name: "infosistel",
      script: ".next/standalone/server.js",
      cwd: "/home/zarate/infosistel",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        // Usamos rutas absolutas para evitar errores de directorio
        DATABASE_URL: "file:/home/zarate/infosistel/prisma/dev.db",
        PORT: 3000,
        HOSTNAME: "0.0.0.0"
      },
      // Estas variables se pueden pasar dinámicamente o dejar fijas aquí
      env_production: {
        NODE_ENV: "production",
        JWT_SECRET: "infosistel-key-super-segura-2026",
        ENCRYPTION_KEY: "infosistel-encryption-key-32-chars"
      }
    }
  ]
};
