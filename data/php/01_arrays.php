<?php
$scores = [
    "alice" => 92,
    "bob" => 85,
    "eve" => 97
];

foreach ($scores as $name => $score) {
    if ($score >= 90) {
        echo "$name passed with $score\n";
    }
}

$nums = [3, 1, 4, 1, 5];
sort($nums);
print_r($nums);
?>
