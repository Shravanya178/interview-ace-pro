import React, { useState } from 'react';
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
  
  // Generate questions based on skills
  const generateQuestions = (): Question[] => {
    // In a real app, these would be generated based on the user's resume and skills
    // For this example, we're creating mock questions related to the detected skills
    
    return [
      {
        id: 1,
        question: "Which React hook would you use to perform side effects in your component?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correctAnswer: 1,
        skillCategory: "technical",
        skillName: "React"
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
        question: "Which of these is NOT a valid TypeScript type?",
        options: ["string", "number", "boolean", "float"],
        correctAnswer: 3,
        skillCategory: "technical",
        skillName: "TypeScript"
      },
      {
        id: 4,
        question: "In a Node.js application, which module would you use to create a web server?",
        options: ["fs", "http", "path", "crypto"],
        correctAnswer: 1,
        skillCategory: "technical",
        skillName: "Node.js"
      },
      {
        id: 5,
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
        id: 6,
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
        id: 7,
        question: "Which AWS service would you use for serverless computing?",
        options: ["EC2", "S3", "Lambda", "RDS"],
        correctAnswer: 2,
        skillCategory: "tool",
        skillName: "AWS"
      },
      {
        id: 8,
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
      }
    ];
  };

  const questions = generateQuestions();
  
  const handleStartTest = () => {
    setTestStarted(true);
    setProgress(0);
  };
  
  const handleSelectAnswer = (questionId: number, answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
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
      
      if (selectedAnswers[q.id] === q.correctAnswer) {
        skillScores[q.skillName].correct += 1;
      }
    });
    
    // Update skill levels based on test performance
    updatedSkills.forEach((skill, index) => {
      if (skillScores[skill.name]) {
        const score = skillScores[skill.name];
        const performanceModifier = (score.correct / score.total) * 10;
        
        // Adjust skill level based on test performance
        // This could be more sophisticated in a real app
        let newLevel = skill.level;
        
        if (score.correct === 0) {
          newLevel = Math.max(skill.level - 15, 10); // Significant decrease but minimum 10%
        } else if (score.correct < score.total) {
          newLevel = Math.max(skill.level - 5, 20); // Modest decrease but minimum 20%
        } else {
          newLevel = Math.min(skill.level + 5, 95); // Modest increase but maximum 95%
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
    // Calculate correct/incorrect answers
    const correctCount = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const incorrectCount = questions.length - correctCount;
    
    // Identify weak areas
    const skillPerformance: Record<string, { correct: number, total: number, percentage: number }> = {};
    questions.forEach(q => {
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
      performance.percentage = (performance.correct / performance.total) * 100;
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
    <Card>
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
            value={selectedAnswers[currentQuestion.id]?.toString()}
            onValueChange={(value) => 
              handleSelectAnswer(currentQuestion.id, parseInt(value))
            }
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
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