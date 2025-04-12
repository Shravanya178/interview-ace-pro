
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Code, MessageSquare, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const InterviewPrep = () => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  const companies = [
    { id: 'google', name: 'Google' },
    { id: 'amazon', name: 'Amazon' },
    { id: 'microsoft', name: 'Microsoft' },
    { id: 'apple', name: 'Apple' },
    { id: 'meta', name: 'Meta' },
  ];
  
  const roles = [
    { id: 'frontend', name: 'Frontend Developer' },
    { id: 'backend', name: 'Backend Developer' },
    { id: 'fullstack', name: 'Full Stack Developer' },
    { id: 'data-scientist', name: 'Data Scientist' },
    { id: 'devops', name: 'DevOps Engineer' },
  ];
  
  const interviewTypes = [
    {
      id: 'technical',
      title: 'Technical Interview',
      description: 'Coding challenges and technical questions',
      icon: Code,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'behavioral',
      title: 'Behavioral Interview',
      description: 'STAR method questions about past experiences',
      icon: MessageSquare,
      color: 'bg-green-100 text-green-700',
    },
    {
      id: 'system-design',
      title: 'System Design',
      description: 'Architecture and scalability discussions',
      icon: BookOpen,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'mock',
      title: 'Full Mock Interview',
      description: 'Comprehensive simulated interview',
      icon: Video,
      color: 'bg-orange-100 text-orange-700',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Preparation</h1>
          <p className="text-gray-500 mt-1">Practice with AI-powered interview simulations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customize Your Interview</CardTitle>
            <CardDescription>Select a company and role to tailor your practice interview</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="company" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="company">Target Company</TabsTrigger>
                <TabsTrigger value="role">Job Role</TabsTrigger>
              </TabsList>
              
              <TabsContent value="company" className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {companies.map((company) => (
                    <Button
                      key={company.id}
                      variant={selectedCompany === company.id ? "default" : "outline"}
                      className="h-auto py-4 justify-start flex-col items-center"
                      onClick={() => setSelectedCompany(company.id)}
                    >
                      <span>{company.name}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="role" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <Button
                      key={role.id}
                      variant={selectedRole === role.id ? "default" : "outline"}
                      className="h-auto py-3 justify-start"
                      onClick={() => setSelectedRole(role.id)}
                    >
                      {role.name}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-3">Selected Options</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCompany && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {companies.find(c => c.id === selectedCompany)?.name}
                  </Badge>
                )}
                {selectedRole && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {roles.find(r => r.id === selectedRole)?.name}
                  </Badge>
                )}
                {!selectedCompany && !selectedRole && (
                  <p className="text-sm text-gray-500">No options selected</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviewTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card key={type.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`p-2 rounded-full ${type.color.split(' ')[0]}`}>
                      <Icon className={`h-5 w-5 ${type.color.split(' ')[1]}`} />
                    </div>
                    <CardTitle>{type.title}</CardTitle>
                  </div>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="inline-block w-1 h-1 rounded-full bg-gray-500 mt-2"></span>
                      <span>
                        {type.id === 'technical' && 'Includes data structures, algorithms, and language-specific questions'}
                        {type.id === 'behavioral' && 'Assess teamwork, conflict resolution, and leadership skills'}
                        {type.id === 'system-design' && 'Focus on scalability, reliability, and performance considerations'}
                        {type.id === 'mock' && 'Complete simulation of a real interview with multiple sections'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-block w-1 h-1 rounded-full bg-gray-500 mt-2"></span>
                      <span>
                        {type.id === 'technical' && 'Live coding with real-time feedback'}
                        {type.id === 'behavioral' && 'Detailed feedback on your STAR responses'}
                        {type.id === 'system-design' && 'Collaborative diagramming tools included'}
                        {type.id === 'mock' && 'Comprehensive performance report provided'}
                      </span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button className="w-full">Start {type.title}</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewPrep;
