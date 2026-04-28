SELECT u.name, o.total, o.created_at
FROM users u
INNER JOIN orders o ON u.id = o.user_id
LEFT JOIN profiles p ON u.id = p.user_id
WHERE o.status = 'completed'
  AND p.country = 'US';
