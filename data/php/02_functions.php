<?php
function clamp($val, $min, $max) {
    return max($min, min($max, $val));
}

$multiplier = 2;
$double = function($n) use ($multiplier) {
    return $n * $multiplier;
};

echo clamp(15, 0, 10);
echo $double(21);
?>
