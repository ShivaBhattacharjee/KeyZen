SELECT id, name, email
FROM users
WHERE active = true
  AND last_login > '2024-01-01'
ORDER BY name ASC
LIMIT 10;
