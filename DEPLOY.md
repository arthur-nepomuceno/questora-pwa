# Deploy do Show do Milênio PWA para GitHub Pages

## Configuração do Repositório

### 1. Configurar GitHub Pages
1. Vá para Settings do repositório
2. Na seção "Pages", configure:
   - Source: GitHub Actions
   - Branch: gh-pages (será criada automaticamente)

### 2. Atualizar URL no Código
Substitua `[SEU_USUARIO]` no arquivo `src/app/layout.tsx` pela sua URL do GitHub Pages:
```typescript
// Linha 6 em src/app/layout.tsx
'https://SEU_USUARIO.github.io/show-milenio'
```

### 3. Fazer Push da Branch PWA
```bash
git add .
git commit -m "feat: Configuração para GitHub Pages"
git push origin pwa
```

## Como Funciona

1. **Push na branch `pwa`** → Trigger do GitHub Actions
2. **Build automático** → Gera arquivos estáticos na pasta `out`
3. **Deploy automático** → Publica na branch `gh-pages`
4. **GitHub Pages** → Serve os arquivos em `https://SEU_USUARIO.github.io/show-milenio`

## Instalação PWA no Celular

1. Acesse `https://SEU_USUARIO.github.io/show-milenio` no celular
2. Aguarde o prompt "Adicionar à tela inicial"
3. Toque em "Instalar" ou "Adicionar"
4. O app aparecerá na tela inicial como um app nativo

## Estrutura de Arquivos

```
show-milenio-nextjs/
├── .github/workflows/deploy.yml  # Deploy automático
├── next.config.js               # Configuração para export
├── src/app/layout.tsx           # metadataBase configurado
└── out/                         # Arquivos estáticos (gerados)
```

## Troubleshooting

- **Erro 404**: Verifique se a branch `gh-pages` foi criada
- **Assets não carregam**: Confirme se `basePath` está correto
- **PWA não instala**: Verifique se `manifest.json` está acessível
