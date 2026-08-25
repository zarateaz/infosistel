/**
 * server.js — OBSOLETO / DEPRECATED
 *
 * Este archivo era el servidor Express del proyecto anterior (versión HTML/JS puro).
 * La aplicación ahora usa Next.js (app/) como servidor principal, iniciado por PM2
 * a través de ecosystem.config.js → .next/standalone/server.js
 *
 * SECURITY: Este archivo NO debe iniciarse en producción.
 * El servidor real es PM2 + Next.js standalone, NO este Express.
 *
 * Si accidentalmente se inicia este archivo, lanzará un error fatal inmediatamente.
 */

throw new Error(
  "[INFOSISTEL] server.js está OBSOLETO. " +
  "Usa PM2 con ecosystem.config.js para iniciar la aplicación Next.js. " +
  "Comando: pm2 start ecosystem.config.js"
);
