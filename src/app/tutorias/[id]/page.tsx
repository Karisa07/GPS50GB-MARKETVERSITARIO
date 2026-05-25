"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, BookOpen, GraduationCap, Clock, Phone, 
  Sparkles, Heart, Bell, ChevronDown, Loader2, AlertTriangle, 
  User, Send, X, CheckCircle2, MessageSquare,
  LayoutDashboard, Package, Settings, LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function DetalleTutoria() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [tutoria, setTutoria] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userAuth, setUserAuth] = useState<any>(null);

  // Solicitud states
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const loadTutoria = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUserAuth(user);

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setUserProfile(profile);
        }

        // 1. Fetch tutoria details
        const res = await fetch(`/api/tutorias/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Tutoría no encontrada");
        setTutoria(json.data);

        // 2. Check if user already has a pending request for this tutoria
        if (user) {
          const resSol = await fetch("/api/solicitudes?tipo=enviadas");
          if (resSol.ok) {
            const jsonSol = await resSol.json();
            const pending = (jsonSol.data || []).some(
              (s: any) => s.id_tutoria === Number(id) && s.estado === "pendiente"
            );
            setHasPendingRequest(pending);
          }
        }
      } catch (err: any) {
        setErrorText(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadTutoria();
  }, [id]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/login";
  };

  const handleOpenRequestModal = () => {
    if (!userAuth) {
      router.push(`/auth/login?redirect=/tutorias/${id}`);
      return;
    }
    setIsModalOpen(true);
  };

  const handleSendRequest = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tutoria: Number(id),
          mensaje: message.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al enviar la solicitud");

      setSendSuccess(true);
      setHasPendingRequest(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSendSuccess(false);
        setMessage("");
      }, 2000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const isAdmin = userProfile?.rol === "admin" || userProfile?.rol === "superadmin";
  const isOwner = tutoria?.id_usuario === userAuth?.id;

  return (
    <div 
      className="flex h-screen bg-[#F8F9FB] overflow-hidden"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      
      {/* ── SIDEBAR IZQUIERDA ── */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 z-20 hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div>
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
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-medium text-[14px] transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Explorar Feed</span>
                </Link>
              )}
              <Link href="/publicaciones" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-medium text-[14px] transition-colors">
                <Package className="w-4 h-4" />
                <span>{isAdmin ? 'Publicaciones' : 'Mis Publicaciones'}</span>
              </Link>
              {isAdmin && (
                <Link href="/usuarios" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-medium text-[14px] transition-colors">
                  <User className="w-4 h-4" />
                  <span>Usuarios</span>
                </Link>
              )}
            </nav>
          </div>
        </div>

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

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-[#534AB7] transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center group-hover:border-[#534AB7]/30 group-hover:bg-[#F8F7FF] transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-semibold hidden sm:block">Volver</span>
          </button>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
            
            {/* Widget Usuario */}
            <div 
              onClick={() => userProfile && router.push(`/usuarios/${userAuth?.id}`)} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6055D0] to-[#534AB7] flex items-center justify-center text-white font-bold text-[14px] border-2 border-white shadow-sm uppercase">
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

        {/* Zona Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin">
          <div className="max-w-5xl mx-auto">
            
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-32"
                >
                  <Loader2 className="w-10 h-10 animate-spin text-[#534AB7] mb-4" />
                  <p className="text-slate-500 font-medium">Cargando detalles de la tutoría...</p>
                </motion.div>
              )}

              {!loading && errorText && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-32 text-center"
                >
                  <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-800 mb-2">Tutoría no encontrada</h3>
                  <p className="text-slate-500 max-w-sm mb-6">{errorText}</p>
                  <button onClick={() => router.back()} className="px-5 py-2.5 bg-[#534AB7] text-white rounded-xl font-bold text-sm">
                    Regresar
                  </button>
                </motion.div>
              )}

              {!loading && !errorText && tutoria && (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="grid grid-cols-1 lg:grid-cols-5 gap-8"
                >
                  
                  {/* Columna Izquierda: Información de Tutoría */}
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    
                    {/* Tarjeta Detalle de Tutoría */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8 space-y-6">
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#534AB7] bg-indigo-50 px-3 py-1 rounded-lg">
                            {tutoria.asignatura}
                          </span>
                          {tutoria.nivel && (
                            <span className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">
                              • Nivel {tutoria.nivel}
                            </span>
                          )}
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 leading-tight tracking-tight">
                          {tutoria.titulo}
                        </h1>
                      </div>

                      <div className="pt-4 border-t border-slate-50 space-y-4">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Metodología y Temas</h3>
                        <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {tutoria.descripcion || "Sin descripción detallada disponible."}
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Columna Derecha: Tarjeta de Precio, Tutor e Inscripción */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    {/* Tarjeta de Compra/Reserva */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 space-y-5">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Costo por hora</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-semibold text-slate-400">$</span>
                          <span className="text-3xl font-black text-slate-850 tracking-tight">
                            {new Intl.NumberFormat("es-CO").format(tutoria.precio || 0)}
                          </span>
                          <span className="text-slate-400 text-xs font-semibold ml-1">/ hora</span>
                        </div>
                      </div>

                      {/* Botón de Solicitud (TH58) */}
                      {isOwner ? (
                        <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Tu propia tutoría</p>
                          <Link 
                            href={`/usuarios/${userAuth?.id}`}
                            className="text-[#534AB7] text-[13px] font-bold hover:underline mt-1 block"
                          >
                            Ir al panel de tutor
                          </Link>
                        </div>
                      ) : hasPendingRequest ? (
                        <button 
                          disabled 
                          className="w-full h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 font-bold text-[13px] transition-all cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          <span>Solicitud Pendiente</span>
                        </button>
                      ) : (
                        <button 
                          onClick={handleOpenRequestModal}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6055D0] to-[#534AB7] hover:from-[#5048C0] hover:to-[#4339a8] text-white font-bold text-[13px] transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Solicitar Tutoría</span>
                        </button>
                      )}
                    </div>

                    {/* Tarjeta de Perfil de Tutor */}
                    {tutoria.perfil && (
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tutor Académico</p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6055D0] to-[#534AB7] flex items-center justify-center text-white font-black text-[18px] uppercase shadow-md shadow-indigo-500/20 shrink-0">
                            {tutoria.perfil.nombres?.charAt(0)}{tutoria.perfil.apellidos?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/usuarios/${tutoria.id_usuario}`} className="hover:text-[#534AB7] transition-colors">
                              <h4 className="text-[15px] font-black text-slate-800 truncate">
                                {tutoria.perfil.nombres} {tutoria.perfil.apellidos}
                              </h4>
                            </Link>
                            {tutoria.perfil.programa_academico && (
                              <p className="text-[12px] text-slate-400 font-medium truncate mt-0.5">
                                {tutoria.perfil.programa_academico}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                          <Link 
                            href={`/usuarios/${tutoria.id_usuario}`}
                            className="text-[#534AB7] text-[12px] font-bold hover:underline"
                          >
                            Ver Perfil Completo
                          </Link>
                          {tutoria.perfil.telefono && (
                            <span className="text-[12px] text-slate-400 font-medium">
                              Tel: {tutoria.perfil.telefono}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>

      {/* ── MODAL DE SOLICITUD ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !sending && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 p-6 space-y-6"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#534AB7]" />
                  <h3 className="text-lg font-black text-slate-800">Solicitud de Tutoría</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  disabled={sending}
                  className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contenido / Formularios */}
              <AnimatePresence mode="wait">
                {sendSuccess ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-6 flex flex-col items-center justify-center text-center space-y-3"
                  >
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm animate-bounce">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-[15px]">¡Solicitud Enviada!</h4>
                    <p className="text-slate-400 text-xs max-w-xs">El tutor recibirá tu mensaje y podrá aceptar tu solicitud para coordinar.</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="form"
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="mensaje" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Escribe un mensaje al tutor (Opcional)
                      </Label>
                      <Textarea 
                        id="mensaje"
                        placeholder="Hola! Me gustaría programar una tutoría contigo para este tema. Tengo disponibilidad los..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[120px] rounded-2xl border-slate-200 bg-white p-4 focus-visible:ring-2 focus-visible:ring-[#534AB7]/20 focus-visible:border-[#534AB7] resize-none transition-all text-[14px] text-slate-700 leading-relaxed shadow-sm block w-full"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        disabled={sending}
                        className="px-5 py-2.5 rounded-xl font-bold text-[13px] text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleSendRequest}
                        disabled={sending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#534AB7] hover:bg-[#43399b] text-white rounded-xl font-bold text-[13px] transition-colors shadow-sm disabled:opacity-50"
                      >
                        {sending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Enviar Solicitud</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
