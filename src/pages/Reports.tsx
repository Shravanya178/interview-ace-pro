
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, ExternalLink } from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

const Reports = () => {
  const performanceData = [
    { name: 'Technical', score: 75, average: 65 },
    { name: 'Problem Solving', score: 85, average: 70 },
    { name: 'Communication', score: 70, average: 75 },
    { name: 'System Design', score: 60, average: 65 },
    { name: 'Algorithms', score: 80, average: 60 },
  ];

  const progressData = [
    { date: '2023-04-01', technical: 60, behavioral: 65 },
    { date: '2023-04-15', technical: 65, behavioral: 68 },
    { date: '2023-05-01', technical: 70, behavioral: 72 },
    { date: '2023-05-15', technical: 75, behavioral: 70 },
  ];

  const skillGaps = [
    { skill: 'System Design', gap: 'High', courses: [
      { title: 'System Design Interview', platform: 'Educative', url: '#' },
      { title: 'Grokking System Design', platform: 'Educative', url: '#' },
    ]},
    { skill: 'Dynamic Programming', gap: 'Medium', courses: [
      { title: 'Dynamic Programming Patterns', platform: 'LeetCode', url: '#' },
      { title: 'Algorithms: DP', platform: 'Coursera', url: '#' },
    ]},
    { skill: 'Behavioral', gap: 'Low', courses: [
      { title: 'Mastering the STAR Method', platform: 'Udemy', url: '#' },
    ]},
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Reports</h1>
          <p className="text-gray-500 mt-1">Track your progress and identify areas for improvement</p>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Performance</CardTitle>
                <CardDescription>
                  Your performance compared to the average candidate
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar name="Your Score" dataKey="score" fill="hsl(var(--secondary))" />
                      <Bar name="Average Score" dataKey="average" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="progress" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Over Time</CardTitle>
                <CardDescription>
                  Track your improvement across different interview skills
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={progressData.map(item => ({
                        ...item,
                        date: formatDate(item.date)
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="technical" 
                        name="Technical Skills" 
                        stroke="hsl(var(--secondary))" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="behavioral" 
                        name="Behavioral Skills" 
                        stroke="#8884d8" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Gap Analysis</CardTitle>
                <CardDescription>
                  Recommended resources to improve your skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {skillGaps.map((item, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-lg">{item.skill}</h3>
                        <span className={`text-sm px-2 py-1 rounded ${
                          item.gap === 'High' 
                            ? 'bg-red-100 text-red-600' 
                            : item.gap === 'Medium'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-green-100 text-green-600'
                        }`}>
                          {item.gap} Priority
                        </span>
                      </div>
                      
                      <div className="space-y-3 mt-2">
                        {item.courses.map((course, idx) => (
                          <div key={idx} className="flex justify-between items-start">
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
