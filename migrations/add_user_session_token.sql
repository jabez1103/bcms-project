-- Single active session: server-side token must match JWT claim `sid`.
-- (Position omitted so this runs even if `account_status` order differs.)
ALTER TABLE users
  ADD COLUMN session_token VARCHAR(64) NULL DEFAULT NULL;
