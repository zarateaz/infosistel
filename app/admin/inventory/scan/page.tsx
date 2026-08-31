"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ScanBarcode, Camera, X, CheckCircle2, Loader2, ArrowLeft,
  PackageSearch, Save, PackagePlus, AlertTriangle, RefreshCcw, Upload, Sparkles,
} from "lucide-react";
import { saveScannedProduct, getCategories } from "@/app/admin/actions";

type LookupResult = {
  found: boolean;
  existsLocally?: boolean;
  barcode: string;
  model?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  price?: number;
  stock?: number;
  specs?: Record<string, string | null>;
  message?: string;
};

type StockMode = "add" | "set";

type FormState = {
  barcode: string;
  model: string;
  description: string;
  category: string;
  image: string;
  price: string;
  stock: string;
  specs: Record<string, string | null> | null;
  existsLocally: boolean;
  existingStock: number;
  existingPrice: number;
  stockMode: StockMode;
};

const EMPTY_FORM: FormState = {
  barcode: "",
  model: "",
  description: "",
  category: "GENERAL",
  image: "",
  price: "",
  stock: "",
  specs: null,
  existsLocally: false,
  existingStock: 0,
  existingPrice: 0,
  stockMode: "add",
};

// Fallback shown only until the real list loads from the DB — keeps the
// dropdown from being empty for a beat, not a taxonomy of its own.
const FALLBACK_CATEGORIES = ["GENERAL"];

// ── Camera scanner modal (html5-qrcode) — only mounted while open, so its
// browser-only APIs never execute during SSR. ──
function CameraScannerModal({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const containerId = "barcode-camera-reader";
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;
      // Mobile-perf fix: let the browser's native, hardware-accelerated
      // BarcodeDetector decode frames (most Android Chrome supports it)
      // instead of html5-qrcode's pure-JS decoder running on the main
      // thread — that JS-thread decoding at 10fps was what froze the UI
      // and heated the phone during a scan. This option lives on the
      // constructor's config, not on start()'s scan config.
      const instance = new Html5Qrcode(containerId, {
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        verbose: false,
      });
      scannerRef.current = instance;
      instance
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 160 } },
          (decodedText) => {
            onDetected(decodedText.replace(/[^0-9]/g, ""));
          },
          () => {}
        )
        .catch(() => setError("No se pudo acceder a la cámara. Revisa los permisos del navegador."));
    });

    return () => {
      cancelled = true;
      scannerRef.current
        ?.stop()
        .then(() => scannerRef.current?.clear())
        .catch(() => {});
    };
  }, [onDetected]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2rem] p-6 max-w-md w-full border border-gray-100 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-black text-gray-900">Escanear con cámara</p>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>
        {error ? (
          <p className="text-red-500 text-sm font-medium py-8 text-center">{error}</p>
        ) : (
          <div id={containerId} className="rounded-2xl overflow-hidden border border-gray-100" />
        )}
      </motion.div>
    </motion.div>
  );
}

export default function BarcodeInventoryScanPage() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "looking-up" | "ready" | "saving">("idle");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Kept alongside `form.image` (the uploaded URL) so "Reconocer con IA" can
  // send the original photo bytes without re-fetching the just-uploaded file.
  const lastPhotoFileRef = useRef<File | null>(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  // Same source of truth as /tienda's filters and "Añadir Producto" — never
  // a second hardcoded list that can drift out of sync with the real one.
  useEffect(() => {
    getCategories()
      .then((cats) => {
        if (cats.length) setCategories(cats.map((c) => c.name));
      })
      .catch(() => {});
  }, []);

  // Most barcodes on generic/OEM stock were never registered in any public
  // database — that lookup miss is normal, not a bug. Jump straight to the
  // model field so completing the form by hand costs zero extra clicks.
  useEffect(() => {
    if (status === "ready" && !form.model) {
      modelRef.current?.focus();
    }
  }, [status, form.model]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    lastPhotoFileRef.current = file;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setForm((f) => ({ ...f, image: data.url }));
      } else {
        setErrorMessage(data.error || "Error al subir la imagen");
      }
    } catch {
      setErrorMessage("Error de conexión al subir imagen");
    } finally {
      setIsUploading(false);
    }
  };

  // Reads the brand/model/specs printed on the box photo with Gemini vision —
  // works for any product regardless of whether its barcode is in any public
  // database, which the barcode lookup alone can't guarantee (see scan flow).
  const handleRecognize = async () => {
    const file = lastPhotoFileRef.current;
    if (!file) return;
    setIsRecognizing(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/recognize-product", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setForm((f) => ({
          ...f,
          model: data.model || f.model,
          description: data.description || f.description,
          category: data.category || f.category,
        }));
        setInfoMessage("Datos leídos de la foto con IA — revisa y ajusta lo que haga falta antes de guardar.");
      } else {
        setErrorMessage(data.error || "No se pudo reconocer el producto en la foto.");
      }
    } catch {
      setErrorMessage("Error de conexión al reconocer la imagen.");
    } finally {
      setIsRecognizing(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const lookup = useCallback(async (code: string) => {
    const clean = code.replace(/[^0-9]/g, "");
    if (!clean) return;
    if (clean.length < 6) {
      setErrorMessage("El código debe tener al menos 6 dígitos.");
      return;
    }

    setStatus("looking-up");
    setInfoMessage(null);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/barcode?barcode=${encodeURIComponent(clean)}`);
      const data: LookupResult = await res.json();

      setForm({
        barcode: clean,
        model: data.model || "",
        description: data.description || "",
        category: data.category || "General",
        image: data.imageUrl || "",
        price: data.existsLocally && data.price ? String(data.price) : "",
        stock: "",
        specs: data.specs || null,
        existsLocally: Boolean(data.existsLocally),
        existingStock: data.stock ?? 0,
        existingPrice: data.price ?? 0,
        stockMode: "add",
      });

      if (data.existsLocally) {
        setInfoMessage(`Ya tienes este producto en tu catálogo — stock actual: ${data.stock ?? 0} unidades.`);
      } else if (!data.found) {
        setInfoMessage(data.message || "No se encontró información pública para este código. Completa los datos manualmente.");
      }
    } catch {
      setForm({ ...EMPTY_FORM, barcode: clean });
      setInfoMessage("No se pudo consultar el servicio externo. Completa los datos manualmente.");
    } finally {
      setStatus("ready");
    }
  }, []);

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      lookup(barcodeInput);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.barcode || !form.model || !form.price) return;
    if (form.existsLocally && form.stockMode === "add" && !form.stock) {
      setErrorMessage("Indica cuántas unidades estás agregando (o cambia a \"Reemplazar total\").");
      return;
    }

    setStatus("saving");
    setErrorMessage(null);
    try {
      const saved = await saveScannedProduct(form);
      const finalStock = typeof saved?.stock === "number" ? saved.stock : null;
      setToast(
        finalStock !== null
          ? `"${form.model}" guardado — stock actual: ${finalStock} unidades`
          : `"${form.model}" guardado en el catálogo`
      );
      setForm(EMPTY_FORM);
      setBarcodeInput("");
      setInfoMessage(null);
      setStatus("idle");
      barcodeRef.current?.focus();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al guardar el producto");
      setStatus("ready");
    }
  };

  const hasResult = status === "ready" || status === "saving";

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-11 h-11 rounded-2xl bg-gradient-brand flex items-center justify-center shrink-0">
            <ScanBarcode size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-black text-gray-900 leading-tight">Agregar Productos con Código de Barras</h1>
            <p className="text-gray-400 text-xs font-medium">Escanea un código, confirma los datos y guárdalo en el catálogo</p>
          </div>
        </div>

        {/* Scan input module */}
        <div className="bg-white rounded-[1.75rem] border border-gray-100 p-6 md:p-8 mb-6 shadow-[0_20px_60px_rgba(0,0,0,0.02)]">
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
            Código de barras (EAN / UPC)
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <PackageSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                ref={barcodeRef}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeKeyDown}
                placeholder="Apunta el lector aquí o escribe el código y presiona Enter"
                inputMode="numeric"
                autoComplete="off"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-infositel/30 focus:bg-white transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="shrink-0 w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              aria-label="Escanear con cámara"
            >
              <Camera size={18} />
            </button>
          </div>

          {status === "looking-up" && (
            <div className="flex items-center gap-2 text-blue-infositel text-sm font-bold mt-4">
              <Loader2 size={16} className="animate-spin" /> Buscando información del producto...
            </div>
          )}
          {infoMessage && (
            <p
              className={`text-xs font-semibold mt-4 rounded-xl px-3 py-2.5 flex items-start gap-2 ${
                form.existsLocally ? "text-blue-infositel bg-blue-infositel/8" : "text-amber-600 bg-amber-50"
              }`}
            >
              {form.existsLocally ? <PackagePlus size={15} className="shrink-0 mt-0.5" /> : <AlertTriangle size={15} className="shrink-0 mt-0.5" />}
              {infoMessage}
            </p>
          )}
          {errorMessage && (
            <p className="text-xs font-semibold mt-4 rounded-xl px-3 py-2.5 flex items-start gap-2 text-red-600 bg-red-50">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              {errorMessage}
            </p>
          )}
        </div>

        {/* Confirm / edit form */}
        <AnimatePresence>
          {hasResult && (
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              onSubmit={handleSave}
              className="bg-white rounded-[1.75rem] border border-gray-100 p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.02)] space-y-5"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {form.image ? (
                    <Image src={form.image} alt="" fill className="object-contain p-2" unoptimized />
                  ) : (
                    <PackageSearch size={24} className="text-gray-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-gray-400">{form.barcode}</p>
                  <p className="text-sm font-bold text-gray-700 truncate">{form.model || "Producto sin identificar"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Modelo exacto</label>
                  <input
                    ref={modelRef}
                    required
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-infositel/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-infositel/30 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-infositel/30"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Foto del producto</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`relative h-28 w-full border-2 border-dashed rounded-2xl flex items-center gap-4 px-5 overflow-hidden transition-all cursor-pointer ${
                      isUploading ? "bg-blue-infositel/5 border-blue-infositel/20" : "bg-gray-50 hover:bg-blue-infositel/5 border-gray-200"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="animate-spin text-blue-infositel shrink-0" size={22} />
                        <p className="text-xs font-black text-blue-infositel">Subiendo foto...</p>
                      </>
                    ) : form.image ? (
                      <>
                        <div className="relative w-16 h-16 rounded-xl bg-white border border-gray-100 shrink-0 overflow-hidden">
                          <Image src={form.image} alt="" fill className="object-contain p-1.5" unoptimized />
                        </div>
                        <p className="text-xs font-bold text-gray-500">Click para cambiar la foto</p>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                          <Upload className="text-gray-400" size={18} />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Toca para tomar/subir una foto</p>
                      </>
                    )}
                  </div>

                  {form.image && (
                    <button
                      type="button"
                      onClick={handleRecognize}
                      disabled={isRecognizing}
                      className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-gradient-brand rounded-2xl py-3 shadow-glow-brand hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60"
                    >
                      {isRecognizing ? (
                        <>
                          <Loader2 size={15} className="animate-spin" /> Leyendo la caja con IA...
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} /> Reconocer con IA
                        </>
                      )}
                    </button>
                  )}
                  <p className="text-[11px] text-gray-400 font-medium mt-2 leading-relaxed">
                    Sube una foto nítida de la caja/etiqueta y presiona "Reconocer con IA" para llenar
                    modelo, descripción y categoría automáticamente — funciona aunque el código de
                    barras no tenga datos en la base pública.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Precio de venta (S/.) <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.10"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-infositel/30"
                  />
                  {form.existsLocally && (
                    <p className="text-[11px] text-gray-400 font-medium mt-1.5">Precio actual: S/. {form.existingPrice.toFixed(2)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    {form.existsLocally ? (form.stockMode === "add" ? "Unidades a agregar" : "Nuevo stock total") : "Stock inicial"}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-infositel/30"
                  />
                  {form.existsLocally && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, stockMode: form.stockMode === "add" ? "set" : "add" })}
                      className="text-[11px] text-blue-infositel font-bold mt-1.5 flex items-center gap-1 hover:underline"
                    >
                      <RefreshCcw size={11} />
                      {form.stockMode === "add"
                        ? `Sumando a las ${form.existingStock} actuales — cambiar a reemplazar total`
                        : "Reemplazando el total — cambiar a sumar a lo existente"}
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "saving"}
                className="w-full h-13 rounded-2xl bg-gradient-brand text-white font-black text-sm flex items-center justify-center gap-2 shadow-glow-brand hover:scale-[1.01] active:scale-95 transition-transform disabled:opacity-60"
              >
                {status === "saving" ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Guardar en Catálogo
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Camera modal */}
      <AnimatePresence>
        {showCamera && (
          <CameraScannerModal
            onDetected={(code) => {
              setShowCamera(false);
              setBarcodeInput(code);
              lookup(code);
            }}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold max-w-[90vw]"
          >
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
