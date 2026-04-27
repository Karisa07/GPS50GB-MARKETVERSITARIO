"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Bell, LayoutDashboard, Package, 
  Settings, LogOut, ChevronDown, MapPin, 
  Heart, Filter, Sparkles, Check
} from "lucide-react";

// -- MOCK DATA --
const MOCK_PRODUCTS = [
  {
    id: "1",
    titulo: "MacBook Air M1 2020 256GB",
    precio: "2.800.000",
    precioNum: 2800000,
    categoria: "Tecnología",
    ubicacion: "Biblioteca Central",
    estado: "disponible", // disponible, reservado, vendido
    imagen: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600&auto=format&fit=crop",
    vendedor: { nombre: "Carlos M." },
    tiempo: "Hace 2 horas"
  },
  {
    id: "2",
    titulo: "Libro: Cálculo de Stewart 8va Edición",
    precio: "85.000",
    precioNum: 85000,
    categoria: "Libros",
    ubicacion: "Bloque 14",
    estado: "disponible",
    imagen: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    vendedor: { nombre: "Ana López" },
    tiempo: "Hace 5 horas"
  },
  {
    id: "3",
    titulo: "Calculadora Casio FX-991LAX",
    precio: "120.000",
    precioNum: 120000,
    categoria: "Útiles",
    ubicacion: "Plazoleta Principal",
    estado: "reservado",
    imagen: "https://images.unsplash.com/photo-1574607383476-f517f260d30b?q=80&w=600&auto=format&fit=crop",
    vendedor: { nombre: "Daniel P." },
    tiempo: "Ayer"
  },
  {
    id: "4",
    titulo: "iPad Pro 11' + Apple Pencil",
    precio: "3.200.000",
    precioNum: 3200000,
    categoria: "Tecnología",
    ubicacion: "Cafetería Ciencias",
    estado: "disponible",
    imagen: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop",
    vendedor: { nombre: "Sofía R." },
    tiempo: "Hace 1 día"
  },
  {
    id: "5",
    titulo: "Audífonos Sony WH-1000XM4",
    precio: "750.000",
    precioNum: 750000,
    categoria: "Tecnología",
    ubicacion: "Bloque 21",
    estado: "vendido",
    imagen: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop",
    vendedor: { nombre: "Mateo G." },
    tiempo: "Hace 2 días"
  },
  {
    id: "6",
    titulo: "Bata de Laboratorio Talla M",
    precio: "25.000",
    precioNum: 25000,
    categoria: "Ropa",
    ubicacion: "Laboratorios Sur",
    estado: "disponible",
    imagen: "https://images.unsplash.com/photo-1584982751601-97d8cb0f66fc?q=80&w=600&auto=format&fit=crop",
    vendedor: { nombre: "Laura V." },
    tiempo: "Hace 3 días"
  }
];

const CATEGORIAS = ["Todas las categorías", "Tecnología", "Libros", "Útiles", "Ropa", "Servicios Estudiantiles", "Otros"];

const RANGOS_PRECIO = [
  { label: "Todos los precios", min: 0, max: Infinity },
  { label: "Menos de $50.000", min: 0, max: 50000 },
  { label: "$50.000 - $200.000", min: 50000, max: 200000 },
  { label: "Más de $200.000", min: 200000, max: Infinity },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

export default function FeedMarketplace() {
  const [activeCategory, setActiveCategory] = useState("Todas las categorías");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePriceRange, setActivePriceRange] = useState(0); // Index of RANGOS_PRECIO
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [likedItems, setLikedItems] = useState<{ [key: string]: boolean }>({});

  // Estado del combobox de categorías
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [comboboxSearch, setComboboxSearch] = useState("");
  const comboboxRef = React.useRef<HTMLDivElement>(null);

  // Cerrar combobox al hacer click afuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsComboboxOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = CATEGORIAS.filter(cat => 
    cat.toLowerCase().includes(comboboxSearch.toLowerCase())
  );

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentPriceRange = RANGOS_PRECIO[activePriceRange];

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchCategory = activeCategory === "Todas las categorías" || p.categoria === activeCategory;
    const matchSearch = p.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice = p.precioNum >= currentPriceRange.min && p.precioNum <= currentPriceRange.max;
    return matchCategory && matchSearch && matchPrice;
  });

  return (
    <div 
      className="flex h-screen bg-[#F8F9FB] overflow-hidden"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      
      {/* 1. SIDEBAR IZQUIERDA */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 z-20 hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center px-8 border-b border-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6055D0] to-[#534AB7] flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[18px] text-slate-800 tracking-tight">Market<span className="text-[#534AB7]">Versitario</span></span>
            </div>
          </div>

          {/* Menú Principal */}
          <div className="px-5 py-6">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Navegación</p>
            <nav className="space-y-1.5">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-[#F8F7FF] text-[#534AB7] rounded-xl font-semibold text-[14px] transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                <span>Explorar Feed</span>
              </a>
              <a href="/publicaciones/nueva" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-medium text-[14px] transition-colors">
                <Package className="w-4 h-4" />
                <span>Mis Publicaciones</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-medium text-[14px] transition-colors">
                <Heart className="w-4 h-4" />
                <span>Guardados</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Menú Inferior */}
        <div className="px-5 py-6 border-t border-slate-50">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ajustes</p>
          <nav className="space-y-1.5">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-medium text-[14px] transition-colors">
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-medium text-[14px] transition-colors mt-2">
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar: Buscador y Perfil */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          {/* Barra de Búsqueda Prominente */}
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar calculadoras, libros, tecnología..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-slate-100/70 border-transparent rounded-full focus:bg-white focus:border-[#534AB7]/30 focus:ring-2 focus:ring-[#534AB7]/10 transition-all text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* User Widgets (Right) */}
          <div className="flex items-center gap-4 ml-6">
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6055D0] to-[#534AB7] flex items-center justify-center text-white font-bold text-[14px] border-2 border-white shadow-sm">
                JR
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-bold text-slate-700 group-hover:text-[#534AB7] transition-colors">Jason Ranti</p>
                <p className="text-[11px] text-slate-400 font-medium">Estudiante</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin">
          
          {/* Cabecera y Filtros */}
          <div className="mb-8">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Descubre productos</h2>
                <p className="text-[14px] text-slate-500 mt-1">Encuentra lo que necesitas dentro del campus universitario.</p>
              </div>

              {/* Filtros Secundarios (Precio y Orden) */}
              <div className="flex items-center gap-3 relative">
                {/* Filtro Rango de Precio */}
                <div className="relative">
                  <button 
                    onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <span>{currentPriceRange.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <AnimatePresence>
                    {isPriceDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1"
                      >
                        {RANGOS_PRECIO.map((rango, idx) => (
                          <div 
                            key={idx}
                            onClick={() => { setActivePriceRange(idx); setIsPriceDropdownOpen(false); }}
                            className={`px-4 py-2 text-[13px] cursor-pointer transition-colors ${activePriceRange === idx ? 'bg-[#F8F7FF] text-[#534AB7] font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                            {rango.label}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Recientes</span>
                </button>
              </div>
            </div>

            {/* Filtro de Categoría (Combobox Editable) - Fila Horizontal */}
            <div className="relative w-full sm:w-64" ref={comboboxRef}>
              <input 
                type="text"
                placeholder="Filtrar por categoría..."
                value={isComboboxOpen ? comboboxSearch : activeCategory}
                onChange={(e) => {
                  setComboboxSearch(e.target.value);
                  if (!isComboboxOpen) setIsComboboxOpen(true);
                }}
                onFocus={() => {
                  setIsComboboxOpen(true);
                  setComboboxSearch(""); // Limpiar para ver todo al enfocar
                }}
                className={`w-full h-11 pl-4 pr-10 rounded-xl border-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#534AB7]/20 focus-visible:border-[#534AB7] transition-all text-[13px] font-medium shadow-sm ${isComboboxOpen ? 'border-[#534AB7] bg-white' : 'bg-white hover:border-slate-300'}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {isComboboxOpen ? (
                  <Search className="w-4 h-4 text-[#534AB7]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              <AnimatePresence>
                {isComboboxOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute z-50 top-[52px] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="max-h-56 overflow-y-auto p-1" style={{ scrollbarWidth: "thin" }}>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map(cat => (
                          <div 
                            key={cat}
                            onClick={() => {
                              setActiveCategory(cat);
                              setComboboxSearch("");
                              setIsComboboxOpen(false);
                            }}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-[13px] transition-colors ${activeCategory === cat ? 'bg-[#F8F7FF] text-[#534AB7] font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}
                          >
                            {cat}
                            <AnimatePresence>
                              {activeCategory === cat && (
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
                          No se encontraron categorías.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Grid de Productos */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((producto) => {
                const isLiked = likedItems[producto.id] || false;
                
                return (
                  <motion.div
                    key={producto.id}
                    layout
                    variants={cardVariants}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 group flex flex-col"
                  >
                    {/* Imagen del Producto (Aspect Ratio 4/3) */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      <img 
                        src={producto.imagen} 
                        alt={producto.titulo} 
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          producto.estado === "vendido" ? "grayscale opacity-60" : "group-hover:scale-105"
                        }`}
                      />
                      
                      {/* Badge de Estado Absoluto */}
                      <div className="absolute top-3 left-3">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={producto.estado}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm border block ${
                              producto.estado === "disponible" ? "bg-white/90 backdrop-blur-sm text-emerald-600 border-emerald-100" :
                              producto.estado === "reservado" ? "bg-white/90 backdrop-blur-sm text-amber-600 border-amber-100" :
                              "bg-slate-800/90 backdrop-blur-sm text-white border-transparent"
                            }`}
                          >
                            {producto.estado}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      
                      {/* Botón Favorito Flotante */}
                      <motion.button 
                        onClick={(e) => toggleLike(producto.id, e)}
                        whileTap={{ scale: 1.4 }}
                        animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }}
                        transition={{ duration: 0.3, type: "spring" }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white transition-colors shadow-sm"
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                      </motion.button>
                    </div>

                    {/* Información del Producto */}
                    <div className="p-5 flex-1 flex flex-col">
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#534AB7] uppercase tracking-wider bg-[#F8F7FF] px-2 py-0.5 rounded-sm">
                          {producto.categoria}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{producto.tiempo}</span>
                      </div>

                      <h3 className="text-[15px] font-bold text-slate-800 leading-snug line-clamp-2 mb-3 group-hover:text-[#534AB7] transition-colors">
                        {producto.titulo}
                      </h3>
                      
                      <div className="mt-auto">
                        
                        <div className="border-t border-slate-100 pt-3 mt-3">
                          {/* Precio Estelar con separador sutil */}
                          <p className="text-xl font-black text-slate-800 tracking-tight">
                            <span className="text-sm font-semibold text-slate-400 mr-1">$</span>
                            {producto.precio}
                          </p>
                        </div>

                        {/* Footer de la Card: Vendedor y Ubicación */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6055D0] to-[#534AB7] flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                              {producto.vendedor.nombre.charAt(0)}
                            </div>
                            <span className="text-[12px] font-medium text-slate-600">{producto.vendedor.nombre}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium truncate max-w-[80px]">{producto.ubicacion}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No se encontraron productos</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                No hay resultados para tu búsqueda con los filtros actuales. Intenta modificar el rango de precio o la categoría.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
