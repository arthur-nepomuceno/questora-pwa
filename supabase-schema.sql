-- Schema para o Show do Milênio - Sistema de Competição
-- Execute este script no SQL Editor do Supabase

-- Tabela de usuários
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255),
  foto_perfil TEXT,
  provider VARCHAR(50) DEFAULT 'google',
  creditos INT DEFAULT 100,
  criado_em TIMESTAMP DEFAULT NOW(),
  ultimo_login TIMESTAMP
);

-- Tabela de partidas
CREATE TABLE partidas (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
  acertos INT NOT NULL,
  erros INT NOT NULL,
  creditos_ganhos INT DEFAULT 0,
  creditos_final INT NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_usuarios_google_id ON usuarios(google_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_partidas_usuario_id ON partidas(usuario_id);
CREATE INDEX idx_partidas_criado_em ON partidas(criado_em);

-- RLS (Row Level Security) - Políticas de segurança
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas ENABLE ROW LEVEL SECURITY;

-- Política para usuários: usuários só podem ver/editar seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios
  FOR ALL USING (auth.uid()::text = google_id);

-- Política para partidas: usuários só podem ver suas próprias partidas
CREATE POLICY "Usuários podem ver suas próprias partidas" ON partidas
  FOR ALL USING (
    usuario_id IN (
      SELECT id FROM usuarios WHERE google_id = auth.uid()::text
    )
  );

-- Função para criar usuário automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (google_id, email, nome, foto_perfil, provider, creditos)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'google',
    100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar último login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.usuarios 
  SET ultimo_login = NOW()
  WHERE google_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar último login
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.update_last_login();

-- View para ranking de usuários
CREATE VIEW ranking_usuarios AS
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
CREATE POLICY "Ranking público" ON ranking_usuarios
  FOR SELECT USING (true);

-- Comentários para documentação
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema de competição';
COMMENT ON TABLE partidas IS 'Histórico de partidas dos usuários';
COMMENT ON COLUMN usuarios.creditos IS 'Saldo atual de créditos do usuário';
COMMENT ON COLUMN partidas.creditos_ganhos IS 'Créditos ganhos ou perdidos na partida';
COMMENT ON COLUMN partidas.creditos_final IS 'Saldo final após a partida';
