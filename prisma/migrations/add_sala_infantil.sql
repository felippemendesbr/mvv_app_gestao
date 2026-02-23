-- Migration: Criar tabela SalaInfantil
-- Execute manualmente no SQL Server se necessário

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'SalaInfantil')
BEGIN
  CREATE TABLE SalaInfantil (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome NVARCHAR(100) NOT NULL,
    TipoSala INT NOT NULL,
    IdChurch INT NOT NULL,
    Enabled BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_SalaInfantil_TipoSalaInfantil FOREIGN KEY (TipoSala) REFERENCES TipoSalaInfantil(id),
    CONSTRAINT FK_SalaInfantil_Churches FOREIGN KEY (IdChurch) REFERENCES Churches(Id)
  );
END;
