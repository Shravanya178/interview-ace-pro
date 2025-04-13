import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Video, Mic, Settings, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { GoogleGenerativeAI, GenerativeModel, ChatSession } from "@google/generative-ai";

// Types for Gemini API
interface GenModel {
  startChat: (options: ChatOptions) => GenChatSession;
}

interface ChatOptions {
  history: ChatMessage[];
  generationConfig?: GenerationConfig;
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: string | {text: string}[];
}

interface ChatResponse {
  response: {
    text: () => string;
  };
}

interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

interface GenChatSession {
  sendMessage: (message: ChatMessage | string) => Promise<ChatResponse>;
}

// Speech Recognition types
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang?: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface JitsiMeetOptions {
  roomName: string;
  width: string | number;
  height: string | number;
  parentNode: HTMLElement;
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
  userInfo?: {
    displayName?: string;
    email?: string;
  };
}

interface JitsiMeetExternalAPI {
  addEventListeners: (events: Record<string, (data?: unknown) => void>) => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
  dispose: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: JitsiMeetOptions) => JitsiMeetExternalAPI;
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface InterviewSessionProps {
  roomName: string;
  language?: string;
  onClose?: () => void;
}

// Simple wrapper for the Gemini API
class GeminiInterviewer {
  private apiKey: string;
  private model: GenModel | null = null;
  private isInitialized: boolean = false;
  private conversation: GenChatSession | null = null;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.initialize();
  }
  
  async initialize(): Promise<boolean> {
    try {
      // Dynamically import the Google Generative AI SDK
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      
      // Initialize the API with the provided key
      const genAI = new GoogleGenerativeAI(this.apiKey);
      
      // Create the model instance
      this.model = genAI.getGenerativeModel({ model: "gemini-pro" }) as unknown as GenModel;
      
      // Create a new chat session with a much more specific prompt
      this.conversation = this.model.startChat({
        history: [
          {
            role: "user",
            parts: `You are an experienced technical interviewer for software engineering positions. 
            
            Your task is to conduct a dynamic, realistic technical interview that covers a wide range of topics.

            Follow these rules precisely:
            1. Ask one question at a time and wait for a response
            2. NEVER repeat the same question
            3. DO NOT ask about "React DOM" - this is a forbidden topic
            4. Cover a diverse range of topics: algorithms, system design, language-specific questions, behavioral questions, etc.
            5. Ask specific technical questions that require detailed knowledge
            6. After receiving an answer, provide brief feedback and then ask a completely different question
            7. Make questions progressively more challenging as the interview continues
            8. When the candidate mentions a technology in their answer, occasionally ask follow-up questions about it
            9. Maintain a professional, conversational tone
            10. IMPORTANT: Ensure every question is unique - DO NOT ask similar questions repeatedly
            
            The candidate is applying for a senior software engineer position. Evaluate both technical depth and communication skills.`
          },
          {
            role: "model",
            parts: "I understand my role as a technical interviewer for a senior software engineering position. I'll conduct a dynamic interview covering diverse topics, ensuring I never repeat questions and avoiding React DOM entirely. I'll ask specific, detailed questions, provide brief feedback after answers, and make questions progressively challenging. I'll occasionally follow up on technologies the candidate mentions, maintain a professional tone, and ensure every question is unique. I'm ready to begin the interview when you are."
          }
        ],
        generationConfig: {
          temperature: 0.9,  // Increased for more variety
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
      });
      
      this.isInitialized = true;
      console.log("Gemini interviewer initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize Gemini:", error);
      this.isInitialized = false;
      return false;
    }
  }
  
  isReady(): boolean {
    return this.isInitialized && this.conversation !== null;
  }
  
  async startInterview(): Promise<string> {
    if (!this.isReady()) {
      throw new Error("Gemini interviewer not initialized");
    }
    
    try {
      const result = await this.conversation!.sendMessage({
        role: "user", 
        parts: "Let's start the interview now. Please introduce yourself briefly as the interviewer and ask your first technical question. Make sure it's a challenging and specific question about software engineering fundamentals. Do NOT ask about React DOM."
      });
      return result.response.text();
    } catch (error) {
      console.error("Error starting interview:", error);
      throw error;
    }
  }
  
  async sendResponse(userAnswer: string): Promise<string> {
    if (!this.isReady()) {
      throw new Error("Gemini interviewer not initialized");
    }
    
    try {
      const result = await this.conversation!.sendMessage({
        role: "user",
        parts: `My answer: ${userAnswer}

        Now, provide brief feedback on my answer (1-2 sentences) and then ask a completely different technical question. Make sure it's not repetitive and covers a different area of software engineering than previous questions. DO NOT ask about React DOM.`
      });
      return result.response.text();
    } catch (error) {
      console.error("Error sending response to Gemini:", error);
      throw error;
    }
  }
}

const InterviewSession = ({ roomName, language = "en", onClose }: InterviewSessionProps) => {
  const apiRef = useRef<JitsiMeetExternalAPI | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const { t: tTranslation } = useTranslation();
  const [isJoined, setIsJoined] = useState(false);
  const [jitsiError, setJitsiError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  
  // Speech synthesis and recognition
  const synthesis = window.speechSynthesis;
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Gemini AI setup
  const [interviewer, setInterviewer] = useState<GeminiInterviewer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const interviewType = searchParams.get("type") || "mock";
  const company = searchParams.get("company") || "";
  const role = searchParams.get("role") || "";

  // Function to load the Jitsi script
  const loadJitsiScript = () => {
    // Log browser information to help with debugging
    const browserInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      language: navigator.language,
    };
    logDebug(`Browser Information: ${JSON.stringify(browserInfo, null, 2)}`);
    
    return new Promise<void>((resolve, reject) => {
      if (typeof window.JitsiMeetExternalAPI !== "undefined") {
        logDebug("Jitsi Meet External API already loaded");
        setScriptLoaded(true);
        resolve();
        return;
      }

      logDebug("Loading Jitsi Meet External API script...");
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      
      script.onload = () => {
        logDebug("Jitsi Meet External API script loaded successfully");
        // Add a small delay to ensure the API is fully initialized
        setTimeout(() => {
          if (typeof window.JitsiMeetExternalAPI === "undefined") {
            const error = "Script loaded but JitsiMeetExternalAPI is undefined";
            logDebug(`ERROR: ${error}`);
            setJitsiError("Script loaded but Jitsi API is not available. Please try refreshing the page.");
            setIsLoading(false);
            reject(new Error(error));
          } else {
            setScriptLoaded(true);
            resolve();
          }
        }, 500);
      };
      
      script.onerror = (error) => {
        logDebug(`ERROR: Failed to load Jitsi Meet External API script: ${error}`);
        setJitsiError("Failed to load Jitsi Meet API script. Please check your network connection.");
        setIsLoading(false);
        reject(error);
      };
      
      document.body.appendChild(script);
    });
  };

  // Auto-retry mechanism
  useEffect(() => {
    if (jitsiError && retryCount < 2) {
      // Auto-retry after 5 seconds
      const retryTimeout = setTimeout(() => {
        console.log(`Auto-retrying Jitsi connection (attempt ${retryCount + 1})...`);
        setDebugInfo(prev => `${prev}\nAuto-retry attempt ${retryCount + 1}`);
        setJitsiError(null);
        setIsLoading(true);
        setRetryCount(prev => prev + 1);
        
        if (apiRef.current) {
          apiRef.current.dispose();
          apiRef.current = null;
        }
        
        // Re-initialize by triggering the script loaded effect
        setScriptLoaded(false);
        const cleanup = loadJitsiScript();
      }, 5000);
      
      return () => clearTimeout(retryTimeout);
    }
  }, [jitsiError, retryCount]);

  // Log and capture debug info
  const logDebug = useCallback((message: string) => {
    console.log(message);
    setDebugInfo(prev => `${prev}\n${message}`);
  }, []);

  // Load Jitsi script when component mounts
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const initJitsi = async () => {
      try {
        await loadJitsiScript();
        // Script loaded, now setupJitsi will be called via the scriptLoaded useEffect
      } catch (error) {
        console.error("Error loading Jitsi script:", error);
      }
      
      // Set a timeout to check if script loading is taking too long
      timeoutId = setTimeout(() => {
        if (!scriptLoaded) {
          console.warn("Jitsi script loading timeout after 10 seconds");
          setJitsiError("Jitsi script loading timed out. Your network connection may be slow or blocked.");
          setIsLoading(false);
        }
      }, 10000);
    };
    
    initJitsi();
    
    return () => {
      clearTimeout(timeoutId);
      // Clean up script tag if needed
      const scriptTag = document.querySelector('script[src="https://meet.jit.si/external_api.js"]');
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
      // Clean up Jitsi instance
      if (apiRef.current) {
        console.log("Disposing Jitsi instance on unmount");
        apiRef.current.dispose();
      }
    };
  }, []);

  // Initialize Jitsi when script is loaded
  useEffect(() => {
    if (scriptLoaded) {
      setupJitsi();
    }
  }, [scriptLoaded, roomName]);

  // Function to initialize Jitsi
  const setupJitsi = useCallback(() => {
    if (!containerRef.current) {
      logDebug("ERROR: Container ref is not available");
      setJitsiError("Container element not found");
      setIsLoading(false);
      return;
    }

    if (typeof window.JitsiMeetExternalAPI === "undefined") {
      logDebug("ERROR: Jitsi Meet External API is not loaded");
      setJitsiError("Jitsi Meet API not loaded");
      setIsLoading(false);
      return;
    }

    if (apiRef.current) {
      logDebug("Jitsi instance already exists");
      return;
    }

    logDebug(`Setting up Jitsi Meet with room: ${roomName}`);
    
    try {
        // Set up config for Jitsi Meet
        const domain = "meet.jit.si";
        const options = {
          roomName: roomName,
          width: "100%",
          height: "100%",
          parentNode: containerRef.current,
          lang: "en",
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            startWithAudioMuted: true,
            startWithVideoMuted: false,
          resolution: 720,
          constraints: {
            video: {
              height: {
                ideal: 720,
                max: 720,
                min: 240
              }
            }
          }
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            APP_NAME: "Interview Ace Pro",
            NATIVE_APP_NAME: "Interview Ace Pro",
            PROVIDER_NAME: "Interview Ace Pro",
          DEFAULT_BACKGROUND: "#111111",
          TILE_VIEW_MAX_COLUMNS: 2,
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "chat",
              "recording",
              "settings",
              "raisehand",
              "videoquality",
            ],
          },
          userInfo: {
            displayName: "Candidate",
          },
        };

      // Create the Jitsi Meet external API instance
      logDebug("Creating new JitsiMeetExternalAPI instance");
      // Ensure we're not in a race condition
      setTimeout(() => {
        try {
          apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

          // Event listeners
          logDebug("Adding event listeners to Jitsi");
          apiRef.current.addEventListeners({
            readyToClose: handleClose,
            videoConferenceJoined: handleJoined,
            participantJoined: handleParticipantJoined,
            error: (error: unknown) => {
              logDebug(`ERROR: Jitsi error: ${JSON.stringify(error)}`);
              setJitsiError(`Jitsi error: ${error ? JSON.stringify(error) : 'Unknown error'}`);
              toast({
                title: t("error"),
                description: t("jitsi_error_occurred"),
                variant: "destructive",
              });
            }
          });
          
          setIsLoading(false);
          logDebug("Jitsi Meet setup completed successfully");
        } catch (error) {
          logDebug(`ERROR: Failed to create Jitsi instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setJitsiError(`Failed to create Jitsi instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setIsLoading(false);
        }
      }, 100);
    } catch (error) {
      logDebug(`ERROR: Failed to initialize Jitsi: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setJitsiError(`Failed to initialize Jitsi: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
          toast({
            title: t("error"),
            description: t("failed_to_initialize_interview"),
            variant: "destructive",
          });
        }
  }, [roomName, t, logDebug]);

  useEffect(() => {
    if (isJoined && apiRef.current) {
      // Add logging to track command execution
      logDebug("User joined conference, applying video settings");
      
      try {
        // Ensure commands are run after a short delay to allow Jitsi to fully initialize
        setTimeout(() => {
          try {
            // Setting video quality to 720p
            logDebug("Setting video quality to 720p");
            apiRef.current?.executeCommand('setVideoQuality', 720);
            
            // Enable tile view
            logDebug("Enabling tile view");
            apiRef.current?.executeCommand('enableTileView');
            
            logDebug("Video settings applied successfully");
          } catch (innerError) {
            logDebug(`ERROR: Error applying delayed video settings: ${innerError}`);
          }
        }, 2000);
      } catch (error) {
        logDebug(`ERROR: Error applying video settings: ${error}`);
        toast({
          title: t("warning"),
          description: t("failed_to_apply_video_settings"),
          variant: "destructive",
        });
      }
    }
  }, [isJoined, t, logDebug]);

  useEffect(() => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        setApiError("Gemini API key not found. Please add it to your .env file.");
        setIsLoading(false);
        return;
      }
      
      const initInterviewer = async () => {
        try {
          console.log("Initializing Gemini interviewer with API key...");
          const interviewer = new GeminiInterviewer(apiKey);
          setInterviewer(interviewer);
          
          // Wait to ensure initialization completes
          setTimeout(async () => {
            if (interviewer.isReady()) {
              console.log("Gemini interviewer is ready");
              toast({
                title: "Gemini API Connected",
                description: "AI interviewer is ready to start",
              });
    } else {
              console.error("Gemini interviewer failed to initialize");
              setApiError("Failed to initialize Gemini interviewer. Please check your API key.");
              toast({
                title: "API Connection Failed",
                description: "Could not connect to Gemini API",
                variant: "destructive",
              });
            }
            setIsLoading(false);
          }, 3000);
        } catch (error) {
          console.error("Error creating interviewer:", error);
          setApiError("Failed to initialize Gemini interviewer");
          setIsLoading(false);
          toast({
            title: "Error",
            description: "Failed to initialize Gemini API",
            variant: "destructive",
          });
        }
      };
      
      initInterviewer();
      
      // Initialize speech recognition
      if (typeof window !== 'undefined') {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          
          recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            
            for (let i = 0; i < event.results.length; i++) {
              const result = event.results[i];
              if (result.isFinal) {
                finalTranscript += result[0].transcript;
              }
            }
            
            if (finalTranscript) {
              setCurrentQuestion(finalTranscript);
            }
          };
          
          recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
          };
        }
      }
    } catch (error) {
      console.error("Error initializing Gemini:", error);
      setApiError("Failed to initialize Gemini interviewer");
      setIsLoading(false);
    }
  }, []);

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.onend = () => {
      // Resume listening after AI finishes speaking
      if (interviewStarted) {
        startListening();
      }
    };
    synthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const startInterview = async () => {
    if (!interviewer || !interviewer.isReady()) {
      toast({
        title: "Error",
        description: "AI interviewer not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const introQuestion = await interviewer.startInterview();
      setCurrentQuestion(introQuestion);
      setInterviewStarted(true);
      await speakText(introQuestion);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast({
        title: "Error",
        description: "Failed to start interview with AI",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const submitAnswer = async () => {
    if (!interviewer || !interviewer.isReady() || !currentQuestion.trim()) {
      return;
    }
    
    setIsProcessing(true);
    stopListening();
    
    try {
      const response = await interviewer.sendResponse(currentQuestion);
      setCurrentQuestion(response);
      await speakText(response);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const endInterview = () => {
    stopListening();
    synthesis.cancel();
    setInterviewStarted(false);
    if (onClose) onClose();
  };

  const handleJoined = () => {
    setIsJoined(true);
    toast({
      title: t("success"),
      description: t("interview_session_started"),
    });
  };

  const handleParticipantJoined = (participant: { displayName?: string }) => {
    toast({
      title: t("participant_joined"),
      description: `${participant.displayName || 'A participant'} ${t("has_joined_the_session")}`,
    });
  };

  const handleClose = () => {
    if (apiRef.current) {
      apiRef.current.dispose();
    }
    navigate("/interview");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Interview Session</h1>

        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Camera Test</h2>
          <p className="mb-2">If your camera isn't working in the interview, click the button below to test direct camera access:</p>
          <button 
            onClick={async () => {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                alert("Camera access granted successfully! Your camera is working.");
                // Clean up
                stream.getTracks().forEach(track => track.stop());
              } catch (err) {
                alert(`Camera access failed: ${err.message || err}. Please check your camera permissions.`);
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
          >
            Test Camera Access
          </button>
        </div>

        {jitsiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-md text-red-800">
            <h3 className="text-lg font-semibold mb-2">Jitsi Error</h3>
            <p>{jitsiError}</p>
            <Button 
              onClick={() => {
                setJitsiError(null);
                setIsLoading(true);
                if (apiRef.current) {
                  apiRef.current.dispose();
                  apiRef.current = null;
                }
                loadJitsiScript();
              }}
              className="mt-2"
              variant="outline"
            >
              Retry Connection
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/interview")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Back to Interview")}
          </Button>
          <div className="flex items-center gap-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold">
                {company || t("Mock Interview")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {role || t("General Interview")}
              </p>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="relative h-[600px] overflow-hidden">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-sm text-center max-w-xs">
                    {scriptLoaded 
                      ? "Connecting to Jitsi conference room..." 
                      : "Loading Jitsi Meet API..."}
                  </p>
                </div>
              ) : jitsiError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4">
                  <div className="text-center max-w-md">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Connection Error</h3>
                    <p className="mb-4">{jitsiError}</p>
                    <div className="text-xs text-left bg-gray-100 p-2 mb-4 rounded-md max-h-32 overflow-y-auto">
                      <p className="font-semibold">Debug Info:</p>
                      <pre>{debugInfo || "No debug information available."}</pre>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={() => {
                          setJitsiError(null);
                          setIsLoading(true);
                          setRetryCount(prev => prev + 1);
                          logDebug(`Manual retry initiated (attempt ${retryCount + 1})`);
                          if (apiRef.current) {
                            apiRef.current.dispose();
                            apiRef.current = null;
                          }
                          loadJitsiScript();
                        }}
                      >
                        Retry Connection
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/interview")}
                      >
                        Back to Menu
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
              <div ref={containerRef} className="h-full" />
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("Interview Controls")}
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => apiRef.current?.executeCommand("toggleAudio")}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  {t("Toggle Audio")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => apiRef.current?.executeCommand("toggleVideo")}
                >
                  <Video className="mr-2 h-4 w-4" />
                  {t("Toggle Video")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    console.log("Toggling screen sharing");
                    try {
                      apiRef.current?.executeCommand("toggleShareScreen");
                    } catch (error) {
                      console.error("Error toggling screen share:", error);
                    }
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t("Share Screen")}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleClose}
                >
                  <X className="mr-2 h-4 w-4" />
                  {t("End Interview")}
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("Interview Info")}
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">{t("Room")}:</span> {roomName}
                </p>
                <p>
                  <span className="font-medium">{t("Type")}:</span>{" "}
                  {interviewType}
                </p>
                <p>
                  <span className="font-medium">{t("Status")}:</span>{" "}
                  {isJoined ? t("Connected") : t("Connecting")}
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {t("AI Interview")}
              </h3>
              <div className="space-y-4">
                {apiError ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    <p className="font-medium">Connection Error</p>
                    <p>{apiError}</p>
                  </div>
                ) : !interviewer?.isReady() ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
                    <p className="font-medium">Connecting to Gemini API</p>
                    <p>Please wait while we establish connection...</p>
                    <div className="mt-2 flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Initializing AI interviewer</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm mb-4">
                    <p className="font-medium">Gemini API Connected</p>
                    <p>AI interviewer is ready to start</p>
                  </div>
                )}

                {!interviewStarted ? (
                  <Button 
                    onClick={startInterview} 
                    className="w-full"
                    disabled={isProcessing || !interviewer?.isReady()}
                  >
                    {isProcessing ? "Initializing..." : "Start AI Interview"}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">Current Question/Feedback:</h3>
                      <p>{currentQuestion}</p>
                    </div>
                    <div className="flex gap-4">
                      <Button 
                        onClick={isListening ? stopListening : startListening}
                        variant={isListening ? "destructive" : "default"}
                        className="flex-1"
                      >
                        {isListening ? "Stop Speaking" : "Start Speaking"}
                      </Button>
                      <Button 
                        onClick={submitAnswer}
                        variant="outline"
                        className="flex-1"
                      >
                        Submit Answer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;

