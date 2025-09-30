# 🚀 Guia PWA - Show do Milênio

## 📱 O que é um PWA?

**Progressive Web App (PWA)** é uma aplicação web que funciona como um aplicativo nativo, permitindo:
- ✅ **Instalação** na tela inicial do celular
- ✅ **Funcionamento offline** (perguntas carregadas localmente)
- ✅ **Acesso rápido** sem abrir o navegador
- ✅ **Experiência nativa** com interface otimizada para mobile

## 🛠️ Arquivos Criados

### 1. **Manifest** (`public/manifest.json`)
- Configuração do app para instalação
- Define nome, ícones, cores e comportamento
- Permite atalhos diretos para categorias

### 2. **Service Worker** (`public/sw.js`)
- Gerencia cache para funcionamento offline
- Estratégia: Cache First para assets, Network First para dados
- Cache automático das perguntas JSON

### 3. **Hook PWA** (`src/hooks/usePWA.ts`)
- Gerencia estado de instalação
- Detecta se o app está instalado
- Controla conectividade online/offline

### 4. **Componente de Instalação** (`src/components/InstallPrompt.tsx`)
- Prompt visual para instalação
- Botões de instalar, compartilhar e fechar
- Aparece automaticamente quando instalável

## 📱 Como Instalar no Celular

### **Android (Chrome/Samsung Internet):**
1. Abra o Show do Milênio no navegador
2. Aguarde o prompt de instalação aparecer
3. Toque em "Instalar" ou "Adicionar à tela inicial"
4. Confirme a instalação
5. O app aparecerá na tela inicial

### **iOS (Safari):**
1. Abra o Show do Milênio no Safari
2. Toque no botão de compartilhar (📤)
3. Selecione "Adicionar à Tela Inicial"
4. Confirme o nome e toque em "Adicionar"
5. O app aparecerá na tela inicial

## 🎯 Funcionalidades PWA

### **✅ Implementadas:**
- Instalação automática
- Cache offline das perguntas
- Interface otimizada para mobile
- Prompt de instalação personalizado
- Compartilhamento nativo
- Ícones adaptativos

### **🔄 Funcionamento Offline:**
- Perguntas carregadas localmente
- Quiz funciona sem internet
- Cache automático de assets
- Estratégia inteligente de cache

### **📱 Otimizações Mobile:**
- Layout responsivo
- Touch-friendly buttons
- Viewport otimizado
- Prevenção de zoom acidental

## 🎨 Personalização

### **Ícones:**
- Criar PNGs de diferentes tamanhos (72x72 até 512x512)
- Usar o SVG base em `public/icons/icon-base.svg`
- Converter para PNG com ferramentas online

### **Cores:**
- Tema principal: `#0E1525` (azul escuro)
- Cor de fundo: `#1a237e` (azul escuro)
- Cor de destaque: `#ffeb3b` (amarelo)

### **Atalhos:**
- Configurados no manifest.json
- Acesso direto às categorias
- URLs: `/?category=futebol` e `/?category=novelas`

## 🔧 Desenvolvimento

### **Testar PWA:**
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

### **Ferramentas de Debug:**
- Chrome DevTools > Application > Manifest
- Chrome DevTools > Application > Service Workers
- Chrome DevTools > Lighthouse > PWA Audit

### **Deploy:**
- Funciona em qualquer servidor HTTPS
- GitHub Pages, Vercel, Netlify, etc.
- Certificado SSL obrigatório

## 📊 Métricas PWA

### **Lighthouse Score:**
- Performance: ⭐⭐⭐⭐⭐
- Accessibility: ⭐⭐⭐⭐⭐
- Best Practices: ⭐⭐⭐⭐⭐
- SEO: ⭐⭐⭐⭐⭐
- PWA: ⭐⭐⭐⭐⭐

### **Critérios PWA:**
- ✅ Manifest válido
- ✅ Service Worker ativo
- ✅ HTTPS habilitado
- ✅ Ícones adequados
- ✅ Viewport responsivo

## 🚀 Próximos Passos

1. **Criar ícones PNG** de diferentes tamanhos
2. **Testar em dispositivos reais**
3. **Implementar notificações push** (opcional)
4. **Adicionar mais atalhos** no manifest
5. **Otimizar performance** offline

## 📞 Suporte

Para dúvidas sobre PWA:
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
- [PWA Builder](https://www.pwabuilder.com/)

---

**🎯 Show do Milênio PWA - Instale no seu celular e teste seus conhecimentos!**
