
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, ExternalLink, BookOpen, Video, FileText } from 'lucide-react';
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useLanguage } from '@/hooks/useLanguage';

const Reports = () => {
  const { t } = useLanguage();
  
  const progressData = [
    { date: '2023-04-01', technical: 60, behavioral: 65 },
    { date: '2023-04-15', technical: 65, behavioral: 68 },
    { date: '2023-05-01', technical: 70, behavioral: 72 },
    { date: '2023-05-15', technical: 75, behavioral: 70 },
  ];

  const learningResources = [
    {
      category: 'Data Structures & Algorithms',
      priority: 'High',
      resources: [
        { 
          title: 'Introduction to Algorithms', 
          type: 'Book',
          author: 'Thomas H. Cormen',
          link: 'https://www.amazon.com/Introduction-Algorithms-3rd-MIT-Press/dp/0262033844',
          icon: BookOpen
        },
        { 
          title: 'AlgoExpert - Algorithm Interview Preparation',
          type: 'Course',
          author: 'Clement Mihailescu',
          link: 'https://www.algoexpert.io/',
          icon: Video
        },
        { 
          title: 'Grokking Algorithms',
          type: 'Book',
          author: 'Aditya Bhargava',
          link: 'https://www.manning.com/books/grokking-algorithms',
          icon: BookOpen
        },
      ]
    },
    {
      category: 'System Design',
      priority: 'Medium',
      resources: [
        { 
          title: 'System Design Interview', 
          type: 'Book',
          author: 'Alex Xu',
          link: 'https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF',
          icon: BookOpen
        },
        { 
          title: 'Grokking the System Design Interview',
          type: 'Course',
          author: 'Educative',
          link: 'https://www.educative.io/courses/grokking-the-system-design-interview',
          icon: Video
        },
      ]
    },
    {
      category: 'Behavioral Interviews',
      priority: 'Low',
      resources: [
        { 
          title: 'Cracking the Coding Interview', 
          type: 'Book',
          author: 'Gayle Laakmann McDowell',
          link: 'https://www.amazon.com/Cracking-Coding-Interview-Programming-Questions/dp/0984782850',
          icon: BookOpen
        },
        { 
          title: 'STAR Method - Complete Guide',
          type: 'Article',
          author: 'Indeed Career Guide',
          link: 'https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique',
          icon: FileText
        },
      ]
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-600';
      case 'Medium':
        return 'bg-amber-100 text-amber-600';
      case 'Low':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const iconForType = (type: string, Icon: any) => {
    return (
      <Icon className="h-4 w-4 mr-2 text-secondary" />
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('performance_reports')}</h1>
          <p className="text-gray-500 mt-1">{t('track_progress')}</p>
        </div>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="progress">{t('progress')}</TabsTrigger>
            <TabsTrigger value="recommendations">{t('recommendations')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('progress_over_time')}</CardTitle>
                <CardDescription>
                  {t('interview_skills_progress')}
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
                        name={t('technical_skills')} 
                        stroke="hsl(var(--secondary))" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="behavioral" 
                        name={t('behavioral_skills')} 
                        stroke="#8884d8" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  {t('download_full_report')}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('learning_resources')}</CardTitle>
                <CardDescription>
                  {t('recommended_resources')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {learningResources.map((category, index) => (
                    <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex justify-between mb-4">
                        <h3 className="font-medium text-lg">{category.category}</h3>
                        <span className={`text-sm px-2 py-1 rounded ${priorityColor(category.priority)}`}>
                          {category.priority} {t('priority')}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        {category.resources.map((resource, idx) => {
                          const ResourceIcon = resource.icon;
                          return (
                            <div key={idx} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex items-start">
                                  <div className="mt-0.5">
                                    {ResourceIcon && <ResourceIcon className="h-5 w-5 text-secondary" />}
                                  </div>
                                  <div className="ml-3">
                                    <h4 className="font-medium text-gray-900">{resource.title}</h4>
                                    <p className="text-sm text-gray-500">
                                      {resource.type} • {resource.author}
                                    </p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <a href={resource.link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    {t('view')}
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
