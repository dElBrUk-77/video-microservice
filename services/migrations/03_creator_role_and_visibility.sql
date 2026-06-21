-- Añadir columna de visibilidad a videos
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS creator_notes TEXT;

-- Asegurar que el rol 'creator' existe en la lógica (es un alias de company_admin en este flujo)
-- Insertar el usuario creador de prueba
INSERT INTO users (email, password_hash, company_id, membership_active, role)
VALUES ('creador@example.com', '$2a$10$7O7jB1E.v6v6v6v6v6v6v.O8/X5eZ1X5eZ1X5eZ1X5eZ1X5eZ1', 1, true, 'creator')
ON CONFLICT (email) DO NOTHING;
