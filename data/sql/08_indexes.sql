CREATE INDEX idx_products_category_price 
ON products (category_id, price);

CREATE INDEX idx_users_email_lower 
ON users (LOWER(email));

ANALYZE users;
