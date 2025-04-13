import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Video,
  Code,
  MessageSquare,
  BookOpen,
  Smile,
  CircleHelp,
  FileText,
  Lightbulb,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CompanySelector from "@/components/interview/CompanySelector";
import RoleSelector from "@/components/interview/RoleSelector";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

const InterviewPrep = () => {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentInterview, setCurrentInterview] = useState(null);
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Extended company and role lists
  const companies = [
    { id: "google", name: "Google" },
    { id: "amazon", name: "Amazon" },
    { id: "microsoft", name: "Microsoft" },
    { id: "apple", name: "Apple" },
    { id: "meta", name: "Meta" },
    { id: "netflix", name: "Netflix" },
    { id: "uber", name: "Uber" },
    { id: "airbnb", name: "Airbnb" },
    { id: "twitter", name: "Twitter" },
    { id: "linkedin", name: "LinkedIn" },
    { id: "salesforce", name: "Salesforce" },
    { id: "ibm", name: "IBM" },
    { id: "oracle", name: "Oracle" },
    { id: "adobe", name: "Adobe" },
    { id: "intel", name: "Intel" },
    { id: "nvidia", name: "NVIDIA" },
    { id: "tesla", name: "Tesla" },
    { id: "walmart", name: "Walmart" },
    { id: "jpmorgan", name: "JPMorgan Chase" },
    { id: "goldman", name: "Goldman Sachs" },
  ];

  const roles = [
    { id: "frontend", name: "Frontend Developer" },
    { id: "backend", name: "Backend Developer" },
    { id: "fullstack", name: "Full Stack Developer" },
    { id: "data-scientist", name: "Data Scientist" },
    { id: "devops", name: "DevOps Engineer" },
    { id: "mobile", name: "Mobile Developer" },
    { id: "ui-ux", name: "UI/UX Designer" },
    { id: "product-manager", name: "Product Manager" },
    { id: "data-engineer", name: "Data Engineer" },
    { id: "ml-engineer", name: "Machine Learning Engineer" },
    { id: "qa", name: "QA Engineer" },
    { id: "sre", name: "Site Reliability Engineer" },
    { id: "security", name: "Security Engineer" },
    { id: "cloud", name: "Cloud Architect" },
    { id: "embedded", name: "Embedded Systems Engineer" },
    { id: "blockchain", name: "Blockchain Developer" },
    { id: "ar-vr", name: "AR/VR Developer" },
    { id: "game", name: "Game Developer" },
    { id: "technical-writer", name: "Technical Writer" },
    { id: "project-manager", name: "Project Manager" },
  ];

  const interviewTypes = [
    {
      id: "technical",
      title: t("Technical interview"),
      description: t("Technical interview desc"),
      icon: Code,
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: "behavioral",
      title: t("Behavioral interview"),
      description: t("Behavioral interview desc"),
      icon: MessageSquare,
      color: "bg-green-100 text-green-700",
    },
    {
      id: "system-design",
      title: t("System design"),
      description: t("System design desc"),
      icon: BookOpen,
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: "mock",
      title: t("Full mock interview"),
      description: t("Full mock interview desc"),
      icon: Video,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  // Add Facial Emotion Analysis card directly after the interview types cards
  const renderFacialAnalysis = () => (
    <Card className="overflow-hidden relative">
      <div className="absolute -top-1 -right-1 z-10">
        <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
          Unique Feature
        </Badge>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2 mb-1">
          <div className="p-2 rounded-full bg-yellow-100">
            <Smile className="h-5 w-5 text-yellow-700" />
          </div>
          <CardTitle>Facial Emotion Analysis</CardTitle>
        </div>
        <CardDescription>
          Analyze your facial expressions to improve your interview presence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          <li className="flex items-start gap-2">
            <span className="inline-block w-1 h-1 rounded-full bg-gray-500 mt-2"></span>
            <span>Real-time facial expression analysis using AI</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="inline-block w-1 h-1 rounded-full bg-gray-500 mt-2"></span>
            <span>
              Get feedback on how your expressions appear to interviewers
            </span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          className="w-full"
          onClick={() => navigate("/facial-emotion-analysis")}
        >
          {t("Start")} Facial Analysis
        </Button>
      </CardFooter>
    </Card>
  );

  const startAIInterview = (interviewType: string) => {
    if (!selectedCompany || !selectedRole) {
      toast({
        title: t("Selection required"),
        description: t("Select company and role"),
        variant: "destructive",
      });
      return;
    }

    try {
      // Show popup with chat and video interview options
      const useVideoInterview = window.confirm(
        "Choose Interview Type:\n\nClick 'OK' for Video Interview\nClick 'Chat' for Chat Interview"
      );

      if (useVideoInterview) {
        // Navigate to the AI Interview Simulator (video interview)
        navigate(
          `/ai-interview-simulator?company=${selectedCompany}&role=${selectedRole}&type=${interviewType}`
        );
      } else {
        // Navigate to the simple interview page (chat interview)
        navigate(
          `/interview-simple?company=${selectedCompany}&role=${selectedRole}&type=${interviewType}`
        );
      }
    } catch (error) {
      console.error("Error starting interview:", error);

      // Fallback to chat interview if there's an error
      toast({
        title: "Error Starting Interview",
        description: "Using chat interview as fallback.",
        variant: "destructive",
      });

      navigate(
        `/interview-simple?company=${selectedCompany}&role=${selectedRole}&type=${interviewType}`
      );
    }
  };

  // Modify the InterviewFeedbackReport component to include interview type
  const InterviewFeedbackReport = ({ interview, onClose }) => {
    const { t } = useLanguage();

    // Reference the interview type in the title
    const interviewTitle = interview?.title || t("interview");
    const interviewType = interview?.id || "technical";

    // Customize feedback areas based on interview type
    const getFeedbackAreas = (type) => {
      switch (type) {
        case "technical":
          return [
            {
              area: "algorithmic thinking",
              score: 65,
              status: "needs improvement",
              details:
                "Your technical explanations lacked depth in algorithm complexity analysis and optimization techniques.",
              resources: [
                {
                  name: "Algorithm Design Manual",
                  url: "https://www.algorist.com/",
                },
                {
                  name: "LeetCode Patterns",
                  url: "https://leetcode.com/explore/",
                },
              ],
            },
            {
              area: "code quality",
              score: 72,
              status: "good",
              details:
                "Your code is generally well-structured but could benefit from better error handling and edge case consideration.",
              resources: [
                {
                  name: "Clean Code",
                  url: "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882",
                },
                {
                  name: "Effective Error Handling",
                  url: "https://web.mit.edu/6.031/www/sp21/classes/09-exceptions/",
                },
              ],
            },
            {
              area: "system design knowledge",
              score: 58,
              status: "needs improvement",
              details:
                "You need to strengthen your understanding of distributed systems, scalability patterns, and database optimization.",
              resources: [
                {
                  name: "System Design Primer",
                  url: "https://github.com/donnemartin/system-design-primer",
                },
                {
                  name: "Designing Data-Intensive Applications",
                  url: "https://dataintensive.net/",
                },
              ],
            },
            {
              area: "technical communication",
              score: 85,
              status: "excellent",
              details:
                "You clearly articulate technical concepts, though sometimes jump ahead without explaining foundational elements.",
              resources: [
                {
                  name: "Technical Writing Course",
                  url: "https://developers.google.com/tech-writing",
                },
                {
                  name: "Explaining Complex Ideas",
                  url: "https://www.youtube.com/c/cs50",
                },
              ],
            },
          ];
        case "behavioral":
          return [
            {
              area: "structured responses",
              score: 68,
              status: "needs improvement",
              details:
                "Your answers lack clear structure. Try using the STAR method to organize your responses more effectively.",
              resources: [
                {
                  name: "STAR Method Guide",
                  url: "https://www.themuse.com/advice/star-interview-method",
                },
                {
                  name: "Behavioral Interview Prep",
                  url: "https://www.amazon.com/Cracking-Coding-Interview-Programming-Questions/dp/0984782850",
                },
              ],
            },
            {
              area: "specificity of examples",
              score: 75,
              status: "good",
              details:
                "Your examples are relevant but could be more specific with measurable outcomes and impact.",
              resources: [
                {
                  name: "Quantifying Achievements",
                  url: "https://hbr.org/2016/11/how-to-quantify-your-accomplishments",
                },
                {
                  name: "Impact Storytelling",
                  url: "https://www.coursera.org/learn/storytelling-influencing",
                },
              ],
            },
            {
              area: "leadership demonstration",
              score: 62,
              status: "needs improvement",
              details:
                "Your examples don't sufficiently highlight leadership qualities and initiative.",
              resources: [
                {
                  name: "Leadership Storytelling",
                  url: "https://www.linkedin.com/learning/leadership-storytelling",
                },
                {
                  name: "Executive Presence",
                  url: "https://www.amazon.com/Executive-Presence-Missing-Between-Success/dp/0062246895",
                },
              ],
            },
            {
              area: "adaptability examples",
              score: 88,
              status: "excellent",
              details:
                "You effectively demonstrate adaptability and resilience when facing challenges.",
              resources: [
                {
                  name: "Adaptability in Tech",
                  url: "https://hbr.org/2016/10/adaptability-the-new-competitive-advantage",
                },
                {
                  name: "Change Management",
                  url: "https://www.mindtools.com/pages/article/newPPM_94.htm",
                },
              ],
            },
          ];
        case "system-design":
          return [
            {
              area: "scalability principles",
              score: 60,
              status: "needs improvement",
              details:
                "Your understanding of horizontal and vertical scaling strategies needs improvement.",
              resources: [
                {
                  name: "Scalability Patterns",
                  url: "https://www.amazon.com/Designing-Data-Intensive-Applications-Reliable-Maintainable/dp/1449373321",
                },
                {
                  name: "System Design Fundamentals",
                  url: "https://github.com/donnemartin/system-design-primer#scalability",
                },
              ],
            },
            {
              area: "database design",
              score: 72,
              status: "good",
              details:
                "You have good knowledge of database concepts but need improvement in choosing the right database for specific use cases.",
              resources: [
                {
                  name: "Database Systems",
                  url: "https://www.coursera.org/learn/database-management",
                },
                {
                  name: "NoSQL vs SQL",
                  url: "https://www.mongodb.com/nosql-explained/nosql-vs-sql",
                },
              ],
            },
            {
              area: "api design",
              score: 65,
              status: "needs improvement",
              details:
                "Your API designs need more consideration for security, versioning, and documentation.",
              resources: [
                { name: "RESTful API Design", url: "https://restfulapi.net/" },
                {
                  name: "API Security Best Practices",
                  url: "https://owasp.org/www-project-api-security/",
                },
              ],
            },
            {
              area: "system requirements analysis",
              score: 85,
              status: "excellent",
              details:
                "You excel at gathering and analyzing system requirements from business needs.",
              resources: [
                {
                  name: "Requirements Engineering",
                  url: "https://www.amazon.com/Software-Requirements-Developer-Best-Practices/dp/0735679665",
                },
                {
                  name: "System Analysis",
                  url: "https://www.coursera.org/learn/system-analysis-design",
                },
              ],
            },
          ];
        default:
          return [
            {
              area: "technical knowledge",
              score: 65,
              status: "needs improvement",
              details:
                "Your technical explanations lacked depth in key areas relevant to the role.",
              resources: [
                {
                  name: "Technical Interview Handbook",
                  url: "https://www.techinterviewhandbook.org/",
                },
                {
                  name: "Coding Interview University",
                  url: "https://github.com/jwasham/coding-interview-university",
                },
              ],
            },
            {
              area: "communication skills",
              score: 72,
              status: "good",
              details:
                "You articulated concepts clearly but could improve on explaining your thought process step-by-step.",
              resources: [
                {
                  name: "Technical Communication Course",
                  url: "https://www.coursera.org/learn/technical-communication",
                },
                {
                  name: "Explaining Complex Ideas",
                  url: "https://www.youtube.com/c/cs50",
                },
              ],
            },
            {
              area: "problem solving",
              score: 58,
              status: "needs improvement",
              details:
                "You jumped to solutions too quickly without exploring alternative approaches or edge cases.",
              resources: [
                {
                  name: "Problem Solving Techniques",
                  url: "https://leetcode.com/explore/",
                },
                {
                  name: "Thinking Like an Engineer",
                  url: "https://www.hackerrank.com/domains/tutorials/10-days-of-javascript",
                },
              ],
            },
            {
              area: "interview preparation",
              score: 85,
              status: "excellent",
              details:
                "Your examples were specific and demonstrated impact, though could be more concise.",
              resources: [
                {
                  name: "Interview Preparation Guide",
                  url: "https://www.themuse.com/advice/star-interview-method",
                },
                {
                  name: "Mock Interview Practice",
                  url: "https://www.pramp.com/",
                },
              ],
            },
          ];
      }
    };

    // Get feedback areas based on interview type
    const feedbackAreas = getFeedbackAreas(interviewType);

    // Get status color
    const getStatusColor = (status) => {
      switch (status) {
        case "needs improvement":
          return "text-red-600 bg-red-50";
        case "good":
          return "text-yellow-600 bg-yellow-50";
        case "excellent":
          return "text-green-600 bg-green-50";
        default:
          return "text-gray-600 bg-gray-50";
      }
    };

    // Calculate overall score
    const overallScore = Math.round(
      feedbackAreas.reduce((total, area) => total + area.score, 0) /
        feedbackAreas.length
    );

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                {interviewTitle} {t("Performance report")}
              </CardTitle>
              <CardDescription>
                {t("Detailed analysis and improvement suggestions")}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              {t("Close")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-stretch">
            <Card className="border-none shadow-none bg-slate-50 p-6 rounded-lg w-full md:w-1/3">
              <div className="text-center">
                <h3 className="text-xl font-medium mb-1">
                  {t("Overall performance")}
                </h3>
                <div className="relative w-32 h-32 mx-auto my-4">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 stroke-current"
                      strokeWidth="10"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    />
                    <circle
                      className="text-primary stroke-current"
                      strokeWidth="10"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 40 * (1 - overallScore / 100)
                      }`}
                      strokeLinecap="round"
                      style={{
                        transformOrigin: "center",
                        transform: "rotate(-90deg)",
                      }}
                    />
                    <text
                      x="50"
                      y="50"
                      className="text-3xl font-bold"
                      dominantBaseline="middle"
                      textAnchor="middle"
                    >
                      {overallScore}%
                    </text>
                  </svg>
                </div>
                <p className="text-gray-500">
                  {overallScore >= 80
                    ? t("Excellent performance")
                    : overallScore >= 70
                    ? t("Good performance")
                    : t("Needs improvement")}
                </p>
              </div>
            </Card>

            <div className="w-full md:w-2/3 space-y-4">
              <h3 className="text-xl font-medium">
                {t("Key improvement areas")}
              </h3>
              <div className="space-y-3">
                {feedbackAreas
                  .sort((a, b) => a.score - b.score) // Sort by lowest score first
                  .slice(0, 3) // Take top 3 improvement areas
                  .map((area, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1">
                        <CircleHelp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium capitalize">{area.area}</h4>
                        <p className="text-sm text-gray-600">{area.details}</p>
                      </div>
                    </div>
                  ))}
              </div>

              <h3 className="text-xl font-medium mt-6">
                {t("Recommended next steps")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {t("Review detailed feedback")}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t("Analyze each area below")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {t("Practice targeted exercises")}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t("Focus on lowest scoring areas")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {t("Use recommended resources")}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t("Explore learning links below")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-medium mb-4">
              {t("Detailed performance breakdown")}
            </h3>
            <div className="space-y-6">
              {feedbackAreas.map((area, index) => (
                <Card key={index} className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-medium capitalize">
                        {area.area}
                      </h4>
                      <Badge
                        className={`${getStatusColor(area.status)} border-none`}
                      >
                        {area.score}% - {area.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 mb-3">{area.details}</p>

                    <div className="mt-4">
                      <h5 className="text-sm font-medium flex items-center gap-1 mb-2">
                        <ArrowDown className="h-3 w-3" />
                        {t("Improvement resources")}
                      </h5>
                      <div className="space-y-2">
                        {area.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {resource.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              {t("Continue your improvement")}
            </h3>
            <p className="text-blue-700 mb-3">{t("Schedule follow up")}</p>
            <Button variant="outline" className="bg-white">
              {t("Schedule practice session")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Add a toggle state for showing the report
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("Interview prep")}
          </h1>
          <p className="text-gray-500 mt-1">{t("Practice interview desc")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("Customize interview")}</CardTitle>
            <CardDescription>{t("Customize interview desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="company" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="company">{t("Target company")}</TabsTrigger>
                <TabsTrigger value="role">{t("Job role")}</TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="mt-4">
                <CompanySelector
                  companies={companies}
                  selectedCompany={selectedCompany}
                  setSelectedCompany={setSelectedCompany}
                />
              </TabsContent>

              <TabsContent value="role" className="mt-4">
                <RoleSelector
                  roles={roles}
                  selectedRole={selectedRole}
                  setSelectedRole={setSelectedRole}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-3">
                {t("Selected options")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedCompany && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {companies.find((c) => c.id === selectedCompany)?.name}
                  </Badge>
                )}
                {selectedRole && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {roles.find((r) => r.id === selectedRole)?.name}
                  </Badge>
                )}
                {!selectedCompany && !selectedRole && (
                  <p className="text-sm text-gray-500">
                    {t("No options selected")}
                  </p>
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
                    <div
                      className={`p-2 rounded-full ${type.color.split(" ")[0]}`}
                    >
                      <Icon className={`h-5 w-5 ${type.color.split(" ")[1]}`} />
                    </div>
                    <CardTitle>{type.title}</CardTitle>
                  </div>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="inline-block w-1 h-1 rounded-full bg-gray-500 mt-2"></span>
                      <span>{t(`${type.id}_feature_1`)}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-block w-1 h-1 rounded-full bg-gray-500 mt-2"></span>
                      <span>{t(`${type.id}_feature_2`)}</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-0">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setCurrentInterview(type);
                      setShowDetailedReport(true);
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    {t("View report")}
                  </Button>
                  <Button
                    className={`${type.color} hover:opacity-90`}
                    onClick={() => startAIInterview(type.id)}
                  >
                    {t("Start")} {type.title}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          {/* Add Facial Emotion Analysis card */}
          {renderFacialAnalysis()}
        </div>
      </div>

      {showDetailedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <InterviewFeedbackReport
            interview={currentInterview}
            onClose={() => setShowDetailedReport(false)}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default InterviewPrep;
