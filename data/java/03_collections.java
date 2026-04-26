import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class CollectionsDemo {
    public static void main(String[] args) {
        List<String> words = new ArrayList<>();
        words.add("focus");
        words.add("rhythm");
        words.add("precision");

        Map<String, Integer> scores = new HashMap<>();
        scores.put("Ava", 82);
        scores.put("Leo", 77);

        for (String word : words) {
            System.out.println(word.toUpperCase());
        }

        scores.forEach((name, wpm) -> System.out.println(name + ": " + wpm));
    }
}
