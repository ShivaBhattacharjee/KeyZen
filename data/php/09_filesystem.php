<?php
$path = "config.txt";
if (file_exists($path)) {
    $content = file_get_contents($path);
    echo "Size: " . strlen($content);
} else {
    file_put_contents($path, "default settings");
}
?>
