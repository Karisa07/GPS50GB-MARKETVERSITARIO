import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.rol !== 'admin' && profile.rol !== 'superadmin')) {
      return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
    }

    const isSuperAdmin = profile.rol === 'superadmin';
    const { searchParams } = new URL(request.url);
    const formato = searchParams.get('formato'); // 'csv' para exportar
    const filtroEstado = searchParams.get('estado'); // filtro opcional
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const porPagina = parseInt(searchParams.get('por_pagina') || '50');
    const offset = (pagina - 1) * porPagina;

    // ── 1. Log de ventas (intenciones_compra con detalle) ──────────────────
    let query = supabase
      .from('intenciones_compra')
      .select(`
        id,
        codigo_transaccion,
        estado,
        fecha_clic,
        fecha_marcado_vendedor,
        fecha_confirmacion,
        calificacion_comprador,
        comentario_comprador,
        id_publicacion,
        id_comprador,
        comprador:profiles!intenciones_compra_id_comprador_fkey(nombres, apellidos, email),
        publicacion(id_publicacion, titulo, precio, estado, id_usuario)
      `, { count: 'exact' })
      .order('fecha_clic', { ascending: false })
      .range(offset, offset + porPagina - 1);

    if (filtroEstado && filtroEstado !== 'todos') {
      query = query.eq('estado', filtroEstado);
    }

    const { data: intenciones, error: intentionError, count: totalIntenciones } = await query;

    if (intentionError) {
      console.error('Error auditoria intenciones:', intentionError);
      return NextResponse.json({ error: intentionError.message }, { status: 500 });
    }

    // ── 2. Enriquecer con datos del vendedor ───────────────────────────────
    const vendedorIds = [...new Set(
      (intenciones || [])
        .map((i: any) => i.publicacion?.id_usuario)
        .filter(Boolean)
    )];

    let vendedoresMap: Record<string, any> = {};
    if (vendedorIds.length > 0) {
      const { data: vendedores } = await supabase
        .from('profiles')
        .select('id, nombres, apellidos, email')
        .in('id', vendedorIds);
      (vendedores || []).forEach((v: any) => { vendedoresMap[v.id] = v; });
    }

    // ── 3. Detección de fraude (solo superadmin ve el detalle completo) ────
    // Compradores con >3 intenciones rechazadas
    const { data: suspechosos } = await supabase
      .from('intenciones_compra')
      .select('id_comprador, estado')
      .eq('estado', 'rechazado');

    const conteoRechazos: Record<string, number> = {};
    (suspechosos || []).forEach((s: any) => {
      conteoRechazos[s.id_comprador] = (conteoRechazos[s.id_comprador] || 0) + 1;
    });
    const idsSospechosos = Object.entries(conteoRechazos)
      .filter(([, count]) => count >= 3)
      .map(([id]) => id);

    // Publicaciones con precio anormal (precio = 0 o > 50,000,000)
    const { data: pubsAnormales } = await supabase
      .from('publicacion')
      .select('id_publicacion, titulo, precio, id_usuario')
      .or('precio.eq.0,precio.gt.50000000');

    // ── 4. KPIs rápidos ────────────────────────────────────────────────────
    const { count: totalConfirmadas } = await supabase
      .from('intenciones_compra')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'confirmado');

    const { count: totalClickeadas } = await supabase
      .from('intenciones_compra')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'clickeado');

    const { count: totalRechazadas } = await supabase
      .from('intenciones_compra')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'rechazado');

    const { count: totalPendientes } = await supabase
      .from('intenciones_compra')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'marcado_vendedor');

    const { data: ventasConfirmadas } = await supabase
      .from('intenciones_compra')
      .select('publicacion(precio)')
      .eq('estado', 'confirmado');

    const montoTotalVentas = (ventasConfirmadas || []).reduce(
      (sum: number, v: any) => sum + (parseFloat(v.publicacion?.precio || 0)),
      0
    );

    // ── 5. Construir respuesta enriquecida ─────────────────────────────────
    const logEnriquecido = (intenciones || []).map((i: any) => {
      const vendedor = vendedoresMap[i.publicacion?.id_usuario] || null;
      const esSospechoso = idsSospechosos.includes(i.id_comprador);
      return {
        id: i.id,
        codigo_transaccion: i.codigo_transaccion,
        estado: i.estado,
        fecha_clic: i.fecha_clic,
        ...(isSuperAdmin && {
          fecha_marcado_vendedor: i.fecha_marcado_vendedor,
          fecha_confirmacion: i.fecha_confirmacion,
        }),
        calificacion: i.calificacion_comprador,
        comentario: i.comentario_comprador,
        producto: {
          id: i.id_publicacion,
          titulo: i.publicacion?.titulo,
          precio: i.publicacion?.precio,
          estado_publicacion: i.publicacion?.estado,
        },
        comprador: i.comprador
          ? {
              nombres: i.comprador.nombres,
              apellidos: i.comprador.apellidos,
              ...(isSuperAdmin && { email: i.comprador.email }),
              es_sospechoso: esSospechoso,
            }
          : null,
        vendedor: vendedor
          ? {
              nombres: vendedor.nombres,
              apellidos: vendedor.apellidos,
              ...(isSuperAdmin && { email: vendedor.email }),
            }
          : null,
      };
    });

    // ── 6. Exportar CSV si se solicita ─────────────────────────────────────
    if (formato === 'csv') {
      const headers = [
        'ID', 'Código', 'Estado', 'Fecha Clic', 'Producto', 'Precio',
        'Comprador', 'Vendedor', 'Calificación',
        ...(isSuperAdmin ? ['Email Comprador', 'Email Vendedor', 'Fecha Confirmación', 'Sospechoso'] : [])
      ];

      const rows = logEnriquecido.map(r => [
        r.id,
        r.codigo_transaccion,
        r.estado,
        r.fecha_clic ? new Date(r.fecha_clic).toLocaleString('es-CO') : '',
        r.producto?.titulo || '',
        r.producto?.precio || '',
        r.comprador ? `${r.comprador.nombres} ${r.comprador.apellidos}` : '',
        r.vendedor ? `${r.vendedor.nombres} ${r.vendedor.apellidos}` : '',
        r.calificacion || '',
        ...(isSuperAdmin ? [
          (r.comprador as any)?.email || '',
          (r.vendedor as any)?.email || '',
          (r as any).fecha_confirmacion ? new Date((r as any).fecha_confirmacion).toLocaleString('es-CO') : '',
          r.comprador?.es_sospechoso ? 'Sí' : 'No',
        ] : [])
      ]);

      const csv = [headers, ...rows]
        .map(row => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return new Response('\uFEFF' + csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="auditoria_ventas_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      data: {
        kpis: {
          totalIntenciones: totalIntenciones || 0,
          totalConfirmadas: totalConfirmadas || 0,
          totalPendientes: totalPendientes || 0,
          totalRechazadas: totalRechazadas || 0,
          totalClickeadas: totalClickeadas || 0,
          montoTotalVentas,
          tasaConversion: totalIntenciones
            ? Math.round(((totalConfirmadas || 0) / totalIntenciones) * 100)
            : 0,
        },
        log: logEnriquecido,
        paginacion: {
          pagina,
          porPagina,
          total: totalIntenciones || 0,
          totalPaginas: Math.ceil((totalIntenciones || 0) / porPagina),
        },
        ...(isSuperAdmin && {
          fraude: {
            usuariosSospechosos: idsSospechosos.length,
            publicacionesAnormales: (pubsAnormales || []).length,
            detalle: {
              sospechosos: idsSospechosos,
              pubsAnormales: pubsAnormales || [],
            },
          },
        }),
      },
    });
  } catch (err: any) {
    console.error('Error auditoría:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
