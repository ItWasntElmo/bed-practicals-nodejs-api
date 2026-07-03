-- ============================================================
--  Practical 7 & 8 — Polytechnic Library API
--  Creates the polytechnic_library database + Users & Books tables
--  Run this in SSMS (or sqlcmd) before starting the app.
-- ============================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'polytechnic_library')
  CREATE DATABASE polytechnic_library;
GO

USE polytechnic_library;
GO

-- ---------- Users ----------
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
BEGIN
  CREATE TABLE Users (
    user_id       INT           IDENTITY(1,1) PRIMARY KEY,
    username      VARCHAR(255)  NOT NULL UNIQUE,
    passwordHash  VARCHAR(255)  NOT NULL,        -- bcrypt hash, never the plain password
    role          VARCHAR(20)   NOT NULL
                  CHECK (role IN ('member','librarian'))
  );
END
GO

-- ---------- Books ----------
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Books')
BEGIN
  CREATE TABLE Books (
    book_id       INT           IDENTITY(1,1) PRIMARY KEY,
    title         VARCHAR(255)  NOT NULL,
    author        VARCHAR(255)  NOT NULL,
    availability  CHAR(1)       NOT NULL DEFAULT 'Y'
                  CHECK (availability IN ('Y','N'))
  );
END
GO

-- ---------- Seed some books (users register via POST /register) ----------
IF NOT EXISTS (SELECT 1 FROM Books)
BEGIN
  INSERT INTO Books (title, author, availability) VALUES
    ('The Pragmatic Programmer', 'Andrew Hunt',        'Y'),
    ('Clean Code',               'Robert C. Martin',   'Y'),
    ('You Don''t Know JS',       'Kyle Simpson',       'N'),
    ('Eloquent JavaScript',      'Marijn Haverbeke',   'Y');
END
GO
