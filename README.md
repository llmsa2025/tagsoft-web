# TagSoft Web (MVP)

Abas:
- Parametrização (containers)
- Análises (IA stub)
- Indicadores (overview)

## Variáveis de ambiente
- NEXT_PUBLIC_API_URL  (ex: https://seu-api.railway.app)
- NEXT_PUBLIC_API_KEY  (ex: DEMO_KEY)

## Local run
```bash
npm install
NEXT_PUBLIC_API_URL=http://localhost:8787 NEXT_PUBLIC_API_KEY=DEMO_KEY npm run dev
```

### Snippet de teste
Acesse `/snippet.html` e passe `?api=URL&key=API_KEY` para apontar para sua API.
Exemplo:
`/snippet.html?api=http://localhost:8787&key=DEMO_KEY`
