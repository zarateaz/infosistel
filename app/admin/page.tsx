"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, Lock, LogOut, Plus, Trash2, Package, Tag, 
  Wrench, X, RefreshCw, Upload, Loader2, Users as UsersIcon, 
  ShoppingCart as CartIcon, CreditCard, Mail, Tag as OfferTag,
  CheckCircle, AlertCircle, ToggleLeft, ToggleRight, ClipboardList, Edit3, 
  Calculator, CalculatorIcon, Percent, TrendingUp, DollarSign, PieChart, ShoppingCart, ChevronRight
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
  toggleProductOffer, editProduct as editProductAction, inlineUpdateProduct as inlineUpdateProductAction,
  getSales, getSaleStats, addSaleAction, deleteSaleAction,
  updateCategory as updateCategoryAction
} from "./actions";

export default function AdminPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"productos" | "categorias" | "reparaciones" | "usuarios" | "ventas" | "inventario">("productos");



  const [newCategory, setNewCategory] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", description: "", price: "", costPrice: "", stock: "",
    image: "/img/cooler.png", onSale: false, salePrice: ""
  });
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("");
  
  // Calculator State
  const [calcCost, setCalcCost] = useState<string>("");
  const [calcMargin, setCalcMargin] = useState<string>("30");
  const [calcIgv, setCalcIgv] = useState<boolean>(true);
  const [calcTargetId, setCalcTargetId] = useState<string | null>(null);

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

  const [inventoryView, setInventoryView] = useState<"table" | "showcase">("table");

  const [sales, setSales] = useState<any[]>([]);
  const [saleStats, setStats] = useState<any>(null);
  const [newSale, setNewSale] = useState({ pName: "", price: "", costPrice: "", quantity: 1, category: "", productId: "", subtractStock: true });
  
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState("");
  
  // Feedback states
  const [showProductSuccess, setShowProductSuccess] = useState(false);
  const [showCategorySuccess, setShowCategorySuccess] = useState(false);

  useEffect(() => { loadData(); }, []);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const loadData = async () => {
    try {
      const [p, c, r, u, o, s, st] = await Promise.all([
        getProducts(), getCategories(), getRepairs(), getUsers(), getOrders(), getSales(), getSaleStats()
      ]);
      setProducts(p); setCategories(c); setRepairs(r); setAdminUsers(u); setOrders(o); setSales(s); setStats(st);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
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
    setAdminUsers(prev => prev.filter(u => u.id !== id));
    setConfirmDelete(null);
    try {
      await deleteUser(id);
    } catch {
      loadData();
      alert("❌ Error al eliminar usuario.");
    }
  };

  const addCategory = async () => {
    if (!newCategory) return;
    const catName = newCategory.trim().toUpperCase();
    
    // Optimistic UI
    if (categories.some(c => c.name === catName)) {
      setNewCategory("");
      return;
    }

    const tempId = Date.now().toString();
    setCategories(prev => [...prev, { id: tempId, name: catName }]);
    setNewCategory("");
    setShowCategorySuccess(true);
    setTimeout(() => setShowCategorySuccess(false), 3000);

    try {
      await addCategoryAction(catName);
      // No necesitamos recargar todo, ya lo añadimos.
    } catch (err: any) {
      loadData(); // Revertir si hay error
      if (!err.message.includes("ya existe")) {
         alert("⚠️ Error: " + err.message);
      }
    }
  };
  const removeCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setConfirmDelete(null);
    try {
      await deleteCategory(id);
    } catch {
      loadData();
      alert("❌ Error al eliminar categoría.");
    }
  };
  const saveCategoryEdit = async (id: string) => {
    if (!editCategoryValue) { setEditingCategory(null); return; }
    const newName = editCategoryValue.trim().toUpperCase();
    
    // Optimistic UI
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
    setProducts(prev => prev.map(p => p.category === categories.find(x => x.id === id)?.name ? { ...p, category: newName } : p));
    setEditingCategory(null);
    setShowCategorySuccess(true);
    setTimeout(() => setShowCategorySuccess(false), 2000);

    try {
      await updateCategoryAction(id, newName);
    } catch (err: any) {
      loadData();
      alert("⚠️ Error al actualizar categoría: " + err.message);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.category) {
      alert("Por favor, completa el nombre y selecciona una categoría ⚠️");
      return;
    }
    if (isUploading) {
      alert("Por favor espera a que la imagen termine de subirse... ⏳");
      return;
    }
    try {
      setIsBatchLoading(true);
      await addProductAction(newProduct);
      setNewProduct({ name: "", category: "", description: "", price: "", costPrice: "", stock: "", image: "/img/cooler.png", onSale: false, salePrice: "" });
      setImagePreview(null);
      await loadData();
      setShowProductSuccess(true);
      setTimeout(() => setShowProductSuccess(false), 3000);
    } catch (err: any) {
      alert("⚠️ Error al guardar: " + (err.message || "Falla de red"));
    } finally {
      setIsBatchLoading(false);
    }
  };
  const saveEditedProduct = async () => {
    if (!editingProduct) return;
    try {
      await editProductAction(editingProduct.id, editingProduct);
      setEditingProduct(null);
      setImagePreview(null);
      loadData();
      setShowProductSuccess(true);
      setTimeout(() => setShowProductSuccess(false), 3000);
    } catch (err: any) {
      alert("Error al editar producto: " + (err.message || "Error desconocido"));
    }
  };
  const removeProduct = async (id: string) => {
    // Actualización optimista: quitar de la lista inmediatamente
    setProducts(prev => prev.filter(p => p.id !== id));
    setConfirmDelete(null);
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error("Error eliminando producto:", err);
      // Revertir si hay error
      loadData();
      alert("⚠️ No se pudo eliminar el producto del servidor.");
    }
  };

  const applyCalculatedPrice = async () => {
    if (!calcTargetId || !calcCost) return;
    const baseCost = parseFloat(calcCost) || 0;
    const margin = parseFloat(calcMargin) || 0;
    let finalPrice = baseCost + (baseCost * margin / 100);
    if (calcIgv) {
      finalPrice = finalPrice * 1.18;
    }
    await inlineUpdateProductAction(calcTargetId, { costPrice: baseCost, price: finalPrice });
    setCalcTargetId(null);
    setCalcCost("");
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
    setOrders(prev => prev.filter(o => o.id !== id));
    setConfirmDelete(null);
    try {
      await deleteOrderAction(id);
    } catch {
      loadData();
      alert("❌ Error al eliminar el pedido.");
    }
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
    setRepairs(prev => prev.filter(r => r.id !== id));
    setConfirmDelete(null);
    try {
      await deleteRepair(id);
    } catch {
      loadData();
      alert("❌ Error al eliminar reparación.");
    }
  };

  const handleAddSale = async () => {
    if (!newSale.pName || !newSale.price) {
      alert("⚠️ Completa nombre y precio de venta.");
      return;
    }
    try {
      await addSaleAction({
        pName: newSale.pName,
        price: parseFloat(newSale.price),
        costPrice: parseFloat(newSale.costPrice || "0"),
        quantity: newSale.quantity,
        category: newSale.category,
        productId: newSale.productId,
        subtractStock: newSale.subtractStock
      });
      setNewSale({ pName: "", price: "", costPrice: "", quantity: 1, category: "", productId: "", subtractStock: true });
      loadData();
      alert("✅ Venta registrada y stock actualizado.");
    } catch {
      alert("❌ Error al registrar la venta.");
    }
  };

  const removeSale = async (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
    setConfirmDelete(null);
    try {
      await deleteSaleAction(id);
    } catch {
      loadData();
      alert("❌ Error al eliminar venta.");
    }
  };

  const handleSelectProductForSale = (pId: string) => {
    const p = products.find(x => x.id === pId);
    if (p) {
      setNewSale({ 
        ...newSale, 
        productId: p.id, 
        pName: p.name, 
        price: p.price.toString(), 
        costPrice: (p.costPrice || 0).toString(),
        category: p.category
      });
    }
  };

  const quickSale = async (p: any) => {
    if (isBatchLoading) return;
    if (!window.confirm(`¿Confirmar venta rápida de 1 unidad de ${p.name}?`)) return;

    setIsBatchLoading(true);
    // Actualización optimista del stock en pantalla
    setProducts(prev => prev.map(item => item.id === p.id ? { ...item, stock: Math.max(0, item.stock - 1) } : item));

    try {
      await addSaleAction({
        pName: p.name,
        category: p.category,
        quantity: 1,
        price: p.onSale && p.salePrice ? p.salePrice : p.price,
        costPrice: p.costPrice || 0,
        subtractStock: true,
        productId: p.id
      });
      await loadData();
    } catch (err: any) {
      alert("⚠️ Error: " + err.message);
      loadData();
    } finally {
      setIsBatchLoading(false);
    }
  };

  const [expandedInventario, setExpandedInventario] = useState<string[]>([]);
  const toggleInventario = (id: string) => {
     setExpandedInventario(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // --- Actualización Optimista de Stock ---
  const handleStockUpdate = async (id: string, newStock: number) => {
    // 1. Actualizar inmediatamente en la interfaz (Instante 0)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    
    try {
      // 2. Ejecutar en el servidor en segundo plano
      await inlineUpdateProductAction(id, { stock: newStock });
    } catch (err) {
      // 3. Si falla, recargar datos originales para seguridad
      console.error("Error al actualizar stock:", err);
      loadData();
      alert("⚠️ No se pudo sincronizar el stock con el servidor.");
    }
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
      if (data.success) {
        setNewProduct({ ...newProduct, image: data.url });
      } else {
        alert(data.error || "Error al subir la imagen");
        setImagePreview(null); // Limpiar preview si falló
      }
    } catch {
      alert("Error de conexión al subir imagen");
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const TABS = [
    { id: "inventario", label: "Inventario", icon: ClipboardList },
    { id: "productos", label: "Productos", icon: Package },
    { id: "categorias", label: "Categorías", icon: Tag },
    { id: "reparaciones", label: "Reparaciones", icon: Wrench },
    { id: "usuarios", label: "Usuarios", icon: UsersIcon },
    { id: "ventas", label: "Ventas", icon: CartIcon },
  ] as const;

  const filteredInventory = products.filter(p => {
    const matchName = p.name.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchCat = inventoryCategory === "" || p.category === inventoryCategory;
    return matchName && matchCat;
  });

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
                    if (confirmDelete.type === "sale") removeSale(confirmDelete.id);
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

      {/* ── Edit Product Modal ── */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => { setEditingProduct(null); setImagePreview(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-6 max-w-lg w-full shadow-2xl my-8 relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => { setEditingProduct(null); setImagePreview(null); }}
                className="absolute top-6 right-6 p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
               >
                <X size={20} />
              </button>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <Edit3 className="text-blue-infositel" size={20} /> Editar Producto
              </h3>
              
              <div className="space-y-3">
                  <input type="text" placeholder="Nombre del producto"
                    className="w-full p-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                    value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                  <select className="w-full p-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                    value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}>
                    <option value="">Seleccionar Categoría</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <textarea placeholder="Descripción"
                    className="w-full p-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm resize-none"
                    rows={2}
                    value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-gray-400 px-1">Costo (S/.)</label>
                      <input type="number" placeholder="Costo"
                        className="w-full p-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                        value={editingProduct.costPrice || ""} onChange={e => setEditingProduct({ ...editingProduct, costPrice: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black tracking-wider text-gray-400 px-1">Venta (S/.)</label>
                      <input type="number" placeholder="Venta"
                        className="w-full p-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                        value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black tracking-wider text-gray-400 px-1">Stock</label>
                      <input type="number" placeholder="Stock"
                        className="w-full p-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                        value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: e.target.value })} />
                    </div>
                  </div>

                  <div className="relative h-32 w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all bg-gray-50 hover:bg-gray-100 border-gray-200 mt-2">
                    {imagePreview ? (
                      <Image src={imagePreview} alt="Preview" fill className="object-contain p-2" />
                    ) : (
                       <Upload className="mx-auto text-gray-400" size={24} />
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        setIsUploading(true);
                        const formData = new FormData(); formData.append("file", file);
                        try {
                          const res = await fetch("/api/upload", { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.success) { 
                            setEditingProduct({ ...editingProduct, image: data.url }); 
                            setImagePreview(data.url); 
                          } else {
                            alert(data.error || "Error al subir la imagen");
                          }
                        } catch {
                           alert("Error de conexión al subir imagen");
                        } finally {
                          setIsUploading(false);
                        }
                      }} />
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-infositel" size={24} />
                      </div>
                    )}
                  </div>

                  <button onClick={saveEditedProduct}
                    className="w-full bg-blue-infositel text-white py-4 mt-2 rounded-2xl font-black hover:bg-blue-600 transition-all text-sm">
                    Guardar Cambios
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

        {/* ══════════════════ INVENTARIO TAB ══════════════════ */}
        {activeTab === "inventario" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Inversión (Suma Compras)</p>
                <h3 className="text-2xl md:text-3xl font-black text-blue-infositel">
                  S/. {products.reduce((acc, p) => acc + (p.costPrice || 0) * p.stock, 0).toFixed(2)}
                </h3>
              </div>
              <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Capital (Suma Ventas)</p>
                <h3 className="text-2xl md:text-3xl font-black text-green-500">
                  S/. {products.reduce((acc, p) => acc + p.price * p.stock, 0).toFixed(2)}
                </h3>
              </div>
              <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Ganancia Estimada Total</p>
                <h3 className="text-2xl md:text-3xl font-black text-purple-500">
                  S/. {products.reduce((acc, p) => acc + (p.price - (p.costPrice || 0)) * p.stock, 0).toFixed(2)}
                </h3>
              </div>
            </div>

            {/* CALCULATOR PANEL */}
            <div className="bg-gradient-to-br from-blue-infositel to-blue-900 rounded-[2.5rem] p-6 md:p-8 shadow-xl text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/img/pattern.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
              <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center justify-between">
                <div className="flex-1 w-full space-y-6">
                  <h3 className="text-2xl font-black flex items-center gap-2">
                    <CalculatorIcon size={28} className="text-blue-300" /> Calculadora de Precios
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-blue-200">Costo Base (S/.)</label>
                      <input type="number" placeholder="Ej. 100"
                        className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl outline-none text-white font-black text-lg focus:bg-white/20 transition-all placeholder:text-white/30"
                        value={calcCost} onChange={e => setCalcCost(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-blue-200">Margen Deseado (%)</label>
                      <div className="relative">
                        <input type="number" placeholder="Ej. 30"
                          className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl outline-none text-white font-black text-lg focus:bg-white/20 transition-all placeholder:text-white/30 pl-12"
                          value={calcMargin} onChange={e => setCalcMargin(e.target.value)} />
                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={18} />
                      </div>
                    </div>
                    <div className="space-y-2 flex flex-col justify-center">
                       <label className="text-xs font-black uppercase tracking-wider text-blue-200 mb-2">Igv (18%)</label>
                       <button onClick={() => setCalcIgv(!calcIgv)}
                         className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${calcIgv ? 'bg-white text-blue-infositel border-white' : 'bg-transparent text-blue-200 border-blue-400 hover:bg-white/10'}`}>
                         {calcIgv ? "Incluido ✅" : "Sin IGV ❌"}
                       </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 w-full lg:w-72 shrink-0">
                  <p className="text-xs font-black uppercase tracking-wider text-blue-200 mb-1">Precio Sugerido</p>
                  <h2 className="text-4xl font-black text-white mb-2">
                    S/. {((parseFloat(calcCost) || 0) * ( 1 + (parseFloat(calcMargin) || 0) / 100) * (calcIgv ? 1.18 : 1)).toFixed(2)}
                  </h2>
                  <p className="text-sm font-bold text-blue-200 mb-6">
                    Ganancia Neta: <span className="text-green-400">S/. {(((parseFloat(calcCost) || 0) * (parseFloat(calcMargin) || 0) / 100)).toFixed(2)}</span>
                  </p>
                  <button 
                    onClick={applyCalculatedPrice}
                    disabled={!calcTargetId || !calcCost}
                    className="w-full py-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl font-black shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {calcTargetId ? "Aplicar Precio Mágicamente 🚀" : "Selecciona un producto 👇"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black">Detalle de Inventario</h3>
                  <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                    <button 
                      onClick={() => setInventoryView("table")}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${inventoryView === "table" ? "bg-white text-blue-infositel shadow-md" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <ClipboardList size={14} /> Tabla
                    </button>
                    <button 
                      onClick={() => setInventoryView("showcase")}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${inventoryView === "showcase" ? "bg-white text-blue-infositel shadow-md" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <Package size={14} /> Visual
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <select 
                    className="p-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm font-medium border border-gray-100"
                    value={inventoryCategory} onChange={e => setInventoryCategory(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <input
                    type="text"
                    placeholder="🔍 Buscar producto..."
                    className="w-full md:w-64 p-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm font-medium border border-gray-100"
                    value={inventorySearch}
                    onChange={e => setInventorySearch(e.target.value)}
                  />
                </div>
              </div>

              {inventoryView === "table" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <th className="py-4 px-4 font-bold">Producto</th>
                        <th className="py-4 px-4 font-bold text-center">Stock</th>
                        <th className="py-4 px-4 font-bold text-right">P. Costo</th>
                        <th className="py-4 px-4 font-bold text-right">P. Venta</th>
                        <th className="py-4 px-4 font-bold text-right">Ganancia</th>
                        <th className="py-4 px-4 font-bold text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredInventory.map(p => {
                        const cost = p.costPrice || 0;
                        const profit = p.price - cost;
                        return (
                          <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="py-3 px-4 font-bold flex items-center gap-3">
                              <div className="w-8 h-8 relative rounded-lg border border-gray-100 overflow-hidden bg-white shrink-0"><Image src={p.image} fill className="object-cover p-1" alt="img"/></div>
                              <span className="truncate max-w-[200px] block">{p.name}</span>
                            </td>
                            <td className="py-3 px-4 text-center font-black">
                              <div className="flex items-center justify-center gap-3">
                                <button 
                                  onClick={() => handleStockUpdate(p.id, Math.max(0, p.stock - 1))}
                                  className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white active:scale-90 transition-all flex items-center justify-center font-black text-xl"
                                >
                                  -
                                </button>
                                <span className={`w-12 text-center text-lg ${p.stock < 5 ? "text-red-500 animate-pulse" : "text-green-500"}`}>{p.stock}</span>
                                <button 
                                  onClick={() => handleStockUpdate(p.id, p.stock + 1)}
                                  className="w-10 h-10 rounded-full bg-green-50 text-green-500 hover:bg-green-500 hover:text-white active:scale-90 transition-all flex items-center justify-center font-black text-xl"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-gray-400 font-bold text-xs">S/.</span>
                                <input type="number" 
                                  className="w-20 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 outline-none text-right font-medium text-gray-600 focus:ring-2 focus:ring-blue-infositel"
                                  defaultValue={cost}
                                  onBlur={(e) => inlineUpdateProductAction(p.id, { costPrice: e.target.value }).then(loadData)}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-black">S/. {p.price.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-black text-purple-500">S/. {profit.toFixed(2)}</td>
                            <td className="py-3 px-4 text-center">
                              <button 
                                onClick={() => {
                                  setCalcTargetId(p.id);
                                  setCalcCost((p.costPrice || 0).toString());
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }} 
                                className={`p-2.5 rounded-xl transition-all font-black text-xs mr-2 ${calcTargetId === p.id ? 'bg-blue-infositel text-white' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'}`}
                                title="Calcular Precio"
                              >
                                <CalculatorIcon size={16} />
                              </button>
                              <button onClick={() => { setEditingProduct(p); setImagePreview(p.image); setActiveTab("productos"); }} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-xl transition-all">
                                <Edit3 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                     })}

                    </tbody>
                  </table>
                </div>
              ) : (
                /* SHOWCASE MODE - BIG CARDS FOR CLIENTS */
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredInventory.map(p => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -10, scale: 1.02 }}
                        key={p.id} 
                        className={`bg-white rounded-[3rem] p-6 border-2 transition-all group relative ${p.stock < 5 ? 'border-red-100 shadow-[0_20px_50px_rgba(239,68,68,0.1)]' : 'border-gray-50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(20,51,201,0.1)]'}`}
                      >
                         {/* Low Stock Badge */}
                         {p.stock < 5 && (
                           <div className="absolute top-6 left-6 z-20 bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full animate-bounce shadow-lg shadow-red-500/40">
                             STOCK BAJO ⚠️
                           </div>
                         )}

                         <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
                            <button 
                               onClick={() => { setEditingProduct(p); setImagePreview(p.image); setActiveTab("productos"); }}
                               className="p-3 bg-white/90 backdrop-blur-md text-gray-400 rounded-2xl hover:text-blue-infositel hover:scale-110 transition-all border border-gray-100 shadow-sm"
                             >
                               <Edit3 size={18} />
                             </button>
                             <button 
                               onClick={() => {
                                 setCalcTargetId(p.id);
                                 setCalcCost((p.costPrice || 0).toString());
                                 window.scrollTo({ top: 0, behavior: 'smooth' });
                               }}
                               className={`p-3 backdrop-blur-md rounded-2xl hover:scale-110 transition-all border shadow-sm ${calcTargetId === p.id ? 'bg-blue-infositel text-white border-blue-500' : 'bg-white/90 text-blue-500 border-gray-100'}`}
                             >
                               <CalculatorIcon size={18} />
                             </button>
                         </div>
                         
                         <div className="relative h-64 w-full bg-gray-50 rounded-[2.5rem] overflow-hidden mb-8 border border-gray-100 p-8 group-hover:bg-white transition-colors duration-500">
                           <motion.div 
                              whileHover={{ scale: 1.1, rotate: 2 }}
                              className="relative h-full w-full"
                           >
                              <Image src={p.image} alt={p.name} fill className="object-contain" />
                           </motion.div>
                           <div className="absolute inset-0 bg-gradient-to-t from-blue-infositel/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>

                         <div className="space-y-6">
                           <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-infositel" />
                                <p className="text-[10px] font-black text-blue-infositel uppercase tracking-[0.2em]">{p.category}</p>
                             </div>
                             <h4 className="text-xl font-extrabold text-gray-900 leading-tight group-hover:text-blue-infositel transition-colors">{p.name}</h4>
                             <div className="mt-3 relative">
                               <p className={`text-[11px] text-gray-400 font-bold leading-relaxed ${expandedInventario.includes(p.id) ? '' : 'line-clamp-2'}`}>
                                 {p.description}
                               </p>
                               {p.description.length > 50 && (
                                  <button onClick={() => toggleInventario(p.id)} className="text-[10px] font-black text-blue-infositel/40 mt-1 hover:text-blue-infositel transition-colors flex items-center gap-1 group/expand">
                                    {expandedInventario.includes(p.id) ? 'Cerrar' : 'Detalles completos'}
                                    <ChevronRight size={10} className={`transition-transform ${expandedInventario.includes(p.id) ? '-rotate-90' : 'rotate-90'}`} />
                                  </button>
                               )}
                            </div>
                           </div>

                           <div className="flex items-center justify-between gap-4">
                              <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-100 p-4 rounded-[1.8rem] flex-1 relative overflow-hidden">
                                {p.onSale && (
                                  <div className="absolute top-0 right-0 bg-blue-infositel text-white text-[8px] font-black px-2 py-1 rounded-bl-xl">
                                    PROMO 🔥
                                  </div>
                                )}
                                <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">
                                  {p.onSale ? "Precio Oferta" : "Precio Venta"}
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-blue-infositel font-black text-xs">S/.</span>
                                  <span className="text-3xl font-black text-gray-900 tracking-tighter">
                                    {p.onSale ? p.salePrice?.toFixed(2) : p.price.toFixed(2)}
                                  </span>
                                  {p.onSale && (
                                    <span className="text-xs text-gray-300 line-through font-bold">
                                      S/. {p.price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>

                             <div className={`p-4 rounded-[1.8rem] min-w-[120px] text-center shadow-xl transition-all duration-500 ${p.stock < 5 ? 'bg-red-500 text-white shadow-red-500/30 ring-4 ring-red-50' : 'bg-blue-infositel text-white shadow-blue-500/30'}`}>
                               <p className="text-[9px] font-black opacity-60 uppercase mb-1 tracking-widest">Stock Disponible</p>
                               <div className="flex items-center justify-center gap-4">
                                 <button 
                                   onClick={() => handleStockUpdate(p.id, Math.max(0, p.stock - 1))}
                                   className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 active:scale-75 transition-all flex items-center justify-center"
                                 >
                                   <Trash2 size={12}/>
                                 </button>
                                 <span className="text-2xl font-black tracking-tighter">{p.stock}</span>
                                 <button 
                                   onClick={() => handleStockUpdate(p.id, p.stock + 1)}
                                   className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 active:scale-75 transition-all flex items-center justify-center"
                                 >
                                   <Plus size={12}/>
                                 </button>
                               </div>
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-3 pt-2">
                               <div className="bg-gray-100/50 p-3 rounded-2xl border border-gray-100 flex-1">
                                 <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5 tracking-widest">Costo Unit.</p>
                                 <p className="font-bold text-gray-600">S/. {(p.costPrice || 0).toFixed(2)}</p>
                               </div>
                               <button 
                                 onClick={() => quickSale(p)}
                                 className="bg-green-500 text-white h-[58px] px-8 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-500/20 group/vender"
                               >
                                 <span className="font-extrabold text-sm uppercase tracking-widest">Vender</span>
                                 <ShoppingCart size={18} className="group-hover/vender:animate-bounce" />
                               </button>
                            </div>
                         </div>
                      </motion.div>
                  ))}
                </div>
              )}
              {filteredInventory.length === 0 && <div className="text-center py-20 text-gray-300 font-black italic">No se encontraron productos que coincidan.</div>}
            </div>
          </div>
        )}

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
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="C. Compra"
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                      value={newProduct.costPrice} onChange={e => setNewProduct({ ...newProduct, costPrice: e.target.value })} />
                    <input type="number" placeholder="P. Venta"
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
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  
                  <div 
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`relative h-44 w-full border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden
                    transition-all cursor-pointer ${isUploading ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-blue-infositel" size={32} />
                        <p className="text-[10px] font-black text-blue-500 animate-pulse text-center">PROCESANDO<br/>IMAGEN...</p>
                      </div>
                    ) : imagePreview ? (
                      <div className="relative h-full w-full">
                        <Image src={imagePreview} alt="Preview" fill className="object-contain p-4" />
                        <div className="absolute inset-x-0 bottom-0 bg-blue-infositel/90 backdrop-blur-sm p-2 text-center">
                           <p className="text-white text-[9px] font-black uppercase">Click para cambiar imagen ✅</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto">
                          <Upload className="text-gray-300" size={20} />
                        </div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center px-4">Toca para <br/> subir foto de producto</p>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={addProduct} 
                    disabled={isUploading || isBatchLoading}
                    className={`w-full py-5 rounded-[2rem] font-black transition-all flex items-center justify-center gap-3 shadow-xl 
                      ${isUploading || isBatchLoading 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : showProductSuccess ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-black text-white hover:bg-blue-infositel active:scale-95 shadow-black/10'}`}
                  >
                    {isBatchLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-xs uppercase tracking-widest">Guardando Producto...</span>
                      </>
                    ) : isUploading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-xs uppercase tracking-widest">Subiendo Foto...</span>
                      </>
                    ) : showProductSuccess ? (
                      <>
                        <CheckCircle size={20} />
                        <span className="text-xs uppercase tracking-widest">Guardado con Éxito</span>
                      </>
                    ) : (
                      <span className="text-sm uppercase tracking-widest">Guardar Producto</span>
                    )}
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
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full tracking-wider border border-gray-200">
                          STOCK: {p.stock}
                        </span>
                      </div>
                    </div>
                    {/* Toggle offer button */}
                    <button
                      onClick={() => handleToggleOffer(p)}
                      className={`p-2.5 rounded-xl transition-all text-xs font-black shrink-0 hidden md:block ${
                        p.onSale
                          ? "bg-blue-50 text-blue-infositel hover:bg-blue-100"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                      title={p.onSale ? "Quitar oferta" : "Activar oferta"}
                    >
                      {p.onSale ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    {/* Edit button */}
                    <button
                      onClick={() => { setEditingProduct(p); setImagePreview(p.image); }}
                      className="p-2.5 bg-blue-50 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all shrink-0"
                    >
                      <Edit3 size={16} />
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
                  className={`px-6 rounded-2xl font-black transition-all text-sm whitespace-nowrap flex items-center gap-2 ${showCategorySuccess ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-infositel text-white hover:bg-blue-700'}`}>
                  {showCategorySuccess ? <><CheckCircle size={16} /> Listo</> : "Añadir"}
                </button>
              </div>
            </div>
             <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-3">
                {categories.map(c => (
                  <div key={c.id} className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 group transition-all hover:border-blue-100">
                    {editingCategory === c.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          autoFocus
                          type="text" 
                          className="bg-white border border-blue-200 rounded-lg px-2 py-1 text-sm font-bold outline-none uppercase"
                          value={editCategoryValue}
                          onChange={e => setEditCategoryValue(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && saveCategoryEdit(c.id)}
                          onBlur={() => saveCategoryEdit(c.id)}
                        />
                        <button onClick={() => saveCategoryEdit(c.id)} className="text-green-500"><CheckCircle size={16} /></button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-sm">{c.name}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingCategory(c.id); setEditCategoryValue(c.name); }}
                            className="text-gray-400 hover:text-blue-500 transition-colors">
                            <Edit3 size={14} />
                          </button>
                          {c.name !== "Todos" && (
                            <button onClick={() => setConfirmDelete({ type: "category", id: c.id })}
                              className="text-gray-300 hover:text-red-500 transition-colors">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </>
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
          <div className="space-y-8 pb-20">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { title: "Ventas de Hoy", val: saleStats?.day?.total, profit: saleStats?.day?.profit, icon: TrendingUp, color: "text-blue-infositel", bg: "bg-blue-50" },
                 { title: "Semana Actual", val: saleStats?.week?.total, profit: saleStats?.week?.profit, icon: PieChart, color: "text-purple-500", bg: "bg-purple-50" },
                 { title: "Este Mes", val: saleStats?.month?.total, profit: saleStats?.month?.profit, icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
               ].map((s, i) => (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                   key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden"
                 >
                   <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-bl-[4rem] opacity-50`} />
                   <s.icon className={`relative z-10 ${s.color} mb-4`} size={24} />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.title}</p>
                   <h3 className="text-3xl font-black mb-2">S/. {s.val?.toFixed(2)}</h3>
                   <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${s.bg} ${s.color}`}>GANANCIA: S/. {s.profit?.toFixed(2)}</span>
                   </div>
                 </motion.div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form to register manual sale */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 lg:sticky lg:top-24">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Plus className="text-blue-infositel" size={20} /> Registrar Venta Diaria
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-gray-400 uppercase ml-2">Seleccionar de Inventario</p>
                       <select 
                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm font-bold"
                        onChange={e => handleSelectProductForSale(e.target.value)}
                        value={newSale.productId}
                       >
                         <option value="">-- Buscar Producto --</option>
                         {products.map(p => (
                           <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                         ))}
                       </select>
                    </div>

                    <textarea placeholder="Nombre o detalles de la venta..." rows={2}
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm"
                      value={newSale.pName} onChange={e => setNewSale({ ...newSale, pName: e.target.value })} />
                    
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                         <p className="text-[10px] font-black text-gray-400 uppercase ml-2">P. Venta</p>
                         <input type="number" placeholder="0.00"
                          className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm font-black"
                          value={newSale.price} onChange={e => setNewSale({ ...newSale, price: e.target.value })} />
                       </div>
                       <div className="space-y-1">
                         <p className="text-[10px] font-black text-gray-400 uppercase ml-2">P. Costo</p>
                         <input type="number" placeholder="0.00"
                          className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm font-black"
                          value={newSale.costPrice} onChange={e => setNewSale({ ...newSale, costPrice: e.target.value })} />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                       <input type="number" placeholder="Cant."
                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel text-sm font-black"
                        value={newSale.quantity} onChange={e => setNewSale({ ...newSale, quantity: parseInt(e.target.value) || 1 })} />
                       
                       <label className="flex items-center gap-2 cursor-pointer p-4 bg-gray-50 rounded-2xl">
                          <input type="checkbox" checked={newSale.subtractStock} onChange={e => setNewSale({...newSale, subtractStock: e.target.checked})} className="accent-blue-infositel w-4 h-4" />
                          <span className="text-[10px] font-black text-gray-400 uppercase">Hacer Salida</span>
                       </label>
                    </div>

                    <button onClick={handleAddSale} className="w-full bg-blue-infositel text-white py-4 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 text-sm">
                      Registrar Operación
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="lg:col-span-2 space-y-6">
                 {/* Historial */}
                 <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-black">Historial Consolidado</h3>
                       <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Presencial</span>
                          <span className="flex items-center gap-1 ml-4"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Web</span>
                       </div>
                    </div>

                    <div className="space-y-4">
                       {/* Physical Sales */}
                       {sales.map(s => (
                         <div key={s.id} className="p-5 border border-gray-50 rounded-[1.8rem] hover:bg-gray-50 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-blue-50 text-blue-infositel rounded-2xl shrink-0"><TrendingUp size={18} /></div>
                               <div>
                                  <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">{new Date(s.date).toLocaleDateString()} · {new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                  <h4 className="font-black text-sm">{s.pName} <span className="text-blue-infositel/50 ml-1">x{s.quantity}</span></h4>
                                  <div className="flex items-center gap-2 mt-1">
                                     <span className="text-[10px] font-black text-blue-infositel bg-blue-100/50 px-2 py-0.5 rounded-lg">GANANCIA: S/. {s.profit.toFixed(2)}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="text-right">
                                  <span className="text-lg font-black block">S/. {(s.price * s.quantity).toFixed(2)}</span>
                                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Tienda</span>
                               </div>
                               <button onClick={() => setConfirmDelete({ type: "sale", id: s.id })} className="p-2 text-gray-200 hover:text-red-500 transition-all">
                                  <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                       ))}

                       {/* Web Orders */}
                       {orders.map(o => (
                         <div key={o.id} className="p-5 border border-green-50 bg-green-50/10 rounded-[1.8rem] hover:bg-green-50/20 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-green-50 text-green-500 rounded-2xl shrink-0"><ShoppingCart size={18} /></div>
                               <div>
                                  <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">{new Date(o.date).toLocaleDateString()}</p>
                                  <h4 className="font-black text-sm">{o.customerName}</h4>
                                  <p className="text-[10px] font-black text-green-600/60 uppercase">{o.customerPhone}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="text-right">
                                  <span className="text-lg font-black block">S/. {o.total.toFixed(2)}</span>
                                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Web / WhatsApp</span>
                               </div>
                               <button onClick={() => setConfirmDelete({ type: "order", id: o.id })} className="p-2 text-gray-200 hover:text-red-500 transition-all">
                                  <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                       ))}

                       {sales.length === 0 && orders.length === 0 && (
                         <div className="text-center py-20 text-gray-300 font-black italic">Sin movimientos registrados hoy.</div>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
