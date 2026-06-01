"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Download, RefreshCw, Search, AlertTriangle,
  TrendingUp, CheckCircle, XCircle, Clock, Loader2,
  ChevronLeft, ChevronRight, Filter, Eye, DollarSign
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const FONT: React.CSSProperties = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  clickeado:        { label: "Contactó",   color: "text-blue-600",   bg: "bg-blue-50",   icon: <Eye className="w-3 h-3" /> },
  marcado_vendedor: { label: "Pendiente",  color: "text-amber-600",  bg: "bg-amber-50",  icon: <Clock className="w-3 h-3" /> },
  confirmado:       { label: "Vendido",    color: "text-emerald-600",bg: "bg-emerald-50",icon: <CheckCircle className="w-3 h-3" /> },
  rechazado:        { label: "Rechazado",  color: "text-red-500",    bg: "bg-red-50",    icon: <XCircle className="w-3 h-3" /> },
};

export default function AuditoriaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userProfile, setUserProfile] = useState<any>(null);
  const [userAuth, setUserAuth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [exportando, setExportando] = useState(false);

  // Auth check
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserAuth(user);
      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();
      if (!profile || (profile.rol !== "admin" && profile.rol !== "superadmin")) {
        router.push("/"); return;
      }
      if (profile.estado === "inactivo") {
        await supabase.auth.signOut();
        router.push("/auth/login?error=account_disabled"); return;
      }
      setUserProfile(profile);
    };
    init();
  }, []);

  // Cargar datos de auditoría
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        estado: filtroEstado,
        pagina: String(pagina),
        por_pagina: "50",
      });
      const res = await fetch(`/api/admin/auditoria?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, pagina]);

  useEffect(() => {
    if (userProfile) cargarDatos();
  }, [userProfile, cargarDatos]);

  // Exportar CSV
  const exportarCSV = async () => {
    setExportando(true);
    try {
      const params = new URLSearchParams({ formato: "csv", estado: filtroEstado });
      const res = await fetch(`/api/admin/auditoria?${params}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auditoria_ventas_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportando(false);
    }
  };

  const isSuperAdmin = userProfile?.rol === "superadmin";

  // Filtrado local por búsqueda de texto
  const logFiltrado = (data?.log || []).filter((row: any) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      row.codigo_transaccion?.toLowerCase().includes(q) ||
      row.producto?.titulo?.toLowerCase().includes(q) ||
      `${row.comprador?.nombres} ${row.comprador?.apellidos}`.toLowerCase().includes(q) ||
      `${row.vendedor?.nombres} ${row.vendedor?.apellidos}`.toLowerCase().includes(q)
    );
  });

  const kpis = data?.kpis || {};
  const fraude = data?.fraude || null;
  const paginacion = data?.paginacion || {};

  if (!userProfile) {
    return (
      <div className="flex h-screen bg-[#F8F9FB] overflow-hidden" style={FONT}>
        <Sidebar userProfile={null} userAuth={null} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#534AB7]" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FB] overflow-hidden" style={FONT}>
      <Sidebar userProfile={userProfile} userAuth={userAuth} />
      <main className="flex-1 flex flex-col min-w-0">
        <Header userProfile={userProfile} userAuth={userAuth} title="Auditoría de Ventas" />

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ── Encabezado ── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#534AB7]" />
                  Auditoría de Ventas
                  {isSuperAdmin && (
                    <span className="text-[#534AB7] font-medium text-sm bg-indigo-50 px-2.5 py-1 rounded-full">
                      Superadmin
                    </span>
                  )}
                </h2>
                <p className="text-[13px] text-slate-400 mt-0.5">
                  Rastreo completo del flujo de compra-venta entre estudiantes
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={cargarDatos}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-sm"
                  title="Actualizar"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={exportarCSV}
                  disabled={exportando}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#534AB7] hover:bg-[#4840a0] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-60"
                >
                  {exportando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* ── KPIs ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Total Intenciones", value: kpis.totalIntenciones, color: "text-slate-700", bg: "bg-slate-50", icon: <Filter className="w-5 h-5 text-slate-500" /> },
                { label: "Ventas Confirmadas", value: kpis.totalConfirmadas, color: "text-emerald-700", bg: "bg-emerald-50", icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
                { label: "Pendientes", value: kpis.totalPendientes, color: "text-amber-700", bg: "bg-amber-50", icon: <Clock className="w-5 h-5 text-amber-500" /> },
                { label: "Rechazadas", value: kpis.totalRechazadas, color: "text-red-600", bg: "bg-red-50", icon: <XCircle className="w-5 h-5 text-red-400" /> },
                { label: "Tasa Conversión", value: `${kpis.tasaConversion || 0}%`, color: "text-indigo-700", bg: "bg-indigo-50", icon: <TrendingUp className="w-5 h-5 text-indigo-500" /> },
                { label: "Valor Total Ventas", value: `$${new Intl.NumberFormat("es-CO").format(kpis.montoTotalVentas || 0)}`, color: "text-[#534AB7]", bg: "bg-[#F8F7FF]", icon: <DollarSign className="w-5 h-5 text-[#534AB7]" /> },
              ].map((k, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 ${k.bg}`}
                >
                  {k.icon}
                  <p className={`text-lg font-black ${k.color}`}>{k.value ?? "—"}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{k.label}</p>
                </motion.div>
              ))}
            </div>

            {/* ── Alertas de fraude (solo superadmin) ── */}
            {isSuperAdmin && fraude && (fraude.usuariosSospechosos > 0 || fraude.publicacionesAnormales > 0) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-red-700">Alertas de Fraude Detectadas</p>
                  {fraude.usuariosSospechosos > 0 && (
                    <p className="text-xs text-red-600">
                      • <strong>{fraude.usuariosSospechosos}</strong> usuario(s) con 3+ transacciones rechazadas (posible abuso del sistema)
                    </p>
                  )}
                  {fraude.publicacionesAnormales > 0 && (
                    <p className="text-xs text-red-600">
                      • <strong>{fraude.publicacionesAnormales}</strong> publicación(es) con precio anormal (= $0 o &gt; $50,000,000)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Filtros y búsqueda ── */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por código, producto, comprador o vendedor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-4 h-10 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-[#534AB7]/40 focus:ring-2 focus:ring-[#534AB7]/10 transition-all"
                />
              </div>

              {/* Filtro de estado */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "todos", label: "Todos" },
                  { value: "confirmado", label: "Vendidos" },
                  { value: "marcado_vendedor", label: "Pendientes" },
                  { value: "rechazado", label: "Rechazados" },
                  { value: "clickeado", label: "Contactó" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => { setFiltroEstado(f.value); setPagina(1); }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      filtroEstado === f.value
                        ? "bg-[#534AB7] text-white border-[#534AB7]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tabla ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#534AB7]" />
                </div>
              ) : logFiltrado.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShieldCheck className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-slate-500 font-semibold">No hay registros con los filtros actuales</p>
                  <p className="text-slate-400 text-sm mt-1">Prueba cambiando el filtro de estado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Código</th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Producto</th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Precio</th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Comprador</th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vendedor</th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">⭐</th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                        {isSuperAdmin && (
                          <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alerta</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {logFiltrado.map((row: any, idx: number) => {
                          const cfg = ESTADO_CONFIG[row.estado] || { label: row.estado, color: "text-slate-600", bg: "bg-slate-100", icon: null };
                          const esSospechoso = isSuperAdmin && row.comprador?.es_sospechoso;
                          return (
                            <motion.tr
                              key={row.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.02 }}
                              className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${esSospechoso ? "bg-red-50/30" : ""}`}
                            >
                              <td className="px-4 py-3">
                                <span className="font-mono text-xs font-bold text-[#534AB7] bg-indigo-50 px-2 py-0.5 rounded-md">
                                  {row.codigo_transaccion}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                  {cfg.icon}
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 max-w-[180px]">
                                <p className="font-semibold text-slate-700 truncate text-xs">{row.producto?.titulo || "—"}</p>
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-slate-600 whitespace-nowrap">
                                {row.producto?.precio
                                  ? `$${new Intl.NumberFormat("es-CO").format(row.producto.precio)}`
                                  : "—"}
                              </td>
                              <td className="px-4 py-3">
                                {row.comprador ? (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-700">
                                      {row.comprador.nombres} {row.comprador.apellidos}
                                    </p>
                                    {isSuperAdmin && (
                                      <p className="text-[10px] text-slate-400">{row.comprador.email}</p>
                                    )}
                                  </div>
                                ) : <span className="text-slate-400 text-xs">—</span>}
                              </td>
                              <td className="px-4 py-3">
                                {row.vendedor ? (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-700">
                                      {row.vendedor.nombres} {row.vendedor.apellidos}
                                    </p>
                                    {isSuperAdmin && (
                                      <p className="text-[10px] text-slate-400">{row.vendedor.email}</p>
                                    )}
                                  </div>
                                ) : <span className="text-slate-400 text-xs">—</span>}
                              </td>
                              <td className="px-4 py-3 text-xs">
                                {row.calificacion ? (
                                  <span className="text-amber-500 font-bold">{"★".repeat(row.calificacion)}</span>
                                ) : <span className="text-slate-300">—</span>}
                              </td>
                              <td className="px-4 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                                {row.fecha_clic
                                  ? new Date(row.fecha_clic).toLocaleDateString("es-CO", {
                                      day: "2-digit", month: "short", year: "numeric"
                                    })
                                  : "—"}
                              </td>
                              {isSuperAdmin && (
                                <td className="px-4 py-3">
                                  {esSospechoso ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                      <AlertTriangle className="w-3 h-3" /> Sospechoso
                                    </span>
                                  ) : (
                                    <span className="text-slate-200 text-xs">—</span>
                                  )}
                                </td>
                              )}
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── Paginación ── */}
            {paginacion.totalPaginas > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Mostrando {((paginacion.pagina - 1) * paginacion.porPagina) + 1}–{Math.min(paginacion.pagina * paginacion.porPagina, paginacion.total)} de {paginacion.total} registros
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={paginacion.pagina <= 1}
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="flex items-center px-4 h-9 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                    {paginacion.pagina} / {paginacion.totalPaginas}
                  </span>
                  <button
                    onClick={() => setPagina(p => Math.min(paginacion.totalPaginas, p + 1))}
                    disabled={paginacion.pagina >= paginacion.totalPaginas}
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
