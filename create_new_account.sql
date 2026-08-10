USE dental_clinic;

-- 1. Create New Super Admin Account
INSERT INTO users (uid, full_name, email, phone, dob, gender, address, role, password_hash) VALUES
('AD-8888', 'Tejaswini Manne', 'tejaswini@gmail.com', '9876543210', '1998-05-15', 'Female', 'Hyderabad, India', 'Admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2')
ON DUPLICATE KEY UPDATE full_name='Tejaswini Manne', role='Admin';

-- 2. Create New Doctor Account
INSERT INTO users (uid, full_name, email, phone, dob, gender, address, role, password_hash) VALUES
('DC-8888', 'Dr. Tejaswini Manne', 'dr.tejaswini@smilecare.com', '9876543211', '1995-08-20', 'Female', 'Hyderabad, India', 'Doctor', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2')
ON DUPLICATE KEY UPDATE full_name='Dr. Tejaswini Manne', role='Doctor';

-- Verify created accounts
SELECT id, uid, full_name, email, role FROM users WHERE email LIKE '%tejaswini%';
