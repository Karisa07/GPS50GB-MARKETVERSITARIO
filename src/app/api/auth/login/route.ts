import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // ── 1. Autenticar con Supabase ──────────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Credenciales inválidas.' },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Error inesperado al iniciar sesión.' },
        { status: 500 }
      )
    }

    // ── 2. Obtener el perfil extendido del usuario ──────────────────
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.warn('Usuario sin perfil en tabla profiles:', authData.user.id)
    }

    // ── 3. Respuesta exitosa ────────────────────────────────────────
    return NextResponse.json(
      {
        message: 'Sesión iniciada exitosamente.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          profile: profile || null,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[POST /api/auth/login]', error)
    return NextResponse.json(
      { error: 'Error interno: ' + message },
      { status: 500 }
    )
  }
}
