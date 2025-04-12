import asyncio
import json
import websockets
import speech_recognition as sr
import pyttsx3
import threading
import queue
import time
from datetime import datetime
import wave
import pyaudio
import numpy as np
import random

class AIInterviewerBot:
    def __init__(self, room_name, domain="meet.jit.si"):
        self.room_name = room_name
        self.domain = domain
        self.websocket = None
        self.is_connected = False
        self.audio_queue = queue.Queue()
        self.response_queue = queue.Queue()
        
        # Initialize speech recognition and synthesis
        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()
        
        # Interview state
        self.current_question = None
        self.interview_history = []
        self.is_listening = False
        self.question_index = 0
        
        # Audio settings
        self.CHUNK = 1024
        self.FORMAT = pyaudio.paFloat32
        self.CHANNELS = 1
        self.RATE = 16000
        
        # Interview questions and feedback templates
        self.questions = {
            "Technical": {
  "Technical Interview": [
    {
      "question": "Explain the concept of object-oriented programming and its main principles.",
      "feedback_template": "Look for: encapsulation, inheritance, polymorphism, abstraction"
    },
    {
      "question": "What is the difference between a list and a tuple in Python?",
      "feedback_template": "Look for: mutability, syntax, use cases, performance implications"
    },
    {
      "question": "Explain how a binary search tree works and its time complexity.",
      "feedback_template": "Look for: structure, traversal methods, search/insert/delete operations, balanced vs unbalanced"
    },
    {
      "question": "What is the difference between HTTP and HTTPS?",
      "feedback_template": "Look for: security, encryption, certificates, ports, use cases"
    },
    {
      "question": "Explain the concept of dependency injection and its benefits.",
      "feedback_template": "Look for: loose coupling, testability, maintainability, real-world examples"
    }
  ],
  "Business Interview": [
    {
      "question": "How do you assess the success of a business strategy?",
      "feedback_template": "Look for: KPIs, ROI, long-term vision, market adaptation"
    },
    {
      "question": "Describe a time when you had to make a critical business decision with limited data.",
      "feedback_template": "Look for: decision-making skills, risk management, outcome"
    },
    {
      "question": "How would you approach entering a new market?",
      "feedback_template": "Look for: market research, competitor analysis, entry strategy"
    }
  ],
  "Marketing Interview": [
    {
      "question": "How do you decide which marketing channels to prioritize?",
      "feedback_template": "Look for: target audience, budget, ROI, campaign objectives"
    },
    {
      "question": "Describe a successful marketing campaign you led.",
      "feedback_template": "Look for: strategy, creativity, analytics, outcomes"
    },
    {
      "question": "What tools do you use to measure marketing performance?",
      "feedback_template": "Look for: analytics platforms, KPIs, A/B testing, insights"
    }
  ],
  "Finance Interview": [
    {
      "question": "Walk me through a basic financial statement and how you analyze it.",
      "feedback_template": "Look for: income statement, balance sheet, cash flow, ratios"
    },
    {
      "question": "How do you perform a financial risk assessment for a project?",
      "feedback_template": "Look for: NPV, sensitivity analysis, risk factors"
    },
    {
      "question": "Explain the concept of working capital and its importance.",
      "feedback_template": "Look for: liquidity, current assets vs liabilities, operational efficiency"
    }
  ],
  "Design Interview": [
    {
      "question": "What is your design process from concept to final output?",
      "feedback_template": "Look for: research, prototyping, tools, user testing"
    },
    {
      "question": "How do you ensure your designs are user-centered?",
      "feedback_template": "Look for: user research, personas, usability testing"
    },
    {
      "question": "Tell me about a design project that didn’t go as planned.",
      "feedback_template": "Look for: challenges, iterations, learning outcomes"
    }
  ],
  "Healthcare Interview": [
    {
      "question": "Describe how you would handle a medical emergency in a clinical setting.",
      "feedback_template": "Look for: protocol, calm under pressure, prioritization"
    },
    {
      "question": "How do you ensure patient safety and privacy?",
      "feedback_template": "Look for: HIPAA compliance, data handling, empathy"
    },
    {
      "question": "Explain how you stay current with medical advancements.",
      "feedback_template": "Look for: journals, conferences, CME credits"
    }
  ],
  "Education Interview": [
    {
      "question": "How do you adapt your teaching style to different types of learners?",
      "feedback_template": "Look for: visual/auditory/kinesthetic strategies, inclusivity"
    },
    {
      "question": "Describe your classroom management strategy.",
      "feedback_template": "Look for: engagement, discipline, positive reinforcement"
    },
    {
      "question": "How do you assess student performance beyond exams?",
      "feedback_template": "Look for: projects, participation, continuous assessment"
    }
  ],
  "Legal Interview": [
    {
      "question": "How do you prepare for a complex legal case?",
      "feedback_template": "Look for: research, case law, documentation, strategy"
    },
    {
      "question": "Describe a situation where you had to interpret a grey area in law.",
      "feedback_template": "Look for: reasoning, precedent, risk analysis"
    },
    {
      "question": "How do you stay updated on legal changes relevant to your practice?",
      "feedback_template": "Look for: publications, legal updates, continuing education"
    }
  ],
  "Fashion Interview": [
    {
      "question": "How do you keep up with the latest fashion trends?",
      "feedback_template": "Look for: trend forecasting, social media, runway analysis"
    },
    {
      "question": "Describe your design aesthetic and creative process.",
      "feedback_template": "Look for: inspiration sources, mood boards, sketches"
    },
    {
      "question": "Tell me about a collection or garment you’re most proud of.",
      "feedback_template": "Look for: originality, execution, reception"
    }
  ],
  "Media Interview": [
    {
      "question": "How do you approach creating content for different platforms?",
      "feedback_template": "Look for: platform-specific strategies, audience targeting, tone"
    },
    {
      "question": "Describe your process for planning a media campaign.",
      "feedback_template": "Look for: goal setting, timeline, media mix, measurement"
    },
    {
      "question": "What role does storytelling play in your media work?",
      "feedback_template": "Look for: narrative flow, emotional impact, audience engagement"
    }
  ]
}

        }
        
    async def connect(self):
        """Connect to Jitsi Meet room"""
        ws_url = f"wss://{self.domain}/{self.room_name}/ws"
        try:
            self.websocket = await websockets.connect(ws_url)
            self.is_connected = True
            print(f"Connected to {ws_url}")
            
            # Start audio processing threads
            threading.Thread(target=self._process_audio, daemon=True).start()
            threading.Thread(target=self._process_responses, daemon=True).start()
            
            await self._join_conference()
        except Exception as e:
            print(f"Connection error: {str(e)}")
            
    async def _join_conference(self):
        """Join the conference and set up bot participant"""
        join_msg = {
            "type": "join",
            "room": self.room_name,
            "name": "AI Interviewer",
            "isBot": True
        }
        await self.websocket.send(json.dumps(join_msg))
        
    def _process_audio(self):
        """Process incoming audio from the conference"""
        audio = pyaudio.PyAudio()
        stream = audio.open(
            format=self.FORMAT,
            channels=self.CHANNELS,
            rate=self.RATE,
            input=True,
            frames_per_buffer=self.CHUNK
        )
        
        while self.is_connected:
            if self.is_listening:
                try:
                    data = stream.read(self.CHUNK)
                    self.audio_queue.put(data)
                except Exception as e:
                    print(f"Audio processing error: {str(e)}")
                    
        stream.stop_stream()
        stream.close()
        audio.terminate()
        
    def _process_responses(self):
        """Process candidate responses and generate AI replies"""
        while self.is_connected:
            try:
                response = self.response_queue.get()
                if response:
                    # Generate feedback
                    feedback = self._generate_feedback(response)
                    
                    # Convert feedback to speech
                    self._speak_text(feedback)
                    
                    # Save to interview history
                    self.interview_history.append({
                        "timestamp": datetime.now().isoformat(),
                        "candidate_response": response,
                        "ai_feedback": feedback
                    })
                    
                    # Ask next question
                    self._ask_next_question()
            except Exception as e:
                print(f"Response processing error: {str(e)}")
                
    def _generate_feedback(self, response):
        """Generate feedback based on response analysis"""
        current_question = self.questions[self.current_type][self.question_index]
        keywords = current_question["keywords"]
        
        # Count keyword matches
        matches = sum(1 for keyword in keywords if keyword.lower() in response.lower())
        
        # Generate feedback based on matches
        if matches >= len(keywords) * 0.7:
            feedback = "Excellent answer! You've covered the key concepts well. "
        elif matches >= len(keywords) * 0.4:
            feedback = "Good answer! You've touched on several important points. "
        else:
            feedback = "Thank you for your response. Let's explore this topic further. "
            
        # Add specific feedback based on missing keywords
        missing_keywords = [k for k in keywords if k.lower() not in response.lower()]
        if missing_keywords:
            feedback += f"Consider discussing: {', '.join(missing_keywords)}. "
            
        # Add follow-up question
        feedback += current_question["follow_up"]
        
        return feedback
        
    def _speak_text(self, text):
        """Convert text to speech"""
        try:
            self.engine.say(text)
            self.engine.runAndWait()
        except Exception as e:
            print(f"Text-to-speech error: {str(e)}")
            
    def _ask_next_question(self):
        """Ask the next interview question"""
        self.question_index = (self.question_index + 1) % len(self.questions[self.current_type])
        question = self.questions[self.current_type][self.question_index]["question"]
        self.current_question = question
        self._speak_text(question)
        
    def start_interview(self, interview_type="Technical"):
        """Start the interview session"""
        self.current_type = interview_type
        self.question_index = 0
        self.is_listening = True
        self._ask_initial_question()
        
    def _ask_initial_question(self):
        """Ask the first interview question"""
        initial_question = "Hello! I'm your AI interviewer today. Could you please introduce yourself and tell me about your background?"
        self.current_question = initial_question
        self._speak_text(initial_question)
        
    def stop_interview(self):
        """Stop the interview session"""
        self.is_listening = False
        self._save_interview_record()
        
    def _save_interview_record(self):
        """Save the interview record to a file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"interview_record_{timestamp}.json"
        
        try:
            with open(filename, 'w') as f:
                json.dump({
                    "room": self.room_name,
                    "timestamp": timestamp,
                    "type": self.current_type,
                    "history": self.interview_history
                }, f, indent=4)
            print(f"Interview record saved to {filename}")
        except Exception as e:
            print(f"Error saving interview record: {str(e)}")
            
    async def disconnect(self):
        """Disconnect from the conference"""
        if self.websocket:
            try:
                await self.websocket.close()
                self.is_connected = False
                print("Disconnected from conference")
            except Exception as e:
                print(f"Error disconnecting: {str(e)}")
                
    def handle_connection_error(self):
        """Handle connection errors and attempt reconnection"""
        retry_count = 0
        max_retries = 3
        
        while retry_count < max_retries and not self.is_connected:
            try:
                print(f"Attempting to reconnect... (Attempt {retry_count + 1}/{max_retries})")
                asyncio.run(self.connect())
                if self.is_connected:
                    print("Successfully reconnected")
                    return True
            except Exception as e:
                print(f"Reconnection attempt failed: {str(e)}")
                retry_count += 1
                time.sleep(2 ** retry_count)  # Exponential backoff
                
        return False 