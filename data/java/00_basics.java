String appName = "KeyZen";
int score = 0;
boolean isActive = true;

double accuracy = 97.5;
System.out.println("App: " + appName);

for (int i = 0; i < 3; i++) {
    score += 10;
    System.out.println("Score: " + score);
}

if (isActive && accuracy >= 95.0) {
    System.out.println("Great typing session");
} else {
    System.out.println("Keep practicing");
}
