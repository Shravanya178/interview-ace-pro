import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import json
from datetime import datetime
import speech_recognition as sr
import pyttsx3
import threading
import os
from dotenv import load_dotenv
import openai
from PIL import Image, ImageTk
import threading
import queue

# Load environment variables
load_dotenv()

# Initialize OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Pre-defined questions for different interview types
INTERVIEW_QUESTIONS = {
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
        }
    ],
    "Behavioral Interview": [
        {
            "question": "Tell me about a time when you had to deal with a difficult team member.",
            "feedback_template": "Look for: conflict resolution, communication skills, emotional intelligence, outcome"
        },
        {
            "question": "Describe a project you're most proud of and why.",
            "feedback_template": "Look for: technical details, personal growth, challenges overcome, impact"
        },
        {
            "question": "How do you handle tight deadlines and pressure?",
            "feedback_template": "Look for: time management, prioritization, stress management, examples"
        }
    ],
    "System Design Interview": [
        {
            "question": "Design a URL shortening service like bit.ly",
            "feedback_template": "Look for: scalability, database design, API design, edge cases"
        },
        {
            "question": "How would you design a real-time chat application?",
            "feedback_template": "Look for: websockets, message queuing, scalability, data persistence"
        },
        {
            "question": "Design a distributed cache system",
            "feedback_template": "Look for: consistency models, replication, partitioning, failure handling"
        }
    ]
}

class MockInterviewApp:
    def __init__(self, root):
        self.root = root
        self.root.title("PrepMate")
        self.root.geometry("1000x800")
        self.root.configure(bg='#f0f0f0')
        
        # Initialize speech recognition and text-to-speech
        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()
        self.is_listening = False
        self.audio_queue = queue.Queue()
        
        self.current_question_index = 0
        self.interview_type = None
        self.responses = []
        
        self.setup_ui()
        self.setup_styles()
    
    def setup_styles(self):
        style = ttk.Style()
        style.configure('TButton', padding=10, font=('Helvetica', 10))
        style.configure('TLabel', padding=5, font=('Helvetica', 11))
        style.configure('Header.TLabel', font=('Helvetica', 14, 'bold'))
    
    def setup_ui(self):
        # Main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Header
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(header_frame, text="PrepMate", 
                 style='Header.TLabel').pack(side=tk.LEFT)
        
        # Interview type selection
        selection_frame = ttk.LabelFrame(main_frame, text="Interview Setup", padding="10")
        selection_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(selection_frame, text="Select Interview Type:").pack(side=tk.LEFT, padx=5)
        self.type_var = tk.StringVar()
        type_combo = ttk.Combobox(selection_frame, textvariable=self.type_var, 
                                 values=list(INTERVIEW_QUESTIONS.keys()), width=30)
        type_combo.pack(side=tk.LEFT, padx=5)
        
        ttk.Button(selection_frame, text="Start Interview", 
                  command=self.start_interview).pack(side=tk.LEFT, padx=5)
        
        # Question display
        question_frame = ttk.LabelFrame(main_frame, text="Current Question", padding="10")
        question_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.question_label = ttk.Label(question_frame, text="", wraplength=900)
        self.question_label.pack(fill=tk.X)
        
        # Response section
        response_frame = ttk.LabelFrame(main_frame, text="Your Response", padding="10")
        response_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        # Voice control buttons
        voice_frame = ttk.Frame(response_frame)
        voice_frame.pack(fill=tk.X, pady=(0, 5))
        
        self.mic_button = ttk.Button(voice_frame, text="🎤 Start Recording", 
                                   command=self.toggle_recording)
        self.mic_button.pack(side=tk.LEFT, padx=5)
        
        self.speak_button = ttk.Button(voice_frame, text="🔊 Read Question", 
                                     command=self.speak_question)
        self.speak_button.pack(side=tk.LEFT, padx=5)
        
        # Response text area
        self.response_text = scrolledtext.ScrolledText(response_frame, height=8, 
                                                     font=('Helvetica', 10))
        self.response_text.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # Submit button
        self.submit_btn = ttk.Button(response_frame, text="Submit Response", 
                                   command=self.submit_response)
        self.submit_btn.pack(pady=5)
        
        # Feedback section
        feedback_frame = ttk.LabelFrame(main_frame, text="AI Feedback", padding="10")
        feedback_frame.pack(fill=tk.BOTH, expand=True)
        
        self.feedback_text = scrolledtext.ScrolledText(feedback_frame, height=6, 
                                                     font=('Helvetica', 10))
        self.feedback_text.pack(fill=tk.BOTH, expand=True)
    
    def toggle_recording(self):
        if not self.is_listening:
            self.is_listening = True
            self.mic_button.configure(text="🛑 Stop Recording")
            threading.Thread(target=self.record_audio, daemon=True).start()
        else:
            self.is_listening = False
            self.mic_button.configure(text="🎤 Start Recording")
    
    def record_audio(self):
        with sr.Microphone() as source:
            self.recognizer.adjust_for_ambient_noise(source)
            while self.is_listening:
                try:
                    audio = self.recognizer.listen(source, timeout=1)
                    text = self.recognizer.recognize_google(audio)
                    current_text = self.response_text.get('1.0', tk.END).strip()
                    self.response_text.delete('1.0', tk.END)
                    self.response_text.insert('1.0', f"{current_text} {text}")
                except sr.WaitTimeoutError:
                    continue
                except Exception as e:
                    print(f"Error in speech recognition: {str(e)}")
    
    def speak_question(self):
        if self.question_label.cget("text"):
            threading.Thread(target=self._speak_text, 
                          args=(self.question_label.cget("text"),), 
                          daemon=True).start()
    
    def _speak_text(self, text):
        self.engine.say(text)
        self.engine.runAndWait()
    
    def get_ai_feedback(self, response, question_data):
        try:
            prompt = f"""
            Question: {question_data['question']}
            Response: {response}
            Key points to consider: {question_data['feedback_template']}
            
            Please provide detailed feedback on this interview response, considering:
            1. Content relevance and completeness
            2. Structure and clarity
            3. Specific improvements needed
            4. Positive aspects of the response
            """
            
            completion = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500
            )
            
            return completion.choices[0].message.content
        except Exception as e:
            return f"Error generating AI feedback: {str(e)}\n\nGeneral feedback:\n{question_data['feedback_template']}"
    
    def start_interview(self):
        self.interview_type = self.type_var.get()
        if self.interview_type:
            self.current_question_index = 0
            self.responses = []
            self.show_current_question()
            self.submit_btn.configure(state='normal')
    
    def show_current_question(self):
        if self.interview_type and self.current_question_index < len(INTERVIEW_QUESTIONS[self.interview_type]):
            question = INTERVIEW_QUESTIONS[self.interview_type][self.current_question_index]["question"]
            self.question_label.config(text=f"Question {self.current_question_index + 1}: {question}")
            self.response_text.delete('1.0', tk.END)
            self.feedback_text.delete('1.0', tk.END)
        else:
            self.question_label.config(text="Interview Complete!")
            self.response_text.delete('1.0', tk.END)
            self.submit_btn.config(state='disabled')
    
    def submit_response(self):
        response = self.response_text.get('1.0', tk.END.strip())
        if response:
            question_data = INTERVIEW_QUESTIONS[self.interview_type][self.current_question_index]
            
            # Show loading message
            self.feedback_text.delete('1.0', tk.END)
            self.feedback_text.insert('1.0', "Generating AI feedback...")
            self.root.update()
            
            # Get AI feedback
            feedback = self.get_ai_feedback(response, question_data)
            
            self.responses.append({
                "question": question_data["question"],
                "response": response,
                "feedback": feedback
            })
            
            self.feedback_text.delete('1.0', tk.END)
            self.feedback_text.insert('1.0', feedback)
            
            self.current_question_index += 1
            if self.current_question_index < len(INTERVIEW_QUESTIONS[self.interview_type]):
                self.root.after(2000, self.show_current_question)
            else:
                self.save_interview_session()
                self.question_label.config(text="Interview Complete! You can start a new interview.")
                self.submit_btn.config(state='disabled')
    
    def save_interview_session(self):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"interview_session_{timestamp}.json"
        
        session_data = {
            "interview_type": self.interview_type,
            "timestamp": timestamp,
            "responses": self.responses
        }
        
        try:
            with open(filename, 'w') as f:
                json.dump(session_data, f, indent=4)
            messagebox.showinfo("Success", f"Interview session saved to {filename}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save interview session: {str(e)}")

def main():
    root = tk.Tk()
    app = MockInterviewApp(root)
    root.mainloop()

if __name__ == "__main__":
    main() 