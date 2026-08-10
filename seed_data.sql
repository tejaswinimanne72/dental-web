USE dental_clinic;

-- 1. CLINIC SETTINGS
UPDATE clinic_settings SET
  clinic_name = 'SmileCare Dental Clinic',
  clinic_phone = '+91-9876543210',
  clinic_email = 'info@smilecare.com',
  clinic_address = '42, MG Road, Hyderabad, Telangana - 500001'
WHERE id = 1;

-- 2. USERS (Doctors + Patients)
INSERT IGNORE INTO users (id, uid, full_name, email, phone, dob, gender, role, password_hash) VALUES
(10, 'DC-1001', 'Dr. Rajesh Kumar',    'rajesh.kumar@smilecare.com',    '9876501001', '1985-03-15', 'Male',   'Doctor',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2'),
(11, 'DC-1002', 'Dr. Priya Sharma',    'priya.sharma@smilecare.com',    '9876501002', '1990-07-22', 'Female', 'Doctor',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2'),
(12, 'DC-1003', 'Dr. Anil Reddy',      'anil.reddy@smilecare.com',      '9876501003', '1982-11-08', 'Male',   'Doctor',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2'),
(20, 'PT-2001', 'Amit Patel',          'amit.patel@gmail.com',          '9876502001', '1995-05-10', 'Male',   'Patient', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2'),
(21, 'PT-2002', 'Sunita Verma',        'sunita.verma@gmail.com',        '9876502002', '1988-09-18', 'Female', 'Patient', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2'),
(22, 'PT-2003', 'Kiran Mehta',         'kiran.mehta@gmail.com',         '9876502003', '2000-01-25', 'Male',   'Patient', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2'),
(23, 'PT-2004', 'Deepa Nair',          'deepa.nair@gmail.com',          '9876502004', '1992-06-14', 'Female', 'Patient', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2'),
(24, 'PT-2005', 'Rahul Gupta',         'rahul.gupta@gmail.com',         '9876502005', '1998-12-03', 'Male',   'Patient', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2'),
(25, 'PT-2006', 'Meena Iyer',          'meena.iyer@gmail.com',          '9876502006', '1975-04-20', 'Female', 'Patient', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2'),
(26, 'PT-2007', 'Suresh Babu',         'suresh.babu@gmail.com',         '9876502007', '1980-08-07', 'Male',   'Patient', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2'),
(27, 'PT-2008', 'Lavanya Singh',       'lavanya.singh@gmail.com',       '9876502008', '2002-02-28', 'Female', 'Patient', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2');

-- 3. PATIENT PROFILES
INSERT IGNORE INTO patient_profiles (user_id, medical_history, allergies, notes) VALUES
(20, 'No major illness', 'Penicillin', 'Regular checkup patient'),
(21, 'Hypertension', 'None', 'Needs gentle treatment'),
(22, 'Diabetes Type 2', 'Aspirin', 'Blood sugar monitoring required'),
(23, 'None', 'Latex', 'Latex-free gloves required'),
(24, 'Asthma', 'None', 'Inhaler available'),
(25, 'Thyroid condition', 'None', 'On thyroid medication'),
(26, 'Heart condition', 'Ibuprofen', 'Consult physician before surgery'),
(27, 'None', 'None', 'First-time patient');

-- 4. OPERATORIES
INSERT IGNORE INTO operatories (id, name, is_active) VALUES
(1, 'Room 1', 1),
(2, 'Room 2', 1),
(3, 'Room 3', 1);

-- 5. APPOINTMENTS
INSERT IGNORE INTO appointments (id, appointment_uid, appointment_code, patient_id, doctor_id, scheduled_date, scheduled_time, scheduled_end_time, type, status, operatory_id) VALUES
(1,  'APT-1001', 'AC-1001', 20, 10, '2026-08-08', '09:00:00', '09:30:00', 'Checkup',      'Confirmed', 1),
(2,  'APT-1002', 'AC-1002', 21, 11, '2026-08-08', '09:30:00', '10:00:00', 'Checkup',      'Confirmed', 2),
(3,  'APT-1003', 'AC-1003', 22, 10, '2026-08-08', '10:00:00', '10:45:00', 'Treatment',    'Confirmed', 1),
(4,  'APT-1004', 'AC-1004', 23, 12, '2026-08-08', '10:30:00', '11:00:00', 'Consultation', 'Confirmed', 3),
(5,  'APT-1005', 'AC-1005', 24, 11, '2026-08-08', '11:00:00', '11:30:00', 'Treatment',    'Confirmed', 2),
(6,  'APT-1006', 'AC-1006', 25, 10, '2026-08-08', '11:30:00', '12:00:00', 'Checkup',      'Completed', 1),
(7,  'APT-1007', 'AC-1007', 26, 12, '2026-08-08', '14:00:00', '14:30:00', 'Treatment',    'Confirmed', 3),
(8,  'APT-1008', 'AC-1008', 27, 11, '2026-08-08', '14:30:00', '15:00:00', 'Consultation', 'Confirmed', 2),
(9,  'APT-1009', 'AC-1009', 20, 10, '2026-08-07', '09:00:00', '09:30:00', 'Checkup',      'Completed', 1),
(10, 'APT-1010', 'AC-1010', 21, 11, '2026-08-07', '10:00:00', '10:30:00', 'Treatment',    'Completed', 2),
(11, 'APT-1011', 'AC-1011', 22, 12, '2026-08-06', '09:00:00', '09:45:00', 'Treatment',    'Completed', 3),
(12, 'APT-1012', 'AC-1012', 23, 10, '2026-08-06', '11:00:00', '11:30:00', 'Checkup',      'Completed', 1);

-- 6. CASES
INSERT IGNORE INTO cases (id, case_uid, patient_id, doctor_id, case_type, stage, priority, agent_summary) VALUES
(1, 'CAS-1001', 20, 10, 'Routine Dental Checkup', 'NEW',       'LOW',    'Patient has mild plaque buildup. Scheduled cleaning.'),
(2, 'CAS-1002', 21, 11, 'Tooth Pain Treatment',    'IN_REVIEW', 'MEDIUM', 'Upper molar pain. Possible cavity. X-ray ordered.'),
(3, 'CAS-1003', 22, 10, 'Root Canal Treatment',    'IN_REVIEW', 'HIGH',   'Root canal in progress. Session 2 pending.'),
(4, 'CAS-1004', 23, 12, 'Orthodontic Braces',     'NEW',       'MEDIUM', 'Braces fitted. Monthly tightening scheduled.'),
(5, 'CAS-1005', 24, 11, 'Cavity Filling',          'RESOLVED',  'LOW',    'Two cavities filled. Recovery normal.'),
(6, 'CAS-1006', 25, 10, 'Gum Disease Treatment',   'IN_REVIEW', 'MEDIUM', 'Moderate gingivitis. Deep cleaning recommended.'),
(7, 'CAS-1007', 26, 12, 'Tooth Extraction',        'NEW',       'HIGH',   'Wisdom tooth extraction scheduled.'),
(8, 'CAS-1008', 27, 11, 'Teeth Whitening',         'NEW',       'LOW',    'Professional whitening consultation done.');

-- 7. PROCEDURE CATALOG
INSERT IGNORE INTO procedure_catalog (id, name, code, default_price) VALUES
(1,  'Dental Checkup',            'CHK001', 500.00),
(2,  'X-Ray (Single)',            'XRY001', 300.00),
(3,  'Teeth Cleaning',            'CLN001', 800.00),
(4,  'Cavity Filling (Composite)','FIL001',1500.00),
(5,  'Root Canal Treatment',      'RCT001', 6000.00),
(6,  'Tooth Extraction (Simple)', 'EXT001', 1000.00),
(7,  'Tooth Extraction (Complex)','EXT002', 2500.00),
(8,  'Braces (Full)',             'ORT001', 25000.00),
(9,  'Teeth Whitening',          'WHT001', 5000.00),
(10, 'Crown (Ceramic)',          'CRW001', 8000.00),
(11, 'Deep Cleaning (Scaling)',  'SCL001', 2000.00),
(12, 'Fluoride Treatment',       'FLR001', 400.00);

-- 8. INVOICES
INSERT IGNORE INTO invoices (id, patient_id, appointment_id, issue_date, amount, status, paid_date) VALUES
(1, 20, 9,  '2026-08-07', 1300.00, 'Paid',    '2026-08-07'),
(2, 21, 10, '2026-08-07', 1500.00, 'Paid',    '2026-08-07'),
(3, 22, 11, '2026-08-06', 6000.00, 'Pending', NULL),
(4, 23, 12, '2026-08-06',  800.00, 'Paid',    '2026-08-06'),
(5, 24, 5,  '2026-08-08', 1500.00, 'Pending', NULL),
(6, 25, 6,  '2026-08-08', 2800.00, 'Paid',    '2026-08-08'),
(7, 20, 1,  '2026-08-08',  500.00, 'Pending', NULL),
(8, 26, 7,  '2026-08-08', 2500.00, 'Pending', NULL);

-- 9. INVOICE ITEMS
INSERT IGNORE INTO invoice_items (invoice_id, description, qty, unit_price, amount) VALUES
(1, 'Dental Checkup',     1, 500.00,  500.00),
(1, 'Teeth Cleaning',     1, 800.00,  800.00),
(2, 'Cavity Filling',     1, 1500.00, 1500.00),
(3, 'Root Canal - Sess 1',1, 3000.00, 3000.00),
(3, 'Root Canal - Sess 2',1, 3000.00, 3000.00),
(4, 'Dental Checkup',     1, 500.00,  500.00),
(4, 'X-Ray',              1, 300.00,  300.00),
(5, 'Cavity Filling',     1, 1500.00, 1500.00),
(6, 'Deep Cleaning',      1, 2000.00, 2000.00),
(6, 'Fluoride Treatment', 1, 400.00,  400.00),
(6, 'X-Ray',              1, 300.00,  300.00),
(6, 'Dental Checkup',     1, 100.00,  100.00),
(7, 'Dental Checkup',     1, 500.00,  500.00),
(8, 'Tooth Extraction',   1, 2500.00, 2500.00);

-- 10. INVENTORY ITEMS
INSERT IGNORE INTO inventory_items (id, item_code, name, category, stock, reorder_threshold, expiry_date, status) VALUES
(1,  'INV001', 'Dental Gloves (Box)',        'PPE',          45,  10, '2027-12-31', 'Healthy'),
(2,  'INV002', 'Face Masks (Box)',           'PPE',          30,  10, '2027-06-30', 'Healthy'),
(3,  'INV003', 'Composite Resin (A2)',       'Restorative',  12,   5, '2027-03-31', 'Healthy'),
(4,  'INV004', 'Local Anesthetic (Lidocaine)','Anesthetic',  20,   8, '2026-12-31', 'Healthy'),
(5,  'INV005', 'Dental Floss (Roll)',        'Preventive',   50,  15, '2028-01-31', 'Healthy'),
(6,  'INV006', 'Dental X-Ray Films',        'Diagnostic',    8,   5, '2026-11-30', 'Low Stock'),
(7,  'INV007', 'Suture Thread',             'Surgical',     15,   5, '2027-08-31', 'Healthy'),
(8,  'INV008', 'Fluoride Varnish',          'Preventive',   10,   4, '2027-02-28', 'Healthy'),
(9,  'INV009', 'Dental Cement',             'Restorative',   6,   3, '2026-10-31', 'Low Stock'),
(10, 'INV010', 'Teeth Whitening Gel',       'Cosmetic',     20,   5, '2027-05-31', 'Healthy'),
(11, 'INV011', 'Orthodontic Brackets',      'Orthodontic',  100, 20, '2028-12-31', 'Healthy'),
(12, 'INV012', 'Saliva Ejectors (Pack)',    'General',      80,  20, '2028-06-30', 'Healthy'),
(13, 'INV013', 'Bib Clips',                'General',      40,  10, '2030-01-01', 'Healthy'),
(14, 'INV014', 'Root Canal Files',         'Endodontic',   25,   8, '2028-12-31', 'Healthy'),
(15, 'INV015', 'Extraction Forceps',       'Surgical',      5,   2, '2030-01-01', 'Healthy');

-- 11. VENDORS
INSERT IGNORE INTO vendors (id, name, phone, email) VALUES
(1, 'MediSupply India',     '9000011111', 'orders@medisupply.in'),
(2, 'DentoCare Supplies',   '9000022222', 'anita@dentocare.com'),
(3, 'OrthoWorld India',     '9000033333', 'pradeep@orthoworld.in');

-- 12. REVENUE ANALYTICS
INSERT IGNORE INTO revenue_analytics_daily (usage_date, doctor_id, total_revenue, appointment_count) VALUES
('2026-08-01', 10, 8500.00,  6),
('2026-08-01', 11, 6000.00,  5),
('2026-08-01', 12, 4500.00,  4),
('2026-08-02', 10, 9000.00,  7),
('2026-08-02', 11, 7500.00,  6),
('2026-08-03', 12, 5000.00,  4),
('2026-08-04', 10, 12000.00, 8),
('2026-08-04', 11, 8000.00,  6),
('2026-08-05', 12, 6500.00,  5),
('2026-08-06', 10, 9800.00,  7),
('2026-08-07', 11, 11000.00, 8),
('2026-08-08', 10, 7800.00,  6);

-- 13. NOTIFICATIONS
INSERT IGNORE INTO notifications (id, user_id, user_role, channel, type, title, message, status) VALUES
(1, 8,  'Admin',  'IN_APP', 'APPOINTMENT', 'New Appointment Booked',    'Amit Patel booked appointment for 08-Aug 9:00 AM',         'NEW'),
(2, 8,  'Admin',  'IN_APP', 'PAYMENT',     'Payment Received',          'Invoice #1 paid by Amit Patel - ₹1,300',                   'NEW'),
(3, 8,  'Admin',  'IN_APP', 'INVENTORY',   'Low Stock Alert',           'Dental X-Ray Films running low (8 remaining)',             'NEW'),
(4, 8,  'Admin',  'IN_APP', 'INVENTORY',   'Low Stock Alert',           'Dental Cement running low (6 remaining)',                  'NEW'),
(5, 10, 'Doctor', 'IN_APP', 'APPOINTMENT', 'Appointment Reminder',      'You have 5 appointments scheduled for today',              'NEW'),
(6, 11, 'Doctor', 'IN_APP', 'APPOINTMENT', 'New Patient Assigned',      'Lavanya Singh assigned for whitening consultation 2:30 PM','NEW'),
(7, 20, 'Patient','IN_APP', 'APPOINTMENT', 'Appointment Confirmed',     'Your appointment on 08-Aug at 9:00 AM is confirmed',       'NEW'),
(8, 21, 'Patient','IN_APP', 'APPOINTMENT', 'Reminder',                 'Reminder: Appointment tomorrow at 9:30 AM',                'NEW');
