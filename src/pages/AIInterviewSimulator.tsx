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

// Define the SpeechRecognition interfaces
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
  onspeechstart?: () => void;
  onspeechend?: () => void;
  onnomatch?: () => void;
  onaudiostart?: () => void;
  onaudioend?: () => void;
  onsoundstart?: () => void;
  onsoundend?: () => void;
}

// Declare global window properties
declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
    TEMP_API_KEY?: string;
  }
}

// Configuration 
const GOOGLE_API_KEY = 'AIzaSyBS4f26epLRkFGSQbIQi_VFQvbFGMd9O6c'; // Google Gemini API key

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

// AI Feedback responses based on user's answers
const AI_FEEDBACK = {
  excellent: [
    "That's an excellent response! Your answer demonstrates a strong understanding of the concept.",
    "Great answer! You've addressed all the key points clearly and concisely.",
    "Very impressive! Your explanation shows deep technical knowledge and problem-solving skills.",
    "Excellent response! Your approach is both comprehensive and well-structured."
  ],
  good: [
    "Good answer. You've covered the main points, though you could elaborate more on implementation details.",
    "That's a solid response. Consider also mentioning the trade-offs involved in your approach.",
    "Good explanation. To strengthen your answer, you might want to include a real-world example.",
    "That's a reasonable approach. You might also want to consider alternative solutions."
  ],
  average: [
    "Your answer covers some important aspects, but misses a few key points like...",
    "That's a starting point, but your response could be more comprehensive. Consider addressing...",
    "I see your approach, but it might benefit from more technical depth. Try exploring...",
    "You're on the right track, but I'd like to hear more about how you would handle edge cases."
  ],
  poor: [
    "Your answer doesn't fully address the question. Let me provide some guidance on what to consider...",
    "I think there's a misunderstanding in your response. Let me clarify what the question is asking for...",
    "Your answer needs more technical accuracy. The key concepts you should focus on are...",
    "I'd recommend rethinking your approach. A more effective solution would involve..."
  ]
};

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
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // State for debugging
  const [showDebug, setShowDebug] = useState(false);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  
  // Scoring and feedback states
  const [scores, setScores] = useState<{[key: number]: number}>({});
  const [overallScore, setOverallScore] = useState<number>(0);
  const [feedbackHistory, setFeedbackHistory] = useState<{[key: number]: string}>({});
  
  // Add API connection state after the existing states
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [apiConnecting, setApiConnecting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Debug function - simplified to avoid infinite renders
  const debug = useCallback((message: string) => {
    console.log(message);
    // Only update state occasionally to prevent infinite loops
    requestAnimationFrame(() => {
      setDebugMessages(prev => [...prev.slice(-19), message]);
    });
  }, []);

  // Get active API key
  const getActiveApiKey = useCallback(() => {
    return window.TEMP_API_KEY || GOOGLE_API_KEY;
  }, []);
  
  // Update the checkApiConnection function to add more debugging
  const checkApiConnection = useCallback(async () => {
    debug("Checking Gemini API connection...");
    setApiConnecting(true);
    setApiError(null);
    
    try {
      const apiKey = getActiveApiKey();
      
      // Display API key length for debugging (don't show the full key)
      debug(`API key length: ${apiKey?.length || 0}`);
      
      if (!apiKey || apiKey.length < 10) {
        debug("API key is missing or too short");
        setApiError("Invalid API key: Please provide a valid Gemini API key");
        setApiConnecting(false);
        toast({
          title: "API Key Invalid",
          description: "Please provide a valid Gemini API key",
          variant: "destructive",
        });
        return;
      }
      
      debug(`Using API key: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`);
      
      // Test the API with a simpler prompt using the correct endpoint
      const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
      debug(`Calling API endpoint: ${apiEndpoint}`);
      
      const response = await axios.post(
        apiEndpoint,
        {
          contents: [
            {
              parts: [
                { text: "Hello" }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          }
        }
      );
      
      debug(`API response status: ${response.status}`);
      debug(`API response data: ${JSON.stringify(response.data)}`);
      
      if (response.data && 
          response.data.candidates && 
          response.data.candidates[0] && 
          response.data.candidates[0].content && 
          response.data.candidates[0].content.parts &&
          response.data.candidates[0].content.parts[0]) {
        
        const responseText = response.data.candidates[0].content.parts[0].text;
        debug(`API text response: "${responseText}"`);
        
        setIsApiConnected(true);
        toast({
          title: "Gemini API Connected",
          description: "Ready to start your AI interview",
        });
      } else {
        debug("API response did not contain expected data structure");
        setApiError("Invalid API response format. Please check your API key.");
        toast({
          title: "API Connection Error",
          description: "Invalid response from Gemini API",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to connect to Gemini API:", error);
      
      let errorMessage = "Could not connect to the Gemini API.";
      
      // Extract more specific error information
      if (error.response) {
        // The request was made and the server responded with a non-2xx status
        debug(`API error response: ${JSON.stringify(error.response.data)}`);
        
        if (error.response.status === 400) {
          errorMessage = "Bad request to Gemini API. The API key may be invalid.";
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = "Authentication failed. The API key is invalid or has been revoked.";
        } else if (error.response.status === 429) {
          errorMessage = "Too many requests. API quota may be exceeded.";
        } else if (error.response.status === 404) {
          errorMessage = "API endpoint not found. The Gemini model name or endpoint URL may be incorrect.";
        } else {
          errorMessage = `API Error: ${error.response.status} - ${error.response.data?.error?.message || "Unknown error"}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        debug("No response received from API server");
        errorMessage = "No response from Gemini API. Please check your internet connection.";
      } else {
        // Something happened in setting up the request
        debug(`API request setup error: ${error.message}`);
        errorMessage = `Error setting up API request: ${error.message}`;
      }
      
      setApiError(errorMessage);
      toast({
        title: "API Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setApiConnecting(false);
    }
  }, [debug, toast, getActiveApiKey]);

  // Add a button to directly enter your own API key - now correctly defined after checkApiConnection
  const handleApiKeyUpdate = useCallback(() => {
    const newApiKey = prompt("Enter your Gemini API key:");
    if (newApiKey && newApiKey.trim()) {
      // Use the new API key for the current session
      // Note: This won't permanently save the key
      window.TEMP_API_KEY = newApiKey.trim();
      toast({
        title: "API Key Updated",
        description: "Using the new API key for this session",
      });
      // Try connecting with the new key
      setTimeout(() => checkApiConnection(), 500);
    }
  }, [checkApiConnection, toast]);

  // Toggle debug display
  const toggleDebug = useCallback(() => {
    setShowDebug(prev => !prev);
  }, []);
  
  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    debug("Initializing speech recognition");
    
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // Create speech recognition instance
      const SpeechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        debug("Speech recognition started");
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
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
      
      recognition.onerror = (event) => {
        debug(`Speech recognition error: ${event.error}`);
        
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access in your browser settings to use speech recognition.",
            variant: "destructive"
          });
        } else if (event.error !== 'aborted') {
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
      
      // Request microphone permission first
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          debug("Microphone permission granted");
          
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
        })
        .catch(error => {
          debug(`Microphone permission denied: ${error}`);
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access to use speech recognition.",
            variant: "destructive"
          });
        });
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

  // Add startUserVideo function definition
  const startUserVideo = useCallback(async () => {
    debug("Starting user video");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        debug("Video stream attached to video element");
      }
    } catch (err) {
      debug(`Error accessing camera: ${err}`);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to participate in the interview",
        variant: "destructive"
      });
    }
  }, [debug, toast]);

  // Modify the startInterview function to check for API first and fix the reference
  const startInterview = useCallback(() => {
    // Don't start if the API isn't connected
    if (!isApiConnected) {
      toast({
        title: "API Not Connected",
        description: "Please wait for the Gemini API to connect before starting",
        variant: "destructive"
      });
      // Try to reconnect
      checkApiConnection();
      return;
    }

    // Rest of your existing startInterview logic
    debug("Starting interview");
    setIsInterviewStarted(true);
    setIsTimerRunning(true);
    
    // Initialize speech recognition
    initSpeechRecognition();
    
    // Start video
    startUserVideo();
    
    // Start the timer
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
      setInterviewDuration((prev) => prev + 1);
    }, 1000);
    
    // Start with the current question
    if (currentQuestion) {
      setAiResponse(`Welcome to your interview with ${company}. ${currentQuestion}`);
      speakText(`Welcome to your interview with ${company}. ${currentQuestion}`);
    }
  }, [isApiConnected, debug, startUserVideo, currentQuestion, company, speakText, toast, checkApiConnection, initSpeechRecognition, setTimer, setInterviewDuration]);

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
  
  // Replace the entire useEffect that references startUserVideo
  useEffect(() => {
    if (!isInterviewStarted) return;
    
    // We're now using the startUserVideo function we defined
    if (videoRef.current) {
      startUserVideo();
    }
    
    return () => {
      // Clean up video stream on unmount
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isInterviewStarted, startUserVideo]);
  
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
  
  // Modify the order by moving these methods around
  // First declare processResponseWithAI
  const processResponseWithAI = useCallback(async (userResponse) => {
    if (!userResponse.trim()) {
      toast({
        title: "Empty Response",
        description: "Please provide an answer before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    debug("Processing response with Google Gemini API");
    setAiResponding(true);
    
    // Check for short or dismissive answers
    const lowEffortResponse = userResponse.toLowerCase().trim();
    if (
      lowEffortResponse === "i don't know" || 
      lowEffortResponse === "i have no idea" || 
      lowEffortResponse === "no idea" ||
      lowEffortResponse === "idk" ||
      lowEffortResponse.length < 15
    ) {
      // Provide immediate critical feedback without API call
      const criticalFeedback = [
        "That's not the type of answer I'd expect in a real interview. Could you try to provide a more thoughtful response?",
        "In an actual interview, saying 'I don't know' without attempting to answer would be a red flag. Let's try to work through this question.",
        "I understand this might be challenging, but in a real interview, you should attempt to reason through the problem even if you're uncertain.",
        "That response wouldn't impress an interviewer. Would you like to try again with a more detailed answer?"
      ];
      
      const feedback = criticalFeedback[Math.floor(Math.random() * criticalFeedback.length)];
      
      // Set a low score for this type of answer
      const score = 2;
      setScores(prev => ({ ...prev, [currentQuestionIndex]: score }));
      setFeedbackHistory(prev => ({ ...prev, [currentQuestionIndex]: feedback }));
      
      // Update overall score
      const allScores = { ...scores, [currentQuestionIndex]: score };
      const scoreValues = Object.values(allScores);
      const newOverallScore = scoreValues.reduce((sum, val) => sum + val, 0) / scoreValues.length;
      setOverallScore(newOverallScore);
      
      setAiResponse(feedback);
      speakText(feedback);
      setAiResponding(false);
      
      // Clear the user response to prevent mismatch with next question
      setUserResponse('');
      setTranscript('');
      
      return;
    }
    
    try {
      // Create a prompt for the AI that's specific to the company and role
      const prompt = `You are an AI interviewer conducting a ${interviewType} interview for a ${role} position at ${company}. 
      
      IMPORTANT CONTEXT: 
      - You are interviewing for a ${role} developer role at ${company}
      - The candidate is currently at question #${currentQuestionIndex + 1}
      - The current question is: "${currentQuestion}"
      - The candidate just responded with: "${userResponse}"
      
      I need you to:
      1. Analyze this response on a scale of 1-10
      2. Provide specific feedback relevant to ${company}'s expectations for ${role} developers
      3. For the next question, ask something SPECIFICALLY relevant to ${company} and ${role}
      
      For example:
      - If interviewing for Amazon backend, ask about scalability, microservices, or AWS
      - If interviewing for Google frontend, ask about performance optimization or modern JS frameworks
      - If interviewing for Microsoft fullstack, ask about .NET, Azure, or cross-platform development
      
      Be critical and challenging, like a real interviewer. Don't just be polite - push the candidate to think deeper.
      If the answer is completely wrong or shows significant misunderstanding, point that out directly.
      
      Format your response as JSON with these fields:
      - score: numerical score from 1-10
      - feedback: your assessment and feedback (2-3 sentences)
      - quality: one of "excellent", "good", "average", or "poor"
      - challenge: a follow-up question that challenges the candidate to elaborate or think deeper
      - next_question: a NEW question specifically relevant to ${company} and the ${role} position`;
      
      debug("Sending request to Gemini API");
      // Using Google's AI API with updated endpoint
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
        {
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1000
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': getActiveApiKey()
          }
        }
      );
      
      debug("Received response from Gemini API");
      
      let aiReply;
      let score = 0;
      let feedbackQuality = "average";
      let challengeQuestion = "";
      let nextQuestion = "";
      
      try {
        // Parse the AI's response
        const rawResponse = response.data.candidates[0].content.parts[0].text;
        debug(`Raw AI response: ${rawResponse}`);
        
        // Extract JSON from the response (handling potential text before/after JSON)
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          score = jsonResponse.score || 5;
          feedbackQuality = jsonResponse.quality || "average";
          aiReply = jsonResponse.feedback || "Thank you for your response.";
          challengeQuestion = jsonResponse.challenge || "Could you elaborate more on your answer?";
          nextQuestion = jsonResponse.next_question || null;
        } else {
          // Fallback if JSON parsing fails
          aiReply = "I'm not fully convinced by that answer. Could you elaborate more?";
          challengeQuestion = "What specific examples can you provide to support your point?";
          score = 5;
        }
      } catch (parseError) {
        debug(`Error parsing AI response: ${parseError}`);
        aiReply = "I understand your approach, but I'd like to challenge your thinking on this.";
        challengeQuestion = "Have you considered alternative perspectives?";
        score = 5;
      }
      
      // Store the score for this question
      setScores(prev => ({ ...prev, [currentQuestionIndex]: score }));
      setFeedbackHistory(prev => ({ ...prev, [currentQuestionIndex]: aiReply }));
      
      // Update overall score
      const allScores = { ...scores, [currentQuestionIndex]: score };
      const scoreValues = Object.values(allScores);
      const newOverallScore = scoreValues.reduce((sum, val) => sum + val, 0) / scoreValues.length;
      setOverallScore(newOverallScore);
      
      // Store the next question if provided by the AI
      if (nextQuestion) {
        const newQuestions = [...getQuestionSet()];
        if (currentQuestionIndex + 1 < newQuestions.length) {
          // Replace the next question with the AI-generated one
          newQuestions[currentQuestionIndex + 1] = { question: nextQuestion, delay: 3000 };
          // We don't need to update the state here as we're using the question directly
          debug(`AI provided next question: ${nextQuestion}`);
        }
      }
      
      // Make the response more interactive by directly challenging the candidate
      const fullResponse = `${aiReply} ${challengeQuestion}`;
      debug(`AI feedback: ${fullResponse}`);
      setAiResponse(fullResponse);
      speakText(fullResponse);
      
      // Clear the user response to prevent mismatch with next question
      setUserResponse('');
      setTranscript('');
      
    } catch (error) {
      debug(`Error with AI API: ${error}`);
      // Fallback to challenging response
      const fallbackResponse = "I'm not sure that answer fully addresses the question. Could you think about it from another angle and try again?";
      setAiResponse(fallbackResponse);
      speakText(fallbackResponse);
      
      // Default score for failed API calls
      setScores(prev => ({ ...prev, [currentQuestionIndex]: 5 }));
      
      // Clear the user response to prevent mismatch with next question
      setUserResponse('');
      setTranscript('');
    } finally {
      setAiResponding(false);
    }
  }, [interviewType, role, company, currentQuestion, currentQuestionIndex, userResponse, scores, speakText, debug, getActiveApiKey, getQuestionSet]);

  // Then declare submitResponse
  const submitResponse = useCallback(() => {
    debug("Submitting user response");
    
    // Stop listening if still active
    if (isListening) {
      toggleListening();
    }
    
    // Process the response using AI
    processResponseWithAI(userResponse);
    
    // Response will be cleared inside processResponseWithAI after processing
  }, [isListening, toggleListening, userResponse, processResponseWithAI]);
  
  // Try to connect to API on component mount
  useEffect(() => {
    // Check API connection when component mounts
    checkApiConnection();
  }, [checkApiConnection]);
  
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Score:</span>
                    <span className="font-medium">{overallScore.toFixed(1)} / 10</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">AI Feedback</h3>
                <p className="text-gray-600">Based on your interview performance, here are some areas of strength and opportunities for improvement:</p>
                
                <div className="space-y-3">
                  {/* Communication score based on average score */}
                  <div>
                    <h4 className="font-medium mb-1">Communication Skills</h4>
                    <Progress value={Math.min(overallScore * 10, 100)} className="h-2" />
                    <p className="text-sm text-gray-500 mt-1">
                      {overallScore >= 8 ? "Excellent communication skills, clear and articulate." : 
                       overallScore >= 6 ? "Good communication with some room for improvement." : 
                       "Consider working on structuring your responses more clearly."}
                    </p>
                  </div>
                  
                  {/* Technical score from question responses */}
                  <div>
                    <h4 className="font-medium mb-1">Technical Knowledge</h4>
                    <Progress value={Math.min(overallScore * 10, 100)} className="h-2" />
                    <p className="text-sm text-gray-500 mt-1">
                      {overallScore >= 8 ? "Strong technical understanding demonstrated throughout." : 
                       overallScore >= 6 ? "Solid technical foundation with some gaps." : 
                       "Focus on strengthening core technical concepts."}
                    </p>
                  </div>
                  
                  {/* Problem solving based on technical questions */}
                  <div>
                    <h4 className="font-medium mb-1">Problem Solving</h4>
                    <Progress value={Math.min(overallScore * 10, 100)} className="h-2" />
                    <p className="text-sm text-gray-500 mt-1">
                      {overallScore >= 8 ? "Excellent problem-solving approach with well-structured solutions." : 
                       overallScore >= 6 ? "Good problem-solving skills with room for more efficient solutions." : 
                       "Work on breaking down problems more systematically."}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-medium mb-3">Question Breakdown</h3>
                <div className="space-y-4">
                  {Object.keys(scores).map((questionIndex) => {
                    const idx = parseInt(questionIndex);
                    const questionObj = allQuestions[idx];
                    const question = typeof questionObj === 'object' ? questionObj.question : questionObj;
                    return (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Question {idx + 1}</h4>
                          <Badge variant={scores[idx] >= 8 ? "default" : scores[idx] >= 5 ? "outline" : "destructive"}>
                            Score: {scores[idx]}/10
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{question}</p>
                        {feedbackHistory[idx] && (
                          <p className="text-xs text-gray-500 italic">"{feedbackHistory[idx]}"</p>
                        )}
                      </div>
                    );
                  })}
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
  
  // Render interview preparation screen - enhance the API connection interface
  if (!isInterviewStarted) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Interview Setup</CardTitle>
              <CardDescription>Configure your simulated interview experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* API Status indicator with enhanced feedback */}
                <div className="mb-4 p-4 border rounded-md bg-gray-50">
                  <h3 className="text-sm font-semibold mb-2">Gemini API Status:</h3>
                  {apiConnecting ? (
                    <div className="flex items-center text-yellow-600">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Connecting to Gemini API...</span>
                    </div>
                  ) : isApiConnected ? (
                    <div className="flex items-center text-green-600">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Connected to Gemini API</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center text-red-600 mb-2">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span>Not Connected to Gemini API</span>
                      </div>
                      
                      {apiError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mb-3">
                          <p className="font-medium">Error Details:</p>
                          <p>{apiError}</p>
                        </div>
                      )}
                      
                      <div className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 mb-3">
                        <p className="font-medium">Troubleshooting:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Ensure you have a valid Gemini API key from Google AI Studio</li>
                          <li>Check your internet connection</li>
                          <li>Make sure you're not using a VPN that might block the API</li>
                          <li>Try entering your API key manually using the button below</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={checkApiConnection} 
                      disabled={apiConnecting}
                    >
                      {apiConnecting ? "Connecting..." : (isApiConnected ? "Check Connection" : "Connect to API")}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleApiKeyUpdate}
                    >
                      Enter API Key
                    </Button>
                  </div>
                </div>

                {/* Your existing setup fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interview-type">Interview Type</Label>
                    <Select value={interviewType} onValueChange={(value) => navigate(`/interview/simulator?type=${value}&role=${role}&company=${company}`)}>
                      <SelectTrigger id="interview-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="system_design">System Design</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="interview-role">Role Focus</Label>
                    <Select value={role} onValueChange={(value) => navigate(`/interview/simulator?type=${interviewType}&role=${value}&company=${company}`)}>
                      <SelectTrigger id="interview-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend</SelectItem>
                        <SelectItem value="backend">Backend</SelectItem>
                        <SelectItem value="fullstack">Full Stack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="interview-company">Target Company</Label>
                  <Select value={company} onValueChange={(value) => navigate(`/interview/simulator?type=${interviewType}&role=${role}&company=${value}`)}>
                    <SelectTrigger id="interview-company">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="microsoft">Microsoft</SelectItem>
                      <SelectItem value="amazon">Amazon</SelectItem>
                      <SelectItem value="apple">Apple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="speaking-enabled">AI Speaking Voice</Label>
                    <Switch id="speaking-enabled" checked={isSpeakingEnabled} onCheckedChange={setIsSpeakingEnabled} />
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={startInterview}
                  disabled={!isApiConnected || apiConnecting}
                >
                  {apiConnecting ? "Connecting to API..." : (isApiConnected ? "Start Interview" : "API Connection Required")}
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