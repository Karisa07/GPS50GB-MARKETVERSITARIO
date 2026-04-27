"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Bell, LayoutDashboard, Package, 
  Settings, LogOut, ChevronDown, Plus, 
  Pencil, Trash2, ExternalLink, Filter,
  Sparkles, Check, Heart, Loader2, X, AlertTriangle, Save
} from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const CATEGORIAS = ["Todas las categorías", "Tecnología", "Libros", "Útiles", "Ropa", "Servicios Estudiantiles", "Otros"];
export default function GestionPublicaciones() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Mis Publicaciones");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas las categorías");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userAuth, setUserAuth] = useState<any>(null);

  // Estado modal eliminar
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // Estado modal editar
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editForm, setEditForm] = useState({ titulo: '', precio: '', ubicacion: '', descripcion: '', estado: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Carga inicial
  React.useEffect(() => {
    const fetchUserAndData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserAuth(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }

      try {
        const res = await fetch('/api/publicaciones?estado=todos');
        if (res.ok) {
          const json = await res.json();
          setProductos(json.data || []);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/auth/login';
  };

  const openEdit = (pub: any) => {
    setEditTarget(pub);
    setEditForm({
      titulo: pub.titulo || '',
      precio: pub.precio ? String(pub.precio) : '',
      ubicacion: pub.ubicacion || '',
      descripcion: pub.descripcion || '',
      estado: pub.estado || 'activo',
    });
    setEditError('');
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    setEditError('');
    try {
      const res = await fetch(`/api/publicaciones/${editTarget.id_publicacion}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: editForm.titulo,
          precio: editForm.precio.replace(/\./g, ''),
          ubicacion: editForm.ubicacion,
          descripcion: editForm.descripcion,
          estado: editForm.estado,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al guardar');
      // Actualizar lista local
      setProductos(prev => prev.map(p =>
        p.id_publicacion === editTarget.id_publicacion ? { ...p, ...json.data } : p
      ));
      setEditTarget(null);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/publicaciones/${deleteTarget.id_publicacion}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Error al eliminar');
      }
      // Quitar de la lista local con animación
      setProductos(prev => prev.filter(p => p.id_publicacion !== deleteTarget.id_publicacion));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const isAdmin = userProfile?.rol === 'admin' || userProfile?.rol === 'superadmin';

  // Para admin, forzar siempre el tab Global
  React.useEffect(() => {
    if (isAdmin) {
      setActiveTab("Global (Admin)");
    } else if (activeTab === "Global (Admin)") {
      setActiveTab("Mis Publicaciones");
    }
  }, [isAdmin]);

  const filteredData = productos.filter(pub => {
    const isMine = pub.id_usuario === userAuth?.id;
    const matchTab = activeTab === "Global (Admin)" ? true : isMine;
    const matchSearch = pub.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || String(pub.id_publicacion).toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === "Todas las categorías" || true; // temporal hasta extraer categorias
    return matchTab && matchSearch && matchCategory;
  });

  return (
    <div 
      className="flex h-screen bg-[#F8F9FB] overflow-hidden"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      
      {/* 1. SIDEBAR IZQUIERDA (Consistente 100% con page.tsx) */}
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

          <div className="px-5 py-6">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Navegación</p>
            <nav className="space-y-1.5">
              {!isAdmin && (
                <a href="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-medium text-[14px] transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Explorar Feed</span>
                </a>
              )}
              <a href="/publicaciones" className="flex items-center gap-3 px-3 py-2.5 bg-[#F8F7FF] text-[#534AB7] rounded-xl font-semibold text-[14px] transition-colors">
                <Package className="w-4 h-4" />
                <span>{isAdmin ? 'Publicaciones' : 'Mis Publicaciones'}</span>
              </a>
              {!isAdmin && (
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-medium text-[14px] transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>Guardados</span>
                </a>
              )}
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
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-medium text-[14px] transition-colors mt-2">
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar: Buscador, Tabs y Perfil (Consistente con page.tsx) */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          
          <div className="flex items-center gap-8 h-full">
            {/* Barra de Búsqueda Prominente */}
            <div className="hidden md:block w-64 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar publicación..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-slate-100/70 border-transparent rounded-full focus:bg-white focus:border-[#534AB7]/30 focus:ring-2 focus:ring-[#534AB7]/10 transition-all text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Tabs de Navegación inspirados en la referencia */}
            <div className="flex items-center gap-6 h-full pt-2">
              {!isAdmin && (
                <button 
                  onClick={() => setActiveTab("Mis Publicaciones")}
                  className={`h-full relative text-[14px] font-bold transition-colors ${activeTab === "Mis Publicaciones" ? "text-[#534AB7]" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Mis Publicaciones
                  {activeTab === "Mis Publicaciones" && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#534AB7] rounded-t-full" />
                  )}
                </button>
              )}
              {isAdmin && (
                <button 
                  onClick={() => setActiveTab("Global (Admin)")}
                  className={`h-full relative text-[14px] font-bold transition-colors ${activeTab === "Global (Admin)" ? "text-[#534AB7]" : "text-slate-400 hover:text-slate-600"}`}
                >
                  Todas las Publicaciones
                  {activeTab === "Global (Admin)" && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#534AB7] rounded-t-full" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* User Widgets (Right) - IDÉNTICO AL FEED */}
          <div className="flex items-center gap-4 ml-6">
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6055D0] to-[#534AB7] flex items-center justify-center text-white font-bold text-[14px] border border-white shadow-sm uppercase">
                {userProfile?.nombres?.charAt(0) || userAuth?.email?.charAt(0) || "U"}
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-bold text-slate-700 group-hover:text-[#534AB7] transition-colors">
                  {userProfile ? `${userProfile.nombres} ${userProfile.apellidos}` : "Usuario"}
                </p>
                <p className="text-[11px] text-slate-400 font-medium capitalize">{userProfile?.rol || "Estudiante"}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Contenido Listado */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin">
          
          <div className="max-w-6xl mx-auto">
            
            {/* Cabecera y Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {activeTab === "Mis Publicaciones" ? "Tus publicaciones recientes" : "Todas las publicaciones"}
                </h2>
                <p className="text-[14px] text-slate-500 mt-1">Gestiona el inventario activo e inactivo del marketplace.</p>
              </div>

              <div className="flex items-center gap-3">
                
                <a 
                  href="/publicaciones/nueva"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#534AB7] hover:bg-[#43399b] text-white rounded-xl font-bold text-[13px] transition-colors shadow-sm shadow-indigo-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Publicación</span>
                </a>

                {/* Combobox de Categoría con border-radius xl */}
                <div className="relative">
                  <button 
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeCategory}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <AnimatePresence>
                    {isCategoryOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute right-0 top-12 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 overflow-hidden"
                      >
                        {CATEGORIAS.map((cat) => (
                          <div 
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setIsCategoryOpen(false); }}
                            className={`px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-colors flex items-center justify-between ${activeCategory === cat ? 'bg-[#F8F7FF] text-[#534AB7]' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                            {cat}
                            {activeCategory === cat && <Check className="w-3.5 h-3.5" />}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Filtro Período border-radius xl */}
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                  <span>Todo el periodo</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* LISTADO TIPO TABLA / CARDS HORIZONTALES */}
            <div className="space-y-3 mt-4">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#534AB7] mb-4" />
                    <p className="text-slate-500 font-medium">Cargando publicaciones...</p>
                  </div>
                ) : filteredData.map((pub, idx) => (
                  <motion.div
                    key={pub.id_publicacion}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all gap-4 group"
                  >
                    
                    {/* Fecha, ID e Imagen */}
                    <div className="flex items-center gap-4 min-w-[220px]">
                      {/* En lugar del botón PDF, usamos la imagen miniatura del producto con radio xl */}
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img src={pub.imagen || "https://images.unsplash.com/photo-1555421689-d68471e189f2?q=80&w=600&auto=format&fit=crop"} alt={pub.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">{new Date(pub.created_at).toLocaleDateString()}</p>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{String(pub.id_publicacion).substring(0, 8)}</p>
                      </div>
                    </div>

                    {/* Título y Autor/Categoría */}
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-[14px] font-bold text-slate-800 truncate group-hover:text-[#534AB7] transition-colors">{pub.titulo}</p>
                      <p className="text-[12px] text-slate-500 font-medium">{activeTab === "Global (Admin)" ? `Por ${pub.perfil?.nombres} ${pub.perfil?.apellidos}` : "Varios"}</p>
                    </div>

                    {/* Precio */}
                    <div className="min-w-[120px] text-left md:text-right">
                      <p className="text-[15px] font-black text-slate-800">${new Intl.NumberFormat("es-CO").format(pub.precio || 0)}</p>
                      <p className="text-[11px] font-medium text-slate-400">Precio de venta</p>
                    </div>

                    {/* Acciones y Estado */}
                    <div className="flex items-center justify-end gap-3 min-w-[280px]">
                      
                      {/* Badge de Estado - Pill pero consistente */}
                      <span className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border flex items-center justify-center w-24 shrink-0 ${
                        pub.estado === "disponible" ? "bg-[#F8F7FF] text-[#534AB7] border-indigo-100" :
                        pub.estado === "reservado" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}>
                        {pub.estado === "vendido" ? <Check className="w-3 h-3 mr-1" /> : null}
                        {pub.estado}
                      </span>
                      
                      {/* Botón Ver Detalle (Border XL consistente) */}
                      <a 
                        href={`/publicaciones/${pub.id_publicacion}`}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#534AB7] hover:bg-[#43399b] text-white text-[12px] font-bold rounded-xl transition-colors shrink-0 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver detalle</span>
                      </a>

                      {/* Botones Ícono (Editar y Eliminar) */}
                      <button
                        onClick={() => openEdit(pub)}
                        className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-[#F8F7FF] border border-slate-200 hover:border-[#534AB7]/30 text-slate-500 hover:text-[#534AB7] transition-colors"
                        title="Editar publicación"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(pub)}
                        className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Eliminar publicación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredData.length === 0 && (
                <div className="py-12 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-800">No hay publicaciones</h3>
                  <p className="text-[13px] text-slate-500 mt-1 max-w-sm">
                    No encontramos publicaciones que coincidan con tu búsqueda o filtros.
                  </p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </main>

      {/* ═══ MODAL ELIMINAR ═══ */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setDeleteTarget(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ pointerEvents: 'none' }}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5"
                style={{ pointerEvents: 'auto', fontFamily: "'Inter', sans-serif" }}
              >
                {/* Icono */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-black text-slate-800">Eliminar publicación</h2>
                    <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                      ¿Estás seguro de que deseas eliminar
                      <span className="font-bold text-slate-700"> "{deleteTarget.titulo}"</span>?
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-[13px] hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-[13px] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ DRAWER EDITAR ═══ */}
      <AnimatePresence>
        {editTarget && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setEditTarget(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            {/* Panel lateral */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* Header */}
              <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
                <div>
                  <h2 className="text-[17px] font-black text-slate-800">Editar publicación</h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Los cambios se guardan inmediatamente</p>
                </div>
                <button
                  onClick={() => setEditTarget(null)}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Formulario */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {editError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-600 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {editError}
                  </div>
                )}

                {/* Título */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Título *</label>
                  <input
                    type="text"
                    value={editForm.titulo}
                    onChange={e => setEditForm(p => ({ ...p, titulo: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-800 font-medium focus:outline-none focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/10 transition-all"
                    placeholder="Título del producto"
                  />
                </div>

                {/* Precio */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Precio (COP) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
                    <input
                      type="text"
                      value={editForm.precio}
                      onChange={e => {
                        const raw = e.target.value.replace(/\D/g, '');
                        const fmt = raw ? new Intl.NumberFormat('es-CO').format(parseInt(raw)) : '';
                        setEditForm(p => ({ ...p, precio: fmt }));
                      }}
                      className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-800 font-medium focus:outline-none focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/10 transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Ubicación */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ubicación</label>
                  <input
                    type="text"
                    value={editForm.ubicacion}
                    onChange={e => setEditForm(p => ({ ...p, ubicacion: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-800 font-medium focus:outline-none focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/10 transition-all"
                    placeholder="Ej: Bloque D, Entrada Principal"
                  />
                </div>

                {/* Estado */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Estado</label>
                  <select
                    value={editForm.estado}
                    onChange={e => setEditForm(p => ({ ...p, estado: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 font-medium focus:outline-none focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/10 transition-all cursor-pointer"
                  >
                    <option value="activo">Activo / Disponible</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                    <option value="pausado">Pausado</option>
                  </select>
                </div>

                {/* Descripción */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Descripción</label>
                  <textarea
                    value={editForm.descripcion}
                    onChange={e => setEditForm(p => ({ ...p, descripcion: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-800 font-medium focus:outline-none focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/10 transition-all resize-none"
                    placeholder="Describe el estado y detalles del producto..."
                  />
                </div>
              </div>

              {/* Footer con botones */}
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                <button
                  onClick={() => setEditTarget(null)}
                  disabled={saving}
                  className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-[13px] hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEdit}
                  disabled={saving || !editForm.titulo.trim()}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#6055D0] to-[#534AB7] hover:from-[#5048C0] hover:to-[#4339a8] text-white font-bold text-[13px] transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
