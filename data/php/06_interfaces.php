<?php
interface Logger {
    public function log(string $msg): void;
}

class FileLogger implements Logger {
    public function log(string $msg): void {
        file_put_contents("app.log", $msg . PHP_EOL, FILE_APPEND);
    }
}

$logger = new FileLogger();
$logger->log("Action performed");
?>
