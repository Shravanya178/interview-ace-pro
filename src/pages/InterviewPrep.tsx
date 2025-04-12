
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Code, MessageSquare, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CompanySelector from '@/components/interview/CompanySelector';
import RoleSelector from '@/components/interview/RoleSelector';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/components/ui/use-toast';

const InterviewPrep = () => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { t } = useLanguage();
  const { toast } = useToast();
  const [jitsiApiLoaded, setJitsiApiLoaded] = useState(false);
  
  // Extended company and role lists
  const companies = [
    { id: 'google', name: 'Google' },
    { id: 'amazon', name: 'Amazon' },
    { id: 'microsoft', name: 'Microsoft' },
    { id: 'apple', name: 'Apple' },
    { id: 'meta', name: 'Meta' },
    { id: 'netflix', name: 'Netflix' },
    { id: 'uber', name: 'Uber' },
    { id: 'airbnb', name: 'Airbnb' },
    { id: 'twitter', name: 'Twitter' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'salesforce', name: 'Salesforce' },
    { id: 'ibm', name: 'IBM' },
    { id: 'oracle', name: 'Oracle' },
    { id: 'adobe', name: 'Adobe' },
    { id: 'intel', name: 'Intel' },
    { id: 'nvidia', name: 'NVIDIA' },
    { id: 'tesla', name: 'Tesla' },
    { id: 'walmart', name: 'Walmart' },
    { id: 'jpmorgan', name: 'JPMorgan Chase' },
    { id: 'goldman', name: 'Goldman Sachs' },
  ];
  
  const roles = [
    { id: 'frontend', name: 'Frontend Developer' },
    { id: 'backend', name: 'Backend Developer' },
    { id: 'fullstack', name: 'Full Stack Developer' },
    { id: 'data-scientist', name: 'Data Scientist' },
    { id: 'devops', name: 'DevOps Engineer' },
    { id: 'mobile', name: 'Mobile Developer' },
    { id: 'ui-ux', name: 'UI/UX Designer' },
    { id: 'product-manager', name: 'Product Manager' },
    { id: 'data-engineer', name: 'Data Engineer' },
    { id: 'ml-engineer', name: 'Machine Learning Engineer' },
    { id: 'qa', name: 'QA Engineer' },
    { id: 'sre', name: 'Site Reliability Engineer' },
    { id: 'security', name: 'Security Engineer' },
    { id: 'cloud', name: 'Cloud Architect' },
    { id: 'embedded', name: 'Embedded Systems Engineer' },
    { id: 'blockchain', name: 'Blockchain Developer' },
    { id: 'ar-vr', name: 'AR/VR Developer' },
    { id: 'game', name: 'Game Developer' },
    { id: 'technical-writer', name: 'Technical Writer' },
    { id: 'project-manager', name: 'Project Manager' },
  ];
  
  const interviewTypes = [
    {
      id: 'technical',
      title: t('technical_interview'),
      description: t('technical_interview_desc'),
      icon: Code,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'behavioral',
      title: t('behavioral_interview'),
      description: t('behavioral_interview_desc'),
      icon: MessageSquare,
      color: 'bg-green-100 text-green-700',
    },
    {
      id: 'system-design',
      title: t('system_design'),
      description: t('system_design_desc'),
      icon: BookOpen,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'mock',
      title: t('full_mock_interview'),
      description: t('full_mock_interview_desc'),
      icon: Video,
      color: 'bg-orange-100 text-orange-700',
    },
  ];

  // Load Jitsi API script
  useEffect(() => {
    if (!jitsiApiLoaded) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => setJitsiApiLoaded(true);
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [jitsiApiLoaded]);

  const startJitsiMeeting = (interviewType: string) => {
    if (!selectedCompany || !selectedRole) {
      toast({
        title: t('selection_required'),
        description: t('select_company_and_role'),
        variant: "destructive",
      });
      return;
    }

    if (typeof window.JitsiMeetExternalAPI !== 'undefined') {
      // Create unique room name based on selections
      const roomName = `interview-${selectedCompany}-${selectedRole}-${interviewType}-${Date.now()}`;
      
      // Redirect to interview page with parameters
      window.location.href = `/interview-session?room=${roomName}&type=${interviewType}&company=${selectedCompany}&role=${selectedRole}`;
    } else {
      toast({
        title: t('loading_error'),
        description: t('jitsi_api_loading_error'),
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('interview_prep')}</h1>
          <p className="text-gray-500 mt-1">{t('practice_interview_desc')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('customize_interview')}</CardTitle>
            <CardDescription>{t('customize_interview_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="company" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="company">{t('target_company')}</TabsTrigger>
                <TabsTrigger value="role">{t('job_role')}</TabsTrigger>
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
              <h3 className="font-medium text-gray-800 mb-3">{t('selected_options')}</h3>
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
                  <p className="text-sm text-gray-500">{t('no_options_selected')}</p>
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
                        {t(`${type.id}_feature_1`)}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-block w-1 h-1 rounded-full bg-gray-500 mt-2"></span>
                      <span>
                        {t(`${type.id}_feature_2`)}
                      </span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => startJitsiMeeting(type.id)}
                    disabled={!jitsiApiLoaded}
                  >
                    {t('start')} {type.title}
                  </Button>
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
