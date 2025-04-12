from flask import Flask, send_file, jsonify, request
import json
import os
from datetime import datetime

app = Flask(__name__)

# Interview questions and feedback templates
INTERVIEW_QUESTIONS = {
    "Technical": [
        {
            "question": "Explain the concept of object-oriented programming and its main principles.",
            "keywords": ["encapsulation", "inheritance", "polymorphism", "abstraction"],
            "follow_up": "Can you provide an example of how you've used these principles in a real project?"
        },
        {
            "question": "What is the difference between a list and a tuple in Python?",
            "keywords": ["immutable", "mutable", "performance", "memory"],
            "follow_up": "In what scenarios would you choose one over the other?"
        },
        {
            "question": "Explain how a binary search tree works and its time complexity.",
            "keywords": ["binary", "search", "tree", "complexity", "O(log n)"],
            "follow_up": "How would you handle balancing in a binary search tree?"
        },
        {
            "question": "What is the difference between HTTP and HTTPS?",
            "keywords": ["security", "encryption", "SSL", "TLS", "certificate"],
            "follow_up": "How would you implement HTTPS in a web application?"
        },
        {
            "question": "Explain the concept of dependency injection and its benefits.",
            "keywords": ["loose coupling", "testability", "maintainability", "inversion of control"],
            "follow_up": "Can you provide an example of dependency injection in your preferred programming language?"
        }
    ],
    "Behavioral": [
        {
            "question": "Tell me about a time when you had to deal with a difficult team member.",
            "keywords": ["communication", "conflict", "resolution", "teamwork"],
            "follow_up": "What did you learn from that experience?"
        },
        {
            "question": "Describe a project you're most proud of and why.",
            "keywords": ["challenge", "solution", "impact", "learning"],
            "follow_up": "What would you do differently if you had to do it again?"
        },
        {
            "question": "How do you handle tight deadlines and pressure?",
            "keywords": ["time management", "prioritization", "stress", "planning"],
            "follow_up": "Can you give a specific example of a deadline you met under pressure?"
        },
        {
            "question": "Describe a situation where you had to make a difficult decision.",
            "keywords": ["decision-making", "analysis", "consequences", "ethics"],
            "follow_up": "What factors did you consider before making your decision?"
        },
        {
            "question": "How do you handle failure or setbacks in your work?",
            "keywords": ["resilience", "learning", "adaptation", "growth mindset"],
            "follow_up": "Can you provide a specific example of how you overcame a professional setback?"
        }
    ],
    "System Design": [
        {
            "question": "Design a URL shortening service like bit.ly",
            "keywords": ["scalability", "database", "caching", "API"],
            "follow_up": "How would you handle rate limiting and security?"
        },
        {
            "question": "How would you design a real-time chat application?",
            "keywords": ["websockets", "real-time", "scalability", "message queue"],
            "follow_up": "How would you handle offline messages and message delivery guarantees?"
        },
        {
            "question": "Design a distributed cache system",
            "keywords": ["consistency", "replication", "partitioning", "failure"],
            "follow_up": "How would you handle cache invalidation and consistency?"
        },
        {
            "question": "Design a content delivery network (CDN)",
            "keywords": ["edge servers", "caching", "load balancing", "geographic distribution"],
            "follow_up": "How would you handle cache invalidation across your CDN?"
        },
        {
            "question": "Design a recommendation system for an e-commerce platform",
            "keywords": ["collaborative filtering", "content-based", "hybrid approach", "scalability"],
            "follow_up": "How would you handle the cold-start problem for new users or items?"
        }
    ],
    "Business": [
        {
            "question": "How would you approach entering a new market segment?",
            "keywords": ["market research", "competitor analysis", "strategy", "risk assessment"],
            "follow_up": "What metrics would you use to measure success in this new market?"
        },
        {
            "question": "Describe your approach to developing a business strategy.",
            "keywords": ["SWOT analysis", "competitive advantage", "value proposition", "execution plan"],
            "follow_up": "How would you ensure alignment between strategy and day-to-day operations?"
        },
        {
            "question": "How would you handle a situation where your company is facing declining sales?",
            "keywords": ["analysis", "cost reduction", "revenue generation", "customer retention"],
            "follow_up": "What short-term and long-term strategies would you implement?"
        },
        {
            "question": "Explain your approach to managing a business transformation.",
            "keywords": ["change management", "stakeholder communication", "timeline", "metrics"],
            "follow_up": "How would you handle resistance to change from employees?"
        },
        {
            "question": "How would you evaluate a potential business acquisition?",
            "keywords": ["due diligence", "financial analysis", "synergies", "integration plan"],
            "follow_up": "What red flags would you look for during the evaluation process?"
        }
    ],
    "Marketing": [
        {
            "question": "How would you develop a marketing strategy for a new product launch?",
            "keywords": ["target audience", "positioning", "channels", "budget allocation"],
            "follow_up": "How would you measure the success of this marketing campaign?"
        },
        {
            "question": "Describe your approach to content marketing.",
            "keywords": ["content strategy", "SEO", "engagement", "distribution channels"],
            "follow_up": "How would you ensure your content stands out in a crowded market?"
        },
        {
            "question": "How would you approach social media marketing for a B2B company?",
            "keywords": ["platform selection", "content calendar", "engagement", "lead generation"],
            "follow_up": "How would you measure ROI for your social media efforts?"
        },
        {
            "question": "Explain your approach to email marketing campaigns.",
            "keywords": ["segmentation", "personalization", "A/B testing", "conversion optimization"],
            "follow_up": "How would you handle declining email open rates?"
        },
        {
            "question": "How would you develop a brand identity for a new company?",
            "keywords": ["brand values", "visual identity", "messaging", "consistency"],
            "follow_up": "How would you ensure your brand resonates with your target audience?"
        }
    ],
    "Finance": [
        {
            "question": "How would you approach financial planning for a startup?",
            "keywords": ["cash flow", "budgeting", "forecasting", "funding strategy"],
            "follow_up": "What financial metrics would you prioritize for a new business?"
        },
        {
            "question": "Explain your approach to investment portfolio management.",
            "keywords": ["diversification", "risk management", "asset allocation", "rebalancing"],
            "follow_up": "How would you adjust your strategy during market volatility?"
        },
        {
            "question": "How would you evaluate the financial health of a company?",
            "keywords": ["financial ratios", "cash flow analysis", "profitability", "liquidity"],
            "follow_up": "What red flags would you look for in a company's financial statements?"
        },
        {
            "question": "Describe your approach to financial risk management.",
            "keywords": ["hedging", "insurance", "diversification", "contingency planning"],
            "follow_up": "How would you balance risk and return in your financial strategy?"
        },
        {
            "question": "How would you approach tax planning for a business?",
            "keywords": ["tax efficiency", "compliance", "strategic planning", "documentation"],
            "follow_up": "How would you stay updated on changing tax regulations?"
        }
    ],
    "Design": [
        {
            "question": "Describe your design process from concept to final product.",
            "keywords": ["research", "ideation", "prototyping", "iteration", "user testing"],
            "follow_up": "How do you incorporate user feedback into your design process?"
        },
        {
            "question": "How do you approach creating a user interface for a complex application?",
            "keywords": ["information architecture", "usability", "accessibility", "visual hierarchy"],
            "follow_up": "How would you balance aesthetics with functionality?"
        },
        {
            "question": "Explain your approach to responsive design.",
            "keywords": ["mobile-first", "breakpoints", "flexible layouts", "performance"],
            "follow_up": "How do you ensure consistency across different devices and screen sizes?"
        },
        {
            "question": "How do you incorporate accessibility into your design process?",
            "keywords": ["WCAG guidelines", "screen readers", "color contrast", "keyboard navigation"],
            "follow_up": "What tools do you use to test for accessibility compliance?"
        },
        {
            "question": "Describe your approach to design systems and component libraries.",
            "keywords": ["consistency", "reusability", "documentation", "maintenance"],
            "follow_up": "How do you ensure adoption of your design system across teams?"
        }
    ],
    "Healthcare": [
        {
            "question": "How would you approach improving patient care in a hospital setting?",
            "keywords": ["patient experience", "efficiency", "staff training", "technology integration"],
            "follow_up": "How would you measure the success of your improvements?"
        },
        {
            "question": "Describe your approach to healthcare data management and privacy.",
            "keywords": ["HIPAA compliance", "electronic health records", "security", "access control"],
            "follow_up": "How would you balance data accessibility with patient privacy?"
        },
        {
            "question": "How would you implement a telemedicine program?",
            "keywords": ["technology platform", "patient engagement", "provider training", "reimbursement"],
            "follow_up": "How would you ensure quality of care in a virtual setting?"
        },
        {
            "question": "Explain your approach to healthcare cost management.",
            "keywords": ["budgeting", "resource allocation", "efficiency", "revenue cycle"],
            "follow_up": "How would you balance cost reduction with quality of care?"
        },
        {
            "question": "How would you approach improving medication adherence among patients?",
            "keywords": ["patient education", "reminder systems", "follow-up", "barrier identification"],
            "follow_up": "How would you measure the effectiveness of your interventions?"
        }
    ],
    "Education": [
        {
            "question": "How would you approach implementing technology in the classroom?",
            "keywords": ["digital tools", "student engagement", "teacher training", "assessment"],
            "follow_up": "How would you ensure equitable access to technology for all students?"
        },
        {
            "question": "Describe your approach to personalized learning.",
            "keywords": ["individual needs", "adaptive learning", "data-driven", "student agency"],
            "follow_up": "How would you balance personalized learning with standardized curriculum requirements?"
        },
        {
            "question": "How would you approach improving student engagement in online learning?",
            "keywords": ["interactive content", "community building", "feedback", "motivation"],
            "follow_up": "How would you address the challenges of screen fatigue in online learning?"
        },
        {
            "question": "Explain your approach to assessment and evaluation in education.",
            "keywords": ["formative assessment", "summative assessment", "feedback", "data analysis"],
            "follow_up": "How would you ensure assessments are fair and equitable for all students?"
        },
        {
            "question": "How would you approach professional development for teachers?",
            "keywords": ["continuous learning", "peer collaboration", "mentoring", "reflective practice"],
            "follow_up": "How would you measure the impact of professional development on student outcomes?"
        }
    ],
    "Legal": [
        {
            "question": "How would you approach contract negotiation?",
            "keywords": ["terms", "conditions", "risk assessment", "negotiation strategy"],
            "follow_up": "How would you handle a situation where the other party is unwilling to compromise?"
        },
        {
            "question": "Describe your approach to legal research and analysis.",
            "keywords": ["case law", "statutes", "precedent", "legal reasoning"],
            "follow_up": "How do you stay updated on changes in relevant laws and regulations?"
        },
        {
            "question": "How would you approach compliance risk management?",
            "keywords": ["risk assessment", "policies", "training", "monitoring"],
            "follow_up": "How would you balance compliance requirements with business objectives?"
        },
        {
            "question": "Explain your approach to intellectual property protection.",
            "keywords": ["patents", "trademarks", "copyrights", "trade secrets"],
            "follow_up": "How would you handle potential IP infringement by competitors?"
        },
        {
            "question": "How would you approach dispute resolution?",
            "keywords": ["mediation", "arbitration", "litigation", "settlement"],
            "follow_up": "How would you determine the most appropriate dispute resolution method for a particular case?"
        }
    ],
    "Fashion": [
        {
            "question": "How would you approach trend forecasting in the fashion industry?",
            "keywords": ["market research", "consumer behavior", "cultural influences", "data analysis"],
            "follow_up": "How would you balance following trends with maintaining brand identity?"
        },
        {
            "question": "Describe your approach to sustainable fashion design.",
            "keywords": ["eco-friendly materials", "ethical production", "waste reduction", "circular economy"],
            "follow_up": "How would you communicate your sustainability efforts to consumers?"
        },
        {
            "question": "How would you approach retail merchandising for a fashion brand?",
            "keywords": ["visual merchandising", "inventory management", "seasonal planning", "store layout"],
            "follow_up": "How would you optimize the customer shopping experience?"
        },
        {
            "question": "Explain your approach to fashion marketing and branding.",
            "keywords": ["brand identity", "target audience", "social media", "influencer partnerships"],
            "follow_up": "How would you measure the success of your marketing campaigns?"
        },
        {
            "question": "How would you approach sizing and fit in fashion design?",
            "keywords": ["inclusive sizing", "body diversity", "fit testing", "customer feedback"],
            "follow_up": "How would you address the challenges of online shopping and returns related to sizing?"
        }
    ],
    "Media": [
        {
            "question": "How would you approach content strategy for a media company?",
            "keywords": ["audience analysis", "content planning", "distribution channels", "engagement metrics"],
            "follow_up": "How would you balance quality content with the need for regular publishing?"
        },
        {
            "question": "Describe your approach to digital media production.",
            "keywords": ["storytelling", "multimedia", "platform optimization", "audience engagement"],
            "follow_up": "How would you adapt content for different platforms and formats?"
        },
        {
            "question": "How would you approach audience growth and retention?",
            "keywords": ["content quality", "community building", "engagement strategies", "analytics"],
            "follow_up": "How would you measure audience loyalty and satisfaction?"
        },
        {
            "question": "Explain your approach to monetization in digital media.",
            "keywords": ["advertising", "subscription models", "sponsored content", "e-commerce"],
            "follow_up": "How would you balance monetization with user experience?"
        },
        {
            "question": "How would you approach crisis communication in media?",
            "keywords": ["transparency", "timely response", "stakeholder management", "reputation protection"],
            "follow_up": "How would you rebuild trust after a crisis?"
        }
    ]
}

# Store interview sessions
interview_sessions = {}

@app.route('/')
def index():
    return send_file('frontend/index.html')

@app.route('/api/start_interview', methods=['POST'])
def start_interview():
    data = request.json
    interview_type = data.get('type', 'Technical')
    
    if interview_type not in INTERVIEW_QUESTIONS:
        return jsonify({"error": "Invalid interview type"}), 400
    
    session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    interview_sessions[session_id] = {
        "type": interview_type,
        "current_question": 0,
        "questions": INTERVIEW_QUESTIONS[interview_type],
        "history": []
    }
    
    return jsonify({
        "session_id": session_id,
        "question": INTERVIEW_QUESTIONS[interview_type][0]["question"]
    })

@app.route('/api/submit_response', methods=['POST'])
def submit_response():
    data = request.json
    response = data.get('response', '')
    session_id = data.get('session_id')
    
    if not session_id or session_id not in interview_sessions:
        return jsonify({"error": "No active interview session"}), 400
    
    session = interview_sessions[session_id]
    current_q = session["current_question"]
    question_data = session["questions"][current_q]
    
    # Generate feedback
    feedback = generate_feedback(response, question_data)
    
    # Save to history
    session["history"].append({
        "timestamp": datetime.now().isoformat(),
        "question": question_data["question"],
        "response": response,
        "feedback": feedback
    })
    
    # Move to next question
    session["current_question"] = (current_q + 1) % len(session["questions"])
    next_question = session["questions"][session["current_question"]]["question"]
    
    return jsonify({
        "feedback": feedback,
        "next_question": next_question,
        "session_id": session_id
    })

def generate_feedback(response, question_data):
    """Generate feedback based on response analysis"""
    keywords = question_data["keywords"]
    
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
    feedback += question_data["follow_up"]
    
    return feedback

@app.route('/api/save_interview', methods=['POST'])
def save_interview():
    data = request.json
    session_id = data.get('session_id')
    
    if not session_id or session_id not in interview_sessions:
        return jsonify({"error": "No active interview session"}), 400
    
    session = interview_sessions[session_id]
    filename = f"interview_record_{session_id}.json"
    
    try:
        with open(filename, 'w') as f:
            json.dump({
                "timestamp": session_id,
                "type": session["type"],
                "history": session["history"]
            }, f, indent=4)
        return jsonify({"message": f"Interview saved to {filename}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Create frontend directory if it doesn't exist
    os.makedirs('frontend', exist_ok=True)
    app.run(port=8000, debug=True) 