import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener los chats del usuario autenticado (donde sea id_usuario_1 o id_usuario_2)
    const { data: chats, error } = await supabase
      .from('chats')
      .select(`
        id_chat,
        created_at,
        u1:profiles!id_usuario_1(id, nombres, apellidos, avatar_url, rol),
        u2:profiles!id_usuario_2(id, nombres, apellidos, avatar_url, rol)
      `)
      .or(`id_usuario_1.eq.${user.id},id_usuario_2.eq.${user.id}`);

    if (error) throw error;

    // Formatear para retornar el perfil del "otro" participante directamente
    const formattedChats = chats.map((chat: any) => {
      const otherUser = chat.u1.id === user.id ? chat.u2 : chat.u1;
      return {
        id_chat: chat.id_chat,
        created_at: chat.created_at,
        participante: otherUser
      };
    });

    return NextResponse.json({ data: formattedChats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id_usuario_2 } = await request.json();

    if (!id_usuario_2) {
      return NextResponse.json({ error: 'Falta id_usuario_2' }, { status: 400 });
    }

    if (user.id === id_usuario_2) {
      return NextResponse.json({ error: 'No puedes chatear contigo mismo' }, { status: 400 });
    }

    // Ordenar IDs para cumplir con la restricción UNIQUE(id_usuario_1, id_usuario_2)
    const id_usuario_1 = user.id < id_usuario_2 ? user.id : id_usuario_2;
    const sorted_id_usuario_2 = user.id < id_usuario_2 ? id_usuario_2 : user.id;

    // Buscar si ya existe el chat
    const { data: existingChat } = await supabase
      .from('chats')
      .select('id_chat')
      .eq('id_usuario_1', id_usuario_1)
      .eq('id_usuario_2', sorted_id_usuario_2)
      .maybeSingle();

    if (existingChat) {
      return NextResponse.json({ data: existingChat });
    }

    // Crear nuevo chat
    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({
        id_usuario_1,
        id_usuario_2: sorted_id_usuario_2
      })
      .select('id_chat')
      .single();

    if (error) throw error;

    return NextResponse.json({ data: newChat }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
