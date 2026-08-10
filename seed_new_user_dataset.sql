USE dental_clinic;

-- 1. CREATE NEW PATIENT ACCOUNT
INSERT INTO users (id, uid, full_name, email, phone, dob, gender, address, role, password_hash) VALUES
(32, 'PT-7777', 'Tejaswini Patient Account', 'tejaswini.patient@gmail.com', '9876549999', '1996-08-10', 'Female', 'Hyderabad, India', 'Patient', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lry2')
ON DUPLICATE KEY UPDATE full_name='Tejaswini Patient Account';

-- 2. PATIENT PROFILE
INSERT INTO patient_profiles (user_id, medical_history, allergies, notes) VALUES
(32, 'No chronic conditions', 'None', 'Prefers afternoon appointments')
ON DUPLICATE KEY UPDATE medical_history='No chronic conditions';

-- 3. APPOINTMENTS DATASET
INSERT INTO appointments (appointment_uid, appointment_code, patient_id, doctor_id, scheduled_date, scheduled_time, scheduled_end_time, type, status, operatory_id) VALUES
('APT-7001', 'AC-7001', 32, 10, '2026-08-09', '14:00:00', '14:30:00', 'Checkup',      'Confirmed', 1),
('APT-7002', 'AC-7002', 32, 11, '2026-08-12', '15:30:00', '16:00:00', 'Treatment',    'Confirmed', 2),
('APT-7003', 'AC-7003', 32, 10, '2026-08-05', '11:00:00', '11:30:00', 'Checkup',      'Completed', 1),
('APT-7004', 'AC-7004', 32, 12, '2026-08-02', '10:00:00', '10:45:00', 'Consultation', 'Completed', 3);

-- 4. CLINICAL CASES DATASET
INSERT INTO cases (case_uid, patient_id, doctor_id, case_type, stage, priority, agent_summary, agent_recommendation) VALUES
('CAS-7001', 32, 10, 'Laser Teeth Whitening & Polishing',    'IN_REVIEW', 'MEDIUM', 'Patient requested aesthetic shade brightening. Shade A3 to A1 target.', 'Perform 2 whitening cycles. Apply desensitizing gel after session.'),
('CAS-7002', 32, 11, 'Composite Cavity Restoration',       'RESOLVED',  'LOW',    'Lower left molar cavity cleaned and filled with resin.',               'Regular brushing twice daily. Follow up checkup in 6 months.'),
('CAS-7003', 32, 12, 'Periodontal Gingivitis Prevention',    'NEW',       'MEDIUM', 'Mild bleeding on probing observed during routine checkup.',            'Chlorhexidine mouthwash prescribed for 7 days. Gentle scaling scheduled.');

-- 5. BILLING & INVOICES DATASET
INSERT INTO invoices (patient_id, appointment_id, issue_date, amount, status, paid_date) VALUES
(32, 3, '2026-08-05', 1200.00, 'Paid',    '2026-08-05'),
(32, 4, '2026-08-02', 2800.00, 'Paid',    '2026-08-02'),
(32, 1, '2026-08-09', 4500.00, 'Pending', NULL);

-- 6. NOTIFICATIONS DATASET
INSERT INTO notifications (user_id, user_role, channel, type, title, message, status) VALUES
(32, 'Patient', 'IN_APP', 'APPOINTMENT', 'Appointment Confirmed', 'Your visit with Dr. Rajesh Kumar is scheduled for Tomorrow at 02:00 PM.', 'NEW'),
(32, 'Patient', 'IN_APP', 'CLINIC',      'Case Update',           'Dr. Priya Sharma updated your Composite Cavity Restoration plan.',       'NEW'),
(32, 'Patient', 'IN_APP', 'BILLING',     'Invoice Ready',         'Invoice #7 for ₹4,500 has been generated for your upcoming visit.',       'NEW');
