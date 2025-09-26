import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Erro no callback:', error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_failed`)
      }

      if (data.user) {
        // Verificar se o usuário já existe no banco
        const { data: existingUser, error: fetchError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('google_id', data.user.id)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Erro ao buscar usuário:', fetchError)
          return NextResponse.redirect(`${requestUrl.origin}/?error=user_fetch_failed`)
        }

        if (!existingUser) {
          // Criar novo usuário com 100 créditos
          const { error: insertError } = await supabase
            .from('usuarios')
            .insert({
              google_id: data.user.id,
              email: data.user.email!,
              nome: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
              foto_perfil: data.user.user_metadata?.avatar_url,
              provider: 'google',
              creditos: 100,
              ultimo_login: new Date().toISOString()
            })

          if (insertError) {
            console.error('Erro ao criar usuário:', insertError)
            return NextResponse.redirect(`${requestUrl.origin}/?error=user_creation_failed`)
          }
        } else {
          // Atualizar último login
          const { error: updateError } = await supabase
            .from('usuarios')
            .update({ ultimo_login: new Date().toISOString() })
            .eq('google_id', data.user.id)

          if (updateError) {
            console.error('Erro ao atualizar último login:', updateError)
          }
        }
      }

      // Redirecionar para a página principal
      return NextResponse.redirect(`${requestUrl.origin}/?auth=success`)
    } catch (error) {
      console.error('Erro inesperado no callback:', error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=unexpected_error`)
    }
  }

  // Se não há código, redirecionar com erro
  return NextResponse.redirect(`${requestUrl.origin}/?error=no_code`)
}
