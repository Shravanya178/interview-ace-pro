import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Check, Clock, X } from 'lucide-react';
import { Question, getRandomQuestions } from './QuestionBank';

// Function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const SecureAptitudeTest = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [testStarted, setTestStarted] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [warning, setWarning] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [testQuestionsCount] = useState(30); // Number of questions per test

  // Define completeTest function early using useCallback to avoid the linter error
  const completeTest = useCallback(() => {
    setTestComplete(true);
    setProgress(100);
    
    // Calculate score
    const correctAnswers = shuffledQuestions.filter(
      q => selectedAnswers[q.id] === q.correctAnswer
    ).length;
    
    const score = (correctAnswers / shuffledQuestions.length) * 100;
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    
    // Show results
    alert(`Test completed! Your score: ${score.toFixed(2)}%`);
  }, [shuffledQuestions, selectedAnswers]);

  const handleExitTest = () => {
    const confirmed = window.confirm("Are you sure you want to exit the test? Your progress will be lost.");
    if (confirmed) {
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      
      // Reset test state
      setTestStarted(false);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setTimeLeft(1800);
      setTabSwitchCount(0);
      setWarning(null);
      setProgress(0);
      setFullscreen(false);
    }
  };

  // Anti-cheating measures
  useEffect(() => {
    if (!testStarted) return;

    // Prevent text selection
    const preventSelection = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setWarning('Right-clicking is not allowed during the test.');
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 's' || e.key === 'a')) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        e.key === 'Tab'
      ) {
        e.preventDefault();
        setWarning('Keyboard shortcuts are not allowed during the test.');
      }
    };

    // Prevent tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setWarning(`Switching tabs is not allowed during the test. Warning ${tabSwitchCount + 1}/3`);
        
        // After 3 tab switches, end the test
        if (tabSwitchCount >= 2) {
          completeTest();
          alert('Test terminated due to multiple tab switches.');
        }
      }
    };

    // Prevent window resize
    const handleResize = () => {
      if (!fullscreen) {
        setWarning('Please maintain fullscreen mode during the test.');
      }
    };

    // Request fullscreen
    const requestFullscreen = async () => {
      try {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
          setFullscreen(true);
        }
      } catch (err) {
        setWarning('Please enable fullscreen mode to continue the test.');
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('mousedown', preventSelection);
    requestFullscreen();

    // Add CSS to prevent text selection
    const style = document.createElement('style');
    style.innerHTML = `
      .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('no-select');

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('mousedown', preventSelection);
      document.body.classList.remove('no-select');
      document.head.removeChild(style);
    };
  }, [testStarted, fullscreen, tabSwitchCount, completeTest]);

  // Timer
  useEffect(() => {
    if (!testStarted || testComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          completeTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testComplete, completeTest]);

  const handleStartTest = async () => {
    try {
      // Get random questions for this test session
      const randomQuestions = getRandomQuestions(testQuestionsCount);
      
      // Shuffle options for each question - only once when test starts
      const shuffled = randomQuestions.map(q => ({
        ...q,
        options: shuffleArray(q.options)
      }));
      
      setShuffledQuestions(shuffled);
      setSelectedAnswers({}); // Reset selected answers
      
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
        setFullscreen(true);
      }
      setTestStarted(true);
      setProgress(0);
      setCurrentQuestionIndex(0);
    } catch (err) {
      setWarning('Please enable fullscreen mode to continue the test.');
    }
  };

  const handleSelectAnswer = (questionId: number, answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setProgress(((currentQuestionIndex + 1) / shuffledQuestions.length) * 100);
    } else {
      completeTest();
    }
  };

  const handleSkipQuestion = () => {
    // Move to the next question without requiring an answer
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setProgress(((currentQuestionIndex + 1) / shuffledQuestions.length) * 100);
    } else {
      completeTest();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRestartTest = () => {
    setTestComplete(false);
    setTestStarted(false);
    setTimeLeft(1800); // Reset timer
    setTabSwitchCount(0);
    setWarning(null);
    setProgress(0);
  };

  if (!testStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>General Aptitude Test</CardTitle>
          <CardDescription>
            Test your problem-solving, numerical, and logical reasoning skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This test includes anti-cheating measures:
                <ul className="list-disc list-inside mt-2">
                  <li>Fullscreen mode required</li>
                  <li>Tab switching not allowed</li>
                  <li>Right-click disabled</li>
                  <li>Keyboard shortcuts disabled</li>
                  <li>Screen splitting not allowed</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ready to begin?</h3>
              <p className="text-gray-500 mb-4">
                This test contains {testQuestionsCount} randomly selected questions and has a time limit of 30 minutes.
                Make sure you are in a quiet environment with no distractions.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartTest} className="w-full">Start Test</Button>
        </CardFooter>
      </Card>
    );
  }

  if (testComplete) {
    // Calculate score
    const correctAnswers = shuffledQuestions.filter(
      q => selectedAnswers[q.id] === q.correctAnswer
    ).length;
    
    const score = (correctAnswers / shuffledQuestions.length) * 100;
    
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Complete</CardTitle>
            <CardDescription>
              Thank you for completing the aptitude test.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Test completed successfully!</h3>
              <p className="text-gray-500 mb-4">
                You scored {score.toFixed(2)}% ({correctAnswers} out of {shuffledQuestions.length} correct)
              </p>
              <div className="mt-4">
                <Progress value={score} className="h-3" />
              </div>
            </div>
            
            <div className="space-y-6 mt-8">
              <h3 className="text-xl font-semibold">Review Your Answers</h3>
              
              {shuffledQuestions.map((question, index) => (
                <Card key={question.id} className={
                  selectedAnswers[question.id] === question.correctAnswer 
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Question {index + 1}</CardTitle>
                      {selectedAnswers[question.id] === question.correctAnswer 
                        ? <span className="text-sm text-green-600 font-medium">Correct</span>
                        : <span className="text-sm text-red-600 font-medium">Incorrect</span>
                      }
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 pt-0">
                    <p className="font-medium mb-2">{question.question}</p>
                    
                    <div className="space-y-1 mb-4">
                      {question.options.map((option, i) => (
                        <div 
                          key={i} 
                          className={`p-2 rounded ${
                            option === question.correctAnswer
                              ? "bg-green-100 border border-green-300" 
                              : option === selectedAnswers[question.id] && option !== question.correctAnswer
                                ? "bg-red-100 border border-red-300"
                                : "bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {option}
                          {option === question.correctAnswer && 
                            <span className="text-green-600 text-xs ml-2">(Correct Answer)</span>
                          }
                          {option === selectedAnswers[question.id] && option !== question.correctAnswer && 
                            <span className="text-red-600 text-xs ml-2">(Your Answer)</span>
                          }
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-sm bg-white p-3 rounded border">
                      <p className="font-medium">Explanation:</p>
                      <p>{question.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRestartTest} className="w-full">Take Another Test</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Safety check to prevent errors if shuffledQuestions is not yet set
  if (shuffledQuestions.length === 0) {
    return <div>Loading...</div>;
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  return (
    <div ref={containerRef} className="min-h-screen bg-background p-6 no-select">
      {warning && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}
      
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleExitTest} 
          className="bg-white hover:bg-red-100 border-red-300"
        >
          <X className="h-4 w-4 text-red-500" />
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Question {currentQuestionIndex + 1} of {shuffledQuestions.length}</CardTitle>
              <CardDescription>
                Time remaining: {formatTime(timeLeft)}
              </CardDescription>
            </div>
            <div className="text-sm font-medium">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="font-medium text-lg">{currentQuestion.question}</div>
            
            <RadioGroup
              value={selectedAnswers[currentQuestion.id]}
              onValueChange={(value) => 
                handleSelectAnswer(currentQuestion.id, value)
              }
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 border p-3 rounded-md">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleExitTest}
            className="w-1/4"
          >
            Exit Test
          </Button>
          <Button
            variant="secondary"
            onClick={handleSkipQuestion}
            className="w-1/4"
          >
            Skip Question
          </Button>
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswers[currentQuestion.id] === undefined}
            className="w-2/4"
          >
            {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Next Question' : 'Complete Test'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SecureAptitudeTest; 