import React, { useState, useRef, useEffect, useCallback, useMemo, ErrorInfo, Component, ReactNode } from 'react';
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
import EmotionDetector from '@/components/interview/EmotionDetector';
import EmotionReport from '@/components/interview/EmotionReport';

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
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
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
    ],
    'data-scientist': [
      { question: "Explain the difference between supervised and unsupervised learning.", delay: 3000 },
      { question: "How do you handle imbalanced datasets in classification problems?", delay: 3000 },
      { question: "Explain the bias-variance trade-off in machine learning models.", delay: 3000 },
      { question: "What evaluation metrics would you use for a regression problem?", delay: 3000 },
      { question: "How would you approach feature selection for a machine learning model?", delay: 3000 }
    ],
    'devops': [
      { question: "Explain your experience with CI/CD pipelines.", delay: 3000 },
      { question: "How do you approach infrastructure as code?", delay: 3000 },
      { question: "What strategies do you use for monitoring and alerting in production systems?", delay: 3000 },
      { question: "How do you handle container orchestration in Kubernetes?", delay: 3000 },
      { question: "Explain your approach to disaster recovery and high availability.", delay: 3000 }
    ],
    'mobile': [
      { question: "How do you ensure performance in mobile applications?", delay: 3000 },
      { question: "Explain the differences between native and cross-platform development.", delay: 3000 },
      { question: "How do you handle offline functionality in mobile apps?", delay: 3000 },
      { question: "What strategies do you use for testing mobile applications?", delay: 3000 },
      { question: "How do you approach state management in a mobile application?", delay: 3000 }
    ],
    'ui-ux': [
      { question: "Describe your design process from research to implementation.", delay: 3000 },
      { question: "How do you test the usability of your designs?", delay: 3000 },
      { question: "Explain how you create accessible designs.", delay: 3000 },
      { question: "How do you collaborate with developers to implement your designs?", delay: 3000 },
      { question: "What metrics do you use to evaluate the success of a design?", delay: 3000 }
    ]
  },
  behavioral: {
    general: [
      { question: "Tell me about a challenging project you worked on and how you overcame obstacles.", delay: 3000 },
      { question: "Describe a situation where you had to work under pressure to meet a deadline.", delay: 3000 },
      { question: "How do you handle conflicts within a team?", delay: 3000 },
      { question: "Can you give an example of a time when you had to adapt to a significant change at work?", delay: 3000 },
      { question: "Tell me about a time when you failed at something. How did you handle it?", delay: 3000 }
    ],
    frontend: [
      { question: "Tell me about a time you had to optimize a complex UI component for performance.", delay: 3000 },
      { question: "Describe a situation where you had to balance design requirements with technical constraints.", delay: 3000 },
      { question: "How do you approach learning new frontend frameworks or libraries?", delay: 3000 },
      { question: "Tell me about a time you had to refactor a large portion of frontend code.", delay: 3000 },
      { question: "Describe how you collaborated with designers to implement a challenging UI feature.", delay: 3000 }
    ],
    backend: [
      { question: "Tell me about a time you had to scale a backend service to handle more traffic.", delay: 3000 },
      { question: "Describe a situation where you improved the performance of a database query.", delay: 3000 },
      { question: "How do you approach debugging complex backend issues in production?", delay: 3000 },
      { question: "Tell me about a time you had to implement a complex business logic in your backend code.", delay: 3000 },
      { question: "Describe how you've ensured the security of sensitive data in your applications.", delay: 3000 }
    ],
    fullstack: [
      { question: "Tell me about a project where you built both the frontend and backend components.", delay: 3000 },
      { question: "Describe a situation where you had to coordinate changes across the full stack.", delay: 3000 },
      { question: "How do you prioritize your work when dealing with both frontend and backend tasks?", delay: 3000 },
      { question: "Tell me about a time you identified and fixed a performance issue spanning both frontend and backend.", delay: 3000 },
      { question: "Describe your experience mentoring junior developers in full stack development.", delay: 3000 }
    ],
    'data-scientist': [
      { question: "Tell me about a challenging data analysis project you worked on.", delay: 3000 },
      { question: "Describe a situation where you had to explain complex data findings to non-technical stakeholders.", delay: 3000 },
      { question: "How do you keep up with the rapidly evolving field of data science?", delay: 3000 },
      { question: "Tell me about a time when your data analysis led to a significant business decision.", delay: 3000 },
      { question: "Describe a situation where you had to work with incomplete or messy data.", delay: 3000 }
    ],
    'devops': [
      { question: "Tell me about a time you automated a complex deployment process.", delay: 3000 },
      { question: "Describe a situation where you had to troubleshoot a critical production issue.", delay: 3000 },
      { question: "How do you balance system stability with the need for new features?", delay: 3000 },
      { question: "Tell me about a time you improved the security posture of your infrastructure.", delay: 3000 },
      { question: "Describe your experience implementing DevOps practices in a team new to the concept.", delay: 3000 }
    ]
  },
  system_design: {
    general: [
      { question: "How would you design a URL shortening service like bit.ly?", delay: 3000 },
      { question: "Design a distributed cache system.", delay: 3000 },
      { question: "How would you design Twitter's news feed functionality?", delay: 3000 },
      { question: "Design a content delivery network (CDN).", delay: 3000 },
      { question: "How would you design a real-time chat application?", delay: 3000 }
    ],
    frontend: [
      { question: "Design a component system for a complex dashboard application.", delay: 3000 },
      { question: "How would you architect a state management solution for a large-scale SPA?", delay: 3000 },
      { question: "Design a system for efficiently loading and rendering large datasets in the browser.", delay: 3000 },
      { question: "How would you implement a real-time collaborative editor in the browser?", delay: 3000 },
      { question: "Design a frontend architecture that supports multiple themes and white-labeling.", delay: 3000 }
    ],
    backend: [
      { question: "Design a high-throughput API gateway service.", delay: 3000 },
      { question: "How would you architect a microservice-based e-commerce backend?", delay: 3000 },
      { question: "Design a job processing queue system that ensures exactly-once delivery.", delay: 3000 },
      { question: "How would you design a recommendation engine for an online retailer?", delay: 3000 },
      { question: "Design a backend system for a ride-sharing application.", delay: 3000 }
    ],
    fullstack: [
      { question: "Design an end-to-end architecture for a social media platform.", delay: 3000 },
      { question: "How would you implement real-time notifications across multiple platforms?", delay: 3000 },
      { question: "Design a full-stack system for a food delivery application.", delay: 3000 },
      { question: "How would you architect a subscription-based content platform?", delay: 3000 },
      { question: "Design a system for a collaborative project management tool.", delay: 3000 }
    ],
    'data-scientist': [
      { question: "Design a real-time anomaly detection system.", delay: 3000 },
      { question: "How would you architect a recommendation system that balances accuracy and diversity?", delay: 3000 },
      { question: "Design a system for processing and analyzing large volumes of streaming data.", delay: 3000 },
      { question: "How would you implement a fraud detection system for an e-commerce platform?", delay: 3000 },
      { question: "Design a data pipeline for a machine learning model in production.", delay: 3000 }
    ],
    'devops': [
      { question: "Design a CI/CD pipeline for a microservice architecture.", delay: 3000 },
      { question: "How would you architect a monitoring and alerting system for a global application?", delay: 3000 },
      { question: "Design an infrastructure that can automatically scale based on traffic patterns.", delay: 3000 },
      { question: "How would you implement zero-downtime deployments for a critical service?", delay: 3000 },
      { question: "Design a disaster recovery system with minimal data loss and downtime.", delay: 3000 }
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

// Define the type for company-specific questions
interface CompanyQuestionsType {
  [company: string]: {
    [role: string]: string[];
  };
}

// Company data with specific questions
const COMPANY_SPECIFIC_QUESTIONS: CompanyQuestionsType = {
  google: {
    frontend: [
      "How would you implement a high-performance UI component for Google Search auto-suggestions?",
      "Explain your approach to optimizing load times for Google's web applications.",
      "How would you architect a complex state management system for a large-scale Google application?",
      "Describe how you would ensure accessibility in Google's web interfaces.",
      "How would you improve the responsive design of Google Maps?"
    ],
    backend: [
      "How would you design a scalable backend system to handle Google-scale search queries?",
      "Explain how you would implement efficient caching for a Google backend service.",
      "How would you architect a distributed database system like Google's Spanner?",
      "Describe your approach to handling rate limiting for Google APIs.",
      "How would you structure microservices for Google's backend infrastructure?"
    ],
    fullstack: [
      "How would you implement real-time collaboration features like in Google Docs?",
      "Explain your approach to full-stack optimization for Google's web applications.",
      "How would you integrate Google Cloud services in a full-stack application?",
      "Describe how you would implement OAuth integration with Google's identity services.",
      "How would you approach testing a complex Google application across the full stack?"
    ]
  },
  microsoft: {
    frontend: [
      "How would you create a component system that aligns with Microsoft's Fluent Design?",
      "Explain your approach to building accessible UI components for Microsoft Teams.",
      "How would you implement cross-platform UI that works well across Microsoft's ecosystem?",
      "Describe your experience with responsive design for enterprise applications like Microsoft's.",
      "How would you optimize the performance of a React application for Microsoft's web services?"
    ],
    backend: [
      "How would you architect a backend service that integrates with Microsoft Azure?",
      "Explain your approach to building secure APIs for Microsoft's enterprise customers.",
      "How would you implement a scalable .NET backend for a Microsoft application?",
      "Describe your experience with cloud-native development on Azure.",
      "How would you design a data pipeline for a Microsoft business intelligence tool?"
    ],
    fullstack: [
      "How would you architect a full-stack application using Microsoft's technology stack?",
      "Explain your approach to implementing SSO using Microsoft's identity platform.",
      "How would you design a system that integrates with Microsoft 365 services?",
      "Describe your experience with DevOps practices in a Microsoft environment.",
      "How would you approach building an enterprise application that leverages Microsoft Graph API?"
    ]
  },
  amazon: {
    frontend: [
      "How would you design a responsive UI for Amazon's product pages?",
      "Explain your approach to optimizing the user experience for Amazon's checkout flow.",
      "How would you implement A/B testing for Amazon's frontend features?",
      "Describe your experience with creating performant web interfaces for e-commerce.",
      "How would you structure a component library for Amazon's diverse product categories?"
    ],
    backend: [
      "How would you architect a microservice system using AWS services?",
      "Explain your approach to building scalable backend systems like those at Amazon.",
      "How would you implement a recommendation engine for Amazon's products?",
      "Describe your experience with distributed systems at scale.",
      "How would you design a system to handle Amazon's order processing volume?"
    ],
    fullstack: [
      "How would you implement a complete feature across Amazon's technology stack?",
      "Explain your approach to full-stack monitoring and observability at Amazon scale.",
      "How would you design a system that integrates with multiple AWS services?",
      "Describe your experience with serverless architecture for e-commerce applications.",
      "How would you approach building a feature that spans mobile, web, and backend systems?"
    ]
  },
  apple: {
    frontend: [
      "How would you implement animations and transitions that match Apple's design language?",
      "Explain your approach to creating pixel-perfect interfaces like Apple's products.",
      "How would you design responsive web applications that feel native on Apple devices?",
      "Describe your experience with optimizing UI performance for high-end devices.",
      "How would you implement accessibility features that meet Apple's standards?"
    ],
    backend: [
      "How would you architect backend services that power Apple's ecosystem?",
      "Explain your approach to implementing secure data synchronization across devices.",
      "How would you design APIs that maintain Apple's privacy standards?",
      "Describe your experience with high-performance backend systems.",
      "How would you implement a backend service that scales to support Apple's user base?"
    ],
    fullstack: [
      "How would you create a seamless experience across Apple's platforms?",
      "Explain your approach to implementing cloud features while maintaining privacy.",
      "How would you design an application that works across the Apple ecosystem?",
      "Describe your experience with integrating hardware and software features.",
      "How would you implement a feature that requires both frontend polish and backend performance?"
    ]
  }
};

// Create an error boundary component to catch runtime errors
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, errorMessage: string}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorMessage: error.message });
  }

  render() {
    if (this.state.hasError) {
      return (
        <DashboardLayout>
          <div className="max-w-4xl mx-auto p-8">
            <Card className="border-red-500">
              <CardHeader>
                <CardTitle className="text-red-600">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Something went wrong: {this.state.errorMessage}</p>
                <Button onClick={() => window.location.reload()}>Reload Application</Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      );
    }

    return this.props.children;
  }
}

const AIInterviewSimulator = () => {
  console.log("Initializing AIInterviewSimulator component");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extract parameters from URL
  const company = searchParams.get('company') || 'google';
  const role = searchParams.get('role') || 'frontend';
  const interviewType = searchParams.get('type') || 'technical';
  console.log(`Interview params: company=${company}, role=${role}, type=${interviewType}`);
  
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
  const [showDebug, setShowDebug] = useState(true); // Set debug to visible by default to help troubleshooting
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  
  // Scoring and feedback states
  const [scores, setScores] = useState<{[key: number]: number}>({});
  const [overallScore, setOverallScore] = useState<number>(0);
  const [feedbackHistory, setFeedbackHistory] = useState<{[key: number]: string}>({});
  
  // Add API connection state after the existing states
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [apiConnecting, setApiConnecting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Error state for component
  const [componentError, setComponentError] = useState<string | null>(null);
  
  // Add state for emotion tracking
  const [emotionData, setEmotionData] = useState<{ [key: string]: number }[]>([]);
  const [emotionsByQuestion, setEmotionsByQuestion] = useState<{ [key: number]: { [key: string]: number } }>({});
  const [showEmotionReport, setShowEmotionReport] = useState(false);
  
  // Add handleEmotionCapture function
  const handleEmotionCapture = useCallback((emotions: { [key: string]: number }) => {
    // Store emotion data with timestamp
    setEmotionData(prev => [...prev, emotions]);
    
    // Also track emotions by current question
    setEmotionsByQuestion(prev => ({
      ...prev,
      [currentQuestionIndex]: emotions
    }));
  }, [currentQuestionIndex]);
  
  // Add debug function - enhanced to also log to console
  const debug = useCallback((message: string) => {
    console.log(`[DEBUG] ${message}`);
    // Only update state occasionally to prevent infinite loops
    requestAnimationFrame(() => {
      setDebugMessages(prev => [...prev.slice(-19), message]);
    });
  }, []);

  // Add state to hold dynamically generated questions
  const [dynamicQuestions, setDynamicQuestions] = useState<{question: string, delay: number}[]>([]);

  // Add error handling for critical operations
  useEffect(() => {
    console.log("AIInterviewSimulator component mounted");
    
    // Add global error handler
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setComponentError(`Error: ${event.message}`);
      debug(`Global error: ${event.message}`);
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      console.log("AIInterviewSimulator component unmounted");
    };
  }, [debug]);
  
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
      
      // Add timeout to prevent long-hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
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
            },
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
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
      } catch (error) {
        clearTimeout(timeoutId);
        throw error; // Re-throw to be caught by the outer try/catch
      }
    } catch (error: unknown) {
      console.error("Failed to connect to Gemini API:", error);
      
      // Check if it's a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        debug("API request timed out");
        setApiError("Connection to Gemini API timed out. The API may be down or inaccessible from your network.");
        toast({
          title: "API Connection Timeout",
          description: "Connection to Gemini API timed out. Please try again later.",
          variant: "destructive",
        });
        setApiConnecting(false);
        return;
      }
      
      let errorMessage = "Could not connect to the Gemini API.";
      
      // Extract more specific error information
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            status: number;
            data?: {
              error?: {
                message?: string;
              };
            };
          };
          request?: unknown;
          message?: string;
        };
        
        // The request was made and the server responded with a non-2xx status
        if (axiosError.response) {
          debug(`API error response: ${JSON.stringify(axiosError.response.data)}`);
          
          if (axiosError.response.status === 400) {
            errorMessage = "Bad request to Gemini API. The API key may be invalid.";
          } else if (axiosError.response.status === 401 || axiosError.response.status === 403) {
            errorMessage = "Authentication failed. The API key is invalid or has been revoked.";
          } else if (axiosError.response.status === 429) {
            errorMessage = "Too many requests. API quota may be exceeded.";
          } else if (axiosError.response.status === 404) {
            errorMessage = "API endpoint not found. The Gemini model name or endpoint URL may be incorrect.";
          } else {
            const apiErrorMessage = axiosError.response.data?.error?.message || "Unknown error";
            errorMessage = `API Error: ${axiosError.response.status} - ${apiErrorMessage}`;
          }
        } else if (axiosError.request) {
          // The request was made but no response was received
          debug("No response received from API server");
          errorMessage = "No response from Gemini API. Please check your internet connection.";
        } else if (axiosError.message) {
          // Something happened in setting up the request
          debug(`API request setup error: ${axiosError.message}`);
          errorMessage = `Error setting up API request: ${axiosError.message}`;
        }
      } else if (error instanceof Error) {
        debug(`API general error: ${error.message}`);
        errorMessage = `Error connecting to API: ${error.message}`;
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

  // Add auto-retry mechanism for API connection
  useEffect(() => {
    if (apiError && !apiConnecting) {
      const retryTimeout = setTimeout(() => {
        debug("Retrying API connection...");
        checkApiConnection();
      }, 5000); // Retry after 5 seconds

      return () => clearTimeout(retryTimeout);
    }
  }, [apiError, apiConnecting, checkApiConnection, debug]);

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
      const SpeechRecognitionAPI: any = window.webkitSpeechRecognition || window.SpeechRecognition;
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
    debug(`Getting questions for ${interviewType} interview, ${role} role at ${company}`);
    
    // Use dynamically generated questions if available
    if (dynamicQuestions && dynamicQuestions.length > 0) {
      debug("Using Gemini-generated questions");
      return dynamicQuestions;
    }
    
    // Otherwise, fall back to predefined questions
    try {
      // First try to get company and role-specific questions
      if (company && role && 
          COMPANY_SPECIFIC_QUESTIONS[company] && 
          COMPANY_SPECIFIC_QUESTIONS[company][role] && 
          COMPANY_SPECIFIC_QUESTIONS[company][role][interviewType]) {
        return COMPANY_SPECIFIC_QUESTIONS[company][role][interviewType];
      }
      
      // Check if there are role-specific questions for this interview type
      if (interviewType in QUESTION_SETS && role in QUESTION_SETS[interviewType]) {
        return QUESTION_SETS[interviewType][role];
      }
      
      // Fall back to general questions for the interview type
      if (interviewType in QUESTION_SETS && QUESTION_SETS[interviewType].general) {
        return QUESTION_SETS[interviewType].general;
      }
      
      // Last resort - return first available question set
      debug("Using fallback questions");
      return QUESTION_SETS.technical.frontend;
    } catch (error) {
      debug(`Error getting questions: ${error}`);
      // Ultimate fallback
      return [
        { question: "Tell me about yourself and your experience.", delay: 3000 },
        { question: "What are your strengths and weaknesses?", delay: 3000 },
        { question: "Why are you interested in this position?", delay: 3000 }
      ];
    }
  }, [interviewType, role, company, debug, dynamicQuestions]);

  // Current question fixed
  const currentQuestion = useMemo(() => {
    const questions = getQuestionSet();
    if (!questions || questions.length === 0) {
      return null;
    }
    const questionObj = questions[currentQuestionIndex];
    return questionObj ? (questionObj.question ? questionObj.question : questionObj) : null;
  }, [currentQuestionIndex, getQuestionSet]);

  // Add company-specific questions
  const getCompanySpecificQuestions = useCallback(() => {
    // With the new structure, we need to extract questions in a different way
    if (COMPANY_SPECIFIC_QUESTIONS[company]) {
      // Get questions across all roles for this company
      const allRoleQuestions: string[] = [];
      
      // Collect questions from all roles for this company
      Object.values(COMPANY_SPECIFIC_QUESTIONS[company]).forEach(roleQuestions => {
        if (Array.isArray(roleQuestions)) {
          allRoleQuestions.push(...roleQuestions);
        }
      });
      
      // Shuffle and take 2 random company questions
      const shuffled = [...allRoleQuestions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 2);
      
      return selected.map(q => ({ question: q, delay: 3000 }));
    }
    
    // Fallback to empty array if no company questions found
    return [];
  }, [company]);

  // Add a function to limit total questions to 5
  const getAllQuestionsLimited = useCallback(() => {
    // Check if we have company and role-specific questions
    if (company && role && 
        COMPANY_SPECIFIC_QUESTIONS[company] && 
        COMPANY_SPECIFIC_QUESTIONS[company][role]) {
      
      // Use up to 5 company-role specific questions
      const companyRoleQuestions = getQuestionSet().slice(0, 5);
      debug(`Using ${companyRoleQuestions.length} company-role specific questions for ${company} ${role}`);
      return companyRoleQuestions;
    }
    
    // If no company-role specific questions, use our original approach
    const standardQuestions = getQuestionSet().slice(0, 3); // Get only 3 standard questions
    const companyQuestions = getCompanySpecificQuestions(); // Get 2 company-specific questions
    return [...standardQuestions, ...companyQuestions]; // Total: 5 questions
  }, [getQuestionSet, getCompanySpecificQuestions, company, role]);

  // Use limited questions
  const allQuestions = useMemo(() => getAllQuestionsLimited(), [getAllQuestionsLimited]);
  
  // Add startUserVideo function definition - modified to work with EmotionDetector
  const startUserVideo = useCallback(async () => {
    debug("Starting user video");
    try {
      // We don't need to set up the video stream directly anymore
      // as the EmotionDetector component will handle this internally
      
      // Just check if camera is accessible
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      debug("Camera access granted");
      
      // Don't need to set videoRef.current.srcObject as EmotionDetector will handle it
    } catch (err) {
      debug(`Error accessing camera: ${err}`);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to participate in the interview",
        variant: "destructive",
      });
      // Set video to off if camera access fails
      setIsVideoOff(true);
    }
  }, [debug, toast]);
  
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
  
  // Updated useEffect that no longer needs to directly manage video streams
  useEffect(() => {
    if (!isInterviewStarted) return;
    
    // Just check camera permissions when interview starts
    startUserVideo();
    
    // No cleanup needed here as EmotionDetector will handle its own cleanup
    return () => {
      // Nothing to clean up here
    };
  }, [isInterviewStarted, startUserVideo]);
  
  // Add a new useEffect to check camera permissions on component mount
  useEffect(() => {
    // Check camera permissions when component mounts
    debug("Checking camera permissions on mount");
    startUserVideo();
  }, [startUserVideo]);
  
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
      // Define company-specific traits and expectations to focus on
      const companyTraits = {
        google: {
          values: ["Innovation", "Technical excellence", "Scalability", "Problem-solving", "Data-driven"],
          focus: {
            frontend: "web performance optimization, large-scale applications, and modern frameworks",
            backend: "distributed systems, algorithm efficiency, and scalable infrastructure",
            fullstack: "end-to-end solutions, technical depth across stack, and Google Cloud Platform"
          }
        },
        microsoft: {
          values: ["Growth mindset", "Customer obsession", "Inclusive design", "Collaborative", "Technical leadership"],
          focus: {
            frontend: "accessibility, cross-platform compatibility, and UI/UX innovation",
            backend: ".NET ecosystem, Azure cloud services, and enterprise-scale solutions",
            fullstack: "Microsoft technology stack integration, cloud-native applications, and DevOps"
          }
        },
        amazon: {
          values: ["Customer obsession", "Ownership", "High bar for talent", "Bias for action", "Frugality"],
          focus: {
            frontend: "user experience, responsive design, and performance metrics",
            backend: "microservices, distributed systems, and AWS infrastructure",
            fullstack: "end-to-end ownership, full-lifecycle development, and cloud-first architecture"
          }
        },
        apple: {
          values: ["Design excellence", "User focus", "Simplicity", "Quality", "Innovation"],
          focus: {
            frontend: "pixel-perfect interfaces, animation quality, and design-led development",
            backend: "performance optimization, security, and system integration",
            fullstack: "seamless ecosystem integration, platform-specific optimization, and user privacy"
          }
        }
      };
      
      // Get relevant company traits or use generic traits if company not recognized
      const traits = companyTraits[company as keyof typeof companyTraits] || {
        values: ["Technical excellence", "Problem-solving", "Teamwork"],
        focus: {
          frontend: "user interfaces and experiences",
          backend: "systems and infrastructure",
          fullstack: "end-to-end development"
        }
      };
      
      // Create a prompt for the AI that's tailored to the company and role
      const prompt = `You are an interviewer at ${company} conducting a technical interview for a ${role} developer position. KEEP RESPONSES BRIEF.
      
      INSTRUCTIONS:
      1. Evaluate this answer to the question: "${currentQuestion}"
      2. The candidate responded: "${userResponse}"
      3. You are at question #${currentQuestionIndex + 1} of 5 total questions.
      4. Stay in character as a ${company} interviewer focusing on ${traits.focus[role as keyof typeof traits.focus]}
      5. Your company values are: ${traits.values.join(', ')}
      
      YOUR RESPONSE MUST BE CONCISE AND INCLUDE:
      - Brief feedback (1-2 sentences maximum)
      - A short follow-up or transition (1 sentence maximum)
      - A new technical question about ${traits.focus[role as keyof typeof traits.focus]} 
      
      LIMIT YOUR ENTIRE RESPONSE TO 3-4 SENTENCES TOTAL. DO NOT USE PLEASANTRIES OR EXCESSIVE EXPLANATION.
      
      Format your response as JSON with these fields:
      {
        "score": 1-10 numerical rating,
        "feedback": "1-2 sentence feedback on their answer",
        "next_question": "A specific technical question about ${traits.focus[role as keyof typeof traits.focus]}"
      }`;
      
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
            temperature: 0.7,
            maxOutputTokens: 350
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
          aiReply = jsonResponse.feedback || "Let's move on to the next question.";
          nextQuestion = jsonResponse.next_question || null;
        } else {
          // Fallback if JSON parsing fails
          aiReply = "I need to assess your approach further.";
          score = 5;
        }
      } catch (parseError) {
        debug(`Error parsing AI response: ${parseError}`);
        aiReply = "Let's move on to the next question.";
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
      
      // Use a concise response format to avoid token exhaustion
      const fullResponse = `${aiReply} ${nextQuestion ? nextQuestion : ''}`;
      debug(`AI feedback: ${fullResponse}`);
      setAiResponse(fullResponse);
      speakText(fullResponse);
      
      // Clear the user response to prevent mismatch with next question
      setUserResponse('');
      setTranscript('');
      
    } catch (error) {
      debug(`Error with AI API: ${error}`);
      // Fallback to challenging response
      const fallbackResponse = "Let's move on to the next question.";
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
  }, [interviewType, role, company, currentQuestion, currentQuestionIndex, userResponse, scores, speakText, debug, getActiveApiKey, getQuestionSet, toast]);

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

  // Modify the startInterview function to check for API first and fix the reference
  const startInterview = useCallback(() => {
    // Don't start if the API isn't connected
    if (!isApiConnected) {
      debug("API not connected, attempting to connect...");
      toast({
        title: "API Not Connected",
        description: "Attempting to connect to Gemini API before starting...",
        variant: "default"
      });
      
      // Set a loading state
      setApiConnecting(true);
      
      // Try to connect with a retry mechanism
      const connect = async () => {
        let retries = 0;
        const maxRetries = 3;
        
        while (retries < maxRetries) {
          try {
            await checkApiConnection();
            
            // If we reach here, connection was successful
            debug("API connection successful after retry");
            
            // Now we can start the interview
            startInterviewAfterConnection();
            return;
          } catch (error) {
            retries++;
            debug(`API connection retry ${retries}/${maxRetries} failed`);
            
            if (retries >= maxRetries) {
              toast({
                title: "API Connection Failed",
                description: "Unable to connect to Gemini API after multiple attempts. Please check your connection and API key.",
                variant: "destructive"
              });
              setApiConnecting(false);
              return;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      };
      
      connect();
      return;
    }

    // If API is already connected, start interview directly
    startInterviewAfterConnection();
  }, [isApiConnected, debug, checkApiConnection, toast]);
  
  // Extract interview start logic to a separate function
  const startInterviewAfterConnection = useCallback(() => {
    debug("Starting interview");
    setIsInterviewStarted(true);
    setIsTimerRunning(true);
    
    // Initialize speech recognition with retry
    const initSpeechWithRetry = async () => {
      let retries = 0;
      const maxRetries = 2;
      
      while (retries <= maxRetries) {
        const success = initSpeechRecognition();
        if (success) {
          debug("Speech recognition initialized successfully");
          break;
        }
        
        debug(`Speech recognition init failed, retry ${retries + 1}/${maxRetries + 1}`);
        retries++;
        
        if (retries > maxRetries) {
          toast({
            title: "Speech Recognition Failed",
            description: "Could not initialize speech recognition. You can still type your responses.",
            variant: "default"
          });
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };
    
    initSpeechWithRetry();
    
    // Start video with error handling
    try {
      startUserVideo().catch(err => {
        debug(`Error starting video: ${err}`);
        toast({
          title: "Camera Access Error",
          description: "Could not access camera. The interview will continue without video.",
          variant: "default"
        });
      });
    } catch (err) {
      debug(`Exception starting video: ${err}`);
    }
    
    // Start the timer
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
      setInterviewDuration((prev) => prev + 1);
    }, 1000);
    
    // Generate fresh questions using Gemini
    generateQuestionsWithGemini().then(questions => {
      if (questions && questions.length > 0) {
        const firstQuestion = questions[0];
        debug(`First Gemini-generated question: ${firstQuestion}`);
        
        const companyName = company.charAt(0).toUpperCase() + company.slice(1);
        const welcomeMessage = `Welcome to your ${role} developer interview with ${companyName}. I'll be asking you questions specific to our company and role. ${firstQuestion}`;
        setAiResponse(welcomeMessage);
        speakText(welcomeMessage);
      } else {
        debug("Failed to generate questions with Gemini, falling back to predefined set");
        // Fall back to first predefined question if API fails
        if (currentQuestion) {
          const companyName = company.charAt(0).toUpperCase() + company.slice(1);
          const welcomeMessage = `Welcome to your ${role} developer interview with ${companyName}. I'll be asking you questions specific to our company and role. ${currentQuestion}`;
          setAiResponse(welcomeMessage);
          speakText(welcomeMessage);
        } else {
          debug("No current question available");
          toast({
            title: "Error Loading Questions",
            description: "Could not load interview questions. Please try refreshing the page.",
            variant: "destructive"
          });
        }
      }
    });
  }, [debug, initSpeechRecognition, startUserVideo, currentQuestion, company, role, speakText, toast, setTimer, setInterviewDuration]);

  // Add a function to generate questions with Gemini
  const generateQuestionsWithGemini = useCallback(async (): Promise<string[]> => {
    debug("Generating fresh interview questions with Gemini API");
    
    try {
      // Define company-specific traits and expectations to focus on
      const companyTraits = {
        google: {
          values: ["Innovation", "Technical excellence", "Scalability", "Problem-solving", "Data-driven"],
          focus: {
            frontend: "web performance optimization, large-scale applications, and modern frameworks",
            backend: "distributed systems, algorithm efficiency, and scalable infrastructure",
            fullstack: "end-to-end solutions, technical depth across stack, and Google Cloud Platform"
          }
        },
        microsoft: {
          values: ["Growth mindset", "Customer obsession", "Inclusive design", "Collaborative", "Technical leadership"],
          focus: {
            frontend: "accessibility, cross-platform compatibility, and UI/UX innovation",
            backend: ".NET ecosystem, Azure cloud services, and enterprise-scale solutions",
            fullstack: "Microsoft technology stack integration, cloud-native applications, and DevOps"
          }
        },
        amazon: {
          values: ["Customer obsession", "Ownership", "High bar for talent", "Bias for action", "Frugality"],
          focus: {
            frontend: "user experience, responsive design, and performance metrics",
            backend: "microservices, distributed systems, and AWS infrastructure",
            fullstack: "end-to-end ownership, full-lifecycle development, and cloud-first architecture"
          }
        },
        apple: {
          values: ["Design excellence", "User focus", "Simplicity", "Quality", "Innovation"],
          focus: {
            frontend: "pixel-perfect interfaces, animation quality, and design-led development",
            backend: "performance optimization, security, and system integration",
            fullstack: "seamless ecosystem integration, platform-specific optimization, and user privacy"
          }
        }
      };
      
      // Get relevant company traits or use generic traits if company not recognized
      const traits = companyTraits[company as keyof typeof companyTraits] || {
        values: ["Technical excellence", "Problem-solving", "Teamwork"],
        focus: {
          frontend: "user interfaces and experiences",
          backend: "systems and infrastructure",
          fullstack: "end-to-end development"
        }
      };
      
      // Create a prompt for the AI to generate interview questions
      const prompt = `You are an interviewer at ${company} conducting a ${interviewType} interview for a ${role} developer position.

      TASK:
      Generate 5 unique and challenging interview questions that a ${company} interviewer would ask a ${role} developer candidate.
      
      CONTEXT:
      - Questions should be for a ${interviewType} interview type
      - Focus on ${traits.focus[role as keyof typeof traits.focus]}
      - Questions should reflect ${company}'s values: ${traits.values.join(', ')}
      - Questions should be varied in difficulty (mix of easy, medium, and hard)
      - Questions should test both knowledge and problem-solving skills
      
      FORMAT YOUR RESPONSE AS A JSON ARRAY:
      [
        "Question 1 here?",
        "Question 2 here?",
        "Question 3 here?",
        "Question 4 here?", 
        "Question 5 here?"
      ]
      
      ONLY RETURN THE JSON ARRAY WITH QUESTIONS. NO EXPLANATIONS OR OTHER TEXT.`;
      
      debug("Sending question generation request to Gemini API");
      
      // Call the Gemini API to generate questions
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
            temperature: 0.9, // Higher temperature for more variety
            maxOutputTokens: 800
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': getActiveApiKey()
          }
        }
      );
      
      // Parse the AI's response
      const rawResponse = response.data.candidates[0].content.parts[0].text;
      debug(`Raw API question generation response: ${rawResponse.substring(0, 100)}...`);
      
      try {
        // Extract and parse the JSON array of questions
        const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const questions = JSON.parse(jsonMatch[0]);
          debug(`Successfully generated ${questions.length} questions with Gemini`);
          
          // Store these questions in state for later use
          // We'll create an array of question objects to match our expected format
          const questionObjects = questions.map((q: string) => ({ question: q, delay: 3000 }));
          
          // Override the original getQuestionSet function behavior
          const dynamicQuestionSet = () => questionObjects;
          setDynamicQuestions(questionObjects);
          
          return questions;
        } else {
          debug("Failed to parse JSON from Gemini response");
          return [];
        }
      } catch (parseError) {
        debug(`Error parsing Gemini response: ${parseError}`);
        return [];
      }
    } catch (error) {
      debug(`Error generating questions with Gemini: ${error}`);
      return [];
    }
  }, [company, role, interviewType, debug, getActiveApiKey]);

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

  // Toggle video - simplified for EmotionDetector integration
  const toggleVideo = useCallback(() => {
    // Just toggle the state - EmotionDetector will handle visibility based on isVideoOff
    setIsVideoOff(prev => !prev);
    console.log(`Video turned ${!isVideoOff ? 'off' : 'on'}`);
  }, [isVideoOff]);

  // End interview - updated for EmotionDetector integration
  const endInterview = useCallback(() => {
    setInterviewEnded(true);
    setIsTimerRunning(false);
    
    // Show emotion report
    setShowEmotionReport(true);
    
    // Stop listening
    if (isListening) {
      toggleListening();
    }
    
    // No need to manually stop webcam as EmotionDetector handles this when component unmounts
    
    // Generate feedback
    setAiResponse("Thank you for completing this interview. Here's some feedback based on your responses...");
    speakText("Thank you for completing this interview. Here's some feedback based on your responses.");
    
    // Add a suggestion for facial emotion analysis
    setTimeout(() => {
      toast({
        title: "Interview Complete",
        description: "Try our Facial Emotion Analysis tool to improve your non-verbal communication.",
        action: (
          <Button variant="outline" onClick={() => navigate("/facial-emotion-analysis")}>
            Try Now
          </Button>
        )
      });
    }, 2000);
  }, [isListening, toggleListening, speakText, toast, navigate]);

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Return to interview prep page
  const goBackToPrep = () => {
    navigate('/interview');
  };
  
  // Check browser compatibility
  useEffect(() => {
    debug("Checking browser compatibility...");
    
    // Check browser features required by the app
    const checkBrowserCompatibility = () => {
      // Check for basic Web APIs
      const requiredFeatures = [
        { name: 'fetch', feature: 'fetch' in window },
        { name: 'Promises', feature: typeof Promise !== 'undefined' },
        { name: 'videoElement', feature: typeof HTMLVideoElement !== 'undefined' },
        { name: 'MediaDevices', feature: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) },
        { name: 'WebRTC', feature: typeof RTCPeerConnection !== 'undefined' },
        { name: 'Speech Recognition', feature: !!(window.webkitSpeechRecognition || (window as any).SpeechRecognition) },
        { name: 'SpeechSynthesis', feature: 'speechSynthesis' in window }
      ];
      
      const missingFeatures = requiredFeatures.filter(feature => !feature.feature).map(feature => feature.name);
      
      if (missingFeatures.length > 0) {
        const missingFeaturesStr = missingFeatures.join(', ');
        const errorMsg = `Your browser doesn't support required features: ${missingFeaturesStr}. Please use a modern browser like Chrome or Edge.`;
        debug(`Browser compatibility issue: ${errorMsg}`);
        setComponentError(errorMsg);
        return false;
      }
      
      debug("Browser compatibility check passed");
      return true;
    };
    
    const isCompatible = checkBrowserCompatibility();
    
    // If browser is compatible, proceed with initialization
    if (isCompatible) {
      // Try to connect to API as soon as component loads
      checkApiConnection().catch(error => {
        debug(`Initial API connection error: ${error}`);
        // Don't set component error for API issues, as they're handled separately
      });
    }
  }, [debug, checkApiConnection]);
  
  // Render error UI if compatibility issues are detected
  if (componentError) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-8">
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Browser Compatibility Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{componentError}</p>
              <p className="mb-4">Please try using a modern browser like Chrome or Edge.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
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
              
              {/* Add Facial Emotion Analysis section right after the summary */}
              <div className="mt-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-blue-800 mb-3">Facial Emotion Analysis</h3>
                
                {emotionData.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-blue-700 mb-4">
                      During your interview, we analyzed your facial expressions to provide insights into your non-verbal communication.
                      Here's a summary of the emotions detected during your interview:
                    </p>
                    
                    {/* Overall emotion distribution */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Overall Emotion Distribution</h4>
                      {(() => {
                        // Calculate average emotions
                        const totalEmotions: Record<string, number> = {};
                        const avgEmotions: Record<string, number> = {};
                        
                        // Sum up all emotions
                        emotionData.forEach(item => {
                          Object.entries(item).forEach(([emotion, value]) => {
                            totalEmotions[emotion] = (totalEmotions[emotion] || 0) + value;
                          });
                        });
                        
                        // Calculate averages
                        if (emotionData.length > 0) {
                          Object.keys(totalEmotions).forEach(emotion => {
                            avgEmotions[emotion] = totalEmotions[emotion] / emotionData.length;
                          });
                        }
                        
                        return (
                          <div className="space-y-2">
                            {Object.entries(avgEmotions)
                              .sort(([, a], [, b]) => b - a) // Sort by highest value
                              .map(([emotion, value]) => (
                                <div key={emotion} className="flex items-center">
                                  <div className="w-28 text-sm capitalize font-medium">{emotion}</div>
                                  <div className="flex-1 h-5 bg-white rounded-full overflow-hidden shadow-inner">
                                    <div 
                                      className={`h-full ${
                                        emotion === 'confident' ? 'bg-emerald-500' : 
                                        emotion === 'nervous' ? 'bg-pink-500' : 
                                        emotion === 'engaged' ? 'bg-blue-500' : 
                                        emotion === 'disinterested' ? 'bg-gray-400' : 
                                        emotion === 'thoughtful' ? 'bg-purple-500' : 
                                        emotion === 'uncertain' ? 'bg-amber-500' : 
                                        'bg-slate-400'
                                      }`} 
                                      style={{ width: `${(value * 100).toFixed(0)}%` }}
                                    />
                                  </div>
                                  <div className="w-16 text-sm text-right font-medium">
                                    {(value * 100).toFixed(0)}%
                                  </div>
                                </div>
                              ))}
                          </div>
                        );
                      })()}
                    </div>
                    
                    {/* Key insights based on emotions */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Insights</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                        {(() => {
                          const insights = [];
                          const avgEmotions = emotionData.reduce((acc, item) => {
                            Object.entries(item).forEach(([emotion, value]) => {
                              acc[emotion] = (acc[emotion] || 0) + value / emotionData.length;
                            });
                            return acc;
                          }, {} as Record<string, number>);
                          
                          const topEmotions = Object.entries(avgEmotions)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 2)
                            .map(([emotion]) => emotion);
                          
                          // Add insights based on top emotions
                          if (topEmotions.includes('confident')) {
                            insights.push(
                              <li key="confident">You displayed strong confidence throughout your interview, which is excellent!</li>
                            );
                          }
                          
                          if (topEmotions.includes('engaged')) {
                            insights.push(
                              <li key="engaged">You appeared highly engaged, showing interviewers you're interested and attentive.</li>
                            );
                          }
                          
                          if (topEmotions.includes('thoughtful')) {
                            insights.push(
                              <li key="thoughtful">Your thoughtful expressions suggest you took time to consider your answers carefully.</li>
                            );
                          }
                          
                          if (topEmotions.includes('nervous')) {
                            insights.push(
                              <li key="nervous">Some nervousness was detected. This is normal, but practicing more interviews may help reduce this.</li>
                            );
                          }
                          
                          if (topEmotions.includes('uncertain')) {
                            insights.push(
                              <li key="uncertain">Moments of uncertainty were detected. More preparation on technical topics might help increase confidence.</li>
                            );
                          }
                          
                          if (topEmotions.includes('disinterested')) {
                            insights.push(
                              <li key="disinterested">There were moments where you appeared less engaged. Maintaining consistent energy throughout is important.</li>
                            );
                          }
                          
                          // Add general insights
                          insights.push(
                            <li key="general">Your facial expressions and body language are important aspects of interview communication.</li>
                          );
                          
                          return insights;
                        })()}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-blue-700">
                      No facial emotion data was collected during this interview. This may be because your camera was off or facial detection wasn't working properly.
                    </p>
                    <Button 
                      className="mt-3" 
                      variant="outline" 
                      onClick={() => navigate("/facial-emotion-analysis")}
                    >
                      Try Our Facial Analysis Tool
                    </Button>
                  </div>
                )}
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
                    return (
                      <div key={idx} className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Question {idx + 1}</h4>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Score: {scores[idx].toFixed(1)}/10
                          </span>
                        </div>
                        <p className="text-sm mb-2">{questionObj?.question || `Question ${idx + 1}`}</p>
                        <Progress value={scores[idx] * 10} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Add Emotion Analysis Report */}
              {showEmotionReport && emotionData.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-medium mb-3">Facial Expression Analysis</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    During your interview, we analyzed your facial expressions to help you understand how you might appear to interviewers.
                    This can provide valuable insights into your non-verbal communication.
                  </p>
                  <EmotionReport 
                    emotionData={emotionData.length > 0 ? 
                      // Calculate average emotions
                      emotionData.reduce((acc, item) => {
                        Object.entries(item).forEach(([key, value]) => {
                          acc[key] = (acc[key] || 0) + value / emotionData.length;
                        });
                        return acc;
                      }, {} as Record<string, number>) : 
                      {} // Empty object if no data
                    }
                    title="Your Expression Profile"
                  />
                </div>
              )}
              
              {/* Add a note if no emotion data was collected */}
              {showEmotionReport && emotionData.length === 0 && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-medium mb-3">Facial Expression Analysis</h3>
                  <div className="bg-gray-100 p-4 rounded">
                    <p className="text-sm">
                      No facial expression data was collected during this interview. This may be because your camera was off or 
                      facial detection was not working properly. Try our dedicated Facial Emotion Analysis tool for better results.
                    </p>
                    <Button 
                      className="mt-3" 
                      variant="outline" 
                      onClick={() => navigate("/facial-emotion-analysis")}
                    >
                      Try Facial Emotion Analysis
                    </Button>
                  </div>
                </div>
              )}
              
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
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4">
            <p className="text-sm font-medium mb-2">Camera not working?</p>
            <button
              onClick={async () => {
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 } 
                  });
                  
                  if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                      videoRef.current?.play();
                      alert("Camera is working! You should see your video feed now.");
                    };
                  } else {
                    alert("Video reference is not available. This is likely a bug.");
                    stream.getTracks().forEach(track => track.stop());
                  }
                } catch (err) {
                  alert(`Camera access error: ${err.message || err}. Please check your camera permissions.`);
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded"
            >
              Try Direct Camera Access
            </button>
          </div>
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
                  <div className="relative w-full h-full">
                    {/* Remove the video element and use EmotionDetector directly */}
                    <EmotionDetector
                      width={640}
                      height={360}
                      onEmotionCapture={handleEmotionCapture}
                      isActive={isInterviewStarted && !interviewEnded}
                    />
                  </div>
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

// Export the wrapped component
const AIInterviewSimulatorWithErrorBoundary = () => (
  <ErrorBoundary>
    <AIInterviewSimulator />
  </ErrorBoundary>
);

export default AIInterviewSimulatorWithErrorBoundary; 