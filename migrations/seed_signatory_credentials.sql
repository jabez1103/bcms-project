-- Seed all SAS Internal Clearance signatories
-- Run AFTER running the migration: add_academic_credentials_to_signatories.sql
-- Assumes user accounts already exist; adjust user_id values to match your DB.
--
-- Format: INSERT credentials for each signatory by matching their user email/name.
-- If you are inserting brand-new users, use the user-accounts admin panel
-- to create them first (with the credentials dropdown), then they will appear here.
--
-- Quick manual seed for existing signatory records (update department + credentials):

-- SAS Internal Clearance Signatories
UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Director, Scholarship and Admission',
      sg.academic_credentials = 'MSc'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Alvin Remolado';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Head, Student Discipline',
      sg.academic_credentials = 'MAEd-EMT'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Jeziel Estapia';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Director, Guidance and Counseling Services',
      sg.academic_credentials = 'EdD'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Maria Jennifer Cubillo';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Director, Health and Wellness Services',
      sg.academic_credentials = 'RN'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Marc Caesar Dumadag';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Director, Sports Development',
      sg.academic_credentials = 'EdD'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Jonathan Oludin';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Director, Culture and Arts Affair',
      sg.academic_credentials = 'MAT-HK'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Nelson Relayosa';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Head, Housing and Residential Services',
      sg.academic_credentials = 'MATVE'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Christian Alibo';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Director, Alumni Relations',
      sg.academic_credentials = 'MENRM'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Sheila Mae Zafra';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Head, Student Publication',
      sg.academic_credentials = 'PhD'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Alberto Labrador';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Head, Student Organizations',
      sg.academic_credentials = 'MATVE'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Jessica Cordovan';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Head, Student Government',
      sg.academic_credentials = 'Atty.'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Norman Torregosa';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Head, FSTLP',
      sg.academic_credentials = 'PhD'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Kindy Juanich';

-- Director, SAS (also appears on Non-Graduating form)
UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Director, Student Development Services',
      sg.academic_credentials = 'PhD'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Patricio Doroy';

-- Non-Graduating Students form signatories
UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Cashier',
      sg.academic_credentials = NULL
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Rebecca Remulta';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Librarian',
      sg.academic_credentials = NULL
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Carmela Sarabello';

UPDATE signatories sg
  JOIN users u ON sg.user_id = u.user_id
  SET sg.department       = 'Dean',
      sg.academic_credentials = 'PhD'
WHERE CONCAT(u.first_name, ' ', u.last_name) = 'Rey Anthony Godmalin';
