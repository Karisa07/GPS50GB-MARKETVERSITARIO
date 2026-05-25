import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single();
    const isAdmin = profile?.rol === 'admin' || profile?.rol === 'superadmin';

    let query = supabase
      .from('solicitudes_tutor')
      .select('*, profiles(nombres, apellidos, email)')
      .order('fecha', { ascending: false });

    // Si no es admin, solo puede ver sus propias solicitudes
    if (!isAdmin) {
      query = query.eq('id_usuario', user.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ data });

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

    const json = await request.json();
    const { mensaje } = json;

    const { data, error } = await supabase
      .from('solicitudes_tutor')
      .insert({
        id_usuario: user.id,
        mensaje,
        estado: 'pendiente'
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
