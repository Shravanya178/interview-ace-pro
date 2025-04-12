# AI Mock Interview System

An intelligent mock interview system powered by open-source AI that helps you practice different types of interviews and receive real-time feedback. This version uses the free Hugging Face Transformers library with the OPT-350M model.

## Features

- Multiple interview types (Technical, Behavioral, System Design)
- Real-time AI-powered responses using open-source models
- Detailed feedback on your answers
- Interactive chat interface
- Session history tracking
- Completely free to use with no API keys required

## Setup

1. Clone this repository
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the application:
   ```bash
   streamlit run app.py
   ```
2. Open your web browser and navigate to the URL shown in the terminal (usually http://localhost:8501)
3. Select an interview type and click "Start New Interview"
4. Begin your mock interview!

## Interview Types

1. **Technical Interview**

   - Focuses on technical skills and knowledge
   - Questions about programming, algorithms, and technical concepts

2. **Behavioral Interview**

   - Evaluates soft skills and past experiences
   - Questions about problem-solving, teamwork, and leadership

3. **System Design Interview**
   - Tests system architecture and design capabilities
   - Questions about scalable systems and technical architecture

## Getting the Most Out of the System

1. Be specific in your responses
2. Take time to think before answering
3. Review the feedback provided after each response
4. Practice regularly to improve your interview skills

## Requirements

- Python 3.7+
- Internet connection (for initial model download)
- Sufficient disk space for the model (~700MB)

## Technical Details

This version uses:

- Hugging Face Transformers library
- Facebook's OPT-350M model
- PyTorch for model inference
- Streamlit for the web interface

## Note

The first time you run the application, it will download the model which may take a few minutes depending on your internet connection. The model will be cached locally for future use.
