import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

class FileIoDemo {
    public static void main(String[] args) throws IOException {
        Path path = Path.of("scores.txt");

        List<String> lines = List.of("Ava,82", "Leo,77", "Mia,91");
        Files.write(path, lines);

        List<String> readBack = Files.readAllLines(path);
        for (String line : readBack) {
            System.out.println(line);
        }

        Files.deleteIfExists(path);
    }
}
