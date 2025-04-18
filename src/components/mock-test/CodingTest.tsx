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

  const analyzeUserCode = (userCode: string, question: CodingQuestion): {
    isCorrect: boolean;
    feedback: string;
    similarities: number;
    testCasesPassed: number;
    totalTestCases: number;
    suggestions: string[];
  } => {
    // This is a more sophisticated analysis than the simple similarity check
    const strippedUserCode = userCode.replace(/\s+/g, '').toLowerCase();
    const strippedSolution = question.solution.replace(/\s+/g, '').toLowerCase();
    
    // Calculate a similarity score (0-100)
    let similarities = 0;
    const solutionKeywords = [
      'for', 'while', 'if', 'else', 'return', 'map', 'filter', 
      'reduce', 'hash', 'array', 'list', 'stack', 'queue', 'tree', 'graph'
    ];
    
    // Check for key algorithm patterns
    for (const keyword of solutionKeywords) {
      if (strippedSolution.includes(keyword) && strippedUserCode.includes(keyword)) {
        similarities += 10; // Increment similarity for each matching pattern
      }
    }
    
    // Cap similarity at 100
    similarities = Math.min(similarities, 100);
    
    // Simulate test case evaluation
    const testCasesPassed = Math.floor(Math.random() * (question.testCases.length + 1));
    
    // Generate feedback based on analysis
    let feedback = "";
    const suggestions: string[] = [];
    
    if (similarities >= 70) {
      feedback = "Your solution is on the right track! The approach is similar to the expected solution.";
      
      if (testCasesPassed < question.testCases.length) {
        feedback += " However, it doesn't pass all test cases yet.";
        suggestions.push("Check edge cases like empty inputs or boundary conditions");
        suggestions.push("Verify your logic for handling special cases");
      } else {
        feedback += " Great job passing all test cases!";
        suggestions.push("Consider optimizing for better time/space complexity");
        suggestions.push("Could you simplify certain parts of your algorithm?");
      }
    } else {
      feedback = "Your solution takes a different approach than expected.";
      
      if (testCasesPassed < question.testCases.length / 2) {
        feedback += " It's not passing most test cases.";
        suggestions.push("Review the problem statement again");
        suggestions.push("Consider the constraints more carefully");
        suggestions.push("Try breaking down the problem into smaller steps");
      } else {
        feedback += " It passes some test cases but could be improved.";
        suggestions.push("Your approach works for some cases but may not be optimal");
        suggestions.push("Consider whether there's a more efficient algorithm");
      }
    }
    
    return {
      isCorrect: testCasesPassed === question.testCases.length,
      feedback,
      similarities,
      testCasesPassed,
      totalTestCases: question.testCases.length,
      suggestions
    };
  };

  const handleSubmitCode = async () => {
    if (!selectedQuestion) return;

    setIsSubmitting(true);
    try {
      // Simulate code execution and testing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Use enhanced code analysis
      const analysisResult = analyzeUserCode(userCode, selectedQuestion);
      
      // Generate detailed AI review based on analysis
      let reviewText = `## Code Analysis Results\n\n`;
      reviewText += `${analysisResult.isCorrect ? '✅ Success!' : '⚠️ Not quite there yet.'} ${analysisResult.feedback}\n\n`;
      reviewText += `- Test Cases: ${analysisResult.testCasesPassed}/${analysisResult.totalTestCases} passed\n`;
      reviewText += `- Algorithm Similarity: ${analysisResult.similarities}%\n\n`;
      
      if (analysisResult.suggestions.length > 0) {
        reviewText += `### Suggestions for Improvement:\n`;
        analysisResult.suggestions.forEach((suggestion, i) => {
          reviewText += `${i+1}. ${suggestion}\n`;
        });
      }
      
      // Sample test case result (would be actual evaluation in a real implementation)
      const failedTestCase = analysisResult.testCasesPassed < analysisResult.totalTestCases 
        ? selectedQuestion.testCases[analysisResult.testCasesPassed] 
        : null;
        
      if (failedTestCase) {
        reviewText += `\n### Failed Test Case:\n`;
        reviewText += `- Input: \`${failedTestCase.input}\`\n`;
        reviewText += `- Expected Output: \`${failedTestCase.output}\`\n`;
        reviewText += `- Your Output: \`[different output]\`\n`;
      }
      
      setAiReview(reviewText);

      if (analysisResult.isCorrect) {
        toast({
          title: "Success! 🎉",
          description: "Your solution passed all test cases!",
        });
        setShowSolution(true);
      } else {
        toast({
          title: `${analysisResult.testCasesPassed}/${analysisResult.totalTestCases} Tests Passed`,
          description: "Check the feedback below to improve your solution.",
          variant: analysisResult.testCasesPassed > 0 ? "default" : "destructive",
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
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl">{selectedQuestion.title}</CardTitle>
                <CardDescription className="mt-1">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    selectedQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    selectedQuestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedQuestion.difficulty}
                  </span>
                  <span className="ml-3">Time Remaining: {formatTime(timeLeft)}</span>
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleTestComplete} className="self-start sm:self-auto">
                End Test
              </Button>
            </div>
            <Progress value={(1800 - timeLeft) / 18} className="mt-3 h-1.5" />
          </CardHeader>
          
          <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-5">
            <div className="space-y-4 bg-gray-50 p-3 sm:p-4 rounded-md">
              <div>
                <h3 className="font-medium text-sm sm:text-base mb-2">Problem Description:</h3>
                <p className="text-gray-700 text-sm sm:text-base">{selectedQuestion.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="overflow-auto">
                  <h3 className="font-medium text-sm sm:text-base mb-2">Sample Input:</h3>
                  <pre className="bg-white border p-2 sm:p-3 rounded text-xs sm:text-sm overflow-x-auto max-h-36">
                    {selectedQuestion.sampleInput}
                  </pre>
                </div>
                <div className="overflow-auto">
                  <h3 className="font-medium text-sm sm:text-base mb-2">Sample Output:</h3>
                  <pre className="bg-white border p-2 sm:p-3 rounded text-xs sm:text-sm overflow-x-auto max-h-36">
                    {selectedQuestion.sampleOutput}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm sm:text-base mb-2">Constraints:</h3>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                  {selectedQuestion.constraints?.split('\n').map((constraint, index) => (
                    <li key={index} className="text-gray-700">{constraint}</li>
                  ))}
                </ul>
              </div>

              {selectedQuestion.difficulty === 'Medium' && selectedQuestion.buggy_code && (
                <div className="overflow-auto">
                  <h3 className="font-medium text-sm sm:text-base mb-2">Buggy Code to Fix:</h3>
                  <pre className="bg-white border p-2 sm:p-3 rounded font-mono text-xs overflow-x-auto max-h-60">
                    {selectedQuestion.buggy_code}
                  </pre>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h3 className="font-medium text-sm sm:text-base">Your Solution:</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full sm:w-[150px]">
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
                    className="w-full sm:w-auto"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                </div>
              </div>

              {showHint && selectedQuestion.hints && (
                <Alert className="mb-2">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="text-xs sm:text-sm">
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
                className="font-mono text-xs sm:text-sm min-h-[250px] sm:min-h-[300px] resize-y border-gray-300"
                placeholder="Write your solution here..."
              />
              
              {aiReview && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                  <h4 className="font-medium text-sm sm:text-base mb-2 text-blue-800">AI Code Analysis:</h4>
                  <div className="prose prose-sm max-w-none text-xs sm:text-sm text-blue-900 whitespace-pre-line">
                    {aiReview}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t">
            <Button
              variant="outline"
              onClick={() => setSelectedDifficulty(null)}
              className="w-full sm:w-auto order-3 sm:order-1"
            >
              Choose Different Difficulty
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={() => setShowSolution(!showSolution)}
                className="w-full sm:w-auto"
              >
                {showSolution ? 'Hide Solution' : 'View Solution'}
              </Button>
              <Button
                onClick={handleSubmitCode}
                disabled={isSubmitting || !userCode.trim()}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </> : 'Submit Solution'
                }
              </Button>
              <Button
                variant="destructive"
                onClick={handleExit}
                className="w-full sm:w-auto"
              >
                Exit Test
              </Button>
            </div>
          </CardFooter>
        </Card>

        {showSolution && (
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Solution Explanation</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-5">
              <div className="space-y-4">
                <div className="overflow-auto">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                    <h3 className="font-medium text-sm sm:text-base">
                      Solution in {SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label || 'Python'}:
                    </h3>
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-full sm:w-[150px]">
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
                  <pre className="bg-white border p-2 sm:p-3 rounded font-mono text-xs sm:text-sm overflow-x-auto max-h-80">
                    {selectedQuestion.solutions[selectedLanguage]}
                  </pre>
                </div>
                
                <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
                  <h3 className="font-medium text-sm sm:text-base mb-2">Step-by-Step Explanation:</h3>
                  <p className="text-gray-700 text-xs sm:text-sm whitespace-pre-wrap">{selectedQuestion.explanation}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
                    <h3 className="font-medium text-sm sm:text-base mb-2">Time Complexity:</h3>
                    <p className="text-gray-700 text-xs sm:text-sm">{selectedQuestion.time_complexity}</p>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
                    <h3 className="font-medium text-sm sm:text-base mb-2">Space Complexity:</h3>
                    <p className="text-gray-700 text-xs sm:text-sm">{selectedQuestion.space_complexity}</p>
                  </div>
                </div>
                
                {selectedQuestion.difficulty === 'Medium' && selectedQuestion.buggy_code && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-md overflow-auto">
                    <h3 className="font-medium text-sm sm:text-base mb-2">Original Buggy Code:</h3>
                    <pre className="bg-white border p-2 sm:p-3 rounded font-mono text-xs overflow-x-auto max-h-60">
                      {selectedQuestion.buggy_code}
                    </pre>
                    <div className="mt-3">
                      <p className="font-medium text-xs sm:text-sm">Common bugs to look for:</p>
                      <ul className="list-disc list-inside mt-1 text-xs sm:text-sm">
                        <li>Incorrect boundary checks</li>
                        <li>Missing edge cases</li>
                        <li>Logic errors in conditions</li>
                        <li>Incorrect variable updates</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 p-3 sm:p-4 rounded-md">
                  <h3 className="font-medium text-sm sm:text-base mb-3">Test Cases:</h3>
                  <div className="space-y-3">
                    {selectedQuestion.testCases.map((test, index) => (
                      <div key={index} className="bg-white border p-3 rounded-md">
                        <p className="font-medium text-xs sm:text-sm">Test Case {index + 1}:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-xs font-medium text-gray-600">Input:</p>
                            <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto mt-1">{test.input}</pre>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Expected Output:</p>
                            <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto mt-1">{test.output}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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