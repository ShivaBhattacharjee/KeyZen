SELECT category,
       COUNT(*) as total_items,
       AVG(price) as avg_price,
       MAX(price) as max_price
FROM products
GROUP BY category
HAVING COUNT(*) > 5
ORDER BY avg_price DESC;
