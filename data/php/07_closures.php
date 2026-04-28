<?php
$numbers = [1, 2, 3, 4, 5];
$factor = 10;

$scaled = array_map(function($n) use ($factor) {
    return $n * $factor;
}, $numbers);

$even = array_filter($numbers, fn($n) => $n % 2 === 0);

print_r($scaled);
?>
