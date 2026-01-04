-- Tabla de propiedades
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de huéspedes
CREATE TABLE guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  document_id TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de reservas
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar las 3 propiedades
INSERT INTO properties (name, description, color) VALUES
  ('Duplex 1', 'Primer duplex disponible para alquiler temporal', '#3B82F6'),
  ('Duplex 2', 'Segundo duplex disponible para alquiler temporal', '#22C55E'),
  ('Casa Fondo', 'Casa al fondo disponible para alquiler temporal', '#EAB308');

-- Habilitar Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (para empezar sin auth)
CREATE POLICY "Public read properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Public read guests" ON guests FOR SELECT USING (true);
CREATE POLICY "Public insert guests" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update guests" ON guests FOR UPDATE USING (true);
CREATE POLICY "Public read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update bookings" ON bookings FOR UPDATE USING (true);
CREATE POLICY "Public delete bookings" ON bookings FOR DELETE USING (true);
