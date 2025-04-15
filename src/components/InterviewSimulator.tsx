import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// Speech Recognition interface with browser compatibility
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Define window with speech recognition properties
interface MyWindow extends Window {
  SpeechRecognition: SpeechRecognitionConstructor;
  webkitSpeechRecognition: SpeechRecognitionConstructor;
}

const InterviewSimulator: React.FC = () => {
  // State definitions
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [report, setReport] = useState("");
  const [questionCounter, setQuestionCounter] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // References
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Setup Speech Recognition
  useEffect(() => {
    // Get browser-compatible SpeechRecognition
    const myWindow = window as unknown as MyWindow;
    const SpeechRecognition =
      myWindow.SpeechRecognition || myWindow.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        setAnswer((prev) => prev + " " + transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event);
      };

      recognition.onend = () => {
        if (isListening) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    } else {
      alert(
        "Speech recognition not supported in your browser. Please use Chrome or Edge."
      );
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Setup camera for interview
  useEffect(() => {
    if (interviewStarted && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
        });
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [interviewStarted]);

  // Start interview
  const startInterview = async () => {
    if (!company || !role) {
      alert("Please select a company and role");
      return;
    }

    setInterviewStarted(true);
    setIsProcessing(true);

    try {
      const response = await axios.post("/api/start_interview", {
        company,
        role,
      });

      setQuestion(response.data.question);
      setQuestionCounter(1);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error starting interview:", error);
      setIsProcessing(false);
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);

      // Submit the answer when user stops speaking
      if (answer.trim()) {
        submitAnswer();
      }
    } else {
      setAnswer("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Submit answer to backend
  const submitAnswer = async () => {
    if (!answer.trim()) return;

    setIsProcessing(true);

    try {
      const response = await axios.post("/api/submit_response", {
        company,
        role,
        question,
        answer,
        question_number: questionCounter,
      });

      setFeedback(response.data.feedback);

      // Check if interview is complete
      if (questionCounter >= 5 || response.data.complete) {
        setInterviewComplete(true);
        getReport();
      } else {
        // Set next question after a delay
        setTimeout(() => {
          setQuestion(response.data.next_question);
          setQuestionCounter((prev) => prev + 1);
          setAnswer("");
          setFeedback("");
        }, 5000);
      }

      setIsProcessing(false);
    } catch (error) {
      console.error("Error submitting answer:", error);
      setIsProcessing(false);
    }
  };

  // Get final report
  const getReport = async () => {
    try {
      const response = await axios.post("/api/get_report", {
        company,
        role,
      });

      setReport(response.data.report);
    } catch (error) {
      console.error("Error getting report:", error);
    }
  };

  // Reset interview
  const resetInterview = () => {
    setCompany("");
    setRole("");
    setQuestion("");
    setAnswer("");
    setFeedback("");
    setInterviewStarted(false);
    setInterviewComplete(false);
    setReport("");
    setQuestionCounter(0);
    setIsListening(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Render different states of the interview
  if (!interviewStarted) {
    return (
      <div className="interview-setup">
        <h1>AI Interview Simulator</h1>
        <p>Select a company and role to start your interview preparation</p>

        <div className="form-group">
          <label>Target Company:</label>
          <select value={company} onChange={(e) => setCompany(e.target.value)}>
            <option value="">-- Select Company --</option>
            <option value="Google">Google</option>
            <option value="Amazon">Amazon</option>
            <option value="Microsoft">Microsoft</option>
            <option value="Apple">Apple</option>
            <option value="Meta">Meta</option>
            <option value="Netflix">Netflix</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Target Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">-- Select Role --</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="ML Engineer">ML Engineer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
          </select>
        </div>

        <button
          className="start-button"
          onClick={startInterview}
          disabled={!company || !role}
        >
          Start Interview
        </button>
      </div>
    );
  }

  if (interviewComplete) {
    return (
      <div className="interview-report">
        <h1>Interview Complete</h1>
        <h2>Performance Report</h2>

        <div className="report-content">
          <pre>{report}</pre>
        </div>

        <button className="reset-button" onClick={resetInterview}>
          Start New Interview
        </button>
      </div>
    );
  }

  return (
    <div className="interview-session">
      <div className="interview-header">
        <h1>PrepMate</h1>
        <p>Question {questionCounter}/5</p>
      </div>

      <div className="interview-main">
        <div className="video-container">
          <video ref={videoRef} autoPlay muted />
        </div>

        <div className="interview-content">
          <div className="question-section">
            <h2>Question:</h2>
            <p>{question || "Loading question..."}</p>
          </div>

          <div className="answer-section">
            <h2>Your Answer:</h2>
            <p>{answer || "(Start speaking your answer)"}</p>

            <button
              className={`mic-button ${isListening ? "active" : ""}`}
              onClick={toggleListening}
              disabled={isProcessing}
            >
              {isListening ? "Stop Speaking" : "Start Speaking"}
            </button>
          </div>

          {feedback && (
            <div className="feedback-section">
              <h2>Feedback:</h2>
              <p>{feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSimulator;
