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
