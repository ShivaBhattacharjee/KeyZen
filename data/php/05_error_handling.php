<?php
function safe_divide($a, $b) {
    if ($b === 0) {
        throw new Exception("Division by zero");
    }
    return $a / $b;
}

try {
    echo safe_divide(10, 0);
} catch (Exception $e) {
    error_log($e->getMessage());
} finally {
    echo "Cleanup\n";
}
?>
