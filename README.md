# Cruzadas SBA

App de palavras cruzadas para revisão do conteúdo programático da SBA.
Estático, sem servidor, funciona offline depois da primeira visita.

## Publicar no GitHub Pages (grátis)

1. Crie uma conta em github.com, se ainda não tiver.
2. **New repository** → nome `cruzadas` → **Public** → Create.
3. Na página do repositório: **Add file → Upload files**. Arraste
   `index.html`, `app.js`, `manifest.json`, `sw.js` e a pasta `dados`.
   Commit.
4. **Settings → Pages** → em *Source* escolha **Deploy from a branch**,
   branch `main`, pasta `/ (root)` → Save.
5. Em um ou dois minutos o endereço aparece:
   `https://SEU-USUARIO.github.io/cruzadas/`

No celular, abra esse endereço e use "Adicionar à tela de início". A partir daí
ele abre como aplicativo e funciona sem sinal.

## Testar antes de publicar

Duplo clique no `index.html` **não funciona** — o navegador bloqueia a leitura
dos arquivos de dados. Use um servidor local:

```bash
cd site
python3 -m http.server 8000
```

E abra `http://localhost:8000`.

## Acrescentar uma edição

```bash
python3 scripts/publicar.py banco.json --site site \
        --id p22p23 --tema "Pontos 22 e 23 · Anestesia Inalatória" \
        --modulo ME2 --pontos 22 23
```

Isso escreve `dados/p22p23.json` e atualiza `dados/indice.json`.
Suba os dois arquivos para o repositório — `index.html` e `app.js` não mudam.

Depois de publicar uma edição nova, incremente `CACHE` no `sw.js`
(`cruzadas-v1` → `cruzadas-v2`), senão os aparelhos que já visitaram continuam
servindo a versão antiga do índice.

## Progresso

Fica no aparelho (localStorage), separado por edição. Trocar de celular ou
limpar dados do navegador apaga. Sincronizar entre aparelhos exige conta e
servidor — vale quando houver material suficiente para justificar.
