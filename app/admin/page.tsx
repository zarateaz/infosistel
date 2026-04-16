"use client";

import { useState, useEffect } from "react";
import { 
  User, Lock, LogOut, Plus, Trash2, Package, Tag, 
  Wrench, X, RefreshCw, Upload, Loader2, Users as UsersIcon, 
  ShoppingCart as CartIcon, CreditCard 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import PageBg from "@/components/PageBg";
import { useRouter } from "next/navigation";
import { getProducts, addProduct as addProductAction, deleteProduct, getCategories, addCategory as addCategoryAction, deleteCategory, getRepairs, addRepair as addRepairAction, updateRepairProgress as updateRepairProgressAction, deleteRepair, getOrders, getUsers, addUser as addUserAction, deleteUser } from "./actions";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"productos" | "categorias" | "reparaciones" | "usuarios" | "ventas">("productos");

  // State for data
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Form states
  const [newCategory, setNewCategory] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", description: "", price: "", stock: "", image: "/img/producto3mouse.webp", onSale: false, salePrice: ""
  });
  const [newRepair, setNewRepair] = useState({
    dni: "", equipment: "", problem: "", progress: 0, statusText: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "", role: "admin" as "admin" | "superadmin" });

  useEffect(() => {
    loadData();
  }, []);

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
    loadData();
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.category) return;
    await addProductAction(newProduct);
    setNewProduct({ name: "", category: "", description: "", price: "", stock: "", image: "/img/producto3mouse.webp", onSale: false, salePrice: "" });
    setImagePreview(null);
    loadData();
  };
  const removeProduct = async (id: string) => {
    await deleteProduct(id);
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

  return (
    <div className="min-h-screen bg-white relative overflow-hidden pt-32 pb-24">
      <PageBg intensity={0.35} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black">Dashboard</h1>
            <p className="text-gray-500 font-medium">Gestiona tu tienda, usuarios y reparaciones desde aquí.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-100 transition-all"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap bg-white p-2 rounded-3xl shadow-sm mb-12 border border-gray-100 max-w-fit gap-1">
          <button 
            onClick={() => setActiveTab("productos")}
            className={`px-6 sm:px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center space-x-2 ${activeTab === 'productos' ? 'bg-blue-infositel text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Package size={18} />
            <span className="hidden sm:inline">Productos</span>
          </button>
          <button 
            onClick={() => setActiveTab("categorias")}
            className={`px-6 sm:px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center space-x-2 ${activeTab === 'categorias' ? 'bg-blue-infositel text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Tag size={18} />
            <span className="hidden sm:inline">Categorías</span>
          </button>
          <button 
            onClick={() => setActiveTab("reparaciones")}
            className={`px-6 sm:px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center space-x-2 ${activeTab === 'reparaciones' ? 'bg-blue-infositel text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Wrench size={18} />
            <span className="hidden sm:inline">Reparaciones</span>
          </button>
          <button 
            onClick={() => setActiveTab("usuarios")}
            className={`px-6 sm:px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center space-x-2 ${activeTab === 'usuarios' ? 'bg-blue-infositel text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <UsersIcon size={18} />
            <span className="hidden sm:inline">Usuarios</span>
          </button>
          <button 
            onClick={() => setActiveTab("ventas")}
            className={`px-6 sm:px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center space-x-2 ${activeTab === 'ventas' ? 'bg-blue-infositel text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <CartIcon size={18} />
            <span className="hidden sm:inline">Ventas</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {/* PRODUCTOS TAB */}
          {activeTab === "productos" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 sticky top-36">
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
                    <Plus className="text-blue-infositel" /> Añadir Producto
                  </h3>
                  <div className="space-y-4">
                    <input 
                      type="text" placeholder="Nombre" 
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel"
                      value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                    <select 
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel"
                      value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    >
                      <option value="">Seleccionar Categoría</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <textarea 
                      placeholder="Descripción" 
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel"
                      value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="number" placeholder="Precio S/." 
                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel"
                        value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      />
                      <input 
                        type="number" placeholder="Stock" 
                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel"
                        value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                      />
                    </div>
                    
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-black text-blue-900">¿Activar Oferta?</label>
                        <input 
                          type="checkbox" 
                          className="w-6 h-6 accent-blue-infositel cursor-pointer"
                          checked={newProduct.onSale} 
                          onChange={e => setNewProduct({...newProduct, onSale: e.target.checked})}
                        />
                      </div>
                      {newProduct.onSale && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                          <input 
                            type="number" placeholder="Precio de Oferta S/." 
                            className="w-full p-4 bg-white rounded-xl outline-none border border-blue-200 focus:ring-2 focus:ring-blue-infositel"
                            value={newProduct.salePrice} 
                            onChange={e => setNewProduct({...newProduct, salePrice: e.target.value})}
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold ml-2">Imagen del Producto</label>
                      <div 
                        className={`relative h-40 w-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all overflow-hidden ${imagePreview ? 'border-blue-infositel bg-blue-50/50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                      >
                        {imagePreview ? (
                          <div className="relative h-full w-full group">
                            <Image src={imagePreview} alt="Preview" fill className="object-contain p-2" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white text-xs font-bold">Cambiar Imagen</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-2">
                            <Upload className="mx-auto text-gray-400" size={32} />
                            <p className="text-xs font-bold text-gray-400">Click para subir foto</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <Loader2 className="animate-spin text-blue-infositel" size={32} />
                          </div>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={addProduct}
                      disabled={isUploading}
                      className="w-full bg-black text-white py-4 rounded-2xl font-black hover:bg-blue-infositel transition-all disabled:bg-gray-300"
                    >
                      {isUploading ? 'Subiendo...' : 'Guardar Producto'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100">
                <h3 className="text-2xl font-black mb-8">Lista de Productos</h3>
                <div className="space-y-4">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center gap-6 p-4 border border-gray-50 rounded-3xl hover:bg-gray-50 transition-colors">
                      <div className="relative h-16 w-16 bg-white rounded-2xl shrink-0 overflow-hidden border border-gray-100">
                        <Image src={p.image} alt={p.name} fill className="object-contain p-2" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-blue-infositel uppercase tracking-widest">{p.category}</p>
                        <h4 className="font-bold">{p.name}</h4>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs ${p.onSale ? 'line-through text-gray-300' : 'text-gray-400'}`}>Stock: {p.stock} | Precio: S/. {p.price}</p>
                          {p.onSale && (
                            <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md">Oferta: S/. {p.salePrice}</span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeProduct(p.id)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="text-center py-20 text-gray-300 font-bold">No hay productos registrados.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CATEGORIAS TAB */}
          {activeTab === "categorias" && (
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                <h3 className="text-2xl font-black mb-8">Gestionar Categorías</h3>
                <div className="flex gap-4">
                  <input 
                    type="text" placeholder="Nueva categoría..." 
                    className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                  />
                  <button 
                    onClick={addCategory}
                    className="bg-blue-infositel text-white px-8 rounded-2xl font-black"
                  >
                    Añadir
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                <div className="flex flex-wrap gap-4">
                  {categories.map(c => (
                    <div key={c.id} className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 group">
                      <span className="font-bold">{c.name}</span>
                      {c.name !== 'Todos' && (
                        <button 
                          onClick={() => removeCategory(c.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="text-center py-12 text-gray-300 font-bold w-full">No hay categorías.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* REPARACIONES TAB */}
          {activeTab === "reparaciones" && (
            <div className="max-w-4xl mx-auto space-y-12">
               <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                <h3 className="text-2xl font-black mb-8">Registrar Nueva Reparación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input 
                    type="text" placeholder="DNI del Cliente" 
                    className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel"
                    value={newRepair.dni} onChange={e => setNewRepair({...newRepair, dni: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Equipo (ej. Laptop Dell)" 
                    className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel"
                    value={newRepair.equipment} onChange={e => setNewRepair({...newRepair, equipment: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Problema" 
                    className="md:col-span-2 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel"
                    value={newRepair.problem} onChange={e => setNewRepair({...newRepair, problem: e.target.value})}
                  />
                   <input 
                    type="text" placeholder="Estado (ej. Revisando placa)" 
                    className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel"
                    value={newRepair.statusText} onChange={e => setNewRepair({...newRepair, statusText: e.target.value})}
                  />
                  <div className="flex items-center gap-4">
                    <RefreshCw size={24} className="text-gray-300" />
                    <input 
                      type="range" min="0" max="100" 
                      className="flex-1 accent-blue-infositel"
                      value={newRepair.progress} onChange={e => setNewRepair({...newRepair, progress: Number(e.target.value)})}
                    />
                    <span className="font-black text-blue-infositel w-12">{newRepair.progress}%</span>
                  </div>
                  <button 
                    onClick={addRepair}
                    className="md:col-span-2 bg-black text-white py-5 rounded-2xl font-black hover:bg-blue-infositel transition-all"
                  >
                    Registrar Equipo
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 overflow-hidden">
                <h3 className="text-2xl font-black mb-8">Seguimiento de Equipos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-4 font-black">Código/DNI</th>
                        <th className="py-4 font-black">Equipo</th>
                        <th className="py-4 font-black">Progreso</th>
                        <th className="py-4 font-black">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repairs.map(r => (
                        <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-6">
                            <span className="block font-black text-blue-infositel">{r.id}</span>
                            <span className="text-xs text-gray-400 font-bold">{r.dni}</span>
                          </td>
                          <td className="py-6">
                            <span className="block font-bold">{r.equipment}</span>
                            <span className="text-xs text-gray-400">{r.statusText}</span>
                          </td>
                          <td className="py-6 w-48">
                            <div className="flex items-center gap-4">
                              <input 
                                type="range" min="0" max="100" 
                                className="flex-1 h-2 accent-blue-infositel"
                                value={r.progress}
                                onChange={(e) => updateRepairProgress(r.id, Number(e.target.value))}
                              />
                              <span className="font-black text-sm">{r.progress}%</span>
                            </div>
                          </td>
                          <td className="py-6">
                            <button 
                              onClick={() => removeRepair(r.id)}
                              className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {repairs.length === 0 && (
                    <div className="text-center py-20 text-gray-300 font-bold">No hay equipos registrados.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* USUARIOS TAB */}
          {activeTab === "usuarios" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 h-fit">
                <h3 className="text-2xl font-black mb-4">Gestión de Acceso</h3>
                <p className="text-xs text-gray-400 font-bold mb-8 flex flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <Lock size={12} className="text-green-500" />
                    Protección: Hasheado Scrypt (Mem-Hard)
                  </span>
                  <span className="flex items-center gap-2">
                    <CreditCard size={12} className="text-blue-500" />
                    Datos: Cifrado AES-256-GCM
                  </span>
                </p>
                <div className="space-y-4">
                  <input 
                    type="text" placeholder="Usuario" 
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel"
                    value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})}
                  />
                  <input 
                    type="password" placeholder="Contraseña" 
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel"
                    value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                  />
                  <select 
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-infositel font-bold"
                    value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value as "admin" | "superadmin"})}
                  >
                    <option value="admin">Administrador Estándar</option>
                    <option value="superadmin">Super Administrador</option>
                  </select>
                  <button 
                    onClick={addAdminUser}
                    className="w-full bg-black text-white py-4 rounded-2xl font-black hover:bg-blue-infositel transition-all"
                  >
                    Crear Usuario
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                <h3 className="text-2xl font-black mb-8">Administradores</h3>
                <div className="space-y-4">
                  {adminUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${u.role === 'superadmin' ? 'bg-blue-100 text-blue-infositel' : 'bg-gray-100 text-gray-500'}`}>
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold">{u.username}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs uppercase font-black text-gray-400 tracking-tighter">{u.role}</p>
                             {u.passwordHash ? (
                              <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-black uppercase">Scrypt</span>
                            ) : (
                              <span className="text-[9px] bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full font-black">LEGACY</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeAdminUser(u.id)}
                        className="p-3 text-gray-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VENTAS TAB */}
          {activeTab === "ventas" && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-1">Total Ventas</p>
                  <h3 className="text-4xl font-black text-blue-infositel">S/. {orders.reduce((acc, o) => acc + o.total, 0)}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-1">Pedidos Hoy</p>
                  <h3 className="text-4xl font-black">{orders.length}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-1">Promedio</p>
                  <h3 className="text-4xl font-black">S/. {orders.length > 0 ? (orders.reduce((acc, o) => acc + o.total, 0) / orders.length).toFixed(0) : 0}</h3>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 overflow-hidden">
                <h3 className="text-2xl font-black mb-8">Registro de Pedidos</h3>
                <div className="space-y-6">
                  {orders.map(o => (
                    <div key={o.id} className="p-6 border border-gray-50 rounded-[2rem] hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                      <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-gray-50 rounded-2xl text-blue-infositel">
                            <CreditCard size={24} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 font-bold">{new Date(o.date).toLocaleDateString()}</p>
                            <h4 className="text-lg font-black">{o.customerName}</h4>
                            <p className="text-sm text-blue-infositel font-bold">{o.customerPhone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black">S/. {o.total}</span>
                          <span className="block text-xs font-black text-gray-300">#{o.id}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {o.items.map((item: any, idx: number) => (
                          <span key={idx} className="px-4 py-1.5 bg-gray-50 rounded-full text-xs font-bold text-gray-500 border border-gray-100">
                            {item.name} (x{item.quantity}) - <span className="text-blue-infositel">{item.category}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-20 text-gray-300 font-bold">No hay ventas registradas aún.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
