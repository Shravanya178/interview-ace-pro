from flask import Flask, send_file, jsonify, request, send_from_directory
import json
import os
from datetime import datetime
import random
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import speech_recognition as sr
from gtts import gTTS
import io
import base64
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='/static')
# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Google Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Available interview fields
INTERVIEW_FIELDS = {
    "software_engineering": "Software Engineering",
    "data_science": "Data Science",
    "web_development": "Web Development",
    "devops": "DevOps Engineering",
    "mobile_development": "Mobile Development",
    "cybersecurity": "Cybersecurity",
    "ai_ml": "AI/Machine Learning",
    "cloud_computing": "Cloud Computing",
    "system_design": "System Design",
    "product_management": "Product Management"
}

def get_ai_response(prompt):
    """Get response from Gemini API with improved prompt engineering"""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error calling Gemini API: {str(e)}")
        return None

def text_to_speech(text):
    """Convert text to speech and return as base64 audio"""
    try:
        tts = gTTS(text=text, lang='en')
        audio_io = io.BytesIO()
        tts.write_to_fp(audio_io)
        audio_io.seek(0)
        audio_base64 = base64.b64encode(audio_io.read()).decode('utf-8')
        return audio_base64
    except Exception as e:
        print(f"Error in text-to-speech conversion: {str(e)}")
        return None

def speech_to_text(audio_data):
    """Convert speech to text"""
    try:
        recognizer = sr.Recognizer()
        audio_file = io.BytesIO(base64.b64decode(audio_data))
        with sr.AudioFile(audio_file) as source:
            audio = recognizer.record(source)
            text = recognizer.recognize_google(audio)
            return text
    except Exception as e:
        print(f"Error in speech-to-text conversion: {str(e)}")
        return None

# Interview session storage
interview_sessions = {}

@app.route('/api/fields', methods=['GET'])
def get_fields():
    """Get available interview fields"""
    return jsonify(INTERVIEW_FIELDS)

@app.route('/api/start_interview', methods=['POST'])
def start_interview():
    """Start a new interview session with selected field"""
    data = request.json
    field = data.get('field', 'software_engineering')
    role = data.get('role', 'Software Developer')
    resume_details = data.get('resume_details', '')
    
    if field not in INTERVIEW_FIELDS:
        field = 'software_engineering'  # Default to software engineering
    
    session_id = datetime.now().strftime("%Y%m%d%H%M%S")
    
    # Get initial question from AI
    initial_prompt = f"""
    You are an experienced technical interviewer for a {INTERVIEW_FIELDS[field]} position.
    Role: {role}
    
    This is the start of the interview.
    
    Generate a challenging technical interview question that:
    1. Is specific to the {role} role
    2. Tests deep understanding rather than just factual knowledge
    3. Gives the candidate an opportunity to demonstrate problem-solving skills
    4. Is open-ended enough to allow for multiple approaches
    
    FORMAT:
    Just provide the question text only, without any preamble or explanation.
    """
    
    question = get_ai_response(initial_prompt)
    if not question:
        # Fallback question if API fails
        question = f"Can you describe your experience with {INTERVIEW_FIELDS[field]} and how it relates to the {role} position?"
    
    # Convert question to speech
    audio = text_to_speech(question)
    
    interview_sessions[session_id] = {
        "field": field,
        "role": role,
        "resume_details": resume_details,
        "current_question": question,
        "questions_asked": 1,
        "responses": []
    }
    
    return jsonify({
        "session_id": session_id,
        "question": question,
        "audio": audio,
        "questions_remaining": 5 - 1  # Plan for 5 questions total
    })

@app.route('/api/submit_response', methods=['POST'])
def submit_response():
    """Submit response and get next question automatically"""
    data = request.json
    session_id = data.get('session_id')
    response = data.get('response')
    is_audio = data.get('is_audio', False)
    video_metrics = data.get('video_metrics', {})
    use_gemini = data.get('use_gemini', False)  # Flag to use Gemini for enhanced feedback
    
    if session_id not in interview_sessions:
        return jsonify({"error": "Invalid session ID"}), 400
    
    session = interview_sessions[session_id]
    
    # Convert audio to text if needed
    if is_audio:
        response = speech_to_text(response)
        if not response:
            return jsonify({"error": "Failed to convert speech to text"}), 400
    
    # Generate AI feedback - use enhanced Gemini prompt if requested
    feedback_prompt = f"""
    You are an experienced technical interviewer for a {INTERVIEW_FIELDS[session['field']]} position.
    Role: {session['role']}
    
    Evaluate the following response to this interview question:
    
    Question: {session['current_question']}
    
    Candidate's Response: {response}
    
    {video_metrics.get('confidence_score') is not None and f"Observed confidence level: {video_metrics.get('confidence_score')}/10" or ""}
    {video_metrics.get('eye_contact_score') is not None and f"Eye contact rating: {video_metrics.get('eye_contact_score')}/10" or ""}
    
    Provide professional feedback that:
    1. Identifies strengths in the response
    2. Points out areas for improvement
    3. Evaluates technical accuracy and completeness
    4. Suggests specific ways to enhance the answer
    5. Considers communication style and clarity
    
    Keep your feedback constructive, specific, and actionable (200-300 words).
    """
    
    if use_gemini:
        # Enhanced prompt for more detailed feedback
        feedback_prompt = f"""
        You are an experienced technical interviewer for a {INTERVIEW_FIELDS[session['field']]} position.
        Role: {session['role']}
        
        Evaluate the following response to this interview question:
        
        Question: {session['current_question']}
        
        Candidate's Response: {response}
        
        {video_metrics.get('confidence_score') is not None and f"Observed confidence level: {video_metrics.get('confidence_score')}/10" or ""}
        {video_metrics.get('eye_contact_score') is not None and f"Eye contact rating: {video_metrics.get('eye_contact_score')}/10" or ""}
        
        Provide in-depth professional feedback that:
        1. Identifies specific strengths in the response with examples
        2. Points out precise areas for improvement with concrete suggestions
        3. Evaluates technical accuracy, completeness, and depth of understanding
        4. Suggests specific ways to enhance the answer with industry best practices
        5. Analyzes communication style, clarity, and structure
        6. Provides a score out of 10 for this response with justification
        
        Keep your feedback detailed and actionable (300-400 words).
        """
    
    feedback = get_ai_response(feedback_prompt)
    if not feedback:
        feedback = "Thank you for your response. Let's move on to the next question."
    
    # Store response and feedback
    session['responses'].append({
        "question": session['current_question'],
        "response": response,
        "feedback": feedback,
        "video_metrics": video_metrics
    })
    
    # Check if interview is complete
    if session['questions_asked'] >= 5:
        # Generate final assessment
        responses_text = "\n\n".join([
            f"Question {i+1}: {resp['question']}\nResponse: {resp['response']}\nFeedback: {resp['feedback']}"
            for i, resp in enumerate(session['responses'])
        ])
        
        assessment_prompt = f"""
        You are an experienced technical hiring manager evaluating a candidate for a {INTERVIEW_FIELDS[session['field']]} position.
        Role: {session['role']}
        
        {session['resume_details'] and f"The candidate's resume highlights: {session['resume_details']}" or ""}
        
        I've just completed an interview with the candidate. Here are their responses:
        
        {responses_text}
        
        Please provide a comprehensive interview assessment report including:
        
        1. Overall Performance: A summary evaluation of the candidate's technical abilities
        2. Technical Skills: Analysis of demonstrated knowledge and skills
        3. Communication: Evaluation of clarity, conciseness, and effectiveness
        4. Problem-Solving: Assessment of critical thinking and approach to challenges
        5. Confidence & Demeanor: Observations about the candidate's presentation and manner
        6. Areas of Strength: 3-5 specific strengths with examples from their responses
        7. Areas for Improvement: 3-5 specific growth areas with examples
        8. Resources: Recommend specific resources (books, courses, practice sites) to address improvement areas
        9. Hiring Recommendation: Whether you would recommend hiring this candidate, with justification
        
        Make your assessment specific, evidence-based (referencing their actual responses), and actionable.
        """
        
        if use_gemini:
            # Enhanced final report for more detailed analysis when Gemini is used
            assessment_prompt = f"""
            You are an experienced technical hiring manager evaluating a candidate for a {INTERVIEW_FIELDS[session['field']]} position.
            Role: {session['role']}
            
            {session['resume_details'] and f"The candidate's resume highlights: {session['resume_details']}" or ""}
            
            I've just completed an interview with the candidate. Here are their responses:
            
            {responses_text}
            
            Please provide an extensive and detailed interview assessment report including:
            
            1. Executive Summary: A concise overview of the candidate's performance and potential fit (100 words)
            
            2. Technical Skills Assessment:
               - Core technical knowledge demonstrated
               - Framework/tool/language proficiency
               - Problem-solving approach and methodology
               - Code quality and architectural thinking (if applicable)
               - Technical gaps identified
            
            3. Soft Skills Evaluation:
               - Communication clarity and effectiveness
               - Thought organization and presentation
               - Listening skills and response relevance
               - Confidence and professional demeanor
               - Adaptability and learning potential
            
            4. Detailed Strengths Analysis:
               - 5 specific strengths with concrete examples from their responses
               - How these strengths align with the role requirements
            
            5. Growth Opportunities:
               - 5 specific areas for improvement with examples
               - Actionable suggestions for addressing each area
            
            6. Learning Path Recommendations:
               - Books (2-3 specific titles with authors)
               - Online courses or certifications (2-3 specific recommendations)
               - Practice resources (specific websites, platforms)
               - Professional development activities
            
            7. Fit Analysis:
               - Team compatibility assessment
               - Cultural alignment indicators
               - Career trajectory potential within the organization
            
            8. Final Recommendation:
               - Hiring recommendation with clear justification
               - Suggested role fit (original role or alternative)
               - Compensation band recommendation (junior/mid/senior)
               - Onboarding/training recommendations if hired
            
            9. Interview Performance Metrics:
               - Overall score (out of 100)
               - Technical skills score (out of 100)
               - Communication score (out of 100)
               - Problem-solving score (out of 100)
               - Cultural fit score (out of 100)
            
            Make your assessment extremely detailed (800-1000 words), evidence-based (referencing their actual responses), actionable, and professionally formatted with clear section headers.
            """
        
        assessment = get_ai_response(assessment_prompt)
        if not assessment:
            assessment = "Interview completed. Overall, the candidate showed reasonable technical knowledge and communication skills."
        
        return jsonify({
            "status": "completed",
            "feedback": feedback,
            "assessment": assessment
        })
    
    # If interview is not complete, get next question
    next_question_prompt = f"""
    You are an experienced technical interviewer for a {INTERVIEW_FIELDS[session['field']]} position.
    Role: {session['role']}
    
    Based on the candidate's previous responses: 
    {responses_text if 'responses_text' in locals() else 'No previous responses.'}
    
    Generate a challenging technical interview question that:
    1. Is specific to the {session['role']} role
    2. Tests deep understanding rather than just factual knowledge
    3. Gives the candidate an opportunity to demonstrate problem-solving skills
    4. Is different from previously asked questions
    5. Is open-ended enough to allow for multiple approaches
    
    FORMAT:
    Just provide the question text only, without any preamble or explanation.
    """
    
    next_question = get_ai_response(next_question_prompt)
    if not next_question:
        # Fallback question if API fails
        next_question = f"What do you consider your biggest achievement in {INTERVIEW_FIELDS[session['field']]}?"
    
    # Update session with next question
    session['current_question'] = next_question
    session['questions_asked'] += 1
    
    return jsonify({
        "feedback": feedback,
        "next_question": next_question,
        "questions_remaining": max(0, 5 - session['questions_asked'])
    })

@app.route('/api/get_unique_question', methods=['POST'])
def get_unique_question():
    """Get a unique question that hasn't been asked before"""
    data = request.json
    session_id = data.get('session_id')
    asked_questions = data.get('asked_questions', [])
    interview_type = data.get('interview_type', 'Technical')
    role = data.get('role', 'Software Developer')
    
    if session_id not in interview_sessions:
        return jsonify({"error": "Invalid session ID"}), 400
    
    session = interview_sessions[session_id]
    
    # Generate a unique question
    unique_question_prompt = f"""
    You are an experienced technical interviewer for a {interview_type} position.
    Role: {role}
    
    I need a new technical interview question that is DIFFERENT from the following questions that have already been asked:
    
    {', '.join([f'"{q}"' for q in asked_questions])}
    
    Generate a challenging technical interview question that:
    1. Is specific to the {role} role
    2. Tests deep understanding rather than just factual knowledge
    3. Gives the candidate an opportunity to demonstrate problem-solving skills
    4. Is different in topic and focus from the previously asked questions
    5. Is open-ended enough to allow for multiple approaches
    
    FORMAT:
    Just provide the question text only, without any preamble or explanation.
    """
    
    new_question = get_ai_response(unique_question_prompt)
    if not new_question:
        # Fallback to a predefined question if API fails
        fallback_questions = [
            f"Describe a challenging {interview_type} problem you've solved in your previous experience.",
            f"What approaches would you take to optimize performance in a {interview_type} project?",
            f"How would you implement a scalable architecture for a {interview_type} system?",
            f"What do you consider the most important skills for a {role}?",
            f"How do you stay updated with the latest trends in {interview_type}?"
        ]
        
        # Filter out questions that have already been asked
        available_questions = [q for q in fallback_questions if q not in asked_questions]
        
        if available_questions:
            new_question = random.choice(available_questions)
        else:
            # If all fallbacks have been used, generate a random one
            new_question = f"What makes you interested in the {role} position, and what unique value can you bring to it?"
    
    # Update the session with the new question
    session['current_question'] = new_question
    session['questions_asked'] += 1
    
    return jsonify({
        "question": new_question,
        "questions_remaining": max(0, 5 - session['questions_asked'])
    })

@app.route('/')
def index():
    return send_file('templates/index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/api/verify_requirements', methods=['POST'])
def verify_requirements():
    """Verify camera and microphone access"""
    try:
        data = request.json
        camera_access = data.get('camera_access', False)
        microphone_access = data.get('microphone_access', False)
        
        # Always return a valid JSON response
        if not camera_access or not microphone_access:
            return jsonify({
                "success": False,
                "message": "Camera and microphone access are required for the interview"
            })
        
        return jsonify({
            "success": True,
            "message": "Ready to begin interview"
        })
    except Exception as e:
        # Log the error and return a valid error response
        print(f"Error in verify_requirements: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500

@app.route('/api/test', methods=['GET'])
def test_connection():
    """Simple endpoint to test server connectivity"""
    return jsonify({
        "status": "success",
        "message": "Server is running correctly"
    })

@app.errorhandler(404)
def page_not_found(e):
    return send_file('templates/error.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return send_file('templates/error.html'), 500

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    app.run(port=5000, debug=True) 