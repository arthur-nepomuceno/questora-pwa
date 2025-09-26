-- View e Políticas para Ranking - Execute APÓS o supabase-schema.sql
-- Este arquivo deve ser executado separadamente após a criação das tabelas

-- View para ranking de usuários (cria apenas se não existir)
CREATE OR REPLACE VIEW ranking_usuarios AS
SELECT 
  u.id,
  u.nome,
  u.email,
  u.creditos,
  COUNT(p.id) as total_partidas,
  COALESCE(SUM(p.acertos), 0) as total_acertos,
  COALESCE(SUM(p.erros), 0) as total_erros,
  CASE 
    WHEN COALESCE(SUM(p.acertos + p.erros), 0) > 0 
    THEN ROUND((COALESCE(SUM(p.acertos), 0)::DECIMAL / COALESCE(SUM(p.acertos + p.erros), 1)) * 100, 2)
    ELSE 0 
  END as precisao_percentual,
  COALESCE(SUM(p.creditos_ganhos), 0) as creditos_ganhos_total
FROM usuarios u
LEFT JOIN partidas p ON u.id = p.usuario_id
GROUP BY u.id, u.nome, u.email, u.creditos
ORDER BY u.creditos DESC, precisao_percentual DESC;

-- Política para a view de ranking (todos podem ver)
-- Views não suportam RLS diretamente, então criamos uma função segura
CREATE OR REPLACE FUNCTION get_ranking_usuarios()
RETURNS TABLE (
  id INTEGER,
  nome VARCHAR(255),
  email VARCHAR(255),
  creditos INT,
  total_partidas BIGINT,
  total_acertos BIGINT,
  total_erros BIGINT,
  precisao_percentual NUMERIC,
  creditos_ganhos_total BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    u.id,
    u.nome,
    u.email,
    u.creditos,
    COUNT(p.id) as total_partidas,
    COALESCE(SUM(p.acertos), 0) as total_acertos,
    COALESCE(SUM(p.erros), 0) as total_erros,
    CASE 
      WHEN COALESCE(SUM(p.acertos + p.erros), 0) > 0 
      THEN ROUND((COALESCE(SUM(p.acertos), 0)::DECIMAL / COALESCE(SUM(p.acertos + p.erros), 1)) * 100, 2)
      ELSE 0 
    END as precisao_percentual,
    COALESCE(SUM(p.creditos_ganhos), 0) as creditos_ganhos_total
  FROM usuarios u
  LEFT JOIN partidas p ON u.id = p.usuario_id
  GROUP BY u.id, u.nome, u.email, u.creditos
  ORDER BY u.creditos DESC, precisao_percentual DESC;
$$;

-- Comentários para documentação
COMMENT ON VIEW ranking_usuarios IS 'View pública para ranking de usuários com estatísticas';
COMMENT ON FUNCTION get_ranking_usuarios() IS 'Função segura para obter ranking de usuários';
