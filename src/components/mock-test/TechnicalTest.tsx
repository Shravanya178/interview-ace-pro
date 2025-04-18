import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Check, Clock, X } from 'lucide-react';
import { Question } from './QuestionBank';
import { getRandomTechnicalQuestions } from './TechnicalQuestionBank';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const TechnicalTest = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [testStatus, setTestStatus] = useState<'not-started' | 'in-progress' | 'complete'>('not-started');
  const [progress, setProgress] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(2400); // 40 minutes in seconds
  const [warnings, setWarnings] = useState<number>(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Get random technical questions when component mounts
    setQuestions(getRandomTechnicalQuestions(20));
  }, []);

  // Define completeTest as useCallback to prevent dependency issues in useEffects
  const completeTest = useCallback(() => {
    if (testStatus !== 'in-progress') return; // Prevent multiple calls
    
    setTestStatus('complete');
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
    
    // Calculate score
    const correctAnswers = questions.filter(
      (q, index) => index < 20 && selectedAnswers[q.id] === q.correctAnswer
    ).length;
    
    const score = (correctAnswers / 20) * 100;
    
    alert(`Test completed!\n\nYour score: ${score.toFixed(2)}%\n\nCorrect answers: ${correctAnswers} out of 20`);
  }, [testStatus, questions, selectedAnswers]);

  // Function to add a warning with debouncing to prevent multiple alerts
  const addWarning = useCallback((message: string) => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    // Set the warning message for the toast
    setWarningMessage(message);
    
    warningTimeoutRef.current = setTimeout(() => {
      // Clear the warning message after 3 seconds
      setWarningMessage(null);
      
      // But keep incrementing the warning count
      setWarnings(prev => {
        const newCount = prev + 1;
        // Auto-submit after 3 warnings
        if (newCount >= 3) {
          setTimeout(() => {
            alert("You've received multiple warnings. Your test will be submitted automatically.");
            completeTest();
          }, 300);
        }
        return newCount;
      });
    }, 3000);
  }, [completeTest]);

  // Request fullscreen function with error handling
  const requestFullscreen = useCallback(async () => {
    if (testStatus !== 'in-progress') return;
    
    try {
      if (containerRef.current && containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error("Couldn't enter fullscreen mode", error);
      addWarning("Please enable fullscreen for this test");
    }
  }, [testStatus, addWarning]);

  // Anti-cheating measures
  useEffect(() => {
    if (testStatus !== 'in-progress') return;

    // Store initial window dimensions
    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;

    // Detect tab switching or window resizing
    const handleVisibilityChange = () => {
      if (document.hidden && testStatus === 'in-progress') {
        if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
        
        visibilityTimeoutRef.current = setTimeout(() => {
          addWarning("Tab switching detected. Please stay on this page.");
        }, 500);
      }
    };

    // Detect window focus loss (might indicate screen sharing/splitting)
    const handleFocusLoss = () => {
      if (testStatus === 'in-progress') {
        addWarning("Window focus lost. Please keep this window active during the test.");
      }
    };

    // Detect window resizing (might indicate screen splitting)
    const handleResize = () => {
      if (testStatus === 'in-progress') {
        const widthDiff = Math.abs(window.innerWidth - initialWidth);
        const heightDiff = Math.abs(window.innerHeight - initialHeight);
        
        // If window dimensions change significantly, it might indicate screen splitting
        if (widthDiff > 100 || heightDiff > 100) {
          addWarning("Window resizing detected. This may indicate screen splitting, which is not allowed.");
          
          // Try to go back to fullscreen
          requestFullscreen();
        }
      }
    };

    // Prevent right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addWarning("Right-clicking is not allowed during the test");
      return false;
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow tab navigation between fields
      if (e.key === 'Tab') return;
      
      // Prevent Ctrl+C, Ctrl+V, Ctrl+P, Alt+Tab, etc.
      if ((e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 's')) || 
          (e.altKey && e.key === 'Tab') ||
          (e.key === 'PrintScreen')) {
        e.preventDefault();
        addWarning("Keyboard shortcuts are disabled during the test");
        return false;
      }
    };
    
    // Prevent text selection (except in form elements)
    const preventSelection = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'LABEL') {
        e.preventDefault();
        return false;
      }
    };

    // Check if fullscreen was exited
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen && testStatus === 'in-progress') {
        setIsFullscreen(false);
        addWarning("Please maintain fullscreen mode during the test");
        
        // Try to go back to fullscreen
        setTimeout(() => {
          requestFullscreen();
        }, 1000);
      }
    };

    // Add CSS to prevent text selection
    if (!styleRef.current) {
      const style = document.createElement('style');
      style.innerHTML = `
        .technical-test-container * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .technical-test-container input,
        .technical-test-container label {
          cursor: pointer;
        }
      `;
      document.head.appendChild(style);
      styleRef.current = style;
    }

    // Set up event listeners
    requestFullscreen();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('mousedown', preventSelection);
    window.addEventListener('blur', handleFocusLoss);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('mousedown', preventSelection);
      window.removeEventListener('blur', handleFocusLoss);
      window.removeEventListener('resize', handleResize);
      
      if (document.fullscreenElement && testStatus !== 'in-progress') {
        document.exitFullscreen().catch(err => console.error(err));
      }
      
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [testStatus, isFullscreen, addWarning, requestFullscreen]);

  // Cleanup style element when component unmounts
  useEffect(() => {
    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (testStatus !== 'in-progress') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStatus, completeTest]);

  // Progress tracking
  useEffect(() => {
    if (testStatus === 'in-progress') {
      const answeredCount = Object.keys(selectedAnswers).length;
      setProgress(Math.round((answeredCount / 20) * 100));
    }
  }, [selectedAnswers, testStatus]);

  const startTest = () => {
    setTestStatus('in-progress');
    setTimeLeft(2400); // 40 minutes
    setWarnings(0);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleSelectAnswer = (questionId: number, option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      completeTest();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const skipQuestion = () => {
    // Skips the current question without requiring an answer
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      // Update progress
      setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
    } else {
      completeTest();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const renderStartScreen = () => (
    <Card>
      <CardHeader>
        <CardTitle>Technical Questions</CardTitle>
        <CardDescription>
          Test your knowledge of Data Structures, Algorithms, and Object-Oriented Programming concepts
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
              This test contains 20 randomly selected questions and has a time limit of 40 minutes.
              Make sure you are in a quiet environment with no distractions.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={startTest} className="w-full">Start Test</Button>
      </CardFooter>
    </Card>
  );

  const renderQuestion = () => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
      return <div>Loading...</div>;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div ref={containerRef} className="min-h-screen bg-background p-6 no-select">
        {/* Warning toast with transition effect */}
        {warningMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{warningMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => window.location.href = '/mock-test'} 
            className="bg-white hover:bg-red-100 border-red-300"
          >
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Question {currentQuestionIndex + 1} of 20</CardTitle>
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
                onValueChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
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
          <CardFooter>
            <div className="w-full flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/mock-test'}
                className="w-full"
              >
                Exit Test
              </Button>
              <Button
                variant="secondary"
                onClick={skipQuestion}
                className="w-full"
              >
                Skip Question
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!selectedAnswers[currentQuestion.id]}
                className="w-full"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Test'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  };

  const renderCompletionScreen = () => {
    // Calculate score
    const correctAnswers = questions.filter(
      (q, index) => index < 20 && selectedAnswers[q.id] === q.correctAnswer
    ).length;
    
    const score = (correctAnswers / 20) * 100;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Complete</CardTitle>
          <CardDescription>
            You have completed the Technical Questions test.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Test completed successfully!</h3>
            <p className="text-gray-500 mb-4">
              You answered {correctAnswers} out of 20 questions correctly ({score.toFixed(2)}%).
            </p>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Review Your Answers</h3>
            
            {questions.slice(0, 20).map((question, index) => (
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
          <Button onClick={() => window.location.href = '/mock-test'} className="w-full">
            Return to Tests
          </Button>
        </CardFooter>
      </Card>
    );
  };

  if (testStatus === 'not-started') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {renderStartScreen()}
        </div>
      </DashboardLayout>
    );
  } else if (testStatus === 'in-progress') {
    return renderQuestion();
  } else {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {renderCompletionScreen()}
        </div>
      </DashboardLayout>
    );
  }
};

export default TechnicalTest; 