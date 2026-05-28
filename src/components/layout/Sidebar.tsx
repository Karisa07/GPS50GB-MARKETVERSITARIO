"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Package, User, 
  Heart, Settings, LogOut, Sparkles 
} from "lucide-react";

interface SidebarProps {
  userProfile: any;
  userAuth: any;
}

export default function Sidebar({ userProfile, userAuth }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userProfile?.rol === 'admin' || userProfile?.rol === 'superadmin';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/auth/login';
  };

  return (
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
            {!isAdmin && (
              <Link 
                href="/" 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[14px] transition-colors ${pathname === '/' ? 'bg-[#F8F7FF] text-[#534AB7] font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Explorar Feed</span>
              </Link>
            )}
            
            <Link 
              href="/publicaciones" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[14px] transition-colors ${pathname?.startsWith('/publicaciones') ? 'bg-[#F8F7FF] text-[#534AB7] font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              <Package className="w-4 h-4" />
              <span>{isAdmin ? 'Publicaciones' : 'Mis Publicaciones'}</span>
            </Link>

            {userProfile && !isAdmin && (
              <Link 
                href={`/usuarios/${userAuth?.id}`} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[14px] transition-colors ${pathname === `/usuarios/${userAuth?.id}` ? 'bg-[#F8F7FF] text-[#534AB7] font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <User className="w-4 h-4" strokeWidth={2} />
                <span>Mi Perfil / Tutorías</span>
              </Link>
            )}

            {isAdmin && (
              <Link 
                href="/usuarios" 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[14px] transition-colors ${pathname?.startsWith('/usuarios') ? 'bg-[#F8F7FF] text-[#534AB7] font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>Usuarios</span>
              </Link>
            )}

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
  );
}
