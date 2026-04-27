<?php
try {
    $pdo = new PDO("mysql:host=localhost;dbname=test", "user", "pass");
    $stmt = $pdo->prepare("SELECT * FROM users WHERE active = ?");
    $stmt->execute([1]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
?>
