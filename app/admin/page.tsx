"use client";

import { useState, useEffect } from "react";
import { 
  User, Lock, LogOut, Plus, Trash2, Package, Tag, 
  Wrench, X, RefreshCw, Upload, Loader2, Users as UsersIcon, 
  ShoppingCart as CartIcon, CreditCard, Mail, Tag as OfferTag,
  CheckCircle, AlertCircle, ToggleLeft, ToggleRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import PageBg from "@/components/PageBg";
import { useRouter } from "next/navigation";
import {
  getProducts, addProduct as addProductAction, deleteProduct,
  getCategories, addCategory as addCategoryAction, deleteCategory,
  getRepairs, addRepair as addRepairAction, updateRepairProgress as updateRepairProgressAction, deleteRepair,
  getOrders, deleteOrder as deleteOrderAction,
  getUsers, addUser as addUserAction, deleteUser,
  toggleProductOffer,
} from "./actions";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"productos" | "categorias" | "reparaciones" | "usuarios" | "ventas">("productos");

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [newCategory, setNewCategory] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", description: "", price: "", stock: "",
    image: "/img/cooler.png", onSale: false, salePrice: ""
  });
  const [newRepair, setNewRepair] = useState({
    dni: "", equipment: "", problem: "", progress: 0, statusText: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "", role: "admin" as "admin" | "superadmin" });

  // Offer toggle inline state
  const [offerEdit, setOfferEdit] = useState<{ id: string; price: string } | null>(null);
  // Delete confirm state
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string } | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setProducts(await getProducts());
    setCategories(await getCategories());
    setRepairs(await getRepairs());
    setAdminUsers(await getUsers());
    setOrders(await getOrders());
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // --- Handlers ---
  const addAdminUser = async () => {
    if (!newAdmin.username || !newAdmin.password) return;
    await addUserAction(newAdmin);
    setNewAdmin({ username: "", password: "", role: "admin" });
    loadData();
  };
  const removeAdminUser = async (id: string) => {
    await deleteUser(id);
    setConfirmDelete(null);
    loadData();
  };

  const addCategory = async () => {
    if (!newCategory) return;
    await addCategoryAction(newCategory);
    setNewCategory("");
    loadData();
  };
  const removeCategory = async (id: string) => {
    await deleteCategory(id);
    setConfirmDelete(null);
    loadData();
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.category) return;
    await addProductAction(newProduct);
    setNewProduct({ name: "", category: "", description: "", price: "", stock: "", image: "/img/cooler.png", onSale: false, salePrice: "" });
    setImagePreview(null);
    loadData();
  };
  const removeProduct = async (id: string) => {
    await deleteProduct(id);
    setConfirmDelete(null);
    loadData();
  };

  // Toggle oferta en producto existente
  const handleToggleOffer = async (product: any) => {
    if (product.onSale) {
      // Quitar oferta directamente
      await toggleProductOffer(product.id, false);
      loadData();
    } else {
      // Mostrar input de precio de oferta
      setOfferEdit({ id: product.id, price: "" });
    }
  };
  const confirmOfferActivation = async () => {
    if (!offerEdit || !offerEdit.price) return;
    await toggleProductOffer(offerEdit.id, true, parseFloat(offerEdit.price));
    setOfferEdit(null);
    loadData();
  };

  // Eliminar venta/pedido
  const removeOrder = async (id: string) => {
    await deleteOrderAction(id);
    setConfirmDelete(null);
    loadData();
  };

  const addRepair = async () => {
    if (!newRepair.dni || !newRepair.equipment) return;
    await addRepairAction(newRepair);
    setNewRepair({ dni: "", equipment: "", problem: "", progress: 0, statusText: "" });
    loadData();
  };
  const updateRepairProgress = async (id: string, progress: number) => {
    await updateRepairProgressAction(id, progress);
    loadData();
  };
  const removeRepair = async (id: string) => {
    await deleteRepair(id);
    setConfirmDelete(null);
    loadData();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setImagePreview(reader.result as string); };
    reader.readAsDataURL(file);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) setNewProduct({ ...newProduct, image: data.url });
      else alert(data.error || "Error al subir la imagen");
    } catch {
      alert("Error de conexión al subir imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const TABS = [
    { id: "productos", label: "Productos", icon: Package },
    { id: "categorias", label: "Categorías", icon: Tag },
    { id: "reparaciones", label: "Reparaciones", icon: Wrench },
    { id: "usuarios", label: "Usuarios", icon: UsersIcon },
    { id: "ventas", label: "Ventas", icon: CartIcon },
  ] as const;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden pt-24 pb-24">
      <PageBg intensity={0.35} />

      {/* ── Confirm Delete Modal ── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-red-50 rounded-2xl">
                  <AlertCircle className="text-red-500" size={28} />
                </div>
                <div>
                  <h3 className="font-black text-xl">¿Eliminar?</h3>
                  <p className="text-gray-400 text-sm">Esta acción no se puede deshacer.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 font-black text-gray-400 hover:border-gray-200 transition-all">
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (confirmDelete.type === "product") removeProduct(confirmDelete.id);
                    if (confirmDelete.type === "order") removeOrder(confirmDelete.id);
                    if (confirmDelete.type === "repair") removeRepair(confirmDelete.id);
                    if (confirmDelete.type === "user") removeAdminUser(confirmDelete.id);
                    if (confirmDelete.type === "category") removeCategory(confirmDelete.id);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 transition-all"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Offer Activation Modal ── */}
      <AnimatePresence>
        {offerEdit && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOfferEdit(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <OfferTag className="text-blue-infositel" size={28} />
                </div>
                <div>
                  <h3 className="font-black text-xl">Activar Oferta</h3>
                  <p className="text-gray-400 text-sm">Ingresa el precio de oferta</p>
                </div>
              </div>
              <input
                type="number"
                placeholder="Precio de oferta S/."
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel mb-4 text-lg font-black"
                value={offerEdit.price}
                onChange={e => setOfferEdit({ ...offerEdit, price: e.target.value })}
                autoFocus
              />
              <div className="flex gap-4">
                <button onClick={() => setOfferEdit(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 font-black text-gray-400">
                  Cancelar
                </button>
                <button
                  onClick={confirmOfferActivation}
                  disabled={!offerEdit.price}
                  className="flex-1 py-3 rounded-2xl bg-blue-infositel text-white font-black hover:bg-blue-700 transition-all disabled:bg-gray-200"
                >
                  Activar 🔥
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black">Dashboard</h1>
            <p className="text-gray-500 font-medium text-sm">Gestiona tu tienda desde cualquier dispositivo.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="https://webmail.hostingperu.com.pe/"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-50 text-blue-infositel px-4 py-2.5 rounded-2xl font-bold hover:bg-blue-100 transition-all text-sm"
            >
              <Mail size={16} /><span className="hidden sm:inline">Webmail</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-2xl font-bold hover:bg-red-100 transition-all text-sm"
            >
              <LogOut size={16} /><span>Salir</span>
            </button>
          </div>
        </div>

        {/* ── Tabs — scrollable on mobile ── */}
        <div className="overflow-x-auto pb-2 mb-8">
          <div className="flex bg-white p-1.5 rounded-3xl shadow-sm border border-gray-100 gap-1 min-w-max">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "bg-blue-infositel text-white shadow-lg" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════ PRODUCTOS TAB ══════════════════ */}
        {activeTab === "productos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 lg:sticky lg:top-28">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <Plus className="text-blue-infositel" size={20} /> Añadir Producto
                </h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Nombre del producto"
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                    value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                  <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                    value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                    <option value="">Seleccionar Categoría</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <textarea placeholder="Descripción"
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm resize-none"
                    rows={3}
                    value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Precio S/."
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                      value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                    <input type="number" placeholder="Stock"
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                      value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                  </div>

                  {/* Offer toggle */}
                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-black text-blue-900">¿Activar Oferta?</label>
                      <button
                        onClick={() => setNewProduct({ ...newProduct, onSale: !newProduct.onSale })}
                        className={`transition-colors ${newProduct.onSale ? "text-blue-infositel" : "text-gray-300"}`}
                      >
                        {newProduct.onSale ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {newProduct.onSale && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                          <input type="number" placeholder="Precio de Oferta S/."
                            className="w-full p-3 bg-white rounded-xl outline-none border border-blue-200 focus:ring-2 focus:ring-blue-infositel text-sm"
                            value={newProduct.salePrice}
                            onChange={e => setNewProduct({ ...newProduct, salePrice: e.target.value })} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Image upload */}
                  <div className="relative h-36 w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center overflow-hidden
                    transition-all cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-200">
                    {imagePreview ? (
                      <div className="relative h-full w-full">
                        <Image src={imagePreview} alt="Preview" fill className="object-contain p-2" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-bold">Cambiar Imagen</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <Upload className="mx-auto text-gray-400" size={28} />
                        <p className="text-xs font-bold text-gray-400">Toca para subir foto</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageUpload} disabled={isUploading} />
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-infositel" size={28} />
                      </div>
                    )}
                  </div>

                  <button onClick={addProduct} disabled={isUploading}
                    className="w-full bg-black text-white py-4 rounded-2xl font-black hover:bg-blue-infositel transition-all disabled:bg-gray-300 text-sm">
                    {isUploading ? "Subiendo..." : "Guardar Producto"}
                  </button>
                </div>
              </div>
            </div>

            {/* Product list */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-6">Lista de Productos <span className="text-gray-300 font-medium text-base">({products.length})</span></h3>
              <div className="space-y-3">
                {products.map(p => (
                  <div key={p.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="relative h-14 w-14 bg-white rounded-xl shrink-0 overflow-hidden border border-gray-100">
                      <Image src={p.image} alt={p.name} fill className="object-contain p-1.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-blue-infositel uppercase tracking-wider truncate">{p.category}</p>
                      <h4 className="font-black text-sm truncate">{p.name}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-xs ${p.onSale ? "line-through text-gray-300" : "text-gray-400"}`}>S/. {p.price}</p>
                        {p.onSale && (
                          <span className="text-[10px] font-black text-white bg-blue-infositel px-2 py-0.5 rounded-full">
                            🔥 S/. {p.salePrice}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Toggle offer button */}
                    <button
                      onClick={() => handleToggleOffer(p)}
                      className={`p-2.5 rounded-xl transition-all text-xs font-black shrink-0 ${
                        p.onSale
                          ? "bg-blue-50 text-blue-infositel hover:bg-blue-100"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                      title={p.onSale ? "Quitar oferta" : "Activar oferta"}
                    >
                      {p.onSale ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => setConfirmDelete({ type: "product", id: p.id })}
                      className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="text-center py-16 text-gray-300 font-bold">No hay productos registrados.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ CATEGORIAS TAB ══════════════════ */}
        {activeTab === "categorias" && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-6">Gestionar Categorías</h3>
              <div className="flex gap-3">
                <input type="text" placeholder="Nueva categoría..."
                  className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                  value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCategory()} />
                <button onClick={addCategory}
                  className="bg-blue-infositel text-white px-6 rounded-2xl font-black hover:bg-blue-700 transition-all text-sm whitespace-nowrap">
                  Añadir
                </button>
              </div>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-3">
                {categories.map(c => (
                  <div key={c.id} className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 group">
                    <span className="font-bold text-sm">{c.name}</span>
                    {c.name !== "Todos" && (
                      <button onClick={() => setConfirmDelete({ type: "category", id: c.id })}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="text-center py-10 text-gray-300 font-bold w-full">No hay categorías.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ REPARACIONES TAB ══════════════════ */}
        {activeTab === "reparaciones" && (
          <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-6">Registrar Nueva Reparación</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="DNI del Cliente"
                  className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                  value={newRepair.dni} onChange={e => setNewRepair({ ...newRepair, dni: e.target.value })} />
                <input type="text" placeholder="Equipo (ej. Laptop Dell)"
                  className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                  value={newRepair.equipment} onChange={e => setNewRepair({ ...newRepair, equipment: e.target.value })} />
                <input type="text" placeholder="Problema"
                  className="sm:col-span-2 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                  value={newRepair.problem} onChange={e => setNewRepair({ ...newRepair, problem: e.target.value })} />
                <input type="text" placeholder="Estado (ej. Revisando placa)"
                  className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                  value={newRepair.statusText} onChange={e => setNewRepair({ ...newRepair, statusText: e.target.value })} />
                <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-3">
                  <RefreshCw size={20} className="text-gray-300 shrink-0" />
                  <input type="range" min="0" max="100" className="flex-1 accent-blue-infositel"
                    value={newRepair.progress} onChange={e => setNewRepair({ ...newRepair, progress: Number(e.target.value) })} />
                  <span className="font-black text-blue-infositel w-10 text-sm">{newRepair.progress}%</span>
                </div>
                <button onClick={addRepair}
                  className="sm:col-span-2 bg-black text-white py-4 rounded-2xl font-black hover:bg-blue-infositel transition-all text-sm">
                  Registrar Equipo
                </button>
              </div>
            </div>

            {/* Repairs list — card layout on mobile */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-6">Equipos en Seguimiento <span className="text-gray-300 font-medium text-base">({repairs.length})</span></h3>
              <div className="space-y-4">
                {repairs.map(r => (
                  <div key={r.id} className="p-4 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-xs font-black text-blue-infositel">{r.id}</p>
                        <h4 className="font-black text-sm">{r.equipment}</h4>
                        <p className="text-xs text-gray-400">DNI: {r.dni}</p>
                        {r.statusText && <p className="text-xs text-gray-500 mt-1">{r.statusText}</p>}
                      </div>
                      <button onClick={() => setConfirmDelete({ type: "repair", id: r.id })}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors shrink-0">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="range" min="0" max="100" className="flex-1 accent-blue-infositel h-2"
                        value={r.progress} onChange={e => updateRepairProgress(r.id, Number(e.target.value))} />
                      <span className="font-black text-sm text-blue-infositel w-10">{r.progress}%</span>
                    </div>
                  </div>
                ))}
                {repairs.length === 0 && (
                  <div className="text-center py-16 text-gray-300 font-bold">No hay equipos registrados.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ USUARIOS TAB ══════════════════ */}
        {activeTab === "usuarios" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-fit">
              <h3 className="text-xl font-black mb-2">Gestión de Acceso</h3>
              <p className="text-xs text-gray-400 font-bold mb-6 space-y-1">
                <span className="flex items-center gap-2"><Lock size={11} className="text-green-500" />Hasheado Scrypt</span>
                <span className="flex items-center gap-2"><CreditCard size={11} className="text-blue-500" />Datos AES-256-GCM</span>
              </p>
              <div className="space-y-3">
                <input type="text" placeholder="Usuario"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                  value={newAdmin.username} onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })} />
                <input type="password" placeholder="Contraseña"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                  value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} />
                <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel font-bold text-sm"
                  value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value as "admin" | "superadmin" })}>
                  <option value="admin">Administrador Estándar</option>
                  <option value="superadmin">Super Administrador</option>
                </select>
                <button onClick={addAdminUser}
                  className="w-full bg-black text-white py-4 rounded-2xl font-black hover:bg-blue-infositel transition-all text-sm">
                  Crear Usuario
                </button>
              </div>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-6">Administradores</h3>
              <div className="space-y-3">
                {adminUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${u.role === "superadmin" ? "bg-blue-100 text-blue-infositel" : "bg-gray-100 text-gray-500"}`}>
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-black text-sm">{u.username}</p>
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">{u.role}</p>
                      </div>
                    </div>
                    <button onClick={() => setConfirmDelete({ type: "user", id: u.id })}
                      className="p-2 text-gray-300 hover:text-red-500 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ VENTAS TAB ══════════════════ */}
        {activeTab === "ventas" && (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Total Ventas</p>
                <h3 className="text-2xl md:text-4xl font-black text-blue-infositel">
                  S/. {orders.reduce((acc, o) => acc + o.total, 0)}
                </h3>
              </div>
              <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Pedidos</p>
                <h3 className="text-2xl md:text-4xl font-black">{orders.length}</h3>
              </div>
              <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Promedio</p>
                <h3 className="text-2xl md:text-4xl font-black">
                  S/. {orders.length > 0 ? (orders.reduce((acc, o) => acc + o.total, 0) / orders.length).toFixed(0) : 0}
                </h3>
              </div>
            </div>

            {/* Orders list */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Registro de Pedidos <span className="text-gray-300 font-medium text-base">({orders.length})</span></h3>
              </div>
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="p-4 md:p-6 border border-gray-50 rounded-[1.5rem] hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-50 rounded-2xl text-blue-infositel shrink-0">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold">{new Date(o.date).toLocaleDateString()}</p>
                          <h4 className="font-black">{o.customerName}</h4>
                          <p className="text-xs text-blue-infositel font-bold">{o.customerPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xl font-black">S/. {o.total}</span>
                          <span className="block text-[10px] font-black text-gray-300 truncate max-w-[80px]">#{o.id.slice(0, 8)}</span>
                        </div>
                        {/* DELETE ORDER BUTTON */}
                        <button
                          onClick={() => setConfirmDelete({ type: "order", id: o.id })}
                          className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                          title="Eliminar pedido"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {o.items.map((item: any, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 bg-gray-50 rounded-full text-xs font-bold text-gray-500 border border-gray-100">
                          {item.name} (x{item.quantity}) · <span className="text-blue-infositel">{item.category}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-16 text-gray-300 font-bold">No hay ventas registradas aún.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
