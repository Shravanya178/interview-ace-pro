import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Check, PenLine } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  skillCategory: 'technical' | 'soft' | 'language' | 'tool';
  skillName: string;
}

interface TestProps {
  skills: { name: string; level: number; category: 'technical' | 'soft' | 'language' | 'tool' }[];
  onTestComplete: (updatedSkills: { name: string; level: number; category: 'technical' | 'soft' | 'language' | 'tool' }[], report: any) => void;
}

const ResumeTest: React.FC<TestProps> = ({ skills, onTestComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [testStarted, setTestStarted] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Generate questions based on skills
  const generateQuestions = (): Question[] => {
    // Create a pool of questions for different skills
    const questionPools: Record<string, Question[]> = {
      // Technical skills questions
      "JavaScript": [
        {
          id: 1,
          question: "Which of the following is NOT a JavaScript data type?",
          options: ["String", "Boolean", "Integer", "Symbol"],
          correctAnswer: 2,
          skillCategory: "technical",
          skillName: "JavaScript"
        },
        {
          id: 2,
          question: "What is the correct way to destructure an array in JavaScript?",
          options: [
            "const {first, second} = myArray;",
            "const first, second = myArray;",
            "const [first, second] = myArray;",
            "const (first, second) = myArray;"
          ],
          correctAnswer: 2,
          skillCategory: "technical",
          skillName: "JavaScript"
        },
        {
          id: 3,
          question: "Which JavaScript method would you use to add an element to the end of an array?",
          options: ["push()", "pop()", "shift()", "unshift()"],
          correctAnswer: 0,
          skillCategory: "technical",
          skillName: "JavaScript"
        }
      ],
      "React": [
        {
          id: 4,
          question: "Which React hook would you use to perform side effects in your component?",
          options: ["useState", "useEffect", "useContext", "useReducer"],
          correctAnswer: 1,
          skillCategory: "technical",
          skillName: "React"
        },
        {
          id: 5,
          question: "What does JSX stand for in React?",
          options: ["JavaScript XML", "JavaScript Extension", "JavaScript Syntax", "Java XML"],
          correctAnswer: 0,
          skillCategory: "technical",
          skillName: "React"
        },
        {
          id: 6,
          question: "Which lifecycle method is called after a component is rendered for the first time?",
          options: ["componentWillMount", "componentDidMount", "componentWillUpdate", "componentDidUpdate"],
          correctAnswer: 1,
          skillCategory: "technical",
          skillName: "React"
        }
      ],
      "TypeScript": [
        {
          id: 7,
          question: "Which of these is NOT a valid TypeScript type?",
          options: ["string", "number", "boolean", "float"],
          correctAnswer: 3,
          skillCategory: "technical",
          skillName: "TypeScript"
        },
        {
          id: 8,
          question: "What is the purpose of the 'interface' keyword in TypeScript?",
          options: [
            "To create a class",
            "To define a contract for an object structure",
            "To create a module",
            "To implement inheritance"
          ],
          correctAnswer: 1,
          skillCategory: "technical",
          skillName: "TypeScript"
        }
      ],
      "HTML/CSS": [
        {
          id: 9,
          question: "Which CSS property is used to change the text color of an element?",
          options: ["text-color", "color", "font-color", "text-style"],
          correctAnswer: 1,
          skillCategory: "technical",
          skillName: "HTML/CSS"
        },
        {
          id: 10,
          question: "Which HTML element defines the title of a document?",
          options: ["<meta>", "<head>", "<title>", "<header>"],
          correctAnswer: 2,
          skillCategory: "technical",
          skillName: "HTML/CSS"
        }
      ],
      "Node.js": [
        {
          id: 11,
          question: "In a Node.js application, which module would you use to create a web server?",
          options: ["fs", "http", "path", "crypto"],
          correctAnswer: 1,
          skillCategory: "technical",
          skillName: "Node.js"
        },
        {
          id: 12,
          question: "What is the package manager commonly used with Node.js?",
          options: ["pip", "npm", "yarn", "both npm and yarn"],
          correctAnswer: 3,
          skillCategory: "technical",
          skillName: "Node.js"
        }
      ],
      "Python": [
        {
          id: 13,
          question: "What data structure in Python uses key-value pairs?",
          options: ["List", "Tuple", "Dictionary", "Set"],
          correctAnswer: 2,
          skillCategory: "technical",
          skillName: "Python"
        },
        {
          id: 14,
          question: "How do you create a function in Python?",
          options: ["function myFunc():", "def myFunc():", "create myFunc():", "func myFunc():"],
          correctAnswer: 1,
          skillCategory: "technical",
          skillName: "Python"
        }
      ],
      "Java": [
        {
          id: 15,
          question: "Which keyword is used to define a constant in Java?",
          options: ["const", "final", "static", "constant"],
          correctAnswer: 1,
          skillCategory: "technical",
          skillName: "Java"
        },
        {
          id: 16,
          question: "What is the base class for all classes in Java?",
          options: ["Class", "Main", "Object", "Super"],
          correctAnswer: 2,
          skillCategory: "technical",
          skillName: "Java"
        }
      ],
      
      // Soft skills questions
      "Communication": [
        {
          id: 17,
          question: "What is the most effective way to handle a miscommunication with a colleague?",
          options: [
            "Send a detailed email explaining their mistake",
            "Have a direct conversation to clarify the misunderstanding",
            "Ask your manager to mediate",
            "Avoid the issue to prevent confrontation"
          ],
          correctAnswer: 1,
          skillCategory: "soft",
          skillName: "Communication"
        },
        {
          id: 18,
          question: "When presenting technical information to non-technical stakeholders, you should:",
          options: [
            "Use as much technical jargon as possible to sound professional",
            "Skip over the technical details entirely",
            "Use analogies and simplified explanations without sacrificing accuracy",
            "Let someone else do the presentation"
          ],
          correctAnswer: 2,
          skillCategory: "soft",
          skillName: "Communication"
        }
      ],
      "Teamwork": [
        {
          id: 19,
          question: "When addressing a team conflict, what approach is generally most effective?",
          options: [
            "Ignoring the conflict to maintain harmony",
            "Having the team leader make the final decision",
            "Open discussion with all parties to find a compromise",
            "Taking a vote and going with the majority opinion"
          ],
          correctAnswer: 2,
          skillCategory: "soft",
          skillName: "Teamwork"
        },
        {
          id: 20,
          question: "When a team member is struggling with their tasks, what should you do?",
          options: [
            "Report them to the manager",
            "Offer to help or provide guidance",
            "Ignore it as it's not your responsibility",
            "Take over their work completely"
          ],
          correctAnswer: 1,
          skillCategory: "soft",
          skillName: "Teamwork"
        }
      ],
      "Problem Solving": [
        {
          id: 21,
          question: "What approach would you take to troubleshoot a complex technical issue?",
          options: [
            "Immediately seek help from a senior colleague",
            "Try random solutions until one works",
            "Break down the problem, isolate variables, and test hypotheses methodically",
            "Restart the system and hope the issue resolves itself"
          ],
          correctAnswer: 2,
          skillCategory: "soft",
          skillName: "Problem Solving"
        },
        {
          id: 22,
          question: "When faced with a problem that has multiple possible solutions, you should:",
          options: [
            "Choose the first solution that comes to mind",
            "Evaluate each solution based on effectiveness, efficiency, and resources required",
            "Always go with the most complex solution to show your expertise",
            "Let someone else decide"
          ],
          correctAnswer: 1,
          skillCategory: "soft",
          skillName: "Problem Solving"
        }
      ],
      
      // Tools
      "Git": [
        {
          id: 23,
          question: "Which git command would you use to create a new branch and switch to it?",
          options: [
            "git branch new-branch",
            "git checkout -b new-branch",
            "git create new-branch",
            "git switch --create new-branch"
          ],
          correctAnswer: 1,
          skillCategory: "tool",
          skillName: "Git"
        },
        {
          id: 24,
          question: "How do you stage changes in git?",
          options: ["git commit", "git add", "git push", "git stage"],
          correctAnswer: 1,
          skillCategory: "tool",
          skillName: "Git"
        }
      ],
      "AWS": [
        {
          id: 25,
          question: "Which AWS service would you use for serverless computing?",
          options: ["EC2", "S3", "Lambda", "RDS"],
          correctAnswer: 2,
          skillCategory: "tool",
          skillName: "AWS"
        },
        {
          id: 26,
          question: "Which AWS service is used for object storage?",
          options: ["EBS", "S3", "EFS", "RDS"],
          correctAnswer: 1,
          skillCategory: "tool",
          skillName: "AWS"
        }
      ],
      "Docker": [
        {
          id: 27,
          question: "What command is used to run a Docker container?",
          options: ["docker start", "docker run", "docker create", "docker execute"],
          correctAnswer: 1,
          skillCategory: "tool",
          skillName: "Docker"
        },
        {
          id: 28,
          question: "What file is used to define a Docker container?",
          options: ["Docker.json", "Container.yml", "Dockerfile", "Docker-compose.yml"],
          correctAnswer: 2,
          skillCategory: "tool",
          skillName: "Docker"
        }
      ],
      
      // Languages
      "English": [
        {
          id: 29,
          question: "In a technical document, which approach is best for clarity?",
          options: [
            "Using complex sentences with multiple clauses",
            "Using concise, direct sentences with clear subjects and verbs",
            "Using passive voice whenever possible",
            "Avoiding technical terms completely"
          ],
          correctAnswer: 1,
          skillCategory: "language",
          skillName: "English"
        }
      ]
    };
    
    // Generate questions based on user's skills
    const generatedQuestions: Question[] = [];
    let nextId = 100; // Starting with high ID to avoid conflicts
    
    // First, prioritize questions from the user's actual skills
    skills.forEach(skill => {
      // If we have questions for this skill in our pool
      if (questionPools[skill.name]) {
        // Add up to 2 questions for each skill
        const skillQuestions = questionPools[skill.name];
        const questionsToAdd = skillQuestions.slice(0, Math.min(2, skillQuestions.length));
        
        questionsToAdd.forEach(q => {
          generatedQuestions.push({
            ...q,
            id: nextId++
          });
        });
      } else {
        // For skills we don't have specific questions for, 
        // create a generic question about experience level
        generatedQuestions.push({
          id: nextId++,
          question: `How would you rate your proficiency in ${skill.name}?`,
          options: [
            "Beginner - I have basic understanding or limited experience",
            "Intermediate - I can work independently on most tasks",
            "Advanced - I can handle complex tasks and mentor others",
            "Expert - I have deep knowledge and extensive experience"
          ],
          // For self-assessment questions, all answers are "correct" since it's subjective
          correctAnswer: -1, // Special value to indicate self-assessment
          skillCategory: skill.category,
          skillName: skill.name
        });
      }
    });
    
    // If we have fewer than 8 questions, add some from other common skills
    const commonSkills = ["JavaScript", "React", "Problem Solving", "Communication", "Teamwork", "Git"];
    let i = 0;
    
    while (generatedQuestions.length < 8 && i < commonSkills.length) {
      const skill = commonSkills[i];
      // Check if the skill is not already covered and we have questions for it
      if (!skills.some(s => s.name === skill) && questionPools[skill]) {
        // Add one question for this skill
        const question = questionPools[skill][0];
        if (question) {
          generatedQuestions.push({
            ...question,
            id: nextId++
          });
        }
      }
      i++;
    }
    
    // Randomize the order of questions
    return generatedQuestions.sort(() => Math.random() - 0.5);
  };

  // Generate questions only once when component mounts or when skills change
  useEffect(() => {
    const generatedQuestions = generateQuestions();
    setQuestions(generatedQuestions);
    // Reset selected answers when questions change
    setSelectedAnswers({});
  }, [skills]); // Add skills as a dependency
  
  // Reset everything when test starts
  const handleStartTest = () => {
    setTestStarted(true);
    setProgress(0);
    // Clear any previously selected answers
    setSelectedAnswers({});
    // Reset to the first question
    setCurrentQuestionIndex(0);
  };
  
  const handleSelectAnswer = (questionId: number, answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Force a reset of radio button selection state by manipulating the DOM directly
      const radios = document.querySelectorAll('input[type="radio"]');
      radios.forEach((radio) => {
        (radio as HTMLInputElement).checked = false;
      });
      
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
    } else {
      // Test is complete
      completeTest();
    }
  };
  
  const completeTest = () => {
    setTestComplete(true);
    setProgress(100);
    
    // Calculate new skill levels based on test results
    const updatedSkills = [...skills];
    const skillScores: Record<string, { correct: number, total: number }> = {};
    
    // Count correct answers by skill
    questions.forEach(q => {
      if (!skillScores[q.skillName]) {
        skillScores[q.skillName] = { correct: 0, total: 0 };
      }
      
      skillScores[q.skillName].total += 1;
      
      // For self-assessment questions (correctAnswer === -1), count it as correct
      // For knowledge questions, check if the answer matches the correct answer
      if (q.correctAnswer === -1 || selectedAnswers[q.id] === q.correctAnswer) {
        skillScores[q.skillName].correct += 1;
      }
    });
    
    // Update skill levels based on test performance
    updatedSkills.forEach((skill, index) => {
      if (skillScores[skill.name]) {
        const score = skillScores[skill.name];
        
        // Adjust skill level based on test performance
        let newLevel = skill.level;
        
        // For self-assessment questions, use the selected answer as a direct skill level indicator
        const selfAssessmentQuestions = questions.filter(q => 
          q.skillName === skill.name && q.correctAnswer === -1
        );
        
        if (selfAssessmentQuestions.length > 0) {
          // Get the first self-assessment question for this skill
          const selfQ = selfAssessmentQuestions[0];
          const answer = selectedAnswers[selfQ.id];
          
          if (answer !== undefined) {
            // Convert the answer (0-3) to a skill percentage
            const selfRatingToPercentage = {
              0: 25, // Beginner
              1: 50, // Intermediate
              2: 75, // Advanced
              3: 95  // Expert
            };
            newLevel = selfRatingToPercentage[answer as 0 | 1 | 2 | 3];
          }
        } else {
          // For knowledge questions, adjust based on performance
          if (score.correct === 0) {
            newLevel = Math.max(skill.level - 15, 10); // Significant decrease but minimum 10%
          } else if (score.correct < score.total) {
            newLevel = Math.max(skill.level - 5, 20); // Modest decrease but minimum 20%
          } else {
            newLevel = Math.min(skill.level + 5, 95); // Modest increase but maximum 95%
          }
        }
        
        updatedSkills[index] = { ...skill, level: newLevel };
      }
    });
    
    // Generate report
    const report = generateReport(updatedSkills, questions, selectedAnswers);
    
    // Pass updated skills and report to parent
    onTestComplete(updatedSkills, report);
  };
  
  const generateReport = (
    updatedSkills: { name: string; level: number; category: 'technical' | 'soft' | 'language' | 'tool' }[],
    questions: Question[],
    answers: Record<number, number>
  ) => {
    // Calculate correct/incorrect answers (excluding self-assessment questions)
    const knowledgeQuestions = questions.filter(q => q.correctAnswer !== -1);
    const correctCount = knowledgeQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
    const incorrectCount = knowledgeQuestions.length - correctCount;
    
    // Identify weak areas
    const skillPerformance: Record<string, { correct: number, total: number, percentage: number }> = {};
    
    // Process knowledge questions only for skill performance
    knowledgeQuestions.forEach(q => {
      if (!skillPerformance[q.skillName]) {
        skillPerformance[q.skillName] = { correct: 0, total: 0, percentage: 0 };
      }
      
      skillPerformance[q.skillName].total += 1;
      
      if (answers[q.id] === q.correctAnswer) {
        skillPerformance[q.skillName].correct += 1;
      }
    });
    
    // Calculate percentages
    Object.keys(skillPerformance).forEach(skill => {
      const performance = skillPerformance[skill];
      performance.percentage = performance.total > 0 
        ? (performance.correct / performance.total) * 100
        : 0;
    });
    
    // Sort skills by performance
    const sortedSkills = Object.entries(skillPerformance)
      .sort(([, a], [, b]) => a.percentage - b.percentage)
      .map(([name, performance]) => ({
        name,
        performance: performance.percentage,
        correct: performance.correct,
        total: performance.total
      }));
    
    // Generate improvement recommendations
    const weakAreas = sortedSkills.filter(skill => skill.performance < 70);
    
    // Generate recommendations based on weak areas
    const recommendations = weakAreas.map(area => {
      // Mock courses recommendations - in a real app this would come from a database or API
      const courses = [
        {
          title: `Advanced ${area.name} Masterclass`,
          platform: 'Udemy',
          url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(area.name)}`
        },
        {
          title: `${area.name} Deep Dive`,
          platform: 'Coursera',
          url: `https://www.coursera.org/search?query=${encodeURIComponent(area.name)}`
        },
        {
          title: `Professional ${area.name}`,
          platform: 'edX',
          url: `https://www.edx.org/search?q=${encodeURIComponent(area.name)}`
        }
      ];
      
      return {
        skill: area.name,
        performance: area.performance,
        courses: courses.slice(0, 2) // Just return 2 courses per skill
      };
    });
    
    return {
      overall: {
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        percentage: (correctCount / questions.length) * 100
      },
      skillPerformance: sortedSkills,
      weakAreas,
      recommendations
    };
  };
  
  // Skip rendering until questions are loaded
  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preparing Assessment</CardTitle>
          <CardDescription>
            Building your personalized skills assessment...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Get the current question
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!testStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills Assessment Test</CardTitle>
          <CardDescription>
            Take a short test based on your resume to assess your skill levels and get personalized recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <PenLine className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready to assess your skills?</h3>
            <p className="text-gray-500 mb-4">
              This test contains {questions.length} questions based on the skills from your resume. 
              The results will help us tailor recommendations specifically for you.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartTest} className="w-full">Start Test</Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (testComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Complete</CardTitle>
          <CardDescription>
            Thank you for completing the skills assessment test.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Test completed successfully!</h3>
            <p className="text-gray-500 mb-4">
              Your skills have been updated and personalized recommendations are ready.
              Check the Skills and Recommendations tabs to see your results.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card key={`question-card-${currentQuestion.id}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
            <CardDescription>
              Testing your knowledge of {currentQuestion.skillName}
            </CardDescription>
          </div>
          <div className="text-sm font-medium">
            {Math.round(progress)}% Complete
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="font-medium text-lg">{currentQuestion.question}</div>
          
          <RadioGroup
            key={`question-group-${currentQuestion.id}`}
            defaultValue=""
            value={selectedAnswers[currentQuestion.id] !== undefined ? selectedAnswers[currentQuestion.id].toString() : ""}
            onValueChange={(value) => {
              if (value) {
                handleSelectAnswer(currentQuestion.id, parseInt(value));
              }
            }}
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={`question-${currentQuestion.id}-option-${index}`} 
                  className="flex items-center space-x-2 border p-3 rounded-md"
                >
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`question-${currentQuestion.id}-option-${index}`}
                    checked={selectedAnswers[currentQuestion.id] === index}
                  />
                  <Label 
                    htmlFor={`question-${currentQuestion.id}-option-${index}`}
                    className="flex-grow cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={handleNextQuestion}
          disabled={selectedAnswers[currentQuestion.id] === undefined}
          className="w-full"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Test'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResumeTest; 