import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  Mic,
  Video,
  Settings,
  X,
  Volume2,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import {
  interviewService,
  responseService,
  reportService,
} from "@/services/supabaseService";
import InterviewRequirements from "@/components/InterviewRequirements";

interface InterviewQuestion {
  question: string;
  feedback_template?: string;
}

interface InterviewResponse {
  question: string;
  response: string;
  feedback: string;
  timestamp: string;
}

// Mock questions for fallback
const mockNextQuestions = [
  {
    question: "How do you approach solving complex technical problems?",
    feedback_template:
      "Look for: structured approach, problem-solving skills, and experience.",
  },
  {
    question: "Describe a time when you had to learn a new technology quickly.",
    feedback_template:
      "Look for: adaptability, learning ability, and practical application.",
  },
  {
    question: "How do you ensure the quality of your code?",
    feedback_template:
      "Look for: testing strategies, code review practices, and quality mindset.",
  },
];

const InterviewSession = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestion | null>(null);
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState("");
  const [interviewHistory, setInterviewHistory] = useState<InterviewResponse[]>(
    []
  );
  const [isListening, setIsListening] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [requirementsChecked, setRequirementsChecked] = useState(false);
  const [videoMetrics, setVideoMetrics] = useState({
    confidence_score: 0,
    eye_contact_score: 0,
  });
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoAnalysisInterval = useRef<number | null>(null);

  const interviewType = searchParams.get("type") || "Technical";
  const company = searchParams.get("company") || "";
  const role = searchParams.get("role") || "";
  const resumeText = searchParams.get("resume") || "";

  useEffect(() => {
    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");

        setResponse(transcript);

        // Reset silence detection when speech is detected
        if (!isSpeaking) {
          setIsSpeaking(true);
        }

        // Clear any existing silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }

        // Set a new silence timer
        const timer = setTimeout(() => {
          if (isSpeaking && isListening) {
            // Auto-submit if we were speaking and now silent for 2.5 seconds
            recognitionRef.current.stop();
            setIsListening(false);
            setIsSpeaking(false);
            submitResponse();
          }
        }, 2500); // 2.5 seconds of silence to auto-stop

        setSilenceTimer(timer);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setIsSpeaking(false);
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
      };

      recognitionRef.current.onend = () => {
        // Only restart if still in listening mode and not manually stopped
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }

    // Clean up resources on unmount
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }

      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (videoAnalysisInterval.current) {
        window.clearInterval(videoAnalysisInterval.current);
      }

      if (speechSynthesis && speechSynthesisRef.current) {
        speechSynthesis.cancel();
      }

      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [isListening, isSpeaking]);

  // Initialize video tracking and analysis
  const initializeVideoTracking = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Simple video analysis at intervals
      videoAnalysisInterval.current = window.setInterval(() => {
        // In a real implementation, you would use computer vision libraries
        // Here we're just simulating with random scores as a placeholder
        setVideoMetrics({
          confidence_score: Math.floor(Math.random() * 3) + 7, // Simulate 7-10 range
          eye_contact_score: Math.floor(Math.random() * 3) + 7, // Simulate 7-10 range
        });
      }, 10000); // Every 10 seconds
    } catch (err) {
      console.error("Error accessing camera for tracking:", err);
      toast({
        title: t("error"),
        description: t("camera_tracking_failed"),
        variant: "destructive",
      });
    }
  };

  const startInterview = async () => {
    setIsLoading(true);
    setAskedQuestions([]); // Reset asked questions at the start of a new interview

    // Initialize video tracking
    await initializeVideoTracking();

    try {
      console.log("Starting interview with user:", user?.id);

      // Create local interview data if not authenticated
      let interview = {
        id: `local-${Date.now()}`,
        user_id: "guest",
        interview_type: interviewType || "Technical",
        role: role || "Software Developer",
        status: "in_progress",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Only try to create a real interview if the user is authenticated
      if (user) {
        try {
          interview = await interviewService.createInterview({
            interview_type: interviewType || "Technical",
            role: role || "Software Developer",
            status: "in_progress",
          });
          console.log("Interview created successfully in Supabase:", interview);
        } catch (err) {
          console.error("Supabase interview creation error:", err);
          // Continue with local interview data
        }
      } else {
        console.log("Using local interview data for non-authenticated user");
      }

      // Call API to get first question
      let apiData: { question?: string; feedback_template?: string } = {};
      try {
        const response = await fetch("/api/start_interview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: interviewType,
            role: role || "Software Developer",
            resume_details: resumeText,
          }),
        });

        // Check if the response is ok before parsing JSON
        if (!response.ok) {
          console.warn(`API responded with status: ${response.status}`);
        } else {
          // Add a check to handle empty responses
          const text = await response.text();
          apiData = text ? JSON.parse(text) : {};

          // Read question aloud
          if (apiData.question) {
            readTextAloud(apiData.question);
          }
        }
      } catch (apiError) {
        console.warn("API call failed, using mock data:", apiError);
      }

      // Use fallback question if API fails
      const fallbackQuestion = {
        question: "Tell me about yourself and your experience.",
        feedback_template:
          "Look for: clear communication, relevant experience, and concise response.",
      };

      // Only save question to Supabase if user is authenticated
      if (user) {
        try {
          // Save the first question to Supabase
          await responseService.addResponse(interview.id, {
            question: apiData.question || fallbackQuestion.question,
            question_order: 1,
          });

          console.log("First question saved to Supabase");
        } catch (responseError) {
          console.error("Failed to save question to Supabase:", responseError);
          // Continue anyway since we can use mock data
        }
      }

      setCurrentQuestion({
        question: apiData.question || fallbackQuestion.question,
        feedback_template:
          apiData.feedback_template || fallbackQuestion.feedback_template,
      });

      setIsInterviewActive(true);
      setIsLoading(false);

      toast({
        title: t("success"),
        description: t("interview_session_started"),
      });
    } catch (error) {
      console.error("Failed to start interview:", error);
      setIsLoading(false);
      toast({
        title: t("error"),
        description: t("failed_to_start_interview"),
        variant: "destructive",
      });
    }
  };

  const readTextAloud = (text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    setIsReadingAloud(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;

    // Get available voices and select a good one
    const voices = speechSynthesis.getVoices();
    const englishVoices = voices.filter((voice) => voice.lang.includes("en-"));
    if (englishVoices.length > 0) {
      // Prefer a female voice for diversity
      const femaleVoice = englishVoices.find((voice) =>
        voice.name.includes("Female")
      );
      utterance.voice = femaleVoice || englishVoices[0];
    }

    utterance.onend = () => {
      setIsReadingAloud(false);
    };

    speechSynthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setIsSpeaking(false);

      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);

        // Set a timeout to auto-stop if no speech is detected within 15 seconds
        const timer = setTimeout(() => {
          if (isListening && !isSpeaking) {
            recognitionRef.current.stop();
            setIsListening(false);
            toast({
              title: t("info"),
              description: t("no_speech_detected"),
            });
          }
        }, 15000);

        setSilenceTimer(timer);
      } else {
        toast({
          title: t("error"),
          description: t("speech_recognition_not_supported"),
          variant: "destructive",
        });
      }
    }
  };

  const submitResponse = async () => {
    if (!currentQuestion || !response.trim()) return;

    try {
      // Mock feedback for now
      const mockFeedback = [
        "Great response! You provided clear examples and demonstrated good communication skills.",
        "Good answer, but consider adding more specific examples from your experience.",
        "Your answer was concise, but could benefit from more structure. Consider using the STAR method.",
      ];

      // Random feedback for demo purposes
      const feedbackText =
        mockFeedback[Math.floor(Math.random() * mockFeedback.length)];

      let latestInterview = {
        id: `local-${Date.now()}`,
        user_id: "guest",
        created_at: new Date().toISOString(),
      };

      let responses: any[] = [];
      let questionOrder = 2;

      // Only interact with Supabase if user is authenticated
      if (user) {
        try {
          // Get all current interviews to find the most recent one
          const interviews = await interviewService.getUserInterviews();
          if (interviews && interviews.length > 0) {
            // Sort by creation date (newest first) and get the first one
            latestInterview = interviews.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )[0];

            // Get current question count to determine the order
            responses = await responseService.getResponsesByInterviewId(
              latestInterview.id
            );
            questionOrder = responses ? responses.length + 1 : 2; // +1 for the next question

            // Save the response to Supabase
            if (responses && responses.length > 0) {
              await responseService.updateResponse(
                responses[responses.length - 1].id,
                {
                  response: response.trim(),
                  feedback: feedbackText,
                  response_time: 60, // Mock response time
                }
              );
            }
          }
        } catch (dbError) {
          console.error("Database interaction error:", dbError);
          // Continue with local data
        }
      }

      // Call API for feedback using Gemini
      try {
        const responseData = await fetch("/api/submit_response", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: latestInterview.id,
            question: currentQuestion.question,
            response: response.trim(),
            video_metrics: videoMetrics,
            use_gemini: true, // Signal to the backend to use Gemini API
          }),
        });

        if (responseData.ok) {
          const responseText = await responseData.text();
          const data = responseText
            ? JSON.parse(responseText)
            : { feedback: feedbackText };

          setFeedback(data.feedback);

          // Read feedback aloud
          readTextAloud(data.feedback);

          // Add to interview history
          setInterviewHistory((prev) => [
            ...prev,
            {
              question: currentQuestion.question,
              response: response.trim(),
              feedback: data.feedback,
              timestamp: new Date().toISOString(),
            },
          ]);

          // Track this question as asked
          setAskedQuestions((prev) => [...prev, currentQuestion.question]);

          // Check if interview is complete
          if (data.status === "completed") {
            setIsInterviewActive(false);
            // Show final assessment after feedback is read
            setTimeout(() => {
              toast({
                title: t("interview_completed"),
                description: t("generating_report"),
              });
              // Display final assessment
              navigate(`/report?id=${latestInterview.id}`);
            }, 5000);
            return;
          }

          // Set up the next question with slight delay
          setTimeout(() => {
            if (data.next_question) {
              // Check if we've already asked this question
              if (askedQuestions.includes(data.next_question)) {
                // Query for a different question
                fetch("/api/get_unique_question", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    session_id: latestInterview.id,
                    asked_questions: askedQuestions,
                    interview_type: interviewType,
                    role: role,
                  }),
                })
                  .then((res) => res.json())
                  .then((uniqueData) => {
                    if (uniqueData.question) {
                      setCurrentQuestion({
                        question: uniqueData.question,
                        feedback_template: "",
                      });
                      readTextAloud(uniqueData.question);
                    } else {
                      // If we couldn't get a unique question, use mock
                      handleMockNextQuestion();
                    }
                  })
                  .catch((err) => {
                    console.error("Failed to get unique question:", err);
                    handleMockNextQuestion();
                  });
              } else {
                setCurrentQuestion({
                  question: data.next_question,
                  feedback_template: "",
                });
                setResponse("");

                // Read next question aloud
                readTextAloud(data.next_question);
              }
            }
          }, 5000); // Give time for the feedback to be processed
        } else {
          // Use mock feedback if API fails
          setFeedback(feedbackText);
          readTextAloud(feedbackText);

          // Add to interview history
          setInterviewHistory((prev) => [
            ...prev,
            {
              question: currentQuestion.question,
              response: response.trim(),
              feedback: feedbackText,
              timestamp: new Date().toISOString(),
            },
          ]);

          // Track this question as asked
          setAskedQuestions((prev) => [...prev, currentQuestion.question]);

          // Try to get next question
          handleMockNextQuestion();
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        // Use mock feedback if API fails
        setFeedback(feedbackText);
        readTextAloud(feedbackText);

        // Add to interview history
        setInterviewHistory((prev) => [
          ...prev,
          {
            question: currentQuestion.question,
            response: response.trim(),
            feedback: feedbackText,
            timestamp: new Date().toISOString(),
          },
        ]);

        // Track this question as asked
        setAskedQuestions((prev) => [...prev, currentQuestion.question]);

        // Try to get next question
        handleMockNextQuestion();
      }
    } catch (error) {
      console.error("Failed to submit response:", error);
      toast({
        title: t("error"),
        description: t("failed_to_submit_response"),
        variant: "destructive",
      });
    }
  };

  const handleMockNextQuestion = () => {
    // If we've already asked 3 questions, end the interview
    if (interviewHistory.length >= 3) {
      setIsInterviewActive(false);
      toast({
        title: t("success"),
        description: t("interview_completed"),
      });
    } else {
      // Filter out questions we've already asked
      const availableQuestions = mockNextQuestions.filter(
        (q) => !askedQuestions.includes(q.question)
      );

      // Get random next question from available ones
      const randomQuestion =
        availableQuestions.length > 0
          ? availableQuestions[
              Math.floor(Math.random() * availableQuestions.length)
            ]
          : mockNextQuestions[
              Math.floor(Math.random() * mockNextQuestions.length)
            ];

      setCurrentQuestion({
        question: randomQuestion.question,
        feedback_template: randomQuestion.feedback_template,
      });
      setResponse("");
      readTextAloud(randomQuestion.question);

      // Track this question as asked
      setAskedQuestions((prev) => [...prev, randomQuestion.question]);
    }
  };

  const stopReadingAloud = () => {
    if (window.speechSynthesis && speechSynthesisRef.current) {
      speechSynthesis.cancel();
      setIsReadingAloud(false);
    }
  };

  // Handle when requirements are met
  const handleRequirementsMet = () => {
    setRequirementsChecked(true);
    startInterview();
  };

  if (!requirementsChecked) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/interview")}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back_to_interview")}
          </Button>
          <div className="text-sm text-muted-foreground">
            {company && role ? `${company} - ${role}` : t("mock_interview")}
          </div>
        </div>

        <InterviewRequirements onReady={handleRequirementsMet} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/interview")}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back_to_interview")}
        </Button>
        <div className="text-sm text-muted-foreground">
          {company && role ? `${company} - ${role}` : t("mock_interview")}
        </div>
      </div>

      {!user && (
        <Card className="bg-primary/10 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{t("guest_mode")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("guest_mode_warning")}
              </p>
            </div>
            <Button onClick={() => navigate("/login")}>
              {t("login_to_save")}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <Card className="w-full h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">
                {t("preparing_interview")}
              </p>
            </Card>
          ) : (
            <>
              {isInterviewActive ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("current_question")}</CardTitle>
                    <div className="flex items-center mt-1">
                      {isReadingAloud ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          onClick={stopReadingAloud}
                        >
                          <X className="h-4 w-4 mr-1" />
                          {t("stop_reading")}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          onClick={() =>
                            currentQuestion &&
                            readTextAloud(currentQuestion.question)
                          }
                        >
                          <Volume2 className="h-4 w-4 mr-1" />
                          {t("read_aloud")}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{currentQuestion?.question}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start space-y-4">
                    <div className="w-full">
                      <Textarea
                        placeholder={t("type_your_response")}
                        className="min-h-[120px]"
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex items-center ${
                          isListening ? "border-red-500 text-red-500" : ""
                        }`}
                        onClick={toggleListening}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        {isListening
                          ? t("stop_listening")
                          : t("start_listening")}
                      </Button>
                      <Button
                        className="ml-auto"
                        onClick={submitResponse}
                        disabled={!response.trim()}
                      >
                        {t("submit_response")}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="w-full h-64 flex flex-col items-center justify-center">
                  <p className="text-center text-muted-foreground">
                    {interviewHistory.length > 0
                      ? t("interview_completed_message")
                      : t("interview_not_started")}
                  </p>
                  {interviewHistory.length > 0 && (
                    <Button
                      className="mt-4"
                      onClick={() =>
                        navigate(`/report?id=${interviewHistory[0].timestamp}`)
                      }
                    >
                      {t("view_report")}
                    </Button>
                  )}
                </Card>
              )}

              {feedback && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("feedback")}</CardTitle>
                    <div className="flex items-center mt-1">
                      {isReadingAloud ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          onClick={stopReadingAloud}
                        >
                          <X className="h-4 w-4 mr-1" />
                          {t("stop_reading")}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          onClick={() => feedback && readTextAloud(feedback)}
                        >
                          <Volume2 className="h-4 w-4 mr-1" />
                          {t("read_aloud")}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm">
                      <p>{feedback}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="space-y-4">
          {/* Camera preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="h-4 w-4 mr-2" />
                {t("camera_preview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-100 rounded-md overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {t("camera_preview_note")}
              </div>
            </CardContent>
          </Card>

          {/* Interview history */}
          <Card>
            <CardHeader>
              <CardTitle>{t("interview_history")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interviewHistory.length > 0 ? (
                  interviewHistory.map((item, index) => (
                    <div key={index} className="border-b pb-3">
                      <h4 className="font-medium text-sm">
                        {t("question")} {index + 1}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {item.question}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("no_history_yet")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
