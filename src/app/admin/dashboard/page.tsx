"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Users, Package, BookOpen, 
  DollarSign, Loader2, RefreshCw, Sparkles
} from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function AdminDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userAuth, setUserAuth] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndMetrics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserAuth(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);

        if (profile?.estado === 'inactivo') {
          await supabase.auth.signOut();
          router.push('/auth/login?error=account_disabled');
          return;
        }

        if (profile?.rol !== 'admin' && profile?.rol !== 'superadmin') {
          router.push('/');
          return;
        }
      } else {
        router.push('/auth/login');
        return;
      }

      await loadMetrics();
    };

    fetchUserAndMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8F9FB] overflow-hidden">
        <Sidebar userProfile={userProfile} userAuth={userAuth} />
        <main className="flex-1 flex flex-col min-w-0">
          <Header userProfile={userProfile} userAuth={userAuth} title="Dashboard" />
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#534AB7] mb-4" />
            <p className="text-slate-500 font-medium">Cargando métricas y analíticas...</p>
          </div>
        </main>
      </div>
    );
  }

  const r = metrics?.resumen || {};
  const roles = metrics?.roles || {};
  const ventas = metrics?.ventasMensuales || [];

  return (
    <div 
      className="flex h-screen bg-[#F8F9FB] overflow-hidden"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <Sidebar userProfile={userProfile} userAuth={userAuth} />

      <main className="flex-1 flex flex-col min-w-0">
        <Header 
          userProfile={userProfile} 
          userAuth={userAuth} 
          title="Panel de Métricas" 
        />

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header del Panel */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  Analytics <span className="text-[#534AB7] font-medium text-sm bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-[#534AB7]" /> Admin</span>
                </h2>
                <p className="text-[13px] text-slate-400 mt-0.5">Monitoreo en tiempo real del ecosistema universitario</p>
              </div>
              <button 
                onClick={loadMetrics}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-sm"
                title="Actualizar datos"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Fila de Tarjetas Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card Ingresos */}
              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Recaudado Destacados</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">${new Intl.NumberFormat('es-CO').format(r.ingresosDestaques || 0)} COP</p>
                </div>
              </div>

              {/* Card Usuarios */}
              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#534AB7] flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Usuarios Registrados</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{r.totalUsuarios || 0}</p>
                </div>
              </div>

              {/* Card Publicaciones */}
              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Publicaciones Activas</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{r.totalPublicaciones || 0}</p>
                </div>
              </div>

              {/* Card Tutorías */}
              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Tutorías Creadas</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{r.totalTutorias || 0}</p>
                </div>
              </div>

            </div>

            {/* Fila de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Gráfico de Ventas (Línea SVG Custom) */}
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-[15px]">Crecimiento Mensual Destaques</h3>
                    <p className="text-[11px] text-slate-400">Ingresos simulados por promoción de productos</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>

                {/* SVG Line Chart */}
                <div className="h-64 w-full relative pt-4">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#534AB7" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#534AB7" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Area under the line */}
                    <path
                      d="M 50 170 L 150 140 L 250 110 L 350 70 L 450 120 L 450 180 L 50 180 Z"
                      fill="url(#chartGrad)"
                    />
                    {/* Line path */}
                    <path
                      d="M 50 170 L 150 140 L 250 110 L 350 70 L 450 120"
                      fill="none"
                      stroke="#534AB7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Data dots */}
                    <circle cx="50" cy="170" r="5" fill="#534AB7" stroke="#white" strokeWidth="2" />
                    <circle cx="150" cy="140" r="5" fill="#534AB7" stroke="#white" strokeWidth="2" />
                    <circle cx="250" cy="110" r="5" fill="#534AB7" stroke="#white" strokeWidth="2" />
                    <circle cx="350" cy="70" r="5" fill="#534AB7" stroke="#white" strokeWidth="2" />
                    <circle cx="450" cy="120" r="5" fill="#534AB7" stroke="#white" strokeWidth="2" />
                  </svg>
                  {/* X Axis Labels */}
                  <div className="flex justify-between px-6 text-[10px] font-bold text-slate-400 mt-2">
                    <span>Ene</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Abr</span>
                    <span>May</span>
                  </div>
                </div>
              </div>

              {/* Gráfico de Distribución de Roles */}
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-[15px]">Roles de Usuario</h3>
                  <p className="text-[11px] text-slate-400 mb-6">Composición del ecosistema de usuarios</p>

                  <div className="space-y-4">
                    {/* Estudiantes */}
                    <div>
                      <div className="flex justify-between text-[12px] font-bold text-slate-600 mb-1">
                        <span>Estudiantes</span>
                        <span>{roles.estudiante || 0}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" 
                          style={{ width: `${Math.min(100, ((roles.estudiante || 0) / (r.totalUsuarios || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Tutores */}
                    <div>
                      <div className="flex justify-between text-[12px] font-bold text-slate-600 mb-1">
                        <span>Tutores</span>
                        <span>{roles.tutor || 0}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#6055D0] to-[#534AB7] rounded-full" 
                          style={{ width: `${Math.min(100, ((roles.tutor || 0) / (r.totalUsuarios || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Administradores */}
                    <div>
                      <div className="flex justify-between text-[12px] font-bold text-slate-600 mb-1">
                        <span>Admins</span>
                        <span>{(roles.admin || 0) + (roles.superadmin || 0)}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" 
                          style={{ width: `${Math.min(100, (((roles.admin || 0) + (roles.superadmin || 0)) / (r.totalUsuarios || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Total {r.totalUsuarios || 0} Cuentas
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
