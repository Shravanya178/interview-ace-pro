import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, AlertCircle, BookOpen, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ReportDisplayProps {
  report: {
    overall: {
      totalQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      percentage: number;
    };
    skillPerformance: {
      name: string;
      performance: number;
      correct: number;
      total: number;
    }[];
    weakAreas: {
      name: string;
      performance: number;
      correct: number;
      total: number;
    }[];
    recommendations: {
      skill: string;
      performance: number;
      courses: {
        title: string;
        platform: string;
        url: string;
      }[];
    }[];
  };
  onDownload: () => void;
}

const PerformanceBadge = ({ score }: { score: number }) => {
  if (score >= 90) return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Excellent</Badge>;
  if (score >= 70) return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Good</Badge>;
  if (score >= 50) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Average</Badge>;
  return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Needs Improvement</Badge>;
};

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onDownload }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skills Assessment Report</CardTitle>
          <CardDescription>
            Based on your resume and test performance, we've analyzed your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Test Performance</h3>
              <div className="flex items-center justify-between">
                <span>Overall Score</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{Math.round(report.overall.percentage)}%</span>
                  <PerformanceBadge score={report.overall.percentage} />
                </div>
              </div>
              <Progress value={report.overall.percentage} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="border rounded-md p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {report.overall.correctAnswers}
                  </div>
                  <div className="text-sm text-gray-500">Correct Answers</div>
                </div>
                <div className="border rounded-md p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {report.overall.incorrectAnswers}
                  </div>
                  <div className="text-sm text-gray-500">Incorrect Answers</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Performance by Skill</h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {report.skillPerformance.map((skill) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{skill.name}</span>
                      <span>{skill.correct}/{skill.total} correct</span>
                    </div>
                    <div className="relative w-full">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            skill.performance < 50 ? "bg-red-500" : 
                            skill.performance < 70 ? "bg-yellow-500" : 
                            "bg-green-500"
                          )}
                          style={{ width: `${skill.performance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Areas for Improvement</CardTitle>
          <CardDescription>
            Based on your test results, we've identified these skills that need attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.weakAreas.length > 0 ? (
            <div className="space-y-6">
              {report.weakAreas.map((area) => (
                <div key={area.name} className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{area.name}</h4>
                      <p className="text-sm text-gray-500">
                        You scored {Math.round(area.performance)}% in this area, correctly answering {area.correct} out of {area.total} questions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center space-x-2 mb-3">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <h5 className="font-medium">Recommended Resources</h5>
                    </div>
                    <div className="space-y-3">
                      {report.recommendations.find(r => r.skill === area.name)?.courses.map((course, index) => (
                        <div key={index} className="flex justify-between items-start bg-white p-3 rounded border">
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
                  
                  <Separator />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">Great job!</h3>
              <p className="text-gray-500">
                You performed well in all skill areas. Keep up the good work!
              </p>
            </div>
          )}
          
          <Button onClick={onDownload} className="w-full mt-6">
            <Download className="h-4 w-4 mr-2" />
            Download PDF Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDisplay; 