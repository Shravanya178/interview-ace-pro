import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const InterviewPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extract parameters from URL
  const company = searchParams.get('company') || 'google';
  const role = searchParams.get('role') || 'frontend';
  const interviewType = searchParams.get('type') || 'technical';
  
  // State for interview
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [questions] = useState([
    "Tell me about yourself and your experience.",
    "What interests you about this role?",
    "Describe a challenging project you worked on."
  ]);
  
  // Start the interview
  const startInterview = () => {
    setIsInterviewStarted(true);
  };
  
  // Handle next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserResponse('');
    } else {
      toast({
        title: "Interview Complete",
        description: "You've answered all the questions!",
      });
    }
  };
  
  // Return to interview prep
  const goBackToPrep = () => {
    navigate('/interview');
  };
  
  // Render interview preparation screen
  if (!isInterviewStarted) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Interview Simulator</CardTitle>
                  <CardDescription>
                    Prepare for your {interviewType} interview with {company} for the {role} position
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={goBackToPrep}>
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-lg font-medium text-blue-800 mb-3">Interview Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Company</p>
                    <p className="font-medium">{company.charAt(0).toUpperCase() + company.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Role</p>
                    <p className="font-medium">{role.charAt(0).toUpperCase() + role.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Interview Type</p>
                    <p className="font-medium">{interviewType.charAt(0).toUpperCase() + interviewType.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Questions</p>
                    <p className="font-medium">{questions.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button size="lg" onClick={startInterview}>
                  Start Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // Render active interview screen
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Interview in Progress</CardTitle>
            <CardDescription>
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Question:</h3>
              <p>{questions[currentQuestionIndex]}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Your Answer:</h3>
              <Textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[200px]"
              />
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={goBackToPrep}>
                End Interview
              </Button>
              
              <Button onClick={nextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Interview"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InterviewPage; 