-- Migration to update teams_compliance_procedures table for generator project integration
-- This adds submission_data column and renames file_path to document_name for consistency

-- Add submission_data column to store form answers
ALTER TABLE teams_compliance_procedures
ADD COLUMN submission_data JSONB;

-- Rename file_path to document_name for consistency
ALTER TABLE teams_compliance_procedures
RENAME COLUMN file_path TO document_name;

-- Update the column size if needed
ALTER TABLE teams_compliance_procedures
ALTER COLUMN document_name TYPE VARCHAR(255);

-- Add unique constraint to ensure one team can only have one document
ALTER TABLE teams_compliance_procedures
ADD CONSTRAINT unique_team_procedure UNIQUE (team_id);