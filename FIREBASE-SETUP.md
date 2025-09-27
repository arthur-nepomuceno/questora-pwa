# 🔥 Configuração Firebase

## 📋 Passos para configurar o Firebase:

### 1. Criar Projeto no Firebase Console
1. Acesse: https://console.firebase.google.com/
2. Clique em "Criar projeto"
3. Nome do projeto: `questora-competition`
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Configurar Autenticação
1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Vá para a aba "Sign-in method"
4. Habilite "Email/senha"
5. Clique em "Salvar"

### 3. Configurar Firestore Database
1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Criar banco de dados" (primeira opção)
4. Escolha a localização mais próxima (ex: us-central1)
5. Clique em "Concluído"

### 4. Obter Configurações do Projeto
1. No menu lateral, clique na engrenagem ⚙️
2. Clique em "Configurações do projeto"
3. Role para baixo até "Seus aplicativos"
4. Clique no ícone web `</>`
5. Nome do app: `questora-web`
6. **NÃO** marque "Também configurar o Firebase Hosting"
7. Clique em "Registrar app"
8. Copie as configurações que aparecem

### 5. Atualizar Arquivo de Configuração
1. Abra o arquivo `src/lib/firebase.ts`
2. Substitua as configurações de exemplo pelas suas:

```typescript
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};
```

### 6. Configurar Regras de Segurança do Firestore
1. No Firestore, vá para a aba "Regras"
2. Substitua as regras por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler e escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Qualquer um pode ler partidas (para ranking)
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Qualquer um pode ler leaderboard
    match /leaderboard/{entryId} {
      allow read: if request.auth != null;
      allow write: if false; // Apenas funções do servidor podem escrever
    }
  }
}
```

3. Clique em "Publicar"

### 7. Configurar Email de Verificação
1. No menu lateral, clique em "Authentication"
2. Vá para a aba "Templates"
3. Clique em "Email address verification"
4. Personalize o template se desejar
5. Salve as alterações

## ✅ Funcionalidades Implementadas:

- ✅ **Autenticação por email/senha**
- ✅ **Verificação obrigatória por email**
- ✅ **Sistema de créditos**
- ✅ **Persistência de dados**
- ✅ **Estatísticas de jogador**
- ✅ **Salvamento de partidas**
- ✅ **Sistema de ranking**

## 🧪 Como Testar:

1. Execute o projeto: `npm run dev`
2. Escolha "Competição"
3. Clique em "Cadastrar"
4. Preencha os dados
5. Verifique seu email e clique no link de confirmação
6. Faça login com as credenciais
7. Teste o sistema de créditos

## 🔒 Segurança:

- ✅ Senhas criptografadas automaticamente
- ✅ Verificação obrigatória de email
- ✅ Regras de segurança do Firestore
- ✅ Rate limiting do Firebase
- ✅ Tokens JWT seguros
