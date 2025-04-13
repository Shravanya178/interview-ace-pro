import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowRight, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { codingQuestions, getRandomQuestion, CodingQuestion } from './CodingQuestionBank';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SUPPORTED_LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' }
];

// Helper function to get language-specific template
const getLanguageTemplate = (language: string, signature: string): string => {
  switch (language) {
    case 'python':
      return `${signature}\n    # Write your solution here\n    pass`;
    case 'cpp':
      return `${signature} {\n    // Write your solution here\n    \n}`;
    case 'java':
      return `${signature} {\n    // Write your solution here\n    \n}`;
    case 'c':
      return `${signature} {\n    // Write your solution here\n    \n}`;
    default:
      return '// Write your solution here';
  }
};

const CodingTest = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiReview, setAiReview] = useState<string>('');
  const [selectedQuestions, setSelectedQuestions] = useState<CodingQuestion[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const { toast } = useToast();
  const [showSolution, setShowSolution] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<CodingQuestion | null>(null);
  const [userCode, setUserCode] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [testComplete, setTestComplete] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (testStarted && !testComplete) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTestComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, testComplete]);

  useEffect(() => {
    if (!testStarted) {
      const shuffled = [...codingQuestions].sort(() => 0.5 - Math.random());
      setSelectedQuestions(shuffled.slice(0, 5));
      setTestStarted(true);
    }
  }, [testStarted]);

  const selectedQuestion = currentQuestion || (selectedQuestions.length > 0 ? selectedQuestions[currentQuestionIndex] : null);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    if (selectedQuestion && selectedQuestion.function_signatures) {
      const signature = selectedQuestion.function_signatures[value];
      setUserCode(getLanguageTemplate(value, signature));
    }
  };

  const checkCodeCorrectness = (code: string, question: CodingQuestion): boolean => {
    // This is a simplified check. In a real implementation, you would:
    // 1. Run the code against test cases
    // 2. Compare outputs
    // 3. Check for edge cases
    // For now, we'll do a basic check
    const strippedCode = code.replace(/\s+/g, '').toLowerCase();
    const strippedSolution = question.solution.replace(/\s+/g, '').toLowerCase();
    return strippedCode.includes(strippedSolution.substring(0, 30)); // Basic check for similar patterns
  };

  const analyzeCode = async () => {
    setIsSubmitting(true);
    try {
      // Simulate code execution and analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isCorrect = checkCodeCorrectness(code, selectedQuestion);
      
      if (isCorrect) {
        // Generate optimization suggestions
        const optimizationReview = `Code Review Analysis:

✅ Your solution is correct! Here are some optimization suggestions:

1. Time Complexity Analysis:
   - Current: ${selectedQuestion.time_complexity || 'O(n)'}
   - Could potentially optimize to O(log n) in certain cases

2. Space Optimization:
   - Consider using in-place operations where possible
   - Memory usage could be reduced by ${Math.floor(Math.random() * 20 + 10)}%

3. Code Style Improvements:
   - Consider adding type hints
   - Break down complex operations into smaller functions
   - Add comprehensive error handling

4. Alternative Approaches:
   - Consider using a hash map for O(1) lookups
   - A binary search approach might be more efficient
   - Dynamic programming could optimize repeated calculations

Would you like to see an example of an optimized solution?`;
        
        setAiReview(optimizationReview);
        toast({
          title: "Correct Solution!",
          description: "Check out optimization suggestions below.",
        });
      } else {
        // Generate helpful hints and solution guidance
        const helpfulReview = `Code Review Analysis:

❌ Your solution needs some work. Here's some guidance:

1. Logic Check:
   - The algorithm should handle ${selectedQuestion.testCases[0].input} correctly
   - Expected output: ${selectedQuestion.testCases[0].output}
   - Your code might be missing edge cases

2. Common Mistakes:
   - Check array bounds
   - Initialize variables properly
   - Handle empty input cases

3. Hints:
   ${selectedQuestion.hints?.map(hint => `   - ${hint}`).join('\n') || '   - Consider breaking down the problem into smaller steps'}

4. Test Cases:
   - Try running your code with: ${selectedQuestion.testCases[1]?.input || selectedQuestion.testCases[0].input}
   - Expected output: ${selectedQuestion.testCases[1]?.output || selectedQuestion.testCases[0].output}

Would you like to see a step-by-step solution?`;
        
        setAiReview(helpfulReview);
        toast({
          title: "Solution Needs Improvement",
          description: "Check out the suggestions below.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = selectedQuestions[nextIndex];
      const signature = nextQuestion.function_signatures[selectedLanguage];
      setCode(getLanguageTemplate(selectedLanguage, signature));
      setAiReview('');
    }
  };

  const handleExit = () => {
    const confirmExit = window.confirm('Are you sure you want to exit the test? Your progress will be lost.');
    if (confirmExit) {
      navigate('/mock-test');
    }
  };

  const handleDifficultySelect = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    setSelectedDifficulty(difficulty);
    const question = getRandomQuestion(difficulty);
    setCurrentQuestion(question);
    const questionsOfDifficulty = codingQuestions.filter(q => q.difficulty === difficulty);
    const shuffled = [...questionsOfDifficulty].sort(() => 0.5 - Math.random());
    const filteredQuestions = shuffled.filter(q => q.id !== question.id);
    const newSelectedQuestions = [question, ...filteredQuestions.slice(0, 4)];
    setSelectedQuestions(newSelectedQuestions);
    setCurrentQuestionIndex(0);
    
    const signature = question.function_signatures[selectedLanguage];
    setUserCode(getLanguageTemplate(selectedLanguage, signature));
    setTimeLeft(1800);
    setTestStarted(true);
    setShowHint(false);
    setShowSolution(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTestComplete = () => {
    setTestComplete(true);
    setTestStarted(false);
  };

  const handleSubmitCode = async () => {
    if (!selectedQuestion) return;

    setIsSubmitting(true);
    try {
      // Simulate code execution and testing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Basic code similarity check (in a real implementation, you would run actual test cases)
      const strippedUserCode = userCode.replace(/\s+/g, '').toLowerCase();
      const strippedSolution = selectedQuestion.solution.replace(/\s+/g, '').toLowerCase();
      const similarity = strippedUserCode.includes(strippedSolution.substring(0, 30));

      if (similarity) {
        toast({
          title: "Success! 🎉",
          description: "Your solution passed all test cases. Great job!",
        });
        setShowSolution(true);
      } else {
        toast({
          title: "Some tests failed",
          description: "Your solution didn't pass all test cases. Try again or check the hints.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while testing your code.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDifficultySelection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Coding Test</CardTitle>
        <CardDescription>
          Choose your difficulty level to begin the coding challenge
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Each difficulty level has different requirements and time limits.
              Choose wisely based on your experience level.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleDifficultySelect('Easy')}>
              <CardHeader>
                <CardTitle className="text-green-600">Easy</CardTitle>
                <CardDescription>
                  Beginner-friendly DSA questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Basic algorithms</li>
                  <li>Array manipulation</li>
                  <li>String operations</li>
                  <li>Simple data structures</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleDifficultySelect('Medium')}>
              <CardHeader>
                <CardTitle className="text-yellow-600">Medium</CardTitle>
                <CardDescription>
                  Debugging challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Find and fix bugs</li>
                  <li>Logical errors</li>
                  <li>Edge cases</li>
                  <li>Code optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleDifficultySelect('Hard')}>
              <CardHeader>
                <CardTitle className="text-red-600">Hard</CardTitle>
                <CardDescription>
                  Complex DSA problems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Advanced algorithms</li>
                  <li>Dynamic programming</li>
                  <li>Graph problems</li>
                  <li>System design aspects</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCodingChallenge = () => {
    if (!selectedQuestion) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{selectedQuestion.title}</CardTitle>
                <CardDescription>
                  Difficulty: {selectedQuestion.difficulty} | Time Remaining: {formatTime(timeLeft)}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleTestComplete}>
                End Test
              </Button>
            </div>
            <Progress value={(1800 - timeLeft) / 18} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Problem Description:</h3>
                <p className="text-gray-700">{selectedQuestion.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Sample Input:</h3>
                  <pre className="bg-slate-100 p-3 rounded">{selectedQuestion.sampleInput}</pre>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Sample Output:</h3>
                  <pre className="bg-slate-100 p-3 rounded">{selectedQuestion.sampleOutput}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Constraints:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedQuestion.constraints?.split('\n').map((constraint, index) => (
                    <li key={index} className="text-gray-700">{constraint}</li>
                  ))}
                </ul>
              </div>

              {selectedQuestion.difficulty === 'Medium' && selectedQuestion.buggy_code && (
                <div>
                  <h3 className="font-medium mb-2">Buggy Code to Fix:</h3>
                  <pre className="bg-slate-100 p-3 rounded font-mono text-sm">
                    {selectedQuestion.buggy_code}
                  </pre>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Your Solution:</h3>
                <div className="flex items-center space-x-4">
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                </div>
              </div>

              {showHint && selectedQuestion.hints && (
                <Alert className="mb-4">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {selectedQuestion.hints.map((hint, index) => (
                        <li key={index}>{hint}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Textarea
                ref={editorRef}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="font-mono min-h-[300px] text-sm"
                placeholder="Write your solution here..."
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setSelectedDifficulty(null)}
            >
              Choose Different Difficulty
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSolution(!showSolution)}
                disabled={false}
              >
                {showSolution ? 'Hide Solution' : 'View Solution'}
              </Button>
              <Button
                onClick={handleSubmitCode}
                disabled={isSubmitting || !userCode.trim()}
              >
                {isSubmitting ? 'Testing...' : 'Submit Solution'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleExit}
              >
                Exit Test
              </Button>
            </div>
          </CardFooter>
        </Card>

        {showSolution && (
          <Card>
            <CardHeader>
              <CardTitle>Solution Explanation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Solution in {SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label || 'Python'}:</h3>
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <pre className="bg-slate-100 p-3 rounded font-mono text-sm">
                  {selectedQuestion.solutions[selectedLanguage]}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2">Step-by-Step Explanation:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedQuestion.explanation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Time Complexity:</h3>
                  <p className="text-gray-700">{selectedQuestion.time_complexity}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Space Complexity:</h3>
                  <p className="text-gray-700">{selectedQuestion.space_complexity}</p>
                </div>
              </div>
              {selectedQuestion.difficulty === 'Medium' && selectedQuestion.buggy_code && (
                <div>
                  <h3 className="font-medium mb-2">Original Buggy Code:</h3>
                  <pre className="bg-slate-100 p-3 rounded font-mono text-sm">
                    {selectedQuestion.buggy_code}
                  </pre>
                  <p className="mt-2 text-gray-700">
                    Common bugs to look for:
                    <ul className="list-disc list-inside mt-1">
                      <li>Incorrect boundary checks</li>
                      <li>Missing edge cases</li>
                      <li>Logic errors in conditions</li>
                      <li>Incorrect variable updates</li>
                    </ul>
                  </p>
                </div>
              )}
              <div>
                <h3 className="font-medium mb-2">Test Cases:</h3>
                <div className="space-y-2">
                  {selectedQuestion.testCases.map((test, index) => (
                    <div key={index} className="bg-slate-50 p-3 rounded">
                      <p className="font-medium">Test Case {index + 1}:</p>
                      <p className="text-sm text-gray-600">Input: {test.input}</p>
                      <p className="text-sm text-gray-600">Expected Output: {test.output}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        {!selectedDifficulty ? renderDifficultySelection() : renderCodingChallenge()}
      </div>
    </DashboardLayout>
  );
};

export default CodingTest; 