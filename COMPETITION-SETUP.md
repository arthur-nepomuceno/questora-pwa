# 🏆 Configuração do Sistema de Competição - Show do Milênio

Este documento explica como configurar o sistema de competição com autenticação e sistema de créditos.

## 📋 Pré-requisitos

1. **Conta no Supabase** - [Criar conta gratuita](https://supabase.com)
2. **Projeto Google Cloud** - Para OAuth (opcional, pode usar apenas email/senha)
3. **Node.js** versão 18+ instalado

## ⚡ Configuração Mínima (Recomendada)

Se você quer começar rapidamente, siga apenas estes passos:

1. ✅ **Configure o Supabase** (obrigatório)
2. ✅ **Configure OAuth Consent Screen** (obrigatório para Google OAuth)
3. ✅ **Crie credenciais OAuth** (obrigatório para Google OAuth)
4. ✅ **Configure no Supabase** (obrigatório)
5. ✅ **Configure variáveis de ambiente** (obrigatório)

> **💡 Dica**: Você pode pular a ativação de APIs específicas. O OAuth funcionará mesmo sem elas.

## 🚀 Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Escolha uma organização e nomeie o projeto (ex: "show-milenio")
4. Defina uma senha forte para o banco de dados
5. Escolha uma região próxima (ex: South America - São Paulo)
6. Clique em "Create new project"

### 2. Configurar Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. **Execute o script principal**:
   - Copie e cole o conteúdo do arquivo `supabase-schema.sql`
   - Clique em **Run** para executar o script
4. **Execute a view de ranking** (opcional):
   - Crie uma nova query
   - Copie e cole o conteúdo do arquivo `supabase-view-policies.sql`
   - Clique em **Run** para executar

### 3. Obter Chaves da API

1. No painel do Supabase, vá para **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY) - mantenha em segredo!

### 4. Como Usar o Ranking no Código

Para obter o ranking de usuários no seu código, use a função `get_ranking_usuarios()`:

```typescript
// Exemplo de uso no código
const { data: ranking, error } = await supabase
  .rpc('get_ranking_usuarios');

if (error) {
  console.error('Erro ao buscar ranking:', error);
} else {
  console.log('Ranking:', ranking);
}
```

### 5. Configurar Autenticação

1. No painel do Supabase, vá para **Authentication** > **Providers**
2. **Para Google OAuth:**
   - Ative o provider "Google"
   - Configure o Google OAuth (veja seção abaixo)
3. **Para Email/Password:**
   - Ative o provider "Email"
   - Configure as opções de email conforme necessário

## 🔐 Configuração do Google OAuth (Opcional)

### 1. Criar Projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. **Ative as APIs necessárias** (veja seção abaixo)

### 2. Ativar APIs Necessárias

1. Vá para **APIs & Services** > **Library**
2. **Procure e ative estas APIs**:
   - ✅ **Google Identity Services API** (recomendado)
   - ✅ **Google OAuth2 API** (essencial)
   - ✅ **Google+ API** (se disponível)

3. **NÃO ative**:
   - ❌ **Cloud Identity API** (não é necessário)
   - ❌ **Cloud Identity-Aware Proxy API** (não é necessário)

> **💡 Dica**: Se não encontrar essas APIs específicas, você pode pular este passo. O OAuth funcionará mesmo sem APIs específicas ativadas.

### 3. Configurar OAuth Consent Screen

1. Vá para **APIs & Services** > **OAuth consent screen**
2. Escolha "External" e clique "Create"
3. Preencha as informações obrigatórias:
   - **App name**: Show do Milênio
   - **User support email**: seu email
   - **Developer contact information**: seu email
4. Adicione seu domínio nas **Authorized domains**
5. Salve e continue

### 4. Criar Credenciais OAuth

1. Vá para **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **OAuth 2.0 Client IDs**
3. Escolha "Web application"
4. Configure:
   - **Name**: Show do Milênio Web
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (desenvolvimento)
     - `https://seu-dominio.com` (produção)
   - **Authorized redirect URIs**:
     - `https://seu-projeto.supabase.co/auth/v1/callback`
5. Copie o **Client ID** e **Client Secret**

### 5. Configurar no Supabase

1. No painel do Supabase, vá para **Authentication** > **Providers**
2. Encontre **"Google"** na lista de providers
3. Clique no **toggle** para ativar o provider Google
4. **Cole as credenciais** nos campos que aparecerão:
   - **Client ID**: Cole o Client ID copiado do Google Cloud Console
   - **Client Secret**: Cole o Client Secret copiado do Google Cloud Console
5. Clique em **"Save"** para salvar as configurações

> **📍 Localização exata**: Após ativar o toggle do Google, você verá dois campos de texto:
> - Um campo para **Client ID** 
> - Um campo para **Client Secret**
> 
> Cole as credenciais copiadas do Google Cloud Console nesses campos.

#### **Passo a Passo Visual:**

1. **Acesse**: Supabase Dashboard → Authentication → Providers
2. **Encontre**: A linha com "Google" na lista
3. **Ative**: Clique no toggle (botão deslizante) do Google
4. **Aparecerão**: Dois campos de texto:
   ```
   ┌─────────────────────────────────────┐
   │ Client ID: [campo vazio]            │
   └─────────────────────────────────────┘
   ┌─────────────────────────────────────┐
   │ Client Secret: [campo vazio]        │
   └─────────────────────────────────────┘
   ```
5. **Cole**: As credenciais copiadas do Google Cloud Console
6. **Salve**: Clique no botão "Save" no final da página

## ⚙️ Configuração das Variáveis de Ambiente

### 1. Criar arquivo .env.local

**Opção A: Copiar do template**
1. Copie o arquivo `env-template.txt` para `.env.local`
2. Substitua os valores pelos seus dados reais do Supabase

**Opção B: Criar manualmente**
Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# Google OAuth Configuration (opcional)
GOOGLE_CLIENT_ID=seu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_google_client_secret_aqui
```

> **⚠️ Importante**: O arquivo `.env.local` não deve ser commitado no Git por segurança.

### 2. Substituir os valores

- Substitua `seu-projeto` pela URL do seu projeto Supabase
- Substitua `sua_chave_anonima_aqui` pela chave anon do Supabase
- Substitua `sua_chave_service_role_aqui` pela chave service_role do Supabase
- Substitua as credenciais do Google se estiver usando OAuth

## 🎮 Como Funciona o Sistema

### Fluxo de Autenticação

1. **Usuário acessa a modalidade "Competição"**
2. **Tela de Login aparece** com opções:
   - Login com Google (OAuth)
   - Login com Email/Senha
   - Cadastro com Email/Senha
3. **Após login bem-sucedido:**
   - Usuário é criado no banco com 100 créditos iniciais
   - Redirecionado para tela de competição

### Sistema de Créditos

- **Créditos Iniciais**: 100 créditos para novos usuários
- **Custo da Partida**: Baseado na dificuldade e apostas
- **Ganhos/Perdas**: Calculados pelos multiplicadores do quiz
- **Histórico**: Todas as partidas são salvas no banco

### Estrutura do Banco

#### Tabela `usuarios`
- Armazena dados do usuário
- Saldo atual de créditos
- Informações de perfil (nome, foto, etc.)

#### Tabela `partidas`
- Histórico de todas as partidas
- Acertos, erros, créditos ganhos/perdidos
- Saldo final após cada partida

## 🚀 Executando o Projeto

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acessar a aplicação:**
   - Abra [http://localhost:3000](http://localhost:3000)
   - Clique em "Competição" na tela de modalidades
   - Teste o login e sistema de créditos

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de CORS:**
   - Verifique se as URLs estão corretas no Google OAuth
   - Confirme se o domínio está nas configurações do Supabase

2. **Erro de autenticação:**
   - Verifique se as chaves do Supabase estão corretas
   - Confirme se o Google OAuth está configurado corretamente

3. **Erro de banco de dados:**
   - Execute novamente o script SQL no Supabase
   - Verifique se as políticas RLS estão ativas

4. **Usuário não é criado:**
   - Verifique se o trigger está funcionando
   - Confirme se as políticas RLS permitem inserção

### Problemas com APIs do Google

1. **"Cloud Identity" em vez de "Google Identity":**
   - ❌ **Cloud Identity** é para empresas, não para OAuth
   - ✅ **Google Identity Services API** é o correto
   - Se não encontrar, pule a ativação de APIs

2. **APIs não encontradas:**
   - Procure por **"OAuth"** na biblioteca de APIs
   - Ative qualquer API relacionada a OAuth
   - Ou pule completamente este passo

3. **"Google+ API" descontinuada:**
   - Use **Google Identity Services API** em vez disso
   - Ou configure apenas email/senha no Supabase

4. **OAuth não funciona mesmo sem APIs:**
   - Verifique se o OAuth Consent Screen está configurado
   - Confirme se as credenciais estão corretas
   - Teste com email/senha primeiro

5. **Campos de credenciais não aparecem no Supabase:**
   - Certifique-se de que o toggle do Google está **ATIVADO** (azul/verde)
   - Recarregue a página se os campos não aparecerem
   - Verifique se você está na seção correta: Authentication → Providers

6. **Erro "Invalid client" no Supabase:**
   - Verifique se o Client ID está correto (sem espaços extras)
   - Confirme se o Client Secret está correto
   - Certifique-se de que as credenciais foram copiadas completamente

7. **Erro "ranking_usuarios is not a table" no SQL:**
   - **Problema resolvido**: O `supabase-schema.sql` foi corrigido e não contém mais a view problemática
   - **Execute apenas**: O `supabase-schema.sql` primeiro
   - **Depois execute**: O `supabase-view-policies.sql` em uma query separada (opcional)

8. **Erro "relation ranking_usuarios already exists":**
   - **Problema**: A view já foi criada anteriormente
   - **Solução**: O script `supabase-view-policies.sql` agora usa `CREATE OR REPLACE` e pode ser executado múltiplas vezes
   - **Execute novamente**: O `supabase-view-policies.sql` sem problemas

9. **Erro "ranking_usuarios is not a table" (RLS em views):**
   - **Problema**: Views não suportam RLS diretamente no Supabase
   - **Solução**: Criada função `get_ranking_usuarios()` que funciona como uma view segura
   - **Uso**: Execute `SELECT * FROM get_ranking_usuarios();` para obter o ranking

10. **Erro "return type mismatch in function declared to return record":**
   - **Problema**: Incompatibilidade de tipos na função (UUID vs INTEGER)
   - **Solução**: Corrigido o tipo de retorno da função para `INTEGER` (tipo correto do campo `id`)
   - **Execute novamente**: O `supabase-view-policies.sql` com os tipos corretos

11. **Erro de permissão no banco de dados:**
   - Verifique se você tem permissão de administrador no projeto
   - Certifique-se de que o RLS está ativado corretamente
   - Execute os scripts na ordem correta

### Logs e Debug

- Use o console do navegador para ver erros JavaScript
- Verifique os logs do Supabase em **Logs** > **Auth**
- Use o **SQL Editor** para consultar dados diretamente

## 📱 Funcionalidades Implementadas

✅ **Autenticação com Google OAuth**  
✅ **Login/Cadastro com Email/Senha**  
✅ **Sistema de créditos com 100 créditos iniciais**  
✅ **Histórico de partidas**  
✅ **Estatísticas do usuário**  
✅ **Interface responsiva**  
✅ **Segurança com RLS (Row Level Security)**  
✅ **Triggers automáticos para criação de usuários**  

## 🎯 Próximos Passos

- [ ] Implementar ranking global
- [ ] Adicionar mais categorias de quiz
- [ ] Sistema de conquistas/badges
- [ ] Notificações push
- [ ] Modo multiplayer em tempo real
- [ ] Sistema de torneios

## 📞 Suporte

Se encontrar problemas:

1. Verifique este documento primeiro
2. Consulte a [documentação do Supabase](https://supabase.com/docs)
3. Verifique os logs de erro no console
4. Teste com um usuário novo para isolar problemas

---

**🎮 Divirta-se jogando o Show do Milênio!**
