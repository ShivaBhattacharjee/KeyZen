ALTER TABLE users
ADD CONSTRAINT unique_email UNIQUE (email);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL,
    metadata JSONB,
    CHECK (length(action) > 0)
);
