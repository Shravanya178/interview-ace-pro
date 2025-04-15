import React, { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ResumeUpload from '@/components/resume/ResumeUpload';
import SkillsList from '@/components/resume/SkillsList';
import ResumeTest from '@/components/resume/ResumeTest';
import ReportDisplay from '@/components/resume/ReportDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ResumeAnalysis = () => {
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [skills, setSkills] = useState<{ name: string; level: number; category: 'technical' | 'soft' | 'language' | 'tool' }[]>([
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
  ]);
  const [report, setReport] = useState<any>(null);
  const [recommendations, setRecommendations] = useState([
    {
      skill: 'TypeScript',
      courses: [
        { title: 'TypeScript Deep Dive', platform: 'Coursera', url: 'https://www.coursera.org/search?query=typescript' },
        { title: 'Advanced TypeScript', platform: 'Udemy', url: 'https://www.udemy.com/courses/search/?q=typescript' },
      ],
    },
    {
      skill: 'Node.js',
      courses: [
        { title: 'Node.js API Masterclass', platform: 'Udemy', url: 'https://www.udemy.com/courses/search/?q=node.js' },
        { title: 'Server-side Development', platform: 'edX', url: 'https://www.edx.org/search?q=node.js' },
      ],
    },
    {
      skill: 'AWS',
      courses: [
        { title: 'AWS Certified Developer', platform: 'AWS Training', url: 'https://aws.amazon.com/training/' },
        { title: 'Cloud Computing Fundamentals', platform: 'Coursera', url: 'https://www.coursera.org/search?query=aws' },
      ],
    },
  ]);
  const { toast } = useToast();

  // Handle resume upload completion
  const handleUploadComplete = (extractedSkills?: any) => {
    // If we have extracted skills from the resume, update the skills state
    if (extractedSkills && extractedSkills.length > 0) {
      setSkills(extractedSkills);
    }
    
    setAnalysisComplete(true);
    
    // After some time, encourage the user to start the test
    setTimeout(() => {
      toast({
        title: "Analysis Complete",
        description: "Your resume has been analyzed. Let's take a short test to assess your skills better.",
        action: (
          <Button onClick={() => {
            setTestStarted(true);
            setActiveTab("test");
          }}>
            Start Test
          </Button>
        ),
      });
    }, 2000);
  };
  
  // Handle test completion
  const handleTestComplete = (updatedSkills: { name: string; level: number; category: 'technical' | 'soft' | 'language' | 'tool' }[], testReport: any) => {
    setSkills(updatedSkills);
    setReport(testReport);
    setTestComplete(true);
    setReportGenerated(true);
    
    // Update recommendations based on test report
    const newRecommendations = testReport.recommendations.map((rec: any) => ({
      skill: rec.skill,
      courses: rec.courses
    }));
    
    // If we have new recommendations, update them
    if (newRecommendations.length > 0) {
      setRecommendations(newRecommendations);
    }
    
    // Switch to report tab
    setTimeout(() => {
      setActiveTab("report");
      toast({
        title: "Test Completed",
        description: "Your skills assessment is complete. Check out your detailed report.",
      });
    }, 1000);
  };
  
  // Handle report download
  const handleDownloadReport = async () => {
    // In a real app, this would be a more sophisticated PDF generation
    if (!report) return;
    
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your report...",
    });

    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(30, 30, 30);
      pdf.text('Skills Assessment Report', 20, 20);
      
      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Overall performance section
      pdf.setFontSize(16);
      pdf.setTextColor(30, 30, 30);
      pdf.text('Test Performance', 20, 45);
      
      pdf.setFontSize(12);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Score: ${Math.round(report.overall.percentage)}%`, 25, 55);
      pdf.text(`Correct Answers: ${report.overall.correctAnswers}/${report.overall.totalQuestions}`, 25, 62);
      
      // Skills performance section
      pdf.setFontSize(16);
      pdf.text('Skills Performance', 20, 75);
      
      let yPos = 85;
      report.skillPerformance.forEach((skill) => {
        pdf.setFontSize(12);
        pdf.text(`${skill.name}:`, 25, yPos);
        
        // Draw skill bar background
        pdf.setFillColor(230, 230, 230);
        pdf.rect(70, yPos - 4, 100, 5, 'F');
        
        // Draw skill bar progress
        const performance = skill.performance;
        const barColor = performance < 50 ? [220, 50, 50] : performance < 70 ? [240, 180, 0] : [40, 180, 70];
        pdf.setFillColor(barColor[0], barColor[1], barColor[2]);
        pdf.rect(70, yPos - 4, performance, 5, 'F');
        
        // Add percentage text
        pdf.text(`${Math.round(performance)}%`, 175, yPos);
        
        yPos += 10;
        
        // Add new page if we're running out of space
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
      });
      
      // Add weak areas section on a new page if needed
      if (yPos > 200) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Weak areas section
      pdf.setFontSize(16);
      pdf.text('Areas for Improvement', 20, yPos + 10);
      yPos += 20;
      
      if (report.weakAreas.length === 0) {
        pdf.setFontSize(12);
        pdf.text('You performed well in all skill areas. Keep up the good work!', 25, yPos);
        yPos += 10;
      } else {
        report.weakAreas.forEach((area) => {
          pdf.setFontSize(14);
          pdf.text(area.name, 25, yPos);
          yPos += 8;
          
          pdf.setFontSize(11);
          pdf.text(`You scored ${Math.round(area.performance)}% in this area.`, 30, yPos);
          yPos += 12;
          
          // Recommended courses
          const recs = report.recommendations.find(r => r.skill === area.name);
          if (recs && recs.courses.length > 0) {
            pdf.setFontSize(12);
            pdf.text('Recommended Courses:', 30, yPos);
            yPos += 8;
            
            recs.courses.forEach((course) => {
              pdf.setFontSize(11);
              pdf.text(`• ${course.title} (${course.platform})`, 35, yPos);
              pdf.setTextColor(0, 0, 255);
              pdf.text(course.url, 45, yPos + 5);
              pdf.setTextColor(60, 60, 60);
              yPos += 12;
            });
          }
          
          yPos += 5;
          
          // Add new page if we're running out of space
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
        });
      }
      
      // Add summary page
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(30, 30, 30);
      pdf.text('Summary and Next Steps', 20, 20);
      
      pdf.setFontSize(12);
      pdf.setTextColor(60, 60, 60);
      pdf.text('Based on your assessment, we recommend focusing on these key areas:', 20, 35);
      
      let summaryYPos = 45;
      if (report.weakAreas.length === 0) {
        pdf.text('You performed well across all assessed skills. Consider exploring advanced topics', 25, summaryYPos);
        pdf.text('in your strongest areas to further enhance your expertise.', 25, summaryYPos + 6);
      } else {
        report.weakAreas.slice(0, 3).forEach((area, index) => {
          pdf.text(`${index + 1}. Improving your ${area.name} skills through recommended courses`, 25, summaryYPos);
          summaryYPos += 10;
        });
      }
      
      summaryYPos += 15;
      pdf.text('Next Steps:', 20, summaryYPos);
      summaryYPos += 10;
      pdf.text('1. Review the detailed feedback for each skill area', 25, summaryYPos);
      summaryYPos += 10;
      pdf.text('2. Enroll in recommended courses to address knowledge gaps', 25, summaryYPos);
      summaryYPos += 10;
      pdf.text('3. Practice with additional assessments to track your progress', 25, summaryYPos);
      summaryYPos += 10;
      pdf.text('4. Schedule mock interviews to apply your improved skills', 25, summaryYPos);
      
      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text('PrepMate - Skills Assessment Report', 20, 285);
        pdf.text(`Page ${i} of ${pageCount}`, 180, 285);
      }
      
      // Save the PDF
      pdf.save('skills-assessment-report.pdf');
      
      toast({
        title: "Report Downloaded",
        description: "Your skills assessment report has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Analysis</h1>
          <p className="text-gray-500 mt-1">Upload your resume to analyze your skills and get personalized recommendations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="test" disabled={!analysisComplete}>Test</TabsTrigger>
            <TabsTrigger value="skills" disabled={!analysisComplete}>Skills</TabsTrigger>
            <TabsTrigger value="report" disabled={!reportGenerated}>Report</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="upload">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResumeUpload onUploadComplete={handleUploadComplete} />
                
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
                        <span className="font-medium">Take a skills assessment test</span>
                        <p className="text-gray-500 pl-6 mt-1">
                          Complete a customized quiz to validate your skills and identify areas for improvement
                        </p>
                      </li>
                      <li className="pl-2">
                        <span className="font-medium">Get a detailed report</span>
                        <p className="text-gray-500 pl-6 mt-1">
                          Receive personalized recommendations for courses and resources to enhance your skills
                        </p>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="test">
              {analysisComplete && (
                <ResumeTest 
                  skills={skills} 
                  onTestComplete={handleTestComplete} 
                />
              )}
            </TabsContent>
            
            <TabsContent value="skills">
              {analysisComplete && <SkillsList skills={skills} />}
            </TabsContent>
            
            <TabsContent value="report">
              {reportGenerated && report ? (
                <ReportDisplay report={report} onDownload={handleDownloadReport} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Report Not Available</CardTitle>
                    <CardDescription>
                      You need to complete the skills assessment test first
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-6">
                    <p className="mb-4">Please go to the Test tab and complete the assessment to generate your report.</p>
                    <Button onClick={() => setActiveTab("test")}>Go to Test</Button>
                  </CardContent>
                </Card>
              )}
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
