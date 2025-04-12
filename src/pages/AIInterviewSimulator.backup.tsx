import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Mic, MicOff, Video, VideoOff, MessageSquare, Clock, X, Volume2, VolumeX, Phone, Square, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import axios from 'axios';

// Define the SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
  onspeechstart: () => void;
  onspeechend: () => void;
  onnomatch: () => void;
  onaudiostart: () => void;
  onaudioend: () => void;
  onsoundstart: () => void;
  onsoundend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

// At the top level, add the SpeechRecognition interface
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Define question types for different interview scenarios
const QUESTION_SETS = {
  technical: {
    frontend: [
      { question: "Can you explain how React's virtual DOM works?", delay: 3000 },
      { question: "What's the difference between controlled and uncontrolled components in React?", delay: 3000 },
      { question: "How would you optimize the performance of a React application?", delay: 3000 },
      { question: "Explain how you would implement state management in a large React application.", delay: 3000 },
      { question: "How do you handle API requests in a React application?", delay: 3000 }
    ],
    backend: [
      { question: "Explain the concept of middleware in a backend framework.", delay: 3000 },
      { question: "How would you design a scalable database schema for an e-commerce platform?", delay: 3000 },
      { question: "What strategies would you use to ensure the security of a REST API?", delay: 3000 },
      { question: "Explain the differences between SQL and NoSQL databases.", delay: 3000 },
      { question: "How would you implement authentication and authorization in a web application?", delay: 3000 }
    ],
    fullstack: [
      { question: "How do you ensure data consistency between frontend and backend?", delay: 3000 },
      { question: "Explain your approach to debugging issues that span both frontend and backend.", delay: 3000 },
      { question: "How would you implement real-time features in a web application?", delay: 3000 },
      { question: "Describe your experience with containerization and deployment pipelines.", delay: 3000 },
      { question: "How do you manage state in a complex application with multiple user roles?", delay: 3000 }
    ]
  },
  behavioral: {
    general: [
      { question: "Tell me about a challenging project you worked on and how you overcame obstacles.", delay: 3000 },
      { question: "Describe a situation where you had to work under pressure to meet a deadline.", delay: 3000 },
      { question: "How do you handle conflicts within a team?", delay: 3000 },
      { question: "Can you give an example of a time when you had to adapt to a significant change at work?", delay: 3000 },
      { question: "Tell me about a time when you failed at something. How did you handle it?", delay: 3000 }
    ]
  },
  system_design: {
    general: [
      { question: "How would you design a URL shortening service like bit.ly?", delay: 3000 },
      { question: "Design a distributed cache system.", delay: 3000 },
      { question: "How would you design Twitter's news feed functionality?", delay: 3000 },
      { question: "Design a content delivery network (CDN).", delay: 3000 },
      { question: "How would you design a real-time chat application?", delay: 3000 }
    ]
  }
};

// AI feedback responses based on user's answers
const AI_FEEDBACK = [
  "That's a good point. Could you elaborate more on...",
  "Interesting approach. Have you considered alternative solutions?",
  "I like how you structured your answer. Tell me more about your implementation strategy.",
  "Good explanation. In what scenarios might this approach not work as well?",
  "That's helpful. Can you walk me through your thought process a bit more?"
];

// Company data with specific questions
const COMPANY_SPECIFIC_QUESTIONS = {
  google: [
    "How would you improve Google Search?",
    "Tell me about a time you had to make a decision with insufficient information."
  ],
  microsoft: [
    "How would you implement a feature for Microsoft Teams?",
    "Describe your approach to ensuring accessibility in software."
  ],
  amazon: [
    "How do you think about customer obsession in your work?",
    "Tell me about a time you had to make a decision that wasn't popular."
  ],
  apple: [
    "How would you balance innovation with user experience?",
    "Describe a time when you had to simplify a complex design."
  ]
};

// OpenAI API key
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace hardcoded key with placeholder

const AIInterviewSimulator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extract parameters from URL
  const company = searchParams.get('company') || 'google';
  const role = searchParams.get('role') || 'frontend';
  const interviewType = searchParams.get('type') || 'technical';
  
  // State for interview
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [aiResponding, setAiResponding] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Speech recognition and synthesis states
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const recognitionRef = useRef<any | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for debugging
  const [showDebug, setShowDebug] = useState(false);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  
  // Debug function
  const debug = useCallback((message: string) => {
    console.log(message);
    setDebugMessages(prev => [...prev.slice(-19), message]);
  }, []);

  // Toggle debug display
  const toggleDebug = useCallback(() => {
    setShowDebug(prev => !prev);
  }, []);
  
  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    debug("Initializing speech recognition");
    
    // Check browser support
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // Create speech recognition instance with 'any' type to avoid TypeScript errors
      const recognition = new window.webkitSpeechRecognition() as any;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Set up event handlers
      recognition.onstart = () => {
        debug("Speech recognition started");
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          debug(`Final transcript: ${finalTranscript}`);
          setUserResponse(prev => `${prev} ${finalTranscript}`.trim());
        }
        
        setTranscript(interimTranscript);
      };
      
      recognition.onerror = (event: any) => {
        debug(`Speech recognition error: ${event.error}`);
        
        // Only show error if it's not just aborted (which happens on stop)
        if (event.error !== 'aborted') {
          toast({
            title: "Speech Recognition Error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive"
          });
        }
        
        setIsListening(false);
      };
      
      recognition.onend = () => {
        debug("Speech recognition ended");
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      return true;
    } catch (error) {
      debug(`Error creating speech recognition: ${error}`);
      toast({
        title: "Speech Recognition Error",
        description: "Failed to initialize speech recognition.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, debug]);

  // Start or stop speech recognition
  const toggleListening = useCallback(() => {
    if (isListening) {
      debug("Stopping speech recognition");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          debug(`Error stopping speech recognition: ${error}`);
        }
      }
      setIsListening(false);
    } else {
      debug("Starting speech recognition");
      
      // Make sure we have a recognition object
      if (!recognitionRef.current) {
        if (!initSpeechRecognition()) {
          return;
        }
      }
      
      // Clear transcript and focus on new speech
      setTranscript('');
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        debug(`Error starting speech recognition: ${error}`);
        toast({
          title: "Speech Recognition Error",
          description: "Failed to start speech recognition. Please refresh the page.",
          variant: "destructive"
        });
      }
    }
  }, [isListening, initSpeechRecognition, toast, debug]);
  
  // Text-to-speech function
  const speakText = useCallback((text: string) => {
    if (!isSpeakingEnabled) return;
    
    if ('speechSynthesis' in window) {
      debug(`Preparing to speak: "${text.substring(0, 40)}..."`);
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Wait a moment before speaking (helps with reliability)
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
          debug("Speech started");
          
          utterance.onend = () => {
            debug("Speech ended");
          };
          
          utterance.onerror = (event) => {
            debug(`Speech error: ${event.error}`);
          };
        } catch (error) {
          debug(`Speech error: ${error}`);
        }
      }, 100);
    } else {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech synthesis. Try using Chrome or Edge.",
        variant: "destructive"
      });
    }
  }, [isSpeakingEnabled, toast, debug]);
  
  // Get questions based on interview type and role
  const getQuestionSet = useCallback(() => {
    debug(`Getting questions for ${interviewType} interview, ${role} role`);
    
    try {
      // First try to get role-specific questions
      if (interviewType === 'technical' && role in QUESTION_SETS.technical) {
        return QUESTION_SETS.technical[role];
      }
      
      // Fall back to general questions for the interview type
      if (interviewType === 'behavioral' || interviewType === 'system_design') {
        return QUESTION_SETS[interviewType].general;
      }
      
      // Last resort - return first available question set
      debug("Using fallback questions");
      return QUESTION_SETS.technical.frontend;
    } catch (error) {
      debug(`Error getting questions: ${error}`);
      // Ultimate fallback
      return [
        { question: "Tell me about your background and experience.", delay: 3000 },
        { question: "What are your strengths and weaknesses?", delay: 3000 },
        { question: "Why are you interested in this position?", delay: 3000 }
      ];
    }
  }, [interviewType, role, debug]);

  // Current question fixed
  const currentQuestion = useMemo(() => {
    const questions = getQuestionSet();
    if (!questions || questions.length === 0) {
      return null;
    }
    const questionObj = questions[currentQuestionIndex];
    return questionObj ? (questionObj.question ? questionObj.question : questionObj) : null;
  }, [currentQuestionIndex, getQuestionSet]);

  // Handle webcam setup
  useEffect(() => {
    if (isInterviewStarted && videoRef.current) {
      const setupCamera = async () => {
        try {
          debug("Requesting camera and microphone access...");
          
          // Simpler camera request with fewer constraints
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
              debug("Camera access granted");
              
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                  if (videoRef.current) {
                    videoRef.current.play()
                      .then(() => debug("Video playback started"))
                      .catch(e => debug(`Error playing video: ${e}`));
                  }
                };
              }
            })
            .catch(error => {
              debug(`Camera access error: ${error}`);
              toast({
                title: "Camera Access Failed",
                description: "Unable to access your camera. You can still continue with audio only.",
                variant: "destructive"
              });
            });
          
          // Initialize timer for the interview
          setIsTimerRunning(true);
        } catch (error) {
          debug(`Error in camera setup: ${error}`);
        }
      };
      
      setupCamera();
    }

    return () => {
      // Cleanup webcam
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.stop();
          debug(`Stopped track: ${track.kind}`);
        });
      }
    };
  }, [isInterviewStarted, toast, debug]);

  // Initialize speech recognition when interview starts
  useEffect(() => {
    if (isInterviewStarted) {
      initSpeechRecognition();
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isInterviewStarted, initSpeechRecognition]);

  // Interview timer
  useEffect(() => {
    if (isTimerRunning && !interviewEnded) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
        setInterviewDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, interviewEnded]);

  // Start the interview
  const startInterview = useCallback(() => {
    try {
      debug("Starting interview process");
      setIsInterviewStarted(true);
      
      // Initialize speech recognition at the beginning
      initSpeechRecognition();
      
      // Initial delay to allow camera setup
      setTimeout(() => {
        try {
          // Initial AI greeting with company context
          const initialGreeting = `Hello, I'm your AI interviewer for your ${role} position at ${company}. I'll be asking you some ${interviewType} questions. Let's begin with the first question.`;
          setAiResponse(initialGreeting);
          debug("Setting initial greeting");
          
          // Use text-to-speech for initial greeting
          speakText(initialGreeting);
          
          // After greeting, ask first question
          setTimeout(() => {
            try {
              const questions = getQuestionSet();
              debug(`Found ${questions?.length || 0} questions for this interview`);
              
              if (questions && questions.length > 0) {
                const firstQuestionObj = questions[0];
                const firstQuestion = typeof firstQuestionObj === 'object' && 'question' in firstQuestionObj ? 
                  firstQuestionObj.question : String(firstQuestionObj);
                
                debug(`First question: ${firstQuestion}`);
                setAiResponse(firstQuestion);
                speakText(firstQuestion);
              } else {
                debug("No questions found for this interview type/role");
                const errorMsg = "I'm sorry, but I don't have any questions prepared for this interview type. Please try a different interview type.";
                setAiResponse(errorMsg);
                speakText(errorMsg);
              }
            } catch (error) {
              debug(`Error handling first question: ${error}`);
              // Fallback to a simple question if there's an error
              const fallbackQuestion = "Could you tell me about your background and experience?";
              setAiResponse(fallbackQuestion);
              speakText(fallbackQuestion);
            }
          }, 6000); // Longer delay to finish greeting
        } catch (error) {
          debug(`Error in greeting phase: ${error}`);
          // Recover from errors
          const fallbackGreeting = "Welcome to your interview. Let's begin with the first question.";
          setAiResponse(fallbackGreeting);
          speakText(fallbackGreeting);
        }
      }, 1000); // Initial delay for setup
    } catch (error) {
      debug(`Critical error starting interview: ${error}`);
      toast({
        title: "Error Starting Interview",
        description: "There was a problem starting the interview. Please try again.",
        variant: "destructive"
      });
      // Reset the state
      setIsInterviewStarted(false);
    }
  }, [company, role, interviewType, getQuestionSet, speakText, initSpeechRecognition, toast, debug]);

  // Move to the next question
  const nextQuestion = useCallback(() => {
    const questions = getQuestionSet();
    debug("Moving to next question");
    
    // Stop listening while AI responds
    if (isListening) {
      toggleListening();
    }
    
    // Clear user response
    setUserResponse('');
    setTranscript('');
    
    // Check if we've reached the end of questions
    if (currentQuestionIndex + 1 >= questions.length) {
      debug("End of questions reached, ending interview");
      setInterviewEnded(true);
      setIsTimerRunning(false);
      const endMessage = "Thank you for completing this interview. I'll now generate some feedback based on your responses.";
      setAiResponse(endMessage);
      speakText(endMessage);
      return;
    }
    
    // Move to next question
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    setAiResponding(true);
    
    // Get the next question
    const nextIndex = currentQuestionIndex + 1;
    debug(`Moving to question ${nextIndex + 1} of ${questions.length}`);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const nextQuestionObj = questions[nextIndex];
      const nextQuestionText = nextQuestionObj.question || nextQuestionObj;
      
      debug(`Next question: ${nextQuestionText}`);
      setAiResponse(nextQuestionText);
      speakText(nextQuestionText);
      setAiResponding(false);
    }, 1500);
  }, [currentQuestionIndex, getQuestionSet, isListening, toggleListening, speakText, debug]);
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMicMuted(prev => !prev);
    
    // Toggle audio tracks if stream is available
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioTracks = stream.getAudioTracks();
      
      audioTracks.forEach(track => {
        // Toggle the enabled state
        track.enabled = !track.enabled;
        console.log(`Audio track ${track.enabled ? 'enabled' : 'disabled'}`);
      });
    }
    
    // Also toggle speech recognition
    if (!isMicMuted) {
      // If currently unmuted and we're muting, stop listening
      if (isListening) toggleListening();
    } else {
      // If currently muted and we're unmuting, start listening
      if (!isListening && isInterviewStarted) toggleListening();
    }
  }, [isMicMuted, isListening, isInterviewStarted, toggleListening]);

  // Toggle voice response
  const toggleVoiceResponse = useCallback(() => {
    setIsSpeakingEnabled(prev => !prev);
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    setIsVideoOff(prev => !prev);
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTracks = stream.getVideoTracks();
      
      videoTracks.forEach(track => {
        // Toggle the enabled state (this approach is more reliable)
        track.enabled = !track.enabled;
        console.log(`Video track ${track.enabled ? 'enabled' : 'disabled'}`);
      });
    }
  }, []);

  // End interview
  const endInterview = useCallback(() => {
    setInterviewEnded(true);
    setIsTimerRunning(false);
    
    // Stop listening
    if (isListening) {
      toggleListening();
    }
    
    // Stop webcam
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped track: ${track.kind}`);
      });
    }
    
    // Generate feedback
    setAiResponse("Thank you for completing this interview. Here's some feedback based on your responses...");
    speakText("Thank you for completing this interview. Here's some feedback based on your responses.");
  }, [isListening, toggleListening, speakText]);

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Add company-specific questions
  const companyQuestions = COMPANY_SPECIFIC_QUESTIONS[company as keyof typeof COMPANY_SPECIFIC_QUESTIONS] || [];
  const allQuestions = [...getQuestionSet(), ...companyQuestions.map(q => ({ question: q, delay: 3000 }))];
  
  // Start user's video when component mounts
  useEffect(() => {
    if (!isInterviewStarted) return;
    
    const startUserVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        toast({
          title: "Camera access denied",
          description: "Please allow camera access to participate in the interview",
          variant: "destructive"
        });
      }
    };
    
    startUserVideo();
    
    return () => {
      // Clean up video stream on unmount
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isInterviewStarted, toast]);
  
  // Handle timer
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);
  
  // Return to interview prep page
  const goBackToPrep = () => {
    navigate('/interview');
  };
  
  // Add a submitResponse function to manually submit when needed
  const submitResponse = useCallback(() => {
    debug("Submitting user response");
    
    // Stop listening if still active
    if (isListening) {
      toggleListening();
    }
    
    // Process the response using OpenAI
    processResponseWithAI(userResponse);
  }, [isListening, toggleListening, userResponse]);

  // Add an OpenAI integration to generate better AI responses
  const processResponseWithAI = useCallback(async (userResponse) => {
    if (!userResponse.trim()) {
      toast({
        title: "Empty Response",
        description: "Please provide an answer before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    debug("Processing response with OpenAI");
    setAiResponding(true);
    
    try {
      // Create a prompt for OpenAI
      const prompt = `You are an AI interviewer conducting a ${interviewType} interview for a ${role} position at ${company}. The current question is: "${currentQuestion}". The candidate just responded with: "${userResponse}". Please provide an appropriate follow-up comment or question in a professional interview style. Keep it brief (maximum 2-3 sentences).`;
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {role: "system", content: "You are an AI interviewer assistant that gives brief, professional feedback during interviews."},
            {role: "user", content: prompt}
          ],
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
      
      const aiReply = response.data.choices[0]?.message?.content || 
        "Thank you for your response. Let's move on to the next question.";
      
      debug(`AI response: ${aiReply}`);
      setAiResponse(aiReply);
      speakText(aiReply);
      
    } catch (error) {
      debug(`Error with OpenAI: ${error}`);
      // Fallback to simple response
      const fallbackResponse = "Thank you for your response. Let's move on to the next question.";
      setAiResponse(fallbackResponse);
      speakText(fallbackResponse);
    } finally {
      setAiResponding(false);
    }
  }, [interviewType, role, company, currentQuestion, userResponse, speakText, debug]);
  
  // Render interview completion screen
  if (interviewEnded) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Interview Completed</CardTitle>
              <CardDescription>
                Thank you for completing your AI interview with {company.charAt(0).toUpperCase() + company.slice(1)} for the {role.charAt(0).toUpperCase() + role.slice(1)} position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-medium text-green-800 mb-3">Interview Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interview Type:</span>
                    <span className="font-medium">{interviewType.charAt(0).toUpperCase() + interviewType.slice(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{formatTime(timer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions Answered:</span>
                    <span className="font-medium">{currentQuestionIndex + 1} of {allQuestions.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">AI Feedback</h3>
                <p className="text-gray-600">Based on your interview performance, here are some areas of strength and opportunities for improvement:</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Communication Skills</h4>
                    <Progress value={85} className="h-2" />
                    <p className="text-sm text-gray-500 mt-1">You communicated your ideas clearly and concisely.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Technical Knowledge</h4>
                    <Progress value={78} className="h-2" />
                    <p className="text-sm text-gray-500 mt-1">Your technical explanations demonstrated solid understanding.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Problem Solving</h4>
                    <Progress value={82} className="h-2" />
                    <p className="text-sm text-gray-500 mt-1">You showed good problem-solving skills when addressing complex questions.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goBackToPrep}>
                  Return to Interview Prep
                </Button>
                <Button>
                  Download Interview Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // Render interview preparation screen
  if (!isInterviewStarted) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Interview Simulator</CardTitle>
                  <CardDescription>
                    Prepare for your {interviewType} interview with {company.charAt(0).toUpperCase() + company.slice(1)} for the {role.charAt(0).toUpperCase() + role.slice(1)} position
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={goBackToPrep}>
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-lg font-medium text-blue-800 mb-3">Interview Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Company</p>
                    <p className="font-medium">{company.charAt(0).toUpperCase() + company.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Role</p>
                    <p className="font-medium">{role.charAt(0).toUpperCase() + role.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Interview Type</p>
                    <p className="font-medium">{interviewType.charAt(0).toUpperCase() + interviewType.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Duration</p>
                    <p className="font-medium">~{Math.ceil(allQuestions.length * 1.5)} minutes</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Before You Start</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                    <span>Make sure you're in a quiet environment with good lighting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                    <span>Test your camera and microphone before proceeding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                    <span>Have a glass of water nearby</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                    <span>The AI interviewer will ask you questions related to your role</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button size="lg" onClick={startInterview}>
                  Start Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // Render active interview screen
  return (
    <div className="container mx-auto p-4 h-full">
      <h1 className="text-2xl font-bold mb-6">AI Interview Simulator</h1>
      
      {/* Debug overlay */}
      {showDebug && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg z-50 max-w-lg max-h-80 overflow-auto text-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Debug Information</h3>
            <button 
              onClick={toggleDebug} 
              className="text-white hover:text-red-400"
            >
              Close
            </button>
          </div>

          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-semibold mb-1">Status</p>
                <p>Interview Started: <span className={isInterviewStarted ? "text-green-400" : "text-red-400"}>{isInterviewStarted ? 'Yes' : 'No'}</span></p>
                <p>Listening: <span className={isListening ? "text-green-400" : "text-red-400"}>{isListening ? 'Yes' : 'No'}</span></p>
                <p>Mic Muted: <span className={isMicMuted ? "text-red-400" : "text-green-400"}>{isMicMuted ? 'Yes' : 'No'}</span></p>
                <p>Video Off: <span className={isVideoOff ? "text-red-400" : "text-green-400"}>{isVideoOff ? 'Yes' : 'No'}</span></p>
                <p>AI Responding: <span className={aiResponding ? "text-yellow-400" : "text-green-400"}>{aiResponding ? 'Yes' : 'No'}</span></p>
              </div>
              <div>
                <p className="font-semibold mb-1">Interview Info</p>
                <p>Question: {currentQuestionIndex + 1} / {getQuestionSet()?.length || 0}</p>
                <p>Company: {company}</p>
                <p>Role: {role}</p>
                <p>Type: {interviewType}</p>
                <p>Timer: {formatTime(timer)}</p>
              </div>
            </div>

            <div className="mt-3">
              <p className="font-semibold mb-1">Current Question:</p>
              <p className="text-yellow-300">{currentQuestion || "No question loaded"}</p>
            </div>

            <div className="mt-3">
              <p className="font-semibold mb-1">Speech Recognition:</p>
              <p>Speech Recognition: {window.webkitSpeechRecognition ? "Supported" : "Not Supported"}</p>
              <p>Transcript: {transcript || "(none)"}</p>
            </div>

            <hr className="my-2 border-gray-600" />
            
            <div>
              <p className="font-semibold mb-1">Recent logs:</p>
              <div className="h-24 overflow-y-auto bg-gray-900 p-1 rounded">
                {debugMessages.map((msg, i) => (
                  <p key={i} className="whitespace-normal break-words">{msg}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-gray-600">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      
      {/* Quick debug toggle */}
      <button 
        onClick={toggleDebug}
        className="fixed bottom-2 right-2 bg-red-600 text-white p-1 rounded-full w-8 h-8 flex items-center justify-center z-50 opacity-70 hover:opacity-100"
      >
        D
      </button>
      
      <div className="grid gap-4 md:grid-cols-3 h-[calc(100vh-150px)]">
        {/* Left column - Video and controls */}
        <div className="space-y-4">
          <Card className="h-[70vh]">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>Video Feed</span>
                <span className="text-sm text-red-500 font-normal animate-pulse">
                  Recording
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[calc(100%-70px)]">
              <div className="relative w-full h-full flex items-center justify-center bg-gray-900 rounded-md overflow-hidden">
                {isVideoOff ? (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Video className="w-16 h-16 mb-2" />
                    <span>Camera is off</span>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Timer overlay */}
                <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white px-3 py-1 rounded-full">
                  {formatTime(timer)}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Controls */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-center space-x-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={isMicMuted ? "bg-red-100" : ""}
                        onClick={toggleMute}
                      >
                        {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isMicMuted ? "Unmute" : "Mute"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={isVideoOff ? "bg-red-100" : ""}
                        onClick={toggleVideo}
                      >
                        {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isVideoOff ? "Turn on camera" : "Turn off camera"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={!isSpeakingEnabled ? "bg-red-100" : ""}
                        onClick={toggleVoiceResponse}
                      >
                        {isSpeakingEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isSpeakingEnabled ? "Disable AI voice" : "Enable AI voice"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={endInterview}
                      >
                        <Phone className="h-4 w-4 rotate-135" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>End Interview</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Speech recognition status */}
              <div className="mt-4 text-center">
                {isListening ? (
                  <div className="flex items-center justify-center text-green-600">
                    <span className="mr-2">Listening</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Microphone {isMicMuted ? "muted" : "not active"}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Center column - AI responses */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>AI Interviewer</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] flex flex-col">
              <div className="bg-gray-100 p-4 rounded-md mb-4 flex-grow overflow-y-auto">
                {aiResponding ? (
                  <div className="flex items-center">
                    <span className="mr-2">AI is thinking</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                ) : (
                  <p>{aiResponse}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - User responses */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Your Response</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] flex flex-col">
              <div className="bg-gray-100 p-4 rounded-md flex-grow overflow-y-auto mb-4">
                {isListening ? (
                  <div>
                    <p className="text-sm text-green-600 mb-2">Listening... (speak your answer)</p>
                    <p>{transcript || "Your speech will appear here as you speak..."}</p>
                  </div>
                ) : (
                  <Textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Type your answer or use the microphone to speak..."
                    className="min-h-[200px] border-none bg-transparent focus-visible:ring-0"
                  />
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={toggleListening} 
                  variant={isListening ? "destructive" : "default"}
                  className="flex-1"
                >
                  {isListening ? (
                    <>
                      <Square className="mr-2 h-4 w-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={submitResponse}
                  variant="default"
                  className="flex-1"
                  disabled={!userResponse.trim() || aiResponding}
                >
                  Submit Answer
                </Button>
                
                <Button 
                  onClick={nextQuestion} 
                  className="flex-1"
                  disabled={interviewEnded || aiResponding}
                >
                  Next Question
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewSimulator; 