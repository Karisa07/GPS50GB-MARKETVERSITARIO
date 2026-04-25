import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // 1. Verificar sesión del usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para editar una publicación.' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'El ID de la publicación es requerido.' },
        { status: 400 }
      );
    }

    // 2. Verificar que la publicación existe y pertenece al usuario actual
    const { data: existingPost, error: fetchError } = await supabase
      .from('publicacion')
      .select('id_usuario')
      .eq('id_publicacion', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Publicación no encontrada.' },
        { status: 404 }
      );
    }

    if (existingPost.id_usuario !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar esta publicación.' },
        { status: 403 }
      );
    }

    // 3. Extraer datos a actualizar
    const body = await request.json();
    const { titulo, descripcion, precio, estado, imagen, ubicacion } = body;

    // Validación básica: Si envían título, no puede estar vacío
    if (titulo !== undefined && (typeof titulo !== 'string' || titulo.trim() === '')) {
      return NextResponse.json(
        { error: 'El título no puede estar vacío.' },
        { status: 400 }
      );
    }

    // Preparar objeto de actualización solo con los campos recibidos
    const updateData: any = {};
    if (titulo !== undefined) updateData.titulo = titulo.trim();
    if (descripcion !== undefined) updateData.descripcion = descripcion?.trim() || null;
    if (precio !== undefined) updateData.precio = precio ? parseFloat(precio) : null;
    if (estado !== undefined) updateData.estado = estado.trim();
    if (imagen !== undefined) updateData.imagen = imagen?.trim() || null;
    if (ubicacion !== undefined) updateData.ubicacion = ubicacion?.trim() || null;
    
    // Si no hay nada que actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No se enviaron datos para actualizar.' },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date().toISOString();

    // 4. Actualizar en la base de datos
    const { data, error } = await supabase
      .from('publicacion')
      .update(updateData)
      .eq('id_publicacion', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando publicación:', error);
      return NextResponse.json(
        { error: 'Error al actualizar la publicación.', details: error.message },
        { status: 500 }
      );
    }

    // 5. Retornar éxito
    return NextResponse.json(
      { message: 'Publicación actualizada exitosamente', data },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Excepción actualizando publicación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.', details: error.message },
      { status: 500 }
    );
  }
}
