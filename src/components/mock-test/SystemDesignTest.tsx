import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Check, Clock, X } from 'lucide-react';
import { Question } from './QuestionBank';
import { getRandomSystemDesignQuestions } from './SystemDesignQuestionBank';

// Function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const SystemDesignTest = () => {
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
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [testQuestionsCount] = useState(15); // Number of questions per test

  // Define completeTest function early using useCallback to avoid the linter error
  const completeTest = useCallback(() => {
    if (testComplete) return; // Prevent multiple calls
    
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
  }, [shuffledQuestions, selectedAnswers, testComplete]);

  // Improved warning function with debouncing
  const showWarning = useCallback((message: string) => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    setWarning(message);
    
    warningTimeoutRef.current = setTimeout(() => {
      setWarning(null);
    }, 3000);
  }, []);

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

  // Request fullscreen as a reusable function
  const requestFullscreen = useCallback(async () => {
    if (!testStarted) return;
    
    try {
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
        setFullscreen(true);
      }
    } catch (err) {
      showWarning('Please enable fullscreen mode to continue the test.');
    }
  }, [testStarted, showWarning]);

  // Anti-cheating measures
  useEffect(() => {
    if (!testStarted) return;

    // Store initial window dimensions for resize detection
    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;

    // Prevent text selection
    const preventSelection = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showWarning('Right-clicking is not allowed during the test.');
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow tab between form elements
      if (e.key === 'Tab' && !e.ctrlKey && !e.altKey) return;
      
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 's' || e.key === 'a')) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        (e.altKey && e.key === 'Tab')
      ) {
        e.preventDefault();
        showWarning('Keyboard shortcuts are not allowed during the test.');
      }
    };

    // Prevent tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          showWarning(`Switching tabs is not allowed during the test. Warning ${newCount}/3`);
          
          // After 3 tab switches, end the test
          if (newCount >= 3) {
            setTimeout(() => {
              alert('Test terminated due to multiple tab switches.');
              completeTest();
            }, 300);
          }
          
          return newCount;
        });
      }
    };

    // Improved window resize detection
    const handleResize = () => {
      if (testStarted) {
        const widthDiff = Math.abs(window.innerWidth - initialWidth);
        const heightDiff = Math.abs(window.innerHeight - initialHeight);
        
        // If dimensions change significantly, it might indicate screen splitting
        if (widthDiff > 100 || heightDiff > 100) {
          showWarning('Window resizing detected. This may indicate screen splitting, which is not allowed.');
          
          // Try to go back to fullscreen
          requestFullscreen();
        }
      }
    };

    // Check if fullscreen was exited
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && fullscreen) {
        setFullscreen(false);
        showWarning('Please maintain fullscreen mode during the test');
        
        // Try to go back to fullscreen after a short delay
        setTimeout(() => {
          requestFullscreen();
        }, 1000);
      }
    };

    // Add CSS to prevent text selection
    if (!styleRef.current) {
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
      styleRef.current = style;
    }
    document.body.classList.add('no-select');

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('mousedown', preventSelection);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    requestFullscreen();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('mousedown', preventSelection);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.body.classList.remove('no-select');
      
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [testStarted, fullscreen, showWarning, completeTest, requestFullscreen]);

  // Cleanup style element when component unmounts
  useEffect(() => {
    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, []);

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
      const randomQuestions = getRandomSystemDesignQuestions(testQuestionsCount);
      
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

  const renderTestScreen = () => {
    if (currentQuestionIndex >= shuffledQuestions.length) {
      completeTest();
      return null;
    }

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    
    return (
      <div 
        ref={containerRef} 
        className="max-w-4xl mx-auto p-4 no-select relative"
      >
        {/* Warning toast with transition effect */}
        {warning && (
          <div 
            className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md z-50 max-w-md animate-in fade-in slide-in-from-top-5 duration-300"
            style={{ opacity: warning ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
          >
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" />
              <span>{warning}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExitTest}
            className="text-destructive border-destructive"
          >
            Exit Test
          </Button>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={`text-sm font-medium ${timeLeft < 300 ? 'text-red-500' : ''}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {shuffledQuestions.length}</span>
            <span>{progress}% complete</span>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Question {currentQuestionIndex + 1} of {shuffledQuestions.length}</CardTitle>
            <CardDescription>
              Time remaining: {formatTime(timeLeft)}
            </CardDescription>
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
              className="w-1/3"
            >
              Exit Test
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQuestion.id] === undefined}
              className="w-2/3"
            >
              {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Next Question' : 'Complete Test'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  if (!testStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Design Test</CardTitle>
          <CardDescription>
            Test your knowledge of system design principles, patterns, and best practices
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
                This test contains {testQuestionsCount} randomly selected system design questions and has a time limit of 30 minutes.
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Complete</CardTitle>
          <CardDescription>
            Thank you for completing the system design test.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Test completed successfully!</h3>
            <p className="text-gray-500 mb-4">
              Your results have been recorded. You can now exit fullscreen mode.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRestartTest} className="w-full">Take Another Test</Button>
        </CardFooter>
      </Card>
    );
  }

  // Safety check to prevent errors if shuffledQuestions is not yet set
  if (shuffledQuestions.length === 0) {
    return <div>Loading...</div>;
  }

  return renderTestScreen();
};

export default SystemDesignTest; 