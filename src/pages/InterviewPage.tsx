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
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl">Interview Simulator</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Prepare for your {interviewType} interview with {company} for the {role} position
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={goBackToPrep} className="w-full sm:w-auto text-xs sm:text-sm">
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="bg-blue-50 p-3 sm:p-6 rounded-lg border border-blue-100">
                <h3 className="text-base sm:text-lg font-medium text-blue-800 mb-2 sm:mb-3">Interview Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Company</p>
                    <p className="font-medium text-sm sm:text-base">{company.charAt(0).toUpperCase() + company.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Role</p>
                    <p className="font-medium text-sm sm:text-base">{role.charAt(0).toUpperCase() + role.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Interview Type</p>
                    <p className="font-medium text-sm sm:text-base">{interviewType.charAt(0).toUpperCase() + interviewType.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Questions</p>
                    <p className="font-medium text-sm sm:text-base">{questions.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center pt-2 sm:pt-4">
                <Button 
                  size="lg" 
                  onClick={startInterview}
                  className="w-full sm:w-auto text-sm sm:text-base py-2 sm:py-4 px-4 sm:px-8"
                >
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Interview in Progress</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="bg-blue-50 p-3 sm:p-6 rounded-lg">
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Question:</h3>
              <p className="text-sm sm:text-base">{questions[currentQuestionIndex]}</p>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Your Answer:</h3>
              <Textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[150px] sm:min-h-[200px] text-sm sm:text-base"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={goBackToPrep} 
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                End Interview
              </Button>
              
              <Button 
                onClick={nextQuestion} 
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
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