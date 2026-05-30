"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Loader2, MessageSquare, User, 
  ArrowLeft, Clock, Sparkles
} from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams?.get("with"); // ID de usuario con el que se quiere abrir chat

  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userAuth, setUserAuth] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Carga inicial de datos de usuario
  useEffect(() => {
    const fetchUserData = async () => {
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
        }
      } else {
        router.push('/auth/login');
      }
    };
    fetchUserData();
  }, []);

  // Cargar lista de chats
  const fetchChats = async (selectChatId?: number) => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const json = await res.json();
        const chatList = json.data || [];
        setChats(chatList);

        if (selectChatId) {
          const chat = chatList.find((c: any) => c.id_chat === selectChatId);
          if (chat) setActiveChat(chat);
        }
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (userAuth) {
      // Si venimos con el parámetro "with", primero creamos o buscamos el chat
      if (targetUserId) {
        const initChat = async () => {
          try {
            const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_usuario_2: targetUserId })
            });
            if (res.ok) {
              const json = await res.json();
              await fetchChats(json.data?.id_chat);
            } else {
              await fetchChats();
            }
          } catch (e) {
            console.error("Error starting chat:", e);
            await fetchChats();
          }
        };
        initChat();
      } else {
        fetchChats();
      }
    }
  }, [userAuth, targetUserId]);

  // Cargar mensajes al seleccionar un chat activo
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/chat/${activeChat.id_chat}/mensajes`);
        if (res.ok) {
          const json = await res.json();
          setMessages(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Suscripción en tiempo real a nuevos mensajes para este chat
    const channel = supabase
      .channel(`chat_${activeChat.id_chat}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `id_chat=eq.${activeChat.id_chat}`
        },
        (payload) => {
          setMessages(prev => {
            // Evitar duplicados si el remitente es el usuario actual (ya agregado localmente)
            if (prev.some(m => m.id_mensaje === payload.new.id_mensaje)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat]);

  // Scroll automático al fondo cuando cambian los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensaje
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;

    const text = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Optimistic UI update
    const tempId = Date.now();
    const tempMsg = {
      id_mensaje: tempId,
      id_chat: activeChat.id_chat,
      id_remitente: userAuth.id,
      mensaje: text,
      fecha: new Date().toISOString(),
      leido: false
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch(`/api/chat/${activeChat.id_chat}/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: text })
      });

      if (res.ok) {
        const json = await res.json();
        // Reemplazar el mensaje optimista por el real de la BD
        setMessages(prev => prev.map(m => m.id_mensaje === tempId ? json.data : m));
      } else {
        // Remover el mensaje optimista si falla
        setMessages(prev => prev.filter(m => m.id_mensaje !== tempId));
        alert("Error al enviar mensaje");
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id_mensaje !== tempId));
    } finally {
      setSending(false);
    }
  };

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
          title="Mensajería" 
        />

        <div className="flex-1 flex overflow-hidden p-6 lg:p-10">
          <div className="flex-1 max-w-6xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex overflow-hidden">
            
            {/* Panel de Chats (Izquierda) */}
            <div className={`w-full md:w-80 border-r border-slate-50 flex flex-col shrink-0 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-5 border-b border-slate-50">
                <h3 className="font-bold text-slate-800 text-[16px] tracking-tight">Conversaciones</h3>
                <p className="text-[12px] text-slate-400 font-medium mt-0.5">Mensajería instantánea del campus</p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
                {loadingChats ? (
                  <div className="flex flex-col items-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-[#534AB7] mb-2" />
                    <p className="text-slate-400 text-[12px]">Cargando chats...</p>
                  </div>
                ) : chats.length > 0 ? (
                  chats.map((c: any) => {
                    const isSelected = activeChat?.id_chat === c.id_chat;
                    return (
                      <div
                        key={c.id_chat}
                        onClick={() => setActiveChat(c)}
                        className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3.5 ${isSelected ? 'bg-[#F8F7FF] border border-[#534AB7]/10' : 'hover:bg-slate-50 border border-transparent'}`}
                      >
                        {c.participante?.avatar_url ? (
                          <img src={c.participante.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6055D0] to-[#534AB7] text-white font-bold text-[13px] flex items-center justify-center uppercase shrink-0">
                            {c.participante?.nombres?.charAt(0) || "U"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-800 text-[13px] truncate">{c.participante?.nombres} {c.participante?.apellidos}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold uppercase capitalize tracking-wider">{c.participante?.rol || "Estudiante"}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center opacity-50 flex flex-col items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-[12px] text-slate-500 font-semibold">No hay chats activos</p>
                    <p className="text-[10px] text-slate-400 max-w-[180px] mx-auto mt-1">Inicia una conversación desde el perfil o detalle de publicación de otro estudiante.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ventana de Mensajes (Derecha) */}
            <div className={`flex-1 flex flex-col bg-slate-50/30 ${!activeChat ? 'hidden md:flex items-center justify-center p-8' : 'flex'}`}>
              {activeChat ? (
                <>
                  {/* Header del Chat */}
                  <div className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setActiveChat(null)} 
                        className="md:hidden p-1.5 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      
                      {activeChat.participante?.avatar_url ? (
                        <img src={activeChat.participante.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6055D0] to-[#534AB7] text-white font-black text-[12px] flex items-center justify-center uppercase shrink-0">
                          {activeChat.participante?.nombres?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-[13px] text-slate-800 tracking-tight leading-none">{activeChat.participante?.nombres} {activeChat.participante?.apellidos}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase capitalize tracking-wider">{activeChat.participante?.rol}</span>
                      </div>
                    </div>
                  </div>

                  {/* Burbujas de Mensajes */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                    {loadingMessages ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#534AB7]" /></div>
                    ) : messages.map((m) => {
                      const isOwn = m.id_remitente === userAuth.id;
                      return (
                        <div 
                          key={m.id_mensaje}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-md p-4 rounded-2xl text-[13px] leading-relaxed transition-all ${isOwn ? 'bg-[#534AB7] text-white rounded-br-none shadow-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm'}`}>
                            <p>{m.mensaje}</p>
                            <div className="flex justify-end items-center gap-1 mt-1.5 opacity-60 text-[9px] font-medium">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input de Mensaje */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
                    <input
                      type="text"
                      placeholder="Escribe tu mensaje aquí..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 h-11 px-4 bg-slate-50/50 border border-transparent rounded-xl focus:bg-white focus:border-[#534AB7]/30 text-[13px] outline-none text-slate-700 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="w-11 h-11 bg-[#534AB7] hover:bg-[#43399b] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-indigo-500/10 shrink-0"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center opacity-50 p-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-[14px] text-slate-700">Comienza a Chatear</h4>
                  <p className="text-[12px] text-slate-400 max-w-[200px] mt-1">Selecciona una conversación de la izquierda para comenzar a coordinar tus publicaciones y tutorías.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
