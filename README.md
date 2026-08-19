# CRX // Banco de Criaturas — versão com banco real

Esta versão usa **Supabase** como banco de dados + autenticação e pode continuar hospedada no **GitHub Pages**.

## 1. Criar o banco
1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Cole todo o conteúdo de `supabase.sql`.
4. Execute.

## 2. Criar os usuários
Em **Authentication > Users**, crie:
- `mestre@rpg.local` — senha escolhida por você
- `rpg123@rpg.local` — senha do player 1
- `rpg456@rpg.local` — senha do player 2

Recomenda-se desativar a confirmação de e-mail para esta campanha.

Depois, no SQL Editor:
```sql
update public.profiles set role='master' where username='mestre';
```

O login do site continua sendo apenas:
- mestre
- rpg123
- rpg456

O endereço de e-mail interno não é mostrado no site.

## 3. Conectar o site
Abra `config.js` e coloque:
- URL do projeto Supabase
- chave `anon` / `public`

Nunca coloque a chave `service_role` no GitHub.

## 4. Publicar
Suba todos os arquivos na raiz do repositório:
- index.html
- login.html
- style.css
- app.js
- seed.js
- config.js
- supabase.sql
- imagens

Depois:
**Settings > Pages > Deploy from branch > main > /(root)**.

## 5. Painel do Mestre
A conta com `role = master` ganha:
- Arquivos Sazonais
- Gerenciar Criaturas
- Criar criatura
- Editar criatura
- Excluir criatura
- Importar as criaturas iniciais

Os players não recebem essas permissões pelo banco (RLS).

## Observação
O banco guarda atributos, ataques, perícias, perícias especiais, loot, imagem e observações como dados estruturados. Isso significa que você pode mudar a ficha pelo painel sem editar o HTML.
