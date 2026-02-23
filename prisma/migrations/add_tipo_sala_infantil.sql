-- Migration: Criar tabela TipoSalaInfantil
-- Execute manualmente no SQL Server se necessário

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'TipoSalaInfantil')
BEGIN
  CREATE TABLE TipoSalaInfantil (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome NVARCHAR(100) NOT NULL
  );
END;
