-- Migration: Adicionar idChurch à tabela Redes
-- Execute manualmente no SQL Server se necessário

IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID('Redes') AND name = 'idChurch'
)
BEGIN
  ALTER TABLE Redes ADD idChurch INT NULL;
  ALTER TABLE Redes ADD CONSTRAINT FK_Redes_Churches
    FOREIGN KEY (idChurch) REFERENCES Churches(Id) ON DELETE SET NULL;
END;
