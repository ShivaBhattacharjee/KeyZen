import java.util.List;
import java.util.stream.Collectors;

class StreamsDemo {
    public static void main(String[] args) {
        List<Integer> scores = List.of(62, 71, 85, 90, 54);

        List<Integer> passed = scores.stream()
            .filter(s -> s >= 70)
            .sorted()
            .collect(Collectors.toList());

        double average = scores.stream()
            .mapToInt(Integer::intValue)
            .average()
            .orElse(0.0);

        System.out.println("Passed: " + passed);
        System.out.println("Average: " + average);
    }
}
