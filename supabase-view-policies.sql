-- Políticas para Views - Execute APÓS o supabase-schema.sql
-- Este arquivo deve ser executado separadamente após a criação das views

-- Política para a view de ranking (todos podem ver)
CREATE POLICY "Ranking público" ON ranking_usuarios
  FOR SELECT USING (true);

-- Comentário para a view
COMMENT ON VIEW ranking_usuarios IS 'View pública para ranking de usuários com estatísticas';
