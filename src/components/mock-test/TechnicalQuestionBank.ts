import { Question } from './QuestionBank';

// Large bank of technical questions covering DSA and OOP
export const technicalQuestionBank: Question[] = [
  // Data Structures Questions
  {
    id: 1,
    question: "What is the time complexity of searching for an element in a balanced binary search tree?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: "O(log n)",
    explanation: "In a balanced binary search tree, each comparison eliminates roughly half of the remaining tree, resulting in a logarithmic time complexity."
  },
  {
    id: 2,
    question: "Which data structure operates on a LIFO (Last In, First Out) principle?",
    options: ["Queue", "Stack", "Linked List", "Hash Table"],
    correctAnswer: "Stack",
    explanation: "A stack follows the Last In, First Out principle where the last element added is the first one to be removed."
  },
  {
    id: 3,
    question: "In a min-heap, which element is always at the root?",
    options: ["Largest element", "Smallest element", "Median element", "Most recently added element"],
    correctAnswer: "Smallest element",
    explanation: "In a min-heap, the smallest element is always at the root, and each parent node is smaller than or equal to its children."
  },
  {
    id: 4,
    question: "What is the worst-case time complexity of quicksort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: "O(n²)",
    explanation: "The worst-case for quicksort occurs when the pivot selection consistently results in highly unbalanced partitions, leading to a quadratic time complexity."
  },
  {
    id: 5,
    question: "What data structure would you use to implement a breadth-first search?",
    options: ["Stack", "Queue", "Array", "Linked List"],
    correctAnswer: "Queue",
    explanation: "BFS uses a queue to keep track of nodes to visit, allowing it to explore all nodes at the current depth before moving to the next level."
  },
  {
    id: 6,
    question: "Which of the following is NOT a characteristic of a hash table?",
    options: ["O(1) average-case lookup", "Built-in ordering of elements", "Uses a hash function", "Handles collisions"],
    correctAnswer: "Built-in ordering of elements",
    explanation: "Hash tables do not maintain any inherent ordering of elements. The position of an element is determined by its hash value."
  },
  {
    id: 7,
    question: "What is the space complexity of a recursive fibonacci implementation without memoization?",
    options: ["O(1)", "O(log n)", "O(n)", "O(2^n)"],
    correctAnswer: "O(n)",
    explanation: "The space complexity is O(n) due to the maximum depth of the recursion call stack when calculating fib(n)."
  },
  {
    id: 8,
    question: "In an AVL tree, what is the maximum allowed difference in height between two child subtrees?",
    options: ["0", "1", "2", "No limit"],
    correctAnswer: "1",
    explanation: "An AVL tree maintains a balance factor between -1 and 1, meaning the height difference between left and right subtrees cannot exceed 1."
  },
  {
    id: 9,
    question: "Which algorithm would be most efficient for finding the shortest path in an unweighted graph?",
    options: ["Depth-First Search", "Breadth-First Search", "Dijkstra's Algorithm", "Bellman-Ford Algorithm"],
    correctAnswer: "Breadth-First Search",
    explanation: "BFS guarantees the shortest path in terms of the number of edges in an unweighted graph because it explores nodes level by level."
  },
  {
    id: 10,
    question: "What is the time complexity of inserting an element at the end of an array list (like Java's ArrayList or Python's list)?",
    options: ["O(1) amortized", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: "O(1) amortized",
    explanation: "While occasional resizing takes O(n) time, the amortized time complexity for insertion at the end is O(1) across many operations."
  },
  
  // OOP Questions
  {
    id: 11,
    question: "Which OOP principle describes the ability of a class to inherit properties and behaviors from another class?",
    options: ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"],
    correctAnswer: "Inheritance",
    explanation: "Inheritance allows a class to inherit attributes and methods from another class, promoting code reuse and establishing a relationship between a parent class and its children."
  },
  {
    id: 12,
    question: "What is Encapsulation in OOP?",
    options: [
      "The process of hiding implementation details and exposing only the interface", 
      "The ability of an object to take many forms", 
      "The process of creating an instance of a class", 
      "The ability to override methods in subclasses"
    ],
    correctAnswer: "The process of hiding implementation details and exposing only the interface",
    explanation: "Encapsulation is the bundling of data with the methods that operate on that data, restricting direct access to an object's components and protecting the integrity of the data."
  },
  {
    id: 13,
    question: "What is method overloading?",
    options: [
      "Defining a method in a subclass with the same name as in the parent class", 
      "Defining multiple methods in the same class with the same name but different parameters", 
      "Hiding the implementation details of a method", 
      "Changing the behavior of a method at runtime"
    ],
    correctAnswer: "Defining multiple methods in the same class with the same name but different parameters",
    explanation: "Method overloading allows a class to have multiple methods with the same name but different parameter lists, resolved at compile time based on the method signature."
  },
  {
    id: 14,
    question: "Which of the following best describes Polymorphism?",
    options: [
      "Ability to define multiple classes that can be used interchangeably", 
      "Ability to hide implementation details of a class", 
      "Ability to inherit methods from a parent class", 
      "Ability to restrict access to class members"
    ],
    correctAnswer: "Ability to define multiple classes that can be used interchangeably",
    explanation: "Polymorphism allows objects of different classes to be treated as objects of a common superclass, with the appropriate method implementation being called based on the actual object type."
  },
  {
    id: 15,
    question: "What is a constructor in OOP?",
    options: [
      "A method that destroys objects", 
      "A special method that is executed when an object is created", 
      "A method that copies one object to another", 
      "A method that checks if two objects are equal"
    ],
    correctAnswer: "A special method that is executed when an object is created",
    explanation: "A constructor is a special method with the same name as the class that is automatically called when an object is instantiated, typically used to initialize object attributes."
  },
  {
    id: 16,
    question: "What is the purpose of the 'interface' in object-oriented programming?",
    options: [
      "To hide the implementation details of a class", 
      "To define a contract that implementing classes must follow", 
      "To create instances of abstract classes", 
      "To prevent inheritance"
    ],
    correctAnswer: "To define a contract that implementing classes must follow",
    explanation: "An interface defines a contract consisting of method signatures that implementing classes must provide, enabling abstraction and ensuring that classes fulfill certain expected behaviors."
  },
  {
    id: 17,
    question: "What is an abstract class?",
    options: [
      "A class that cannot be instantiated and may contain abstract methods", 
      "A class that can be instantiated but not inherited from", 
      "A class that contains only static methods", 
      "A class with no methods or attributes"
    ],
    correctAnswer: "A class that cannot be instantiated and may contain abstract methods",
    explanation: "An abstract class cannot be instantiated directly and may contain abstract methods (without implementation) that must be implemented by subclasses, providing a base for common functionality."
  },
  {
    id: 18,
    question: "What does the 'final' keyword (or equivalent in other languages) mean when applied to a class?",
    options: [
      "The class cannot be instantiated", 
      "The class cannot be inherited from", 
      "The class methods cannot be overridden", 
      "The class attributes cannot be modified"
    ],
    correctAnswer: "The class cannot be inherited from",
    explanation: "When a class is declared as final, it cannot be subclassed/extended, preventing inheritance and ensuring that the class behavior cannot be modified by subclassing."
  },
  {
    id: 19,
    question: "What is the difference between composition and inheritance?",
    options: [
      "Inheritance is a 'has-a' relationship while composition is an 'is-a' relationship", 
      "Composition is a 'has-a' relationship while inheritance is an 'is-a' relationship", 
      "Both represent 'has-a' relationships but with different levels of coupling", 
      "Both represent 'is-a' relationships but with different visibility modifiers"
    ],
    correctAnswer: "Composition is a 'has-a' relationship while inheritance is an 'is-a' relationship",
    explanation: "Inheritance establishes an 'is-a' relationship (a Car is a Vehicle), while composition establishes a 'has-a' relationship (a Car has a Engine), providing flexibility and reducing coupling."
  },
  {
    id: 20,
    question: "What is the Liskov Substitution Principle?",
    options: [
      "Objects should be replaceable with their subtypes without affecting program correctness", 
      "Every class should have only one reason to change", 
      "Classes should be open for extension but closed for modification", 
      "Classes should depend on abstractions, not concrete implementations"
    ],
    correctAnswer: "Objects should be replaceable with their subtypes without affecting program correctness",
    explanation: "The Liskov Substitution Principle states that objects in a program should be replaceable with instances of their subtypes without altering the correctness of the program, ensuring behavior consistency."
  },
  
  // Additional Data Structures and Algorithms Questions
  {
    id: 21,
    question: "What is the time complexity of insertion sort in the worst case?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
    correctAnswer: "O(n²)",
    explanation: "In the worst case (reversed array), insertion sort compares and shifts each element with all previous elements, resulting in O(n²) time complexity."
  },
  {
    id: 22,
    question: "Which of the following data structures is best suited for implementing a priority queue?",
    options: ["Array", "Linked List", "Heap", "Hash Table"],
    correctAnswer: "Heap",
    explanation: "A heap provides efficient O(log n) operations for insertion and removal of the highest priority element, making it ideal for priority queue implementations."
  },
  {
    id: 23,
    question: "In a graph, what does a topological sort produce?",
    options: ["A cyclic ordering of vertices", "A linear ordering of vertices", "A tree structure", "A minimum spanning tree"],
    correctAnswer: "A linear ordering of vertices",
    explanation: "A topological sort of a directed acyclic graph (DAG) produces a linear ordering of vertices such that for every directed edge (u, v), vertex u comes before v in the ordering."
  },
  {
    id: 24,
    question: "What is the key advantage of a B-tree over a binary search tree?",
    options: ["Simpler implementation", "Better worst-case performance", "Better handling of sequential access", "Lower memory usage"],
    correctAnswer: "Better worst-case performance",
    explanation: "B-trees maintain balance and have a larger branching factor, which results in better worst-case performance especially for disk-based storage systems by reducing the tree height."
  },
  {
    id: 25,
    question: "What is the space complexity of a breadth-first search on a graph with V vertices and E edges?",
    options: ["O(1)", "O(V)", "O(E)", "O(V+E)"],
    correctAnswer: "O(V)",
    explanation: "In BFS, we might need to store all vertices in the queue in the worst case, resulting in a space complexity of O(V)."
  },
  {
    id: 26,
    question: "What is the purpose of a sentinel node in a linked list?",
    options: ["To mark the end of the list", "To simplify boundary conditions", "To improve search efficiency", "To reduce memory usage"],
    correctAnswer: "To simplify boundary conditions",
    explanation: "A sentinel node is a dummy node that simplifies boundary conditions by eliminating the need for special-case handling of empty lists or operations at the beginning/end of the list."
  },
  {
    id: 27,
    question: "Which of the following sorting algorithms is not comparison-based?",
    options: ["Merge sort", "Quick sort", "Radix sort", "Heap sort"],
    correctAnswer: "Radix sort",
    explanation: "Radix sort doesn't compare elements directly; instead, it sorts by processing individual digits or characters, allowing it to achieve a linear time complexity for certain inputs."
  },
  {
    id: 28,
    question: "What is the worst-case time complexity of finding an element in a hash table?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: "O(n)",
    explanation: "In the worst case, when all elements hash to the same bucket and form a linked list, finding an element would require traversing all elements, resulting in O(n) time complexity."
  },
  {
    id: 29,
    question: "Which data structure is most appropriate for implementing a 'back' button in a web browser?",
    options: ["Queue", "Stack", "Heap", "Tree"],
    correctAnswer: "Stack",
    explanation: "A stack follows the Last-In-First-Out (LIFO) principle, which matches the behavior of a 'back' button where the most recently visited page is returned to first."
  },
  {
    id: 30,
    question: "What is the time complexity of the Floyd-Warshall algorithm for finding all-pairs shortest paths?",
    options: ["O(V²)", "O(V³)", "O(V × E)", "O(E log V)"],
    correctAnswer: "O(V³)",
    explanation: "The Floyd-Warshall algorithm uses three nested loops over all vertices, resulting in a time complexity of O(V³), where V is the number of vertices in the graph."
  },
  
  // Additional OOP questions
  {
    id: 31,
    question: "What is method overriding in OOP?",
    options: [
      "Defining a new method in a subclass", 
      "Providing a different implementation for a method inherited from a parent class", 
      "Defining multiple methods with the same name in the same class", 
      "Hiding a method from being accessed outside the class"
    ],
    correctAnswer: "Providing a different implementation for a method inherited from a parent class",
    explanation: "Method overriding occurs when a subclass provides a specific implementation of a method that is already defined in its parent class, allowing for polymorphic behavior."
  },
  {
    id: 32,
    question: "What is the primary purpose of the 'protected' access modifier?",
    options: [
      "To allow access only within the same class", 
      "To allow access within the same class and its subclasses", 
      "To allow access from any class in the same package", 
      "To allow access from any class in the application"
    ],
    correctAnswer: "To allow access within the same class and its subclasses",
    explanation: "The protected access modifier restricts access to members within the same class, its subclasses, and sometimes within the same package (depending on the language), facilitating inheritance while maintaining encapsulation."
  },
  {
    id: 33,
    question: "What design pattern would you use to create objects without specifying their concrete classes?",
    options: ["Singleton", "Factory Method", "Observer", "Decorator"],
    correctAnswer: "Factory Method",
    explanation: "The Factory Method pattern defines an interface for creating objects but lets subclasses decide which classes to instantiate, allowing object creation without exposing the instantiation logic."
  },
  {
    id: 34,
    question: "What is the Single Responsibility Principle?",
    options: [
      "A class should have only one reason to change", 
      "A method should do only one thing", 
      "Software entities should be open for extension but closed for modification", 
      "High-level modules should not depend on low-level modules"
    ],
    correctAnswer: "A class should have only one reason to change",
    explanation: "The Single Responsibility Principle states that a class should have only one reason to change, meaning it should have only one job or responsibility, promoting more maintainable and modular code."
  },
  {
    id: 35,
    question: "What is the difference between an abstract class and an interface?",
    options: [
      "An abstract class can have implementations while an interface cannot", 
      "An interface can be instantiated while an abstract class cannot", 
      "A class can implement multiple abstract classes but only one interface", 
      "Abstract classes are used for loose coupling while interfaces are for tight coupling"
    ],
    correctAnswer: "An abstract class can have implementations while an interface cannot",
    explanation: "An abstract class can provide both abstract method declarations and method implementations, while interfaces (traditionally) only declare methods without implementations, though modern languages have relaxed this restriction."
  },
  {
    id: 36,
    question: "What is the Dependency Inversion Principle?",
    options: [
      "High-level modules should depend on abstractions, not concrete implementations", 
      "Classes should be open for extension but closed for modification", 
      "A class should have only one reason to change", 
      "Objects should be replaceable with their subtypes without affecting program correctness"
    ],
    correctAnswer: "High-level modules should depend on abstractions, not concrete implementations",
    explanation: "The Dependency Inversion Principle states that high-level modules should not depend on low-level modules but both should depend on abstractions, reducing coupling and increasing flexibility."
  },
  {
    id: 37,
    question: "What is the purpose of the Decorator pattern?",
    options: [
      "To create new objects without directly constructing them", 
      "To attach additional responsibilities to objects dynamically", 
      "To define a one-to-many dependency between objects", 
      "To ensure a class has only one instance"
    ],
    correctAnswer: "To attach additional responsibilities to objects dynamically",
    explanation: "The Decorator pattern allows behavior to be added to individual objects dynamically without affecting the behavior of other objects from the same class, providing a flexible alternative to subclassing."
  },
  {
    id: 38,
    question: "What is the purpose of the 'static' keyword in OOP?",
    options: [
      "To define a method that cannot be overridden", 
      "To define a variable that is shared among all instances of a class", 
      "To prevent a class from being inherited", 
      "To mark a class as abstract"
    ],
    correctAnswer: "To define a variable that is shared among all instances of a class",
    explanation: "The static keyword is used to define class members (variables or methods) that belong to the class itself rather than to instances, so they are shared among all instances of the class."
  },
  {
    id: 39,
    question: "What is the Observer pattern used for?",
    options: [
      "Creating objects without specifying their concrete classes", 
      "Defining a family of algorithms and making them interchangeable", 
      "Defining a one-to-many dependency between objects", 
      "Ensuring a class has only one instance"
    ],
    correctAnswer: "Defining a one-to-many dependency between objects",
    explanation: "The Observer pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically, commonly used in event handling systems."
  },
  {
    id: 40,
    question: "What is the difference between association, aggregation, and composition in OOP?",
    options: [
      "They represent increasingly tighter coupling between objects", 
      "They represent increasingly looser coupling between objects", 
      "They are different names for the same concept", 
      "They represent different types of inheritance"
    ],
    correctAnswer: "They represent increasingly tighter coupling between objects",
    explanation: "Association is a general relationship, aggregation is a 'has-a' relationship where parts can exist independently, and composition is a stronger 'contains-a' relationship where parts cannot exist without the whole, representing increasingly tighter coupling."
  }
];

export const getRandomTechnicalQuestions = (count: number): Question[] => {
  const shuffled = [...technicalQuestionBank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}; 