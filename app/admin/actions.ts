"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, encrypt, decrypt } from "@/lib/crypto";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Helper to ensure the user is authenticated for admin actions.
 */
async function ensureAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("infositel_token")?.value;
  if (!token) throw new Error("No autenticado");
  
  const payload = await verifyAuth(token);
  if (!payload) throw new Error("Sesión inválida");
  return payload;
}

// --- Products ---
export async function getProducts() {
  // Products are public, but we can return them ordered
  return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
}

export async function addProduct(data: any) {
  await ensureAuth();
  return prisma.product.create({
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      price: parseFloat(data.price),
      costPrice: data.costPrice ? parseFloat(data.costPrice) : 0,
      stock: parseInt(data.stock),
      image: data.image || "/img/producto3mouse.webp",
      onSale: data.onSale || false,
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      isFeatured: data.isFeatured || false,
    },
  });
}

export async function editProduct(id: string, data: any) {
  await ensureAuth();
  return prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      price: parseFloat(data.price),
      costPrice: data.costPrice ? parseFloat(data.costPrice) : 0,
      stock: parseInt(data.stock),
      image: data.image,
      onSale: data.onSale || false,
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      isFeatured: data.isFeatured || false,
    },
  });
}

export async function inlineUpdateProduct(id: string, data: any) {
  await ensureAuth();
  const updateData: any = {};
  if (data.stock !== undefined) updateData.stock = parseInt(data.stock);
  if (data.costPrice !== undefined) updateData.costPrice = parseFloat(data.costPrice);
  if (Object.keys(updateData).length === 0) return;
  return prisma.product.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteProduct(id: string) {
  await ensureAuth();
  return prisma.product.delete({ where: { id } });
}

export async function toggleProductOffer(
  id: string,
  onSale: boolean,
  salePrice?: number
) {
  await ensureAuth();
  return prisma.product.update({
    where: { id },
    data: {
      onSale,
      salePrice: onSale && salePrice ? salePrice : null,
    },
  });
}

// --- Categories ---
export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function addCategory(name: string) {
  await ensureAuth();
  return prisma.category.create({ data: { name } });
}

export async function deleteCategory(id: string) {
  await ensureAuth();
  return prisma.category.delete({ where: { id } });
}

// --- Repairs ---
export async function getRepairs() {
  await ensureAuth();
  const repairs = await prisma.repair.findMany({ orderBy: { createdAt: "desc" } });
  
  // Decrypt sensitive DNI for display in admin panel
  return repairs.map(r => ({
    ...r,
    dni: decrypt(r.dni)
  }));
}

export async function addRepair(data: any) {
  await ensureAuth();
  return prisma.repair.create({
    data: {
      code: `INF${Math.floor(Math.random() * 9000) + 1000}`,
      dni: encrypt(data.dni), // Encrypt DNI before saving
      equipment: data.equipment,
      problem: data.problem,
      progress: parseInt(data.progress),
      statusText: data.statusText,
    },
  });
}

export async function updateRepairProgress(id: string, progress: number) {
  await ensureAuth();
  return prisma.repair.update({
    where: { id },
    data: { progress, lastUpdate: new Date() }
  });
}

export async function deleteRepair(id: string) {
  await ensureAuth();
  return prisma.repair.delete({ where: { id } });
}

// --- Orders ---
export async function getOrders() {
  await ensureAuth();
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  
  // Decrypt sensitive Phone for display in admin panel
  return orders.map(o => ({
    ...o,
    customerPhone: decrypt(o.customerPhone)
  }));
}

export async function addOrder(data: any) {
  // addOrder might be called from public checkout, but we still encrypt sensitive info
  return prisma.order.create({
    data: {
      customerName: data.customerName,
      customerPhone: encrypt(data.customerPhone), // Encrypt Phone
      total: parseFloat(data.total),
      items: {
        create: data.items.map((item: any) => ({
          name: item.name,
          category: item.category,
          quantity: item.quantity,
        })),
      },
    },
  });
}

export async function deleteOrder(id: string) {
  await ensureAuth();
  // Delete items first (cascade), then the order
  await prisma.orderItem.deleteMany({ where: { orderId: id } });
  return prisma.order.delete({ where: { id } });
}

// --- Users ---
export async function getUsers() {
  await ensureAuth();
  return prisma.user.findMany({ select: { id: true, username: true, role: true } });
}

export async function addUser(data: any) {
  await ensureAuth();
  const { hash, salt } = await hashPassword(data.password);
  return prisma.user.create({
    data: {
      username: data.username,
      passwordHash: hash,
      salt: salt,
      role: data.role || "admin",
    },
    select: { id: true, username: true, role: true },
  });
}

export async function deleteUser(id: string) {
  await ensureAuth(); // Only admins can delete other admins
  return prisma.user.delete({ where: { id } });
}
