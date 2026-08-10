USE dental_clinic;

INSERT INTO appointments (appointment_uid, appointment_code, patient_id, doctor_id, scheduled_date, scheduled_time, scheduled_end_time, type, status, operatory_id) VALUES
('APT-1301', 'AC-1301', 13, 10, '2026-08-08', '10:00:00', '10:30:00', 'Treatment', 'Confirmed', 1),
('APT-1302', 'AC-1302', 13, 11, '2026-08-08', '11:30:00', '12:00:00', 'Checkup', 'Confirmed', 2),
('APT-1303', 'AC-1303', 13, 10, '2026-08-07', '09:00:00', '09:30:00', 'Checkup', 'Completed', 1),
('APT-1304', 'AC-1304', 13, 12, '2026-08-05', '14:00:00', '14:45:00', 'Treatment', 'Completed', 3);

INSERT INTO patient_profiles (user_id, medical_history, allergies, notes) VALUES
(13, 'Routine preventive care', 'None', 'Patient prefers morning visits')
ON DUPLICATE KEY UPDATE medical_history='Routine preventive care';

INSERT INTO cases (case_uid, patient_id, doctor_id, case_type, stage, priority, agent_summary, agent_recommendation) VALUES
('CAS-1301', 13, 10, 'Comprehensive Dental Scaling & Cleaning', 'IN_REVIEW', 'MEDIUM', 'Patient completed initial scaling. Plaque reduction observed. Mild gingival sensitivity.', 'Schedule follow-up fluoride treatment in 2 weeks. Maintain daily flossing routine.'),
('CAS-1302', 13, 11, 'Composite Tooth Filling', 'RESOLVED', 'LOW', 'Upper right molar cavity successfully restored with A2 shade composite resin.', 'Avoid extremely hot or cold beverages for 24 hours. Good oral hygiene maintained.');

INSERT INTO invoices (patient_id, appointment_id, issue_date, amount, status, paid_date) VALUES
(13, 3, '2026-08-07', 1500.00, 'Paid', '2026-08-07'),
(13, 4, '2026-08-05', 2500.00, 'Paid', '2026-08-05'),
(13, 1, '2026-08-08', 800.00, 'Pending', NULL);

INSERT INTO notifications (user_id, user_role, channel, type, title, message, status) VALUES
(13, 'Patient', 'IN_APP', 'APPOINTMENT', 'Appointment Confirmed', 'Your treatment appointment with Dr. Rajesh Kumar is confirmed for Today at 10:00 AM.', 'NEW'),
(13, 'Patient', 'IN_APP', 'CLINIC', 'Treatment Summary Updated', 'Dr. Rajesh Kumar added a new treatment summary for Scaling & Cleaning.', 'NEW'),
(13, 'Patient', 'IN_APP', 'BILLING', 'New Invoice Generated', 'Invoice #3 for ₹800 has been generated for your visit today.', 'NEW');
