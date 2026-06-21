-- Ampliación de esquema para interacciones sociales B2B2C
CREATE TABLE IF NOT EXISTS video_interactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  video_id INTEGER REFERENCES videos(id),
  is_favorite BOOLEAN DEFAULT false,
  liked BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  UNIQUE(user_id, video_id)
);

CREATE TABLE IF NOT EXISTS video_comments (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id),
  author_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  is_creator_comment BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inyectar más videos de prueba
INSERT INTO videos (company_id, title, description, url) VALUES 
(1, 'Masterclass de Diseño Premium', 'Cómo crear interfaces que respiren lujo y exclusividad.', 'test_vid'),
(1, 'Estrategia B2B2C 2026', 'Claves para dominar el mercado de suscripciones.', 'test_vid'),
(1, 'Gestión de Equipos en Remoto', 'Herramientas y metodologías para el CTO moderno.', 'test_vid'),
(1, 'Arquitectura en la Nube', 'Escalando plataformas de video sin morir en el intento.', 'test_vid')
ON CONFLICT DO NOTHING;
