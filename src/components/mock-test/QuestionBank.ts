export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Large bank of questions
export const questionBank: Question[] = [
  // Original 30 questions
  {
    id: 1,
    question: "If a train travels at 120 km/h for 2.5 hours, how far does it go?",
    options: ["300 km", "250 km", "275 km", "325 km"],
    correctAnswer: "300 km",
    explanation: "Distance = Speed × Time = 120 × 2.5 = 300 km"
  },
  {
    id: 2,
    question: "In a series of numbers: 2, 4, 8, 16, ___, what comes next?",
    options: ["24", "32", "28", "20"],
    correctAnswer: "32",
    explanation: "Each number is multiplied by 2: 2×2=4, 4×2=8, 8×2=16, 16×2=32"
  },
  {
    id: 3,
    question: "If 3 workers can complete a task in 6 days, how many days will it take 2 workers to complete the same task?",
    options: ["8 days", "9 days", "7 days", "10 days"],
    correctAnswer: "9 days",
    explanation: "Using inverse proportion: 3×6 = 2×x, where x = 9 days"
  },
  {
    id: 4,
    question: "What is the next number in the sequence: 1, 3, 6, 10, 15, ___?",
    options: ["18", "21", "20", "19"],
    correctAnswer: "21",
    explanation: "The difference between consecutive numbers increases by 1: +2, +3, +4, +5, +6"
  },
  {
    id: 5,
    question: "If a rectangle's length is increased by 20% and width decreased by 20%, what happens to its area?",
    options: ["Increases by 4%", "Decreases by 4%", "Stays the same", "Decreases by 20%"],
    correctAnswer: "Decreases by 4%",
    explanation: "New area = 1.2L × 0.8W = 0.96LW, which is 4% less than original"
  },
  {
    id: 6,
    question: "In a group of 50 people, 30 like coffee and 20 like tea. If 10 like both, how many like neither?",
    options: ["5", "10", "15", "20"],
    correctAnswer: "10",
    explanation: "Using set theory: 50 - (30 + 20 - 10) = 10"
  },
  {
    id: 7,
    question: "If 2^x = 32, what is x?",
    options: ["4", "5", "6", "7"],
    correctAnswer: "5",
    explanation: "32 = 2^5, therefore x = 5"
  },
  {
    id: 8,
    question: "A clock shows 3:15. What is the angle between the hour and minute hands?",
    options: ["7.5°", "15°", "22.5°", "30°"],
    correctAnswer: "7.5°",
    explanation: "At 3:15, hour hand is at 97.5° and minute hand at 90°, difference is 7.5°"
  },
  {
    id: 9,
    question: "If a number is increased by 25% and then decreased by 20%, what is the net change?",
    options: ["No change", "5% increase", "5% decrease", "10% increase"],
    correctAnswer: "No change",
    explanation: "1.25 × 0.8 = 1.0, meaning no net change"
  },
  {
    id: 10,
    question: "What is the probability of getting a sum of 7 when rolling two dice?",
    options: ["1/6", "1/8", "1/9", "1/12"],
    correctAnswer: "1/6",
    explanation: "There are 6 ways to get 7 out of 36 possible outcomes: 6/36 = 1/6"
  },
  {
    id: 11,
    question: "If a square's diagonal is 10 units, what is its area?",
    options: ["50 square units", "100 square units", "25 square units", "75 square units"],
    correctAnswer: "50 square units",
    explanation: "If diagonal is d, area = d²/2 = 100/2 = 50"
  },
  {
    id: 12,
    question: "In a race, if A beats B by 20 meters and B beats C by 10 meters, by how much does A beat C?",
    options: ["30 meters", "25 meters", "35 meters", "40 meters"],
    correctAnswer: "30 meters",
    explanation: "A beats C by the sum of both margins: 20 + 10 = 30 meters"
  },
  {
    id: 13,
    question: "What is the next number in the sequence: 2, 6, 12, 20, 30, ___?",
    options: ["42", "40", "44", "38"],
    correctAnswer: "42",
    explanation: "The difference increases by 2: +4, +6, +8, +10, +12"
  },
  {
    id: 14,
    question: "If 40% of a number is 120, what is 60% of that number?",
    options: ["180", "160", "200", "140"],
    correctAnswer: "180",
    explanation: "If 40% = 120, then 60% = (120/40) × 60 = 180"
  },
  {
    id: 15,
    question: "A rectangle's perimeter is 40 units and its area is 96 square units. What are its dimensions?",
    options: ["12×8", "16×6", "20×4", "24×4"],
    correctAnswer: "12×8",
    explanation: "12×8 = 96 and 2(12+8) = 40"
  },
  {
    id: 16,
    question: "If 3 machines can produce 300 units in 4 hours, how many units can 5 machines produce in 6 hours?",
    options: ["750", "600", "900", "800"],
    correctAnswer: "750",
    explanation: "Using direct proportion: (5/3) × (6/4) × 300 = 750"
  },
  {
    id: 17,
    question: "What is the probability of getting at least one head when tossing three coins?",
    options: ["7/8", "3/4", "1/2", "5/8"],
    correctAnswer: "7/8",
    explanation: "1 - P(all tails) = 1 - (1/2)³ = 7/8"
  },
  {
    id: 18,
    question: "If a number is divisible by both 3 and 5, what must it also be divisible by?",
    options: ["15", "8", "12", "10"],
    correctAnswer: "15",
    explanation: "If divisible by both 3 and 5, it must be divisible by their LCM, which is 15"
  },
  {
    id: 19,
    question: "In a group of 100 people, 70 have a car and 80 have a bike. What is the minimum number who have both?",
    options: ["50", "40", "60", "30"],
    correctAnswer: "50",
    explanation: "Using set theory: 70 + 80 - 100 = 50 minimum overlap"
  },
  {
    id: 20,
    question: "What is the next number in the sequence: 1, 4, 9, 16, 25, ___?",
    options: ["36", "30", "32", "34"],
    correctAnswer: "36",
    explanation: "These are perfect squares: 1², 2², 3², 4², 5², 6²"
  },
  {
    id: 21,
    question: "If a triangle's angles are in ratio 2:3:4, what is the largest angle?",
    options: ["80°", "90°", "100°", "70°"],
    correctAnswer: "80°",
    explanation: "2x + 3x + 4x = 180°, x = 20°, largest angle = 4x = 80°"
  },
  {
    id: 22,
    question: "A shopkeeper marks up an item by 25% and then gives a 20% discount. What is the net profit percentage?",
    options: ["0%", "5%", "10%", "15%"],
    correctAnswer: "0%",
    explanation: "1.25 × 0.8 = 1.0, meaning no net profit"
  },
  {
    id: 23,
    question: "If log₁₀(x) = 2, what is x?",
    options: ["100", "20", "200", "50"],
    correctAnswer: "100",
    explanation: "log₁₀(x) = 2 means x = 10² = 100"
  },
  {
    id: 24,
    question: "What is the probability of getting a prime number when rolling a die?",
    options: ["1/2", "1/3", "2/3", "1/6"],
    correctAnswer: "1/2",
    explanation: "Prime numbers on a die are 2, 3, 5: 3/6 = 1/2"
  },
  {
    id: 25,
    question: "If a circle's radius is doubled, by what factor does its area increase?",
    options: ["4", "2", "8", "6"],
    correctAnswer: "4",
    explanation: "Area = πr², if r doubles, area becomes 4 times"
  },
  {
    id: 26,
    question: "In a class of 30 students, the average age is 15. If a new student joins with age 20, what is the new average?",
    options: ["15.16", "15.5", "15.33", "15.25"],
    correctAnswer: "15.16",
    explanation: "(30×15 + 20)/31 = 15.16"
  },
  {
    id: 27,
    question: "What is the next number in the sequence: 3, 6, 11, 18, 27, ___?",
    options: ["38", "36", "40", "42"],
    correctAnswer: "38",
    explanation: "The difference increases by 2: +3, +5, +7, +9, +11"
  },
  {
    id: 28,
    question: "If 20% of a number is 40, what is 80% of that number?",
    options: ["160", "140", "180", "120"],
    correctAnswer: "160",
    explanation: "If 20% = 40, then 80% = (40/20) × 80 = 160"
  },
  {
    id: 29,
    question: "A rectangle's length is twice its width. If its perimeter is 60 units, what is its area?",
    options: ["200", "150", "180", "120"],
    correctAnswer: "200",
    explanation: "If width is x, length is 2x. 2(x + 2x) = 60, x = 10. Area = 20×10 = 200"
  },
  {
    id: 30,
    question: "If 4 workers can complete a task in 8 days, how many workers are needed to complete it in 2 days?",
    options: ["16", "12", "14", "18"],
    correctAnswer: "16",
    explanation: "Using inverse proportion: 4×8 = x×2, where x = 16 workers"
  },
  
  // Additional 30 new questions
  {
    id: 31,
    question: "If a car depreciates by 15% per year, what will be its value after 3 years if it initially costs $25,000?",
    options: ["$15,469", "$16,234", "$15,781", "$14,953"],
    correctAnswer: "$15,469",
    explanation: "After 3 years: 25000 × (0.85)³ = $15,469"
  },
  {
    id: 32,
    question: "A box contains 3 red, 4 blue, and 5 green marbles. If two marbles are drawn at random without replacement, what is the probability that both are blue?",
    options: ["1/6", "2/11", "1/12", "1/8"],
    correctAnswer: "1/12",
    explanation: "P(both blue) = (4/12) × (3/11) = 1/12"
  },
  {
    id: 33,
    question: "If f(x) = 3x² - 2x + 5, what is f(2)?",
    options: ["15", "13", "11", "17"],
    correctAnswer: "15",
    explanation: "f(2) = 3(2)² - 2(2) + 5 = 12 - 4 + 5 = 15"
  },
  {
    id: 34,
    question: "What is the value of x in the equation 2x - 5 = 3x + 7?",
    options: ["-12", "-8", "-10", "-14"],
    correctAnswer: "-12",
    explanation: "2x - 5 = 3x + 7 → 2x - 3x = 7 + 5 → -x = 12 → x = -12"
  },
  {
    id: 35,
    question: "A water tank is 3/4 full. When 15 liters of water are removed, it becomes 2/3 full. What is the capacity of the tank?",
    options: ["120 liters", "135 liters", "90 liters", "180 liters"],
    correctAnswer: "180 liters",
    explanation: "Let x be the capacity. (3x/4) - 15 = 2x/3 → (9x/12) - 15 = 8x/12 → x/12 = 15 → x = 180"
  },
  {
    id: 36,
    question: "If the sum of the interior angles of a polygon is 1080°, how many sides does it have?",
    options: ["8", "7", "9", "10"],
    correctAnswer: "8",
    explanation: "For an n-sided polygon, sum of interior angles = (n - 2) × 180° → 1080 = (n - 2) × 180 → n = 8"
  },
  {
    id: 37,
    question: "What is the value of sin(30°) + cos(60°)?",
    options: ["1", "0.5", "1.5", "0"],
    correctAnswer: "1",
    explanation: "sin(30°) = 0.5 and cos(60°) = 0.5, so sum = 1"
  },
  {
    id: 38,
    question: "If the area of a circle is 49π square units, what is its radius?",
    options: ["7 units", "14 units", "3.5 units", "21 units"],
    correctAnswer: "7 units",
    explanation: "Area = πr² → 49π = πr² → r² = 49 → r = 7"
  },
  {
    id: 39,
    question: "A mixture contains alcohol and water in the ratio 1:4. If 10 liters of water is added, the ratio becomes 1:6. How many liters of alcohol is in the mixture?",
    options: ["10 liters", "8 liters", "5 liters", "12 liters"],
    correctAnswer: "10 liters",
    explanation: "If a = alcohol and 4a = initial water, then a/(4a + 10) = 1/6 → 6a = 4a + 10 → 2a = 10 → a = 5"
  },
  {
    id: 40,
    question: "If a and b are consecutive integers such that a < b, and a² + b² = 61, what is the value of a?",
    options: ["5", "4", "6", "3"],
    correctAnswer: "5",
    explanation: "If a and b are consecutive, b = a + 1. So a² + (a+1)² = 61 → a² + a² + 2a + 1 = 61 → 2a² + 2a = 60 → a² + a = 30 → a = 5"
  },
  {
    id: 41,
    question: "What is the arithmetic mean of the first 50 natural numbers?",
    options: ["25.5", "24.5", "25", "26"],
    correctAnswer: "25.5",
    explanation: "Mean = (1 + 2 + ... + 50)/50 = (50 × 51)/(2 × 50) = 51/2 = 25.5"
  },
  {
    id: 42,
    question: "Which of the following is not a prime number?",
    options: ["91", "83", "89", "97"],
    correctAnswer: "91",
    explanation: "91 = 7 × 13, so it's not prime"
  },
  {
    id: 43,
    question: "If a fair six-sided die is rolled twice, what is the probability of getting a sum of 8?",
    options: ["5/36", "1/4", "1/6", "1/8"],
    correctAnswer: "5/36",
    explanation: "Favorable outcomes: (2,6), (3,5), (4,4), (5,3), (6,2). So probability = 5/36"
  },
  {
    id: 44,
    question: "If the perimeter of a square is 24 cm, what is its area?",
    options: ["36 cm²", "24 cm²", "48 cm²", "16 cm²"],
    correctAnswer: "36 cm²",
    explanation: "Side length = 24/4 = 6 cm, so area = 6² = 36 cm²"
  },
  {
    id: 45,
    question: "A boat travels 20 km upstream in 4 hours and the same distance downstream in 2 hours. What is the speed of the stream?",
    options: ["3 km/h", "2 km/h", "4 km/h", "5 km/h"],
    correctAnswer: "3 km/h",
    explanation: "If boat speed = v and stream speed = u, then (v-u) × 4 = 20 and (v+u) × 2 = 20 → v-u = 5 and v+u = 10 → 2v = 15 → v = 7.5, u = 2.5"
  },
  {
    id: 46,
    question: "What is the least common multiple (LCM) of 12, 18, and 24?",
    options: ["72", "36", "48", "144"],
    correctAnswer: "72",
    explanation: "LCM(12, 18, 24) = LCM(12, 18, 24) = LCM(2²×3, 2×3², 2³×3) = 2³×3² = 72"
  },
  {
    id: 47,
    question: "If a cone has a height of 12 cm and a base radius of 5 cm, what is its volume?",
    options: ["314 cm³", "300 cm³", "628 cm³", "157 cm³"],
    correctAnswer: "314 cm³",
    explanation: "Volume = (1/3) × π × r² × h = (1/3) × π × 5² × 12 ≈ 314 cm³"
  },
  {
    id: 48,
    question: "The average of 5 consecutive even numbers is 30. What is the largest of these numbers?",
    options: ["34", "36", "32", "38"],
    correctAnswer: "34",
    explanation: "If the numbers are x, x+2, x+4, x+6, x+8, then (x + x+2 + x+4 + x+6 + x+8)/5 = 30 → 5x + 20 = 150 → x = 26. So largest = x+8 = 34"
  },
  {
    id: 49,
    question: "If sin θ = 3/5, what is cos θ?",
    options: ["4/5", "3/4", "5/3", "5/4"],
    correctAnswer: "4/5",
    explanation: "Using sin² θ + cos² θ = 1 → cos² θ = 1 - (3/5)² = 1 - 9/25 = 16/25 → cos θ = 4/5 (since θ is in first quadrant)"
  },
  {
    id: 50,
    question: "If f(x) = x³ - 3x² + 2x - 1, what is f(2)?",
    options: ["3", "5", "1", "7"],
    correctAnswer: "3",
    explanation: "f(2) = 2³ - 3(2)² + 2(2) - 1 = 8 - 12 + 4 - 1 = -1 + 0 = -1"
  },
  {
    id: 51,
    question: "What is the distance between the points (3, 4) and (6, 8)?",
    options: ["5", "4", "6", "7"],
    correctAnswer: "5",
    explanation: "Distance = √[(6-3)² + (8-4)²] = √[9 + 16] = √25 = 5"
  },
  {
    id: 52,
    question: "If the length and width of a rectangle are increased by 20% each, by what percentage does the area increase?",
    options: ["44%", "40%", "20%", "32%"],
    correctAnswer: "44%",
    explanation: "New area = 1.2L × 1.2W = 1.44LW, which is a 44% increase"
  },
  {
    id: 53,
    question: "What is the value of √8 × √18?",
    options: ["12", "6√3", "6", "3√8"],
    correctAnswer: "12",
    explanation: "√8 × √18 = √(8×18) = √144 = 12"
  },
  {
    id: 54,
    question: "If x² + y² = 25 and x + y = 7, what is the value of xy?",
    options: ["12", "10", "14", "16"],
    correctAnswer: "12",
    explanation: "Using (x+y)² = x² + 2xy + y² → 7² = 25 + 2xy → 49 = 25 + 2xy → 2xy = 24 → xy = 12"
  },
  {
    id: 55,
    question: "A line has a slope of 2 and passes through the point (3, 4). What is its y-intercept?",
    options: ["-2", "2", "-1", "1"],
    correctAnswer: "-2",
    explanation: "Using y = mx + b, we have 4 = 2(3) + b → 4 = 6 + b → b = -2"
  },
  {
    id: 56,
    question: "What is the value of log₂(32)?",
    options: ["5", "4", "6", "8"],
    correctAnswer: "5",
    explanation: "log₂(32) = log₂(2⁵) = 5"
  },
  {
    id: 57,
    question: "A bag contains 6 red balls and 4 blue balls. If 2 balls are drawn randomly without replacement, what is the probability that both are red?",
    options: ["2/5", "3/5", "1/3", "2/3"],
    correctAnswer: "2/5",
    explanation: "P(both red) = (6/10) × (5/9) = 30/90 = 1/3"
  },
  {
    id: 58,
    question: "If a = 3 and b = 4, what is the value of a³ - b³?",
    options: ["-37", "-28", "-19", "-46"],
    correctAnswer: "-37",
    explanation: "a³ - b³ = (a-b)(a² + ab + b²) = -1(9 + 12 + 16) = -37"
  },
  {
    id: 59,
    question: "What is the equation of a circle with center (2, -3) and radius 4?",
    options: ["(x-2)² + (y+3)² = 16", "(x+2)² + (y-3)² = 16", "(x-2)² + (y-3)² = 16", "(x+2)² + (y+3)² = 16"],
    correctAnswer: "(x-2)² + (y+3)² = 16",
    explanation: "Equation: (x-h)² + (y-k)² = r² with center (h,k) and radius r, so (x-2)² + (y-(-3))² = 4² → (x-2)² + (y+3)² = 16"
  },
  {
    id: 60,
    question: "If 5 men can build a wall in a10 days, how many days will it take 8 men to build the same wall?",
    options: ["6.25 days", "5.5 days", "7 days", "8 days"],
    correctAnswer: "6.25 days",
    explanation: "Using inverse proportion: men × days = constant → 5 × 10 = 8 × d → d = 50/8 = 6.25 days"
  }
];

// Helper function to get a random selection of questions
export const getRandomQuestions = (count: number): Question[] => {
  const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}; 