/**
 * ecosystem.config.js — PM2 Configuration for INFOSISTEL
 *
 * SECURITY FIX (VULN-02): All secrets have been removed from this file.
 * Secrets MUST be set as real environment variables on the VPS before starting.
 *
 * HOW TO SET SECRETS ON THE VPS (run once):
 *   export JWT_SECRET="$(openssl rand -base64 64)"
 *   export ENCRYPTION_KEY="$(openssl rand -hex 32)"
 *
 * Or create a /home/zarate/.env.production file (chmod 600) and load it in your
 * systemd/pm2 startup hook. Never commit secrets to version control.
 */
module.exports = {
  apps: [
    {
      name: "infosistel",
      script: ".next/standalone/server.js",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        DATABASE_URL: "file:data/dev.db",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        COOKIE_SECURE: "true",
        // ⚠️  SECRETS: Set these as real environment variables, NOT here.
        // JWT_SECRET       → set via: export JWT_SECRET="$(openssl rand -base64 64)"
        // ENCRYPTION_KEY   → set via: export ENCRYPTION_KEY="$(openssl rand -hex 32)"
        // DNI_HMAC_SECRET  → set via: export DNI_HMAC_SECRET="$(openssl rand -hex 32)"
        //   ↑ IMPORTANT: DNI_HMAC_SECRET must NEVER change after first setup.
        //   Changing it invalidates all dniSearchHash values in the DB.
      }
    }
  ]
};
