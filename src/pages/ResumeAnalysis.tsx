
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ResumeUpload from '@/components/resume/ResumeUpload';
import SkillsList from '@/components/resume/SkillsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download } from 'lucide-react';

const ResumeAnalysis = () => {
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  // Mock data - in a real app, this would come from API
  const mockSkills = [
    { name: 'JavaScript', level: 85, category: 'technical' },
    { name: 'React', level: 80, category: 'technical' },
    { name: 'Node.js', level: 70, category: 'technical' },
    { name: 'TypeScript', level: 65, category: 'technical' },
    { name: 'HTML/CSS', level: 90, category: 'technical' },
    { name: 'Communication', level: 75, category: 'soft' },
    { name: 'Teamwork', level: 80, category: 'soft' },
    { name: 'Problem Solving', level: 85, category: 'soft' },
    { name: 'English', level: 95, category: 'language' },
    { name: 'Spanish', level: 40, category: 'language' },
    { name: 'Git', level: 75, category: 'tool' },
    { name: 'Docker', level: 60, category: 'tool' },
    { name: 'AWS', level: 55, category: 'tool' },
  ] as const;
  
  const recommendations = [
    {
      skill: 'TypeScript',
      courses: [
        { title: 'TypeScript Deep Dive', platform: 'Coursera', url: '#' },
        { title: 'Advanced TypeScript', platform: 'Udemy', url: '#' },
      ],
    },
    {
      skill: 'Node.js',
      courses: [
        { title: 'Node.js API Masterclass', platform: 'Udemy', url: '#' },
        { title: 'Server-side Development', platform: 'edX', url: '#' },
      ],
    },
    {
      skill: 'AWS',
      courses: [
        { title: 'AWS Certified Developer', platform: 'AWS Training', url: '#' },
        { title: 'Cloud Computing Fundamentals', platform: 'Coursera', url: '#' },
      ],
    },
  ];

  // Simulate completion after upload - in real app would be triggered by API response
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnalysisComplete(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Analysis</h1>
          <p className="text-gray-500 mt-1">Upload your resume to analyze your skills and get personalized recommendations</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="skills" disabled={!analysisComplete}>Skills</TabsTrigger>
            <TabsTrigger value="recommendations" disabled={!analysisComplete}>Recommendations</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="upload">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResumeUpload />
                
                <Card>
                  <CardHeader>
                    <CardTitle>How it works</CardTitle>
                    <CardDescription>
                      Learn how our AI-powered resume analysis helps you prepare for interviews
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 list-decimal list-inside text-sm">
                      <li className="pl-2">
                        <span className="font-medium">Upload your resume</span>
                        <p className="text-gray-500 pl-6 mt-1">
                          We support PDF and Word document formats (.doc, .docx)
                        </p>
                      </li>
                      <li className="pl-2">
                        <span className="font-medium">AI skill extraction</span>
                        <p className="text-gray-500 pl-6 mt-1">
                          Our AI analyzes your resume to identify technical skills, soft skills,
                          and experience levels
                        </p>
                      </li>
                      <li className="pl-2">
                        <span className="font-medium">Personalized assessments</span>
                        <p className="text-gray-500 pl-6 mt-1">
                          Based on your skills, we create tailored interview questions and
                          mock tests
                        </p>
                      </li>
                      <li className="pl-2">
                        <span className="font-medium">Skill gap analysis</span>
                        <p className="text-gray-500 pl-6 mt-1">
                          Identify areas for improvement and get course recommendations
                        </p>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="skills">
              {analysisComplete && <SkillsList skills={mockSkills} />}
            </TabsContent>
            
            <TabsContent value="recommendations">
              {analysisComplete && (
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Skill Enhancement Recommendations</CardTitle>
                      <CardDescription>
                        Based on your resume analysis, we recommend these courses to improve your skills
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {recommendations.map((rec) => (
                          <div key={rec.skill} className="border-b pb-4 last:border-b-0 last:pb-0">
                            <h3 className="font-medium text-lg mb-2">Improve your {rec.skill} skills</h3>
                            <div className="space-y-3">
                              {rec.courses.map((course) => (
                                <div key={course.title} className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{course.title}</p>
                                    <p className="text-sm text-gray-500">{course.platform}</p>
                                  </div>
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={course.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      View Course
                                    </a>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Resume Improvement Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary mt-2"></span>
                          <span>
                            <strong>Quantify achievements</strong>: Add specific metrics to demonstrate impact in your previous roles.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary mt-2"></span>
                          <span>
                            <strong>Add project details</strong>: Include more information about the projects you worked on.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary mt-2"></span>
                          <span>
                            <strong>Highlight leadership experience</strong>: Emphasize any team leading or mentoring experience.
                          </span>
                        </li>
                      </ul>
                      
                      <Button className="mt-6" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Full Report
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ResumeAnalysis;
