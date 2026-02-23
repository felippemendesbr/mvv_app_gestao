-- Migration: Adicionar IdadeMinima e IdadeMaxima à tabela SalaInfantil
-- Execute manualmente no SQL Server se necessário

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SalaInfantil') AND name = 'IdadeMinima')
BEGIN
  ALTER TABLE SalaInfantil ADD IdadeMinima INT NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SalaInfantil') AND name = 'IdadeMaxima')
BEGIN
  ALTER TABLE SalaInfantil ADD IdadeMaxima INT NOT NULL DEFAULT 14;
END;
