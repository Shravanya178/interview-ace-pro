import React, { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  FileDown,
  Award,
  Clock,
  User,
  Briefcase,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "@/hooks/useAuth";

const Reports = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Helper function to capitalize each word in a string
  const capitalizeEachWord = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const progressData = [
    { date: "2023-04-01", technical: 60, behavioral: 65 },
    { date: "2023-04-15", technical: 65, behavioral: 68 },
    { date: "2023-05-01", technical: 70, behavioral: 72 },
    { date: "2023-05-15", technical: 75, behavioral: 70 },
    { date: "2023-06-01", technical: 80, behavioral: 75 },
    { date: "2023-06-15", technical: 82, behavioral: 78 },
  ];

  const performanceData = [
    { category: "DSA Knowledge", score: 85 },
    { category: "Problem Solving", score: 78 },
    { category: "Code Quality", score: 72 },
    { category: "Optimization", score: 68 },
    { category: "Testing Approach", score: 65 },
  ];

  const skillsData = [
    { name: "Algorithms", value: 35 },
    { name: "Data Structures", value: 25 },
    { name: "System Design", value: 15 },
    { name: "Debugging", value: 15 },
    { name: "OOP Concepts", value: 10 },
  ];

  // Use logged-in user information for candidate data
  const candidateData = {
    name: user?.name || "Guest User",
    email: user?.email || "guest@example.com",
    role: "Senior Frontend Developer",
    date: "2023-07-12",
    time: "14:30 - 15:45",
    testType: "Technical Interview + Coding Test",
    totalScore: 78,
    status: "Pass",
    recommendation: "Hire",
    photoUrl: user?.photoUrl || "",
    feedback:
      "Candidate showed strong problem-solving skills and deep knowledge of JavaScript. Could improve on system design concepts and optimization techniques. Overall, a solid performer who would be an asset to the team.",
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const learningResources = [
    {
      category: "Data Structures & Algorithms",
      priority: "High",
      resources: [
        {
          title: "Introduction to Algorithms",
          type: "Book",
          author: "Thomas H. Cormen",
          link: "https://www.amazon.com/Introduction-Algorithms-3rd-MIT-Press/dp/0262033844",
          icon: BookOpen,
        },
        {
          title: "AlgoExpert - Algorithm Interview Preparation",
          type: "Course",
          author: "Clement Mihailescu",
          link: "https://www.algoexpert.io/",
          icon: Video,
        },
        {
          title: "Grokking Algorithms",
          type: "Book",
          author: "Aditya Bhargava",
          link: "https://www.manning.com/books/grokking-algorithms",
          icon: BookOpen,
        },
      ],
    },
    {
      category: "System Design",
      priority: "Medium",
      resources: [
        {
          title: "System Design Interview",
          type: "Book",
          author: "Alex Xu",
          link: "https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF",
          icon: BookOpen,
        },
        {
          title: "Grokking the System Design Interview",
          type: "Course",
          author: "Educative",
          link: "https://www.educative.io/courses/grokking-the-system-design-interview",
          icon: Video,
        },
      ],
    },
    {
      category: "Behavioral Interviews",
      priority: "Low",
      resources: [
        {
          title: "Cracking the Coding Interview",
          type: "Book",
          author: "Gayle Laakmann McDowell",
          link: "https://www.amazon.com/Cracking-Coding-Interview-Programming-Questions/dp/0984782850",
          icon: BookOpen,
        },
        {
          title: "STAR Method - Complete Guide",
          type: "Article",
          author: "Indeed Career Guide",
          link: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique",
          icon: FileText,
        },
      ],
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-600";
      case "Medium":
        return "bg-amber-100 text-amber-600";
      case "Low":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const iconForType = (type: string, Icon: any) => {
    return <Icon className="h-4 w-4 mr-2 text-secondary" />;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Pass":
        return "bg-green-100 text-green-800";
      case "Fail":
        return "bg-red-100 text-red-800";
      case "Borderline":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const recommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Hire":
        return "bg-green-100 text-green-800";
      case "No Hire":
        return "bg-red-100 text-red-800";
      case "Borderline":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      toast({
        title: capitalizeEachWord("Generating PDF"),
        description: capitalizeEachWord("Please wait while we prepare your report..."),
      });

      // Create PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text(capitalizeEachWord("Candidate Interview Report"), 105, 15, { align: "center" });
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 20, 190, 20);

      // Add candidate information section
      pdf.setFontSize(16);
      pdf.text(capitalizeEachWord("Candidate Information"), 20, 30);

      pdf.setFontSize(11);
      pdf.text(`${capitalizeEachWord("Name")}: ${candidateData.name}`, 20, 40);
      pdf.text(`${capitalizeEachWord("Email")}: ${candidateData.email}`, 20, 47);
      pdf.text(`${capitalizeEachWord("Applied Role")}: ${candidateData.role}`, 20, 54);
      pdf.text(`${capitalizeEachWord("Interview Date")}: ${candidateData.date}`, 20, 61);
      pdf.text(`${capitalizeEachWord("Interview Time")}: ${candidateData.time}`, 20, 68);
      pdf.text(`${capitalizeEachWord("Test Type")}: ${candidateData.testType}`, 20, 75);

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${capitalizeEachWord("Total Score")}: ${candidateData.totalScore}%`, 20, 85);

      // Status with colored rectangle
      pdf.text(`${capitalizeEachWord("Status")}: `, 20, 92);
      pdf.setFillColor(
        candidateData.status === "Pass" ? 0 : 255,
        candidateData.status === "Pass" ? 180 : 0,
        0
      );
      pdf.rect(40, 89, 15, 6, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.text(candidateData.status, 42, 93);
      pdf.setTextColor(0, 0, 0);

      // Recommendation with colored rectangle
      pdf.text(`${capitalizeEachWord("Recommendation")}: `, 20, 102);
      pdf.setFillColor(
        candidateData.recommendation === "Hire" ? 0 : 255,
        candidateData.recommendation === "Hire" ? 180 : 0,
        0
      );
      pdf.rect(60, 99, 20, 6, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.text(candidateData.recommendation, 62, 103);
      pdf.setTextColor(0, 0, 0);

      // Add separator
      pdf.line(20, 110, 190, 110);

      // Add bar chart (manually create it)
      pdf.setFontSize(16);
      pdf.text(capitalizeEachWord("Performance Breakdown"), 20, 120);

      // Generate simple bar chart
      pdf.setDrawColor(0, 0, 0);

      let barY = 130;
      const barMaxWidth = 100;

      performanceData.forEach((data, index) => {
        // Convert hex to RGB for PDF
        const hexColor = COLORS[index % COLORS.length].replace("#", "");
        const r = parseInt(hexColor.substring(0, 2), 16);
        const g = parseInt(hexColor.substring(2, 4), 16);
        const b = parseInt(hexColor.substring(4, 6), 16);

        pdf.setFontSize(10);
        pdf.text(`${data.category}: ${data.score}%`, 20, barY);
        pdf.setFillColor(r, g, b);
        pdf.rect(20, barY + 2, (data.score / 100) * barMaxWidth, 6, "F");
        barY += 15;
      });

      // Add separator
      pdf.line(20, barY, 190, barY);
      barY += 10;

      // Add skills pie chart representation (as text)
      pdf.setFontSize(16);
      pdf.text(capitalizeEachWord("Skills Distribution"), 20, barY);
      barY += 10;

      skillsData.forEach((skill, index) => {
        // Convert hex to RGB for PDF
        const hexColor = COLORS[index % COLORS.length].replace("#", "");
        const r = parseInt(hexColor.substring(0, 2), 16);
        const g = parseInt(hexColor.substring(2, 4), 16);
        const b = parseInt(hexColor.substring(4, 6), 16);

        pdf.setFillColor(r, g, b);
        pdf.rect(20, barY, 8, 8, "F");
        pdf.setFontSize(10);
        pdf.text(`${skill.name}: ${skill.value}%`, 35, barY + 5);
        barY += 12;
      });

      // Add separator
      pdf.line(20, barY, 190, barY);
      barY += 10;

      // Add feedback section - ensure it's fully visible
      pdf.setFontSize(16);
      pdf.text(capitalizeEachWord("Interviewer Feedback"), 20, barY);
      barY += 10;

      // Check if we need to add a new page for feedback (if too close to bottom)
      if (barY > 250) {
        pdf.addPage();
        barY = 20;
        pdf.setFontSize(16);
        pdf.text(capitalizeEachWord("Interviewer Feedback (continued)"), 20, barY);
        barY += 10;
      }

      // Create feedback background
      pdf.setFillColor(240, 240, 240);

      // Handle multiline text for feedback
      const maxWidth = 160; // Wider text area
      const feedbackText = candidateData.feedback;

      // Set font properties for feedback
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);

      // Split text to fit width
      const splitFeedback = pdf.splitTextToSize(feedbackText, maxWidth);

      // Calculate needed height and ensure it fits on page
      const lineHeight = 7;
      const totalHeight = Math.min(splitFeedback.length * lineHeight + 10, 200);

      // Draw background rectangle for feedback
      pdf.rect(20, barY, 170, totalHeight, "F");

      // Add the feedback text line by line with proper spacing
      for (let i = 0; i < splitFeedback.length; i++) {
        // Check if we need a new page
        if (barY + 7 + i * lineHeight > 280) {
          pdf.addPage();
          barY = 20 - i * lineHeight; // Reset position for the new page

          // Redraw background on new page if needed
          const remainingLines = splitFeedback.length - i;
          const remainingHeight = Math.min(
            remainingLines * lineHeight + 10,
            200
          );
          pdf.setFillColor(240, 240, 240);
          pdf.rect(20, barY, 170, remainingHeight, "F");
        }

        // Add each line of text
        pdf.text(splitFeedback[i], 25, barY + 7 + i * lineHeight);
      }

      // Save file
      pdf.save(
        `${candidateData.name.replace(/\s+/g, "_")}_Interview_Report.pdf`
      );

      toast({
        title: capitalizeEachWord("PDF Generated Successfully"),
        description: capitalizeEachWord("Your report has been downloaded."),
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: capitalizeEachWord("Error Generating PDF"),
        description: capitalizeEachWord("There was a problem creating your report. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {capitalizeEachWord(t("performance reports"))}
          </h1>
          <p className="text-gray-500 mt-1">{capitalizeEachWord(t("track progress"))}</p>
        </div>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="progress">{capitalizeEachWord(t("progress"))}</TabsTrigger>
            <TabsTrigger value="candidate">{capitalizeEachWord(t("candidate report"))}</TabsTrigger>
            <TabsTrigger value="recommendations">
              {capitalizeEachWord(t("recommendations"))}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{capitalizeEachWord(t("progress over time"))}</CardTitle>
                <CardDescription>
                  {capitalizeEachWord(t("interview skills progress"))}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div style={{ height: '320px', width: '100%', minHeight: '250px', minWidth: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                    <LineChart
                      data={progressData.map((item) => ({
                        ...item,
                        date: formatDate(item.date),
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
                        name={capitalizeEachWord(t("technical skills"))}
                        stroke="hsl(var(--secondary))"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="behavioral"
                        name={capitalizeEachWord(t("behavioral skills"))}
                        stroke="#8884d8"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidate" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Candidate Info Card */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>{capitalizeEachWord("Candidate Information")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={candidateData.photoUrl}
                        alt={candidateData.name}
                      />
                      <AvatarFallback className="text-lg">
                        {candidateData.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <h3 className="font-medium text-lg">
                        {candidateData.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {candidateData.email}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">{capitalizeEachWord("Applied For")}</p>
                        <p className="font-medium">{candidateData.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">{capitalizeEachWord("Interview Date")}</p>
                        <p className="font-medium">{candidateData.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">{capitalizeEachWord("Interview Time")}</p>
                        <p className="font-medium">{candidateData.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">{capitalizeEachWord("Test Type")}</p>
                        <p className="font-medium">{candidateData.testType}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{capitalizeEachWord("Total Score")}</span>
                      <span className="font-medium text-lg">
                        {candidateData.totalScore}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{capitalizeEachWord("Status")}</span>
                      <Badge className={statusColor(candidateData.status)}>
                        {candidateData.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {capitalizeEachWord("Recommendation")}
                      </span>
                      <Badge
                        className={recommendationColor(
                          candidateData.recommendation
                        )}
                      >
                        {candidateData.recommendation}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {capitalizeEachWord("Interviewer Feedback")}
                    </h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {candidateData.feedback}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    {isGeneratingPDF
                      ? capitalizeEachWord("Generating PDF...")
                      : capitalizeEachWord("Download PDF Report")}
                  </Button>
                </CardFooter>
              </Card>

              {/* Charts Column */}
              <div className="md:col-span-2 space-y-6">
                {/* Performance Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>{capitalizeEachWord("Performance Breakdown")}</CardTitle>
                    <CardDescription>
                      {capitalizeEachWord("Score by assessment category")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: '280px', width: '100%', minHeight: '250px', minWidth: '250px' }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                        <BarChart
                          data={performanceData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 50,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="category"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis domain={[0, 100]} />
                          <Tooltip
                            formatter={(value) => [`${value}%`, "Score"]}
                          />
                          <Bar dataKey="score" fill="hsl(var(--primary))">
                            {performanceData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>{capitalizeEachWord("Skills Distribution")}</CardTitle>
                    <CardDescription>
                      {capitalizeEachWord("Analysis of skills demonstrated during interview")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: '280px', width: '100%', minHeight: '250px', minWidth: '250px' }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                        <PieChart>
                          <Pie
                            data={skillsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {skillsData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value}%`, "Proficiency"]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Hidden report template for PDF generation - this is what gets exported to PDF */}
            <div ref={reportRef} className="hidden">
              <div className="max-w-4xl mx-auto bg-white p-8">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-center mb-2">
                    {capitalizeEachWord("Candidate Interview Report")}
                  </h1>
                  <Separator className="my-4" />
                </div>

                {/* 1. Candidate Information Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    {capitalizeEachWord("Candidate Information")}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">{capitalizeEachWord("Name")}</p>
                        <p className="font-medium">{candidateData.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">{capitalizeEachWord("Email")}</p>
                        <p className="font-medium">{candidateData.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">{capitalizeEachWord("Applied For")}</p>
                        <p className="font-medium">{candidateData.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">{capitalizeEachWord("Interview Date")}</p>
                        <p className="font-medium">{candidateData.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">{capitalizeEachWord("Interview Time")}</p>
                        <p className="font-medium">{candidateData.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">{capitalizeEachWord("Test Type")}</p>
                        <p className="font-medium">{candidateData.testType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">{capitalizeEachWord("Total Score")}</p>
                      <p className="font-medium text-lg">
                        {candidateData.totalScore}%
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">{capitalizeEachWord("Status")}</p>
                      <p
                        className={`px-2 py-1 rounded text-sm inline-block ${statusColor(
                          candidateData.status
                        )}`}
                      >
                        {candidateData.status}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">
                        {capitalizeEachWord("Recommendation")}
                      </p>
                      <p
                        className={`px-2 py-1 rounded text-sm inline-block ${recommendationColor(
                          candidateData.recommendation
                        )}`}
                      >
                        {candidateData.recommendation}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* 2. Performance Bar Chart */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    {capitalizeEachWord("Performance Breakdown")}
                  </h2>
                  <div style={{ height: '280px', width: '100%', minHeight: '250px', minWidth: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                      <BarChart
                        data={performanceData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 50,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="category"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Score"]}
                        />
                        <Bar dataKey="score" fill="hsl(var(--primary))">
                          {performanceData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* 3. Skills Pie Chart */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    {capitalizeEachWord("Skills Distribution")}
                  </h2>
                  <div style={{ height: '280px', width: '100%', minHeight: '250px', minWidth: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                      <PieChart>
                        <Pie
                          data={skillsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {skillsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Proficiency"]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* 4. Interviewer Feedback */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    {capitalizeEachWord("Interviewer Feedback")}
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{candidateData.feedback}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{capitalizeEachWord(t("learning resources"))}</CardTitle>
                <CardDescription>{capitalizeEachWord(t("recommended resources"))}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {learningResources.map((category, index) => (
                    <div
                      key={index}
                      className="border-b pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="flex justify-between mb-4">
                        <h3 className="font-medium text-lg">
                          {capitalizeEachWord(category.category)}
                        </h3>
                        <span
                          className={`text-sm px-2 py-1 rounded ${priorityColor(
                            category.priority
                          )}`}
                        >
                          {capitalizeEachWord(category.priority)} {capitalizeEachWord(t("priority"))}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {category.resources.map((resource, idx) => {
                          const ResourceIcon = resource.icon;
                          return (
                            <div
                              key={idx}
                              className="bg-gray-50 rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-start">
                                  <div className="mt-0.5">
                                    {ResourceIcon && (
                                      <ResourceIcon className="h-5 w-5 text-secondary" />
                                    )}
                                  </div>
                                  <div className="ml-3">
                                    <h4 className="font-medium text-gray-900">
                                      {capitalizeEachWord(resource.title)}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {capitalizeEachWord(resource.type)} • {capitalizeEachWord(resource.author)}
                                    </p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <a
                                    href={resource.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    {capitalizeEachWord(t("view"))}
                                  </a>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
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
