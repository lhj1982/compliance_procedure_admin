-- Insert default admin user (password: admin)
-- Note: Password is hashed using SHA256
INSERT INTO users (username, password, role, teams) VALUES
('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'admin', 'all');

-- Insert sample teams
INSERT INTO teams (name) VALUES
('Engineering'),
('Legal'),
('HR'),
('Finance'),
('Operations');

-- Insert sample procedures with team_id based file paths
INSERT INTO teams_compliance_procedures (team_id, file_path, status, created_at, updated_at) VALUES
(1, '1_procedure_document.docx', 'pending', NOW(), NOW()),
(2, '2_procedure_document.docx', 'completed', NOW(), NOW()),
(3, '3_procedure_document.docx', 'failed', NOW(), NOW()),
(4, '4_procedure_document.docx', 'returned', NOW(), NOW()),
(5, '5_procedure_document.docx', 'pending', NOW(), NOW());