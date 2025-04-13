import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import SecureAptitudeTest from '@/components/mock-test/SecureAptitudeTest';
import BehavioralTest from '@/components/mock-test/BehavioralTest';
import TechnicalTest from '@/components/mock-test/TechnicalTest';
import CodingTest from '@/components/mock-test/CodingTest';
// Note: Ensure the TechnicalTest component is properly created in src/components/mock-test/TechnicalTest.tsx

const MockTest = () => {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const handleTestSelection = (testId: string) => {
    if (testId === 'coding-fundamentals') {
      // Redirect to HackerRank
      window.open('https://www.hackerrank.com/auth/login', '_blank');
    } else {
      setSelectedTest(testId);
    }
  };

  const mockTests = [
    {
      id: 'aptitude-general',
      title: 'General Aptitude Test',
      description: 'Test your problem-solving, numerical, and logical reasoning skills',
      duration: 45,
      questions: 30,
      difficulty: 'Medium',
      tags: ['Reasoning', 'Math', 'Logic'],
    },
    {
      id: 'coding-fundamentals',
      title: 'Coding Fundamentals',
      description: 'Basic programming problems and algorithm challenges on HackerRank platform',
      duration: 60,
      questions: 5,
      difficulty: 'Medium',
      tags: ['Algorithms', 'Data Structures', 'Problem Solving'],
    },
    {
      id: 'coding-test',
      title: 'Advanced Coding Test',
      description: 'Solve DSA problems with AI-powered code review and optimization suggestions',
      duration: 90,
      questions: 5,
      difficulty: 'Hard',
      tags: ['DSA', 'Algorithms', 'Problem Solving', 'AI Review'],
    },
    {
      id: 'technical-dsa-oop',
      title: 'Technical Questions',
      description: 'Assessment of Data Structures, Algorithms and Object-Oriented Programming concepts',
      duration: 40,
      questions: 20,
      difficulty: 'Hard',
      tags: ['DSA', 'OOP', 'Technical', 'Algorithms'],
    },
    {
      id: 'behavioral-questions',
      title: 'Behavioral Questions',
      description: 'Common behavioral questions using the STAR method',
      duration: 30,
      questions: 10,
      difficulty: 'Easy',
      tags: ['STAR Method', 'Soft Skills', 'Communication'],
    },
  ];

  const recentTests = [
    {
      id: 'recent-1',
      title: 'Frontend Development Quiz',
      date: '2023-05-10',
      score: 85,
      status: 'Passed',
    },
    {
      id: 'recent-2',
      title: 'Data Structures Assessment',
      date: '2023-05-05',
      score: 65,
      status: 'Needs Improvement',
    },
  ];

  if (selectedTest === 'aptitude-general') {
    return <SecureAptitudeTest />;
  } else if (selectedTest === 'technical-dsa-oop') {
    return <TechnicalTest />;
  } else if (selectedTest === 'behavioral-questions') {
    return <BehavioralTest />;
  } else if (selectedTest === 'coding-test') {
    return <CodingTest />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mock Tests</h1>
          <p className="text-gray-500 mt-1">Test your knowledge and skills with targeted assessments</p>
        </div>

        {recentTests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Tests</CardTitle>
              <CardDescription>Your most recently completed assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentTests.map((test) => (
                  <div
                    key={test.id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{test.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(test.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {test.status === 'Passed' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <span 
                        className={`font-medium ${
                          test.status === 'Passed' 
                            ? 'text-green-600' 
                            : 'text-amber-600'
                        }`}
                      >
                        {test.score}%
                      </span>
                      <p className="text-xs text-gray-500">{test.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Available Tests</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {mockTests.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>
                        {test.title}
                        {(test.id === 'coding-fundamentals' || test.id === 'coding-test') && (
                          <ExternalLink className="h-4 w-4 inline ml-1 text-gray-400" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">{test.description}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {test.id === 'coding-test' && (
                        <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
                          Unique
                        </Badge>
                      )}
                      <Badge
                        variant={
                          test.difficulty === 'Easy' 
                            ? 'outline' 
                            : test.difficulty === 'Medium' 
                              ? 'secondary' 
                              : 'default'
                        }
                      >
                        {test.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{test.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Info className="h-4 w-4" />
                      <span>{test.questions} questions</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {test.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="bg-primary/5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => handleTestSelection(test.id)}
                  >
                    {test.id === 'coding-test' ? 'Start Test' : 'Start Test'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MockTest;
