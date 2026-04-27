CREATE OR REPLACE VIEW active_user_summaries AS
SELECT u.id, u.name, COUNT(o.id) as order_count
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.active = true
GROUP BY u.id, u.name;
