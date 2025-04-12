import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Clock, ArrowLeft, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BehavioralTest = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [answer, setAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(''));
  const [testStatus, setTestStatus] = useState<'not-started' | 'in-progress' | 'complete'>('not-started');
  const [progress, setProgress] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 minutes in seconds
  const [warnings, setWarnings] = useState<number>(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const questions = [
    {
      id: 1,
      question: "Tell me about a time when you had to work under a tight deadline. What was the situation, and how did you handle it?",
      tips: "Focus on how you prioritized tasks, managed your time, and the outcome of your efforts.",
    },
    {
      id: 2,
      question: "Describe a situation where you had to resolve a conflict with a coworker or team member.",
      tips: "Highlight your communication skills, empathy, and how you reached a resolution.",
    },
    {
      id: 3,
      question: "Give an example of a challenging problem you solved. What was your approach?",
      tips: "Explain your analytical process, the steps you took, and the results you achieved.",
    },
    {
      id: 4,
      question: "Tell me about a time when you received constructive criticism. How did you respond?",
      tips: "Show your willingness to learn and grow from feedback.",
    },
    {
      id: 5,
      question: "Describe a project where you had to lead a team. What was your leadership style, and what was the outcome?",
      tips: "Focus on your leadership qualities, how you motivated the team, and the project results.",
    },
    {
      id: 6,
      question: "Share an experience where you had to adapt to a significant change at work or school.",
      tips: "Emphasize your flexibility, resilience, and how you embraced the new situation.",
    },
    {
      id: 7,
      question: "Tell me about a time when you failed at something. What did you learn from it?",
      tips: "Be honest about the failure, but focus on the lessons learned and how you grew.",
    },
    {
      id: 8,
      question: "Describe a situation where you had to make an important decision with limited information.",
      tips: "Explain your decision-making process, how you gathered what information you could, and the outcome.",
    },
    {
      id: 9,
      question: "Give an example of how you've contributed to a positive team environment.",
      tips: "Highlight your interpersonal skills and specific actions that improved team dynamics.",
    },
    {
      id: 10,
      question: "Tell me about a time when you went above and beyond what was required for a project or assignment.",
      tips: "Focus on your initiative, work ethic, and the impact of your extra effort.",
    },
  ];

  // Define completeTest as useCallback to prevent dependency issues in useEffects
  const completeTest = useCallback(() => {
    if (testStatus !== 'in-progress') return; // Prevent multiple calls
    
    setTestStatus('complete');
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
    
    const answeredQuestions = answers.filter(a => a.trim() !== '').length;
    
    alert(`Test completed!\n\nQuestions answered: ${answeredQuestions} out of ${questions.length}\n\nYour answers have been saved for review.`);
  }, [testStatus, answers, questions.length]);

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
    
    // Prevent text selection (except in the textarea)
    const preventSelection = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'TEXTAREA') {
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
        .behavioral-test-container * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .behavioral-test-container textarea {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
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
      const answeredCount = answers.filter(answer => answer.trim() !== '').length;
      setProgress(Math.round((answeredCount / questions.length) * 100));
    }
  }, [answers, testStatus, questions.length]);

  // Focus textarea when question changes
  useEffect(() => {
    if (currentQuestionIndex >= 0 && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentQuestionIndex]);

  const startTest = () => {
    setTestStatus('in-progress');
    setCurrentQuestionIndex(0);
    setTimeLeft(1800); // 30 minutes
    setWarnings(0);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setAnswer(newAnswer);
    
    // Update answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = newAnswer;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer(answers[currentQuestionIndex + 1] || '');
    } else {
      completeTest();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setAnswer(answers[currentQuestionIndex - 1] || '');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const returnToTests = () => {
    window.location.href = '/mock-test';
  };

  const renderStartScreen = () => (
    <DashboardLayout>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Behavioral Interview Questions</CardTitle>
          <CardDescription>
            Practice answering common behavioral interview questions using the STAR method (Situation, Task, Action, Result).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h3 className="font-medium mb-2">About this test:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>10 behavioral questions commonly asked in interviews</li>
              <li>30 minutes to complete all questions</li>
              <li>Use the STAR method to structure your answers</li>
              <li>Questions cover teamwork, problem-solving, leadership, and adaptability</li>
              <li>This test requires fullscreen mode and doesn't allow tab switching</li>
            </ul>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-medium flex items-center text-yellow-800">
              <AlertCircle className="h-4 w-4 mr-2" />
              Security Measures:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 mt-2">
              <li>Full-screen mode is required throughout the test</li>
              <li>Tab switching and screen splitting are not allowed</li>
              <li>Text selection is disabled except in answer boxes</li>
              <li>Right-clicking and keyboard shortcuts are monitored</li>
              <li>Window resizing and focus changes are detected</li>
              <li>Multiple violations will result in automatic test submission</li>
              <li>Once started, the test will run for 30 minutes or until completion</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={startTest} className="w-full">Start Test</Button>
        </CardFooter>
      </Card>
    </DashboardLayout>
  );

  const renderQuestion = () => {
    if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
      return null;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div ref={containerRef} className="min-h-screen bg-background p-6 behavioral-test-container relative">
        {/* Warning toast with transition effect */}
        {warningMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
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
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                <CardDescription>
                  Time remaining: {formatTime(timeLeft)}
                </CardDescription>
              </div>
              <div className="text-sm font-medium">
                {progress}% Complete
              </div>
            </div>
            <Progress value={progress} className="h-2 mt-2" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="font-medium text-lg">{currentQuestion.question}</div>
              
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> {currentQuestion.tips}
                </p>
              </div>
              
              <textarea
                ref={textareaRef}
                className="w-full border rounded-md p-3 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Type your answer here using the STAR method (Situation, Task, Action, Result)..."
                value={answer}
                onChange={handleAnswerChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={prevQuestion} 
              disabled={currentQuestionIndex === 0}
              className="w-1/3"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button 
              onClick={nextQuestion}
              className="w-2/3"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Test'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  const renderCompletionScreen = () => (
    <DashboardLayout>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Test Completed</CardTitle>
          <CardDescription>
            Thank you for completing the Behavioral Interview Questions test.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
            <h3 className="font-medium text-green-800 mb-2">Summary:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
              <li>Questions answered: {answers.filter(a => a.trim() !== '').length} out of {questions.length}</li>
              <li>Time taken: {30 - Math.floor(timeLeft / 60)} minutes {60 - (timeLeft % 60)} seconds</li>
              <li>Your answers have been saved for review and practice</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 text-xl">Your Answers:</h3>
            <div className="space-y-6">
              {questions.map((q, index) => (
                <Card key={q.id} className={
                  answers[index] && answers[index].length > 50 
                    ? "border-green-200 bg-green-50" 
                    : answers[index] 
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-red-200 bg-red-50"
                }>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Question {index + 1}</CardTitle>
                      {answers[index] && answers[index].length > 50 
                        ? <span className="text-sm text-green-600 font-medium">Detailed Answer</span>
                        : answers[index]
                          ? <span className="text-sm text-yellow-600 font-medium">Brief Answer</span>
                          : <span className="text-sm text-red-600 font-medium">Not Answered</span>
                      }
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 pt-0">
                    <p className="font-medium mb-2">{q.question}</p>
                    
                    <div className="space-y-4">
                      {answers[index] ? (
                        <div className="p-3 bg-white rounded border">
                          <p className="text-sm whitespace-pre-line">{answers[index]}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic p-3 bg-white rounded border">No answer provided</p>
                      )}
                      
                      <div className="text-sm bg-blue-50 p-3 rounded border border-blue-100">
                        <p className="font-medium">Tip for improvement:</p>
                        <p>{q.tips}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={returnToTests} className="w-full">Return to Tests</Button>
        </CardFooter>
      </Card>
    </DashboardLayout>
  );

  if (testStatus === 'not-started') {
    return renderStartScreen();
  } else if (testStatus === 'in-progress') {
    return renderQuestion();
  } else {
    return renderCompletionScreen();
  }
};

export default BehavioralTest; 