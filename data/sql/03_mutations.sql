INSERT INTO users (name, email, created_at)
VALUES ('John Doe', 'john@example.com', NOW());

UPDATE users
SET active = false,
    updated_at = NOW()
WHERE id = 42;

DELETE FROM sessions
WHERE expires_at < NOW();
