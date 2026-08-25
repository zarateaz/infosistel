"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, encrypt, decrypt, hashDNI } from "@/lib/crypto";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";
import {
  sanitizeName,
  sanitizeString,
  sanitizeNumber,
  sanitizeInt,
  sanitizePhone,
  sanitizeDNI,
} from "@/lib/sanitize";

/**
 * Helper to ensure the user is authenticated for admin actions.
 * Returns the JWT payload so callers can inspect role/id.
 */
async function ensureAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("infositel_token")?.value;
  if (!token) throw new Error("No autenticado");

  const payload = await verifyAuth(token);
  if (!payload) throw new Error("Sesión inválida");
  return payload;
}

/**
 * Validate that a string looks like a CUID (Prisma default ID format).
 * CUIDs start with 'c' and are 25 chars: c + 24 alphanumeric chars.
 * Accept also UUID format for forward compatibility.
 */
function isValidId(id: unknown): id is string {
  if (typeof id !== "string" || !id) return false;
  // CUID: starts with 'c', 25 chars total, lowercase alphanumeric
  if (/^c[a-z0-9]{24}$/.test(id)) return true;
  // UUID v4
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return true;
  return false;
}

/** Throw a safe 400-style error if the ID is not a valid format */
function assertValidId(id: unknown, label = "ID"): asserts id is string {
  if (!isValidId(id)) throw new Error(`${label} inválido`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────────────────

export async function getProducts() {
  // Products are public — no auth required
  return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
}

export async function addProduct(data: unknown) {
  await ensureAuth();

  // A-02: Sanitize all string and numeric inputs
  const d = data as Record<string, unknown>;
  const name        = sanitizeName(d.name, 120);
  const category    = sanitizeName(d.category, 80);
  const description = sanitizeString(d.description, 2000);
  const image       = sanitizeString(d.image, 500) || "/img/producto3mouse.webp";
  const price       = sanitizeNumber(d.price, 0, 999_999) ?? 0;
  const costPrice   = sanitizeNumber(d.costPrice, 0, 999_999) ?? 0;
  const stock       = sanitizeInt(d.stock, 0, 100_000) ?? 0;
  const onSale      = Boolean(d.onSale);
  const salePrice   = onSale ? (sanitizeNumber(d.salePrice, 0, 999_999) ?? null) : null;
  const isFeatured  = Boolean(d.isFeatured);

  if (!name) throw new Error("El nombre del producto es requerido");
  if (!category) throw new Error("La categoría es requerida");

  return prisma.product.create({
    data: { name, category, description, price, costPrice, stock, image, onSale, salePrice, isFeatured },
  });
}

export async function editProduct(id: string, data: unknown) {
  await ensureAuth();
  assertValidId(id, "Product ID");

  const d = data as Record<string, unknown>;
  const name        = sanitizeName(d.name, 120);
  const category    = sanitizeName(d.category, 80);
  const description = sanitizeString(d.description, 2000);
  const image       = sanitizeString(d.image, 500);
  const price       = sanitizeNumber(d.price, 0, 999_999) ?? 0;
  const costPrice   = sanitizeNumber(d.costPrice, 0, 999_999) ?? 0;
  const stock       = sanitizeInt(d.stock, 0, 100_000) ?? 0;
  const onSale      = Boolean(d.onSale);
  const salePrice   = onSale ? (sanitizeNumber(d.salePrice, 0, 999_999) ?? null) : null;
  const isFeatured  = Boolean(d.isFeatured);

  return prisma.product.update({
    where: { id },
    data: { name, category, description, price, costPrice, stock, image, onSale, salePrice, isFeatured },
  });
}

export async function inlineUpdateProduct(id: string, data: unknown) {
  await ensureAuth();
  assertValidId(id, "Product ID");

  const d = data as Record<string, unknown>;
  const updateData: Record<string, unknown> = {};

  if (d.stock !== undefined) {
    updateData.stock = sanitizeInt(d.stock, 0, 100_000) ?? 0;
  }
  if (d.costPrice !== undefined) {
    updateData.costPrice = sanitizeNumber(d.costPrice, 0, 999_999) ?? 0;
  }

  if (Object.keys(updateData).length === 0) return;
  return prisma.product.update({ where: { id }, data: updateData });
}

export async function deleteProduct(id: string) {
  await ensureAuth();
  assertValidId(id, "Product ID");
  return prisma.product.delete({ where: { id } });
}

export async function toggleProductOffer(id: string, onSale: boolean, salePrice?: number) {
  await ensureAuth();
  assertValidId(id, "Product ID");
  const safeSalePrice = onSale && salePrice ? sanitizeNumber(salePrice, 0, 999_999) ?? null : null;
  return prisma.product.update({
    where: { id },
    data: { onSale, salePrice: safeSalePrice },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────────────────────

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function addCategory(name: string) {
  await ensureAuth();
  // M-02: Sanitize category name with strict max length
  const normalizedName = sanitizeName(name, 60).toUpperCase();
  if (!normalizedName) throw new Error("El nombre de la categoría es requerido");

  const existing = await prisma.category.findUnique({ where: { name: normalizedName } });
  if (existing) throw new Error(`La categoría "${normalizedName}" ya existe.`);

  return prisma.category.create({ data: { name: normalizedName } });
}

export async function deleteCategory(id: string) {
  await ensureAuth();
  assertValidId(id, "Category ID");
  // M-03: Verify existence before delete to return a clean 404-style error
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new Error("Categoría no encontrada");
  return prisma.category.delete({ where: { id } });
}

export async function updateCategory(id: string, newName: string) {
  await ensureAuth();
  assertValidId(id, "Category ID");
  const normalizedName = sanitizeName(newName, 60).toUpperCase();
  if (!normalizedName) throw new Error("El nombre de la categoría es requerido");

  const oldCategory = await prisma.category.findUnique({ where: { id } });
  if (!oldCategory) throw new Error("Categoría no encontrada");

  const existing = await prisma.category.findUnique({ where: { name: normalizedName } });
  if (existing && existing.id !== id) throw new Error("Ya existe otra categoría con este nombre");

  const updated = await prisma.category.update({ where: { id }, data: { name: normalizedName } });

  await prisma.product.updateMany({
    where: { category: oldCategory.name },
    data: { category: normalizedName },
  });

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// Repairs
// ─────────────────────────────────────────────────────────────────────────────

export async function getRepairs() {
  await ensureAuth();
  const repairs = await prisma.repair.findMany({ orderBy: { createdAt: "desc" } });
  return repairs.map((r) => ({ ...r, dni: decrypt(r.dni) }));
}

export async function addRepair(data: unknown) {
  await ensureAuth();
  const d = data as Record<string, unknown>;

  // A-02: Sanitize all fields
  const dniSanitized  = sanitizeDNI(d.dni);
  const equipment     = sanitizeName(d.equipment, 200);
  const problem       = sanitizeString(d.problem, 1000);
  const statusText    = sanitizeString(d.statusText, 300);
  // A-03: Clamp progress 0-100
  const progress      = Math.min(100, Math.max(0, sanitizeInt(d.progress, 0, 100) ?? 0));

  if (!equipment) throw new Error("El equipo es requerido");
  if (!problem)   throw new Error("El problema es requerido");
  if (!statusText) throw new Error("El estado es requerido");

  // SECURITY FIX (VULN-05 + S-06): cryptographically secure random repair code
  const randomPart1 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const randomPart2 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const repairCode  = `INF-${randomPart1}-${randomPart2}`;

  return prisma.repair.create({
    data: {
      code: repairCode,
      dni: encrypt(dniSanitized),
      dniSearchHash: hashDNI(dniSanitized),
      equipment,
      problem,
      progress,
      statusText,
    },
  });
}

export async function updateRepairProgress(id: string, progress: number) {
  await ensureAuth();
  assertValidId(id, "Repair ID");
  // A-03: Always clamp progress between 0 and 100
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0));
  return prisma.repair.update({
    where: { id },
    data: { progress: safeProgress, lastUpdate: new Date() },
  });
}

export async function deleteRepair(id: string) {
  await ensureAuth();
  assertValidId(id, "Repair ID");
  const existing = await prisma.repair.findUnique({ where: { id } });
  if (!existing) throw new Error("Reparación no encontrada");
  return prisma.repair.delete({ where: { id } });
}

// ─────────────────────────────────────────────────────────────────────────────
// Ventas y Estadísticas
// ─────────────────────────────────────────────────────────────────────────────

export async function addSaleAction(data: {
  pName: string;
  category?: string;
  quantity: number;
  price: number;
  costPrice: number;
  subtractStock?: boolean;
  productId?: string;
}) {
  await ensureAuth();

  // A-02: Sanitize sale fields
  const pName     = sanitizeName(data.pName, 120) || "Producto";
  const category  = data.category ? sanitizeName(data.category, 80) : undefined;
  const quantity  = sanitizeInt(data.quantity, 1, 99_999) ?? 1;
  const price     = sanitizeNumber(data.price, 0, 999_999) ?? 0;
  const costPrice = sanitizeNumber(data.costPrice, 0, 999_999) ?? 0;
  const profit    = (price - costPrice) * quantity;

  const sale = await prisma.sale.create({
    data: { pName, category, quantity, price, costPrice, profit },
  });

  if (data.subtractStock && data.productId && isValidId(data.productId)) {
    await prisma.product.update({
      where: { id: data.productId },
      data: { stock: { decrement: quantity } },
    });
  }

  return sale;
}

export async function getSales() {
  await ensureAuth();
  return prisma.sale.findMany({ orderBy: { date: "desc" } });
}

export async function deleteSaleAction(id: string) {
  await ensureAuth();
  assertValidId(id, "Sale ID");
  // M-03: Verify existence before deleting
  const existing = await prisma.sale.findUnique({ where: { id } });
  if (!existing) throw new Error("Venta no encontrada");
  return prisma.sale.delete({ where: { id } });
}

export async function getSaleStats() {
  await ensureAuth();
  const now = new Date();
  const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek  = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [daily, weekly, monthly] = await Promise.all([
    prisma.sale.aggregate({ where: { date: { gte: startOfDay } },   _sum: { price: true, profit: true }, _count: true }),
    prisma.sale.aggregate({ where: { date: { gte: startOfWeek } },  _sum: { price: true, profit: true } }),
    prisma.sale.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { price: true, profit: true } }),
  ]);

  return {
    day:   { total: daily._sum.price   || 0, profit: daily._sum.profit   || 0, count: daily._count },
    week:  { total: weekly._sum.price  || 0, profit: weekly._sum.profit  || 0 },
    month: { total: monthly._sum.price || 0, profit: monthly._sum.profit || 0 },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrders() {
  await ensureAuth();
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map((o) => ({ ...o, customerPhone: decrypt(o.customerPhone) }));
}

export async function addOrder(data: unknown) {
  /**
   * SECURITY NOTE (A-04): addOrder is intentionally public (no ensureAuth) —
   * it's called from the tienda (storefront) by anonymous customers.
   * Protection is handled by:
   *  1. Rate limiting in /api/orders/route.ts (Nginx + Node.js layers)
   *  2. Server-side price recalculation (VULN-01 fix already applied)
   *  3. Input sanitization below
   */
  const d = data as Record<string, unknown>;

  if (!Array.isArray(d.items) || d.items.length === 0) {
    throw new Error("Se requiere al menos un producto");
  }
  if (d.items.length > 50) {
    throw new Error("Demasiados productos por pedido");
  }

  // A-05 / A-02: Sanitize customer fields
  const customerName  = sanitizeName(d.customerName, 80) || "Cliente Web";
  const customerPhone = sanitizePhone(d.customerPhone);
  if (!customerPhone || customerPhone.length < 7) {
    throw new Error("Teléfono requerido (mínimo 7 dígitos)");
  }

  let serverTotal = 0;
  const sanitizedItems = [];

  for (const item of d.items as Record<string, unknown>[]) {
    const quantity    = sanitizeInt(item.quantity, 1, 999) ?? 1;
    const itemName    = sanitizeName(item.name, 100) || "Producto";
    const itemCategory = sanitizeName(item.category, 50) || "General";

    const product = await prisma.product.findFirst({
      where: { name: itemName },
      select: { id: true, price: true, salePrice: true, onSale: true },
    });

    let unitPrice = 0;
    if (product) {
      unitPrice = product.onSale && product.salePrice ? product.salePrice : product.price;
    } else {
      console.warn(`[ORDER_ACTION] Producto no encontrado en DB para recálculo: ${itemName}`);
    }

    serverTotal += unitPrice * quantity;
    sanitizedItems.push({ name: itemName, category: itemCategory, quantity });
  }

  return prisma.order.create({
    data: {
      customerName,
      customerPhone: encrypt(customerPhone),
      total: serverTotal,
      items: { create: sanitizedItems },
    },
  });
}

export async function deleteOrder(id: string) {
  await ensureAuth();
  assertValidId(id, "Order ID");
  await prisma.orderItem.deleteMany({ where: { orderId: id } });
  return prisma.order.delete({ where: { id } });
}

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

export async function getUsers() {
  await ensureAuth();
  return prisma.user.findMany({ select: { id: true, username: true, role: true } });
}

/** Allowed roles. Only superadmin can assign superadmin role. */
const VALID_ROLES = ["admin", "superadmin"] as const;
type AllowedRole = (typeof VALID_ROLES)[number];

/** Minimum password policy for admin accounts. */
function validatePasswordStrength(password: string): void {
  if (!password || password.length < 12) {
    throw new Error("La contraseña debe tener mínimo 12 caracteres.");
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error("La contraseña debe contener al menos una letra mayúscula.");
  }
  if (!/[0-9]/.test(password)) {
    throw new Error("La contraseña debe contener al menos un número.");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new Error("La contraseña debe contener al menos un símbolo (ej: !, @, #, $).");
  }
}

export async function addUser(data: unknown) {
  const caller = await ensureAuth();
  const d = data as Record<string, unknown>;

  // A-05: Validate and sanitize username — only safe characters allowed
  const rawUsername = typeof d.username === "string" ? d.username.trim() : "";
  if (!rawUsername) throw new Error("El nombre de usuario es requerido");
  if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(rawUsername)) {
    throw new Error(
      "El nombre de usuario solo puede contener letras, números, guiones, puntos o guiones bajos (3-30 caracteres)."
    );
  }
  const username = rawUsername.toLowerCase();

  // S-08: Enforce password strength policy
  const password = typeof d.password === "string" ? d.password.slice(0, 128) : "";
  validatePasswordStrength(password);

  // S-01: Whitelist roles — prevent role injection from client payload
  const requestedRole = d.role as string;
  const callerRole    = caller.role as string;

  let assignedRole: AllowedRole = "admin";
  if (requestedRole === "superadmin") {
    if (callerRole !== "superadmin") {
      throw new Error("Sin permisos: solo un superadmin puede crear otro superadmin.");
    }
    assignedRole = "superadmin";
  } else if (requestedRole === "admin" || !requestedRole) {
    assignedRole = "admin";
  } else {
    throw new Error(`Rol inválido: '${requestedRole}'. Usa 'admin' o 'superadmin'.`);
  }

  const { hash, salt } = await hashPassword(password);
  return prisma.user.create({
    data: { username, passwordHash: hash, salt, role: assignedRole },
    select: { id: true, username: true, role: true },
  });
}

export async function deleteUser(id: string) {
  const caller = await ensureAuth();
  assertValidId(id, "User ID");
  const callerId = caller.id as string;

  // S-02: Prevent self-deletion
  if (callerId === id) {
    throw new Error("No puedes eliminar tu propia cuenta de administrador.");
  }

  const userToDelete = await prisma.user.findUnique({ where: { id } });
  if (!userToDelete) throw new Error("Usuario no encontrado.");

  // S-02: Prevent deletion of the last superadmin
  if (userToDelete.role === "superadmin") {
    const superadminCount = await prisma.user.count({ where: { role: "superadmin" } });
    if (superadminCount <= 1) {
      throw new Error("No puedes eliminar al único superadmin. Crea otro superadmin primero.");
    }
  }

  return prisma.user.delete({ where: { id } });
}

// ─────────────────────────────────────────────────────────────────────────────
// Cashbox (Caja)
// ─────────────────────────────────────────────────────────────────────────────

export async function getCashboxTransactions() {
  await ensureAuth();
  return prisma.cashboxTransaction.findMany({ orderBy: { date: "desc" } });
}

export async function addCashboxTransaction(data: { description: string; type: string; amount: number; paymentMethod: string; notes?: string }) {
  await ensureAuth();
  const description = sanitizeString(data.description, 200) || "Sin descripción";
  const type = data.type === "INCOME" ? "INCOME" : "EXPENSE";
  const amount = sanitizeNumber(data.amount, 0, 999_999) ?? 0;
  const paymentMethod = sanitizeString(data.paymentMethod, 50) || "EFECTIVO";
  const notes = sanitizeString(data.notes || "", 500);

  return prisma.cashboxTransaction.create({
    data: { description, type, amount, paymentMethod, notes }
  });
}

export async function updateCashboxTransaction(id: string, data: { description?: string; type?: string; amount?: number; paymentMethod?: string; date?: Date }) {
  await ensureAuth();
  assertValidId(id, "Transaction ID");
  
  const updateData: any = {};
  if (data.description !== undefined) updateData.description = sanitizeString(data.description, 200) || "Sin descripción";
  if (data.type !== undefined) updateData.type = data.type === "INCOME" ? "INCOME" : "EXPENSE";
  if (data.amount !== undefined) updateData.amount = sanitizeNumber(data.amount, 0, 999_999) ?? 0;
  if (data.paymentMethod !== undefined) updateData.paymentMethod = sanitizeString(data.paymentMethod, 50) || "EFECTIVO";
  if (data.date !== undefined) updateData.date = data.date;

  return prisma.cashboxTransaction.update({
    where: { id },
    data: updateData
  });
}

export async function deleteCashboxTransaction(id: string) {
  await ensureAuth();
  assertValidId(id, "Transaction ID");
  return prisma.cashboxTransaction.delete({ where: { id } });
}

export async function getCashboxSummary() {
  await ensureAuth();
  const txs = await prisma.cashboxTransaction.findMany();
  
  let totalIncome = 0;
  let totalExpense = 0;

  const byMethod: Record<string, { income: number; expense: number; net: number }> = {
    "YAPE 1": { income: 0, expense: 0, net: 0 },
    "YAPE 2": { income: 0, expense: 0, net: 0 },
    "EFECTIVO": { income: 0, expense: 0, net: 0 },
  };

  for (const tx of txs) {
    const amount = tx.amount;
    const method = tx.paymentMethod;
    if (!byMethod[method]) {
      byMethod[method] = { income: 0, expense: 0, net: 0 };
    }

    if (tx.type === "INCOME") {
      totalIncome += amount;
      byMethod[method].income += amount;
      byMethod[method].net += amount;
    } else {
      totalExpense += amount;
      byMethod[method].expense += amount;
      byMethod[method].net -= amount;
    }
  }

  const balance = totalIncome - totalExpense;

  // Add percentage calculations
  const methodsSummary = Object.keys(byMethod).map(method => {
    const data = byMethod[method];
    const pct = totalIncome > 0 ? (data.income / totalIncome) * 100 : 0;
    return {
      method,
      income: data.income,
      expense: data.expense,
      net: data.net,
      percentage: pct.toFixed(1)
    };
  });

  return { totalIncome, totalExpense, balance, byMethod: methodsSummary };
}

