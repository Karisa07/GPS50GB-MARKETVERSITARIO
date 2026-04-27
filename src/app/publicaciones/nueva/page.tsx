"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Image as ImageIcon, Search, AlertTriangle, ChevronDown, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Categoria = { id: string; nombre: string };

export default function NuevaPublicacion() {
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  
  // -- Simulación de base de datos para categorías --
  const [categoriasBD, setCategoriasBD] = useState<Categoria[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  // Estado del combobox
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [comboboxSearch, setComboboxSearch] = useState("");
  const comboboxRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    ubicacion: "",
    categoria: "", // Guarda el ID real, ej: "cat_1"
    imagen: "", // Opcional
  });

  // Efecto para cerrar combobox al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsComboboxOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simular Fetch de categorías desde BD (NO conectado realmente)
  useEffect(() => {
    const fetchCategorias = async () => {
      setLoadingCategories(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockDB: Categoria[] = [
          { id: "cat_1", nombre: "Tecnología y Electrónica" },
          { id: "cat_2", nombre: "Libros y Copias" },
          { id: "cat_3", nombre: "Útiles Universitarios" },
          { id: "cat_4", nombre: "Ropa y Accesorios" },
          { id: "cat_5", nombre: "Servicios Estudiantiles" },
          { id: "cat_6", nombre: "Otros" },
        ];
        setCategoriasBD(mockDB);
      } catch (err) {
        setCategoriesError("No se pudieron cargar las categorías.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategorias();
  }, []);

  // Manejo de filtrado en el combobox
  const filteredCategories = categoriasBD.filter(cat => 
    cat.nombre.toLowerCase().includes(comboboxSearch.toLowerCase())
  );

  const selectedCategoryObj = categoriasBD.find(c => c.id === formData.categoria);
  
  const categoryWarning = formData.categoria && !loadingCategories && !selectedCategoryObj 
    ? "La categoría asignada previamente ya no existe en la base de datos." 
    : "";

  // Manejo general de inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "descripcion" && value.length > 300) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setFormData(prev => ({ ...prev, precio: "" }));
      return;
    }
    const formatted = new Intl.NumberFormat("es-CO").format(parseInt(rawValue, 10));
    setFormData(prev => ({ ...prev, precio: formatted }));
  };

  // Cálculos de progreso
  const requiredFields = ["titulo", "precio", "ubicacion", "categoria", "descripcion"];
  const allFields = [...requiredFields, "imagen"];
  
  const requiredFilledCount = useMemo(() => {
    return requiredFields.filter(field => formData[field as keyof typeof formData].toString().trim().length > 0).length;
  }, [formData]);

  const totalFilledCount = useMemo(() => {
    return allFields.filter(field => formData[field as keyof typeof formData].toString().trim().length > 0).length;
  }, [formData]);

  const progressPercentage = Math.round((totalFilledCount / allFields.length) * 100);
  const isReadyToSubmit = requiredFilledCount === requiredFields.length;
  const remainingFields = requiredFields.length - requiredFilledCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReadyToSubmit) return;

    setLoading(true);
    setErrorText("");

    try {
      const numericPrice = formData.precio.replace(/\./g, "");

      const payload = {
        titulo: formData.titulo,
        descripcion: `[Categoría ID: ${formData.categoria}] ${formData.descripcion}`, 
        precio: numericPrice,
        ubicacion: formData.ubicacion,
        imagen: formData.imagen
      };

      const res = await fetch("/api/publicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la publicación");

      // Redirección inmediata, sin success screen animada
      window.location.href = "/";
      
    } catch (err: any) {
      setErrorText(err.message);
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#F8F9FB] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <div className="w-full max-w-[800px] z-10">
        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-slate-200">
          
          <form onSubmit={handleSubmit} className="px-10 py-10 space-y-9">
            
            {/* Header unificado */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Publicar un producto</h1>
                <p className="text-[15px] text-slate-500 mt-1">Completa los detalles para listar tu artículo en el marketplace.</p>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                  <span>Progreso de completitud</span>
                  <span className={progressPercentage === 100 ? "text-emerald-500" : "text-[#534AB7]"}>{progressPercentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`h-full rounded-full ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-[#534AB7]'}`}
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {errorText && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 shadow-sm mt-4">
                    {errorText}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-8">
              
              {/* Categoría (Combobox Editable) - Propia Fila */}
              <div className="space-y-2 relative" ref={comboboxRef}>
                <Label htmlFor="categoria" className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Categoría <span className="text-[#534AB7]">*</span>
                </Label>
                
                {loadingCategories ? (
                  <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse flex items-center px-4 border border-slate-200">
                    <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                  </div>
                ) : categoriesError ? (
                  <div className="h-12 w-full bg-red-50 rounded-xl flex items-center px-4 border border-red-100 text-red-500 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Error al cargar
                  </div>
                ) : (
                  <div className="relative">
                    <Input 
                      type="text"
                      placeholder="Escribe o selecciona una categoría..."
                      value={isComboboxOpen ? comboboxSearch : (selectedCategoryObj ? selectedCategoryObj.nombre : "")}
                      onChange={(e) => {
                        setComboboxSearch(e.target.value);
                        if (!isComboboxOpen) setIsComboboxOpen(true);
                      }}
                      onFocus={() => {
                        setIsComboboxOpen(true);
                        setComboboxSearch(""); // Limpiar para ver todo al enfocar
                      }}
                      className={`h-12 rounded-xl pr-10 focus-visible:ring-2 focus-visible:ring-[#534AB7]/20 focus-visible:border-[#534AB7] transition-all text-[15px] shadow-sm ${isComboboxOpen ? 'border-[#534AB7] bg-white' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {isComboboxOpen ? (
                        <Search className="w-4 h-4 text-[#534AB7]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                )}

                {categoryWarning && (
                  <p className="text-[11px] text-amber-600 font-medium flex items-center mt-1">
                    <AlertTriangle className="w-3 h-3 mr-1" /> {categoryWarning}
                  </p>
                )}

                <AnimatePresence>
                  {isComboboxOpen && !loadingCategories && !categoriesError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute z-50 top-[76px] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="max-h-56 overflow-y-auto p-1" style={{ scrollbarWidth: "thin" }}>
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map(cat => (
                            <div 
                              key={cat.id}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, categoria: cat.id }));
                                setComboboxSearch("");
                                setIsComboboxOpen(false);
                              }}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-[14px] transition-colors ${formData.categoria === cat.id ? 'bg-[#F8F7FF] text-[#534AB7] font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                              {cat.nombre}
                              <AnimatePresence>
                                {formData.categoria === cat.id && (
                                  <motion.span
                                    initial={{ opacity: 0, x: -6, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -6, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Check className="w-4 h-4 text-[#534AB7]" />
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-[13px] text-slate-400">
                            No se encontraron resultados.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Título - Propia Fila */}
              <div className="space-y-2">
                <Label htmlFor="titulo" className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Título del producto <span className="text-[#534AB7]">*</span></Label>
                <Input 
                  id="titulo" name="titulo"
                  placeholder="Ej: Calculadora Casio FX-991" 
                  value={formData.titulo} onChange={handleChange}
                  className="h-12 rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-[#534AB7]/20 focus-visible:border-[#534AB7] transition-all text-[15px] text-slate-800 placeholder:text-slate-400 shadow-sm"
                />
              </div>

              {/* Precio y Ubicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="precio" className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Precio (COP) <span className="text-[#534AB7]">*</span></Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 text-sm font-semibold pointer-events-none">$</span>
                    <Input 
                      id="precio" name="precio" type="text"
                      placeholder="0" 
                      value={formData.precio} onChange={handlePriceChange}
                      className="h-12 pl-8 rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-[#534AB7]/20 focus-visible:border-[#534AB7] transition-all text-[15px] text-slate-800 placeholder:text-slate-400 font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacion" className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Ubicación / Entrega <span className="text-[#534AB7]">*</span></Label>
                  <Input 
                    id="ubicacion" name="ubicacion"
                    placeholder="Ej: Bloque D, Entrada Principal" 
                    value={formData.ubicacion} onChange={handleChange}
                    className="h-12 rounded-xl border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-[#534AB7]/20 focus-visible:border-[#534AB7] transition-all text-[15px] text-slate-800 placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>

              {/* Descripción Textarea */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="descripcion" className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Descripción detallada <span className="text-[#534AB7]">*</span></Label>
                  <span className={`text-[10px] font-medium ${formData.descripcion.length >= 300 ? 'text-red-500' : 'text-slate-400'}`}>
                    {formData.descripcion.length} / 300
                  </span>
                </div>
                <Textarea 
                  id="descripcion" name="descripcion"
                  placeholder="Explica el estado de tu producto, motivo de venta o detalles clave..." 
                  value={formData.descripcion} onChange={handleChange}
                  className="min-h-[100px] rounded-xl border-slate-200 bg-white p-4 focus-visible:ring-2 focus-visible:ring-[#534AB7]/20 focus-visible:border-[#534AB7] resize-none transition-all text-[15px] text-slate-800 placeholder:text-slate-400 leading-relaxed shadow-sm block w-full"
                />
              </div>

              {/* Dropzone */}
              <div className="space-y-2 pt-2">
                <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Fotografía (OPCIONAL)</Label>
                <div className="relative border border-dashed border-slate-300 hover:border-[#534AB7]/60 rounded-xl bg-slate-50 hover:bg-[#F8F7FF] transition-all duration-300 cursor-pointer group flex flex-row items-center justify-start p-4 gap-4">
                  <div className="p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm group-hover:shadow group-hover:border-[#534AB7]/20 transition-all duration-300">
                    <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-[#534AB7]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-slate-700 group-hover:text-[#534AB7] transition-colors">Subir imagen principal</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">PNG, JPG hasta 5MB</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Submit Section */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left w-full sm:w-auto h-6 flex items-center">
                {!isReadyToSubmit ? (
                  <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1">
                    Faltan 
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={remainingFields}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="font-bold text-[#534AB7] inline-block"
                      >
                        {remainingFields}
                      </motion.span>
                    </AnimatePresence> 
                    campos obligatorios
                  </p>
                ) : (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="text-[12px] text-emerald-600 font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Listo para publicar
                  </motion.p>
                )}
              </div>

              <motion.button 
                type="submit" 
                disabled={loading || !isReadyToSubmit}
                animate={{ 
                  opacity: isReadyToSubmit && !loading ? 1 : 0.4,
                  scale: isReadyToSubmit && !loading ? 1 : 0.98
                }}
                whileHover={isReadyToSubmit && !loading ? { scale: 1.02 } : {}}
                whileTap={isReadyToSubmit && !loading ? { scale: 0.97 } : {}}
                transition={{ duration: 0.2 }}
                className={`w-full sm:w-auto h-12 rounded-xl px-10 font-bold tracking-wide transition-colors duration-300 border-0 flex items-center justify-center gap-2 ${
                  isReadyToSubmit 
                    ? "bg-gradient-to-r from-[#6055D0] to-[#534AB7] text-white cursor-pointer shadow-md" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Publicando...
                  </>
                ) : (
                  "Crear Publicación"
                )}
              </motion.button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
