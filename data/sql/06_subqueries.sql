SELECT name, price
FROM products
WHERE price > (
    SELECT AVG(price) FROM products
)
AND category_id IN (
    SELECT id FROM categories WHERE active = true
);
