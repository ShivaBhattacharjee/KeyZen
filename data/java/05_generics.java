class Box<T> {
    private T value;

    void set(T value) {
        this.value = value;
    }

    T get() {
        return value;
    }

    public static void main(String[] args) {
        Box<Integer> scoreBox = new Box<>();
        scoreBox.set(88);

        Box<String> labelBox = new Box<>();
        labelBox.set("Top score");

        System.out.println(labelBox.get() + ": " + scoreBox.get());
    }
}
