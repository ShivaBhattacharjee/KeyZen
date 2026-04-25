class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a noise."

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed

    def speak(self):
        return f"{self.name} barks!"

dog = Dog("Rex", "Shepherd")
print(dog.speak())
print(isinstance(dog, Animal))
