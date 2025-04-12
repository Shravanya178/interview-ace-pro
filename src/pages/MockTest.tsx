import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import SecureAptitudeTest from '@/components/mock-test/SecureAptitudeTest';

const MockTest = () => {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

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
      description: 'Basic programming problems and algorithm challenges',
      duration: 60,
      questions: 5,
      difficulty: 'Medium',
      tags: ['Algorithms', 'Data Structures', 'Problem Solving'],
    },
    {
      id: 'system-design-basics',
      title: 'System Design Basics',
      description: 'Fundamental concepts in system design and architecture',
      duration: 45,
      questions: 15,
      difficulty: 'Hard',
      tags: ['Architecture', 'Scalability', 'Design Patterns'],
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
                      <CardTitle>{test.title}</CardTitle>
                      <CardDescription className="mt-1">{test.description}</CardDescription>
                    </div>
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
                    onClick={() => setSelectedTest(test.id)}
                  >
                    Start Test
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
