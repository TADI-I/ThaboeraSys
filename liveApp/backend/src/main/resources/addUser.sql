-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Insert the three roles (ignore if they already exist)
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('sales') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('user') ON CONFLICT (name) DO NOTHING;

INSERT INTO users (
    full_name, 
    email, 
    phone_number, 
    password_hash, 
    role_id,
    created_at,
    updated_at
) VALUES (
    'Tadiwanashe', 
    'tadi@gmail.com', 
    '+27 62 962 2755', 
    '$2b$10$VUmZqxiKEuRctxSFjdGNpe4A6rtQ1ZqQB1y5KLvuyAQerFnOCGrH.', 
    (SELECT id FROM roles WHERE name = 'admin'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);