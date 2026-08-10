USE dental_clinic;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. CLEAN UP TEST ACCOUNTS
DELETE FROM users WHERE email IN ('tejaswini@gmail.com', 'dr.tejaswini@smilecare.com', 'tejaswini.patient@gmail.com', 'tejaswini@123');

-- 2. CREATE 1 SINGLE MAIN ACCOUNT BY YOUR NAME
INSERT INTO users (id, uid, full_name, email, phone, role, password_hash) VALUES
(100, 'AD-1001', 'Tejaswini', 'tejaswini@clinic.com', '9876543210', 'Admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2')
ON DUPLICATE KEY UPDATE full_name='Tejaswini', email='tejaswini@clinic.com', role='Admin';

SET FOREIGN_KEY_CHECKS = 1;

-- 3. ENSURE MYSQL PERMITS IP ADDRESS CONNECTIONS FROM ANY IP (%)
GRANT ALL PRIVILEGES ON dental_clinic.* TO 'dental_user'@'%';
FLUSH PRIVILEGES;

-- 4. DISPLAY THE SINGLE CREATED ACCOUNT
SELECT id, uid, full_name, email, role FROM users WHERE id=100;
