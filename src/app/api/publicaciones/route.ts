import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verificar sesión del usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para crear una publicación.' },
        { status: 401 }
      );
    }

    // 2. Extraer datos del cuerpo de la petición
    const body = await request.json();
    const { titulo, descripcion, precio, imagen, ubicacion } = body;

    // 3. Validación básica
    if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
      return NextResponse.json(
        { error: 'El título es obligatorio.' },
        { status: 400 }
      );
    }

    // 4. Insertar en la base de datos
    const { data, error } = await supabase
      .from('publicacion')
      .insert([
        {
          titulo: titulo.trim(),
          descripcion: descripcion?.trim() || null,
          precio: precio ? parseFloat(precio) : null,
          imagen: imagen?.trim() || null,
          ubicacion: ubicacion?.trim() || null,
          id_usuario: user.id, // Se vincula automáticamente al usuario logueado
          estado: 'activo'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error insertando publicación:', error);
      return NextResponse.json(
        { error: 'Error al crear la publicación en la base de datos.', details: error.message },
        { status: 500 }
      );
    }

    // 5. Retornar éxito
    return NextResponse.json(
      { message: 'Publicación creada exitosamente', data },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Excepción creando publicación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.', details: error.message },
      { status: 500 }
    );
  }
}
