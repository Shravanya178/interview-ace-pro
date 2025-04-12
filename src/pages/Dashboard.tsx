
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardCard from '@/components/dashboard/DashboardCard';
import SkillsRadarChart from '@/components/dashboard/SkillsRadarChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Video, TestTube, BookOpen, GraduationCap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const mockSkills = [
    { skill: 'React', score: 70, fullMark: 100 },
    { skill: 'JavaScript', score: 80, fullMark: 100 },
    { skill: 'Node.js', score: 65, fullMark: 100 },
    { skill: 'UI/UX', score: 50, fullMark: 100 },
    { skill: 'SQL', score: 75, fullMark: 100 },
  ];

  const upcomingInterviews = [
    { company: 'Tech Corp', role: 'Frontend Developer', date: '2023-05-25' },
    { company: 'DataSys Inc', role: 'Full Stack Engineer', date: '2023-05-28' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your progress and prepare for your next interview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardCard
                title="Resume Analysis"
                description="Upload your resume to extract skills and experiences"
                icon={FileText}
                href="/resume"
              />
              <DashboardCard
                title="Mock Interviews"
                description="Practice with AI-powered interview simulations"
                icon={Video}
                href="/interview"
              />
              <DashboardCard
                title="Aptitude Tests"
                description="Test your knowledge with targeted assessments"
                icon={TestTube}
                href="/mock-test"
              />
              <DashboardCard
                title="Performance Reports"
                description="Review your progress and improvement areas"
                icon={BookOpen}
                href="/reports"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
                <CardDescription>Scheduled practice sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingInterviews.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingInterviews.map((interview, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                        <div>
                          <h4 className="font-medium">{interview.company}</h4>
                          <p className="text-sm text-gray-500">{interview.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{new Date(interview.date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">No upcoming interviews</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <SkillsRadarChart skills={mockSkills} />

            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">React Fundamentals</span>
                      <span className="text-xs text-gray-500">80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">System Design</span>
                      <span className="text-xs text-gray-500">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Data Structures</span>
                      <span className="text-xs text-gray-500">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-sm mb-2">Recommended Courses</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <GraduationCap className="h-4 w-4 mt-0.5 text-secondary" />
                      <a href="#" className="text-sm text-blue-600 hover:underline">Advanced React Patterns</a>
                    </li>
                    <li className="flex items-start gap-2">
                      <GraduationCap className="h-4 w-4 mt-0.5 text-secondary" />
                      <a href="#" className="text-sm text-blue-600 hover:underline">System Design Interview Prep</a>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
