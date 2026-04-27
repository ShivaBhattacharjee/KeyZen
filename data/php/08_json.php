<?php
$config = [
    "theme" => "dark",
    "retries" => 3,
    "endpoints" => ["auth", "data"]
];

$json = json_encode($config, JSON_PRETTY_PRINT);
$decoded = json_decode($json, true);

echo $json;
?>
