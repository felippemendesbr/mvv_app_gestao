# Deploy em produção

## Variável obrigatória

O Prisma precisa da variável de ambiente **`DATABASE_URL`** para conectar ao SQL Server.

**No servidor (ex.: painel Noah Solutions), configure:**

| Variável      | Obrigatório | Exemplo |
|---------------|-------------|---------|
| `DATABASE_URL` | Sim         | `sqlserver://HOST:1433;database=SEU_BD;user=USUARIO;password=SENHA;encrypt=true;trustServerCertificate=true` |

- Substitua `HOST`, `SEU_BD`, `USUARIO` e `SENHA` pelos dados do seu SQL Server.
- O servidor onde o app roda precisa conseguir acessar o host/porta do banco (rede/firewall).

Se `DATABASE_URL` não estiver definida no ambiente de produção, você verá:

```
Environment variable not found: DATABASE_URL.
```

Nesse caso, adicione a variável no painel da hospedagem e reinicie o app.

## Uploads (PDFs do Edificando)

Os arquivos **não** ficam em `public/uploads`. São gravados na pasta persistente `uploads/` (ou no caminho de `UPLOADS_DIR`) e servidos pela rota `/uploads/edificando/...`.

**No publish, não envie nem substitua a pasta `uploads`.** Se o painel copiar o site inteiro, exclua essa pasta do pacote ou publique só os arquivos da aplicação. Caso contrário, cada deploy apaga os PDFs já enviados.

Recomendado em produção: definir `UPLOADS_DIR` apontando para uma pasta **fora** do diretório publicado, por exemplo `C:\dados\mvv-uploads`. Assim o publish do site nunca mexe nos arquivos.
