
import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/components/ui/use-toast';

// Note: Jitsi Meet External API will be loaded dynamically
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const InterviewSession = () => {
  const apiRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  const roomName = searchParams.get('room') || 'interview-default';
  const interviewType = searchParams.get('type') || 'mock';
  const company = searchParams.get('company') || '';
  const role = searchParams.get('role') || '';

  useEffect(() => {
    // Initialize Jitsi when component mounts
    const initJitsi = () => {
      if (
        containerRef.current && 
        typeof window.JitsiMeetExternalAPI !== 'undefined' && 
        !apiRef.current
      ) {
        // Set up config for Jitsi Meet
        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: containerRef.current,
          lang: 'en',
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            APP_NAME: 'Interview Ace Pro',
            NATIVE_APP_NAME: 'Interview Ace Pro',
            PROVIDER_NAME: 'Interview Ace Pro',
          },
          userInfo: {
            displayName: 'Candidate',
          },
        };
        
        try {
          // Create the Jitsi Meet external API instance
          apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
          
          // Event listeners
          apiRef.current.addEventListeners({
            readyToClose: handleClose,
            videoConferenceJoined: handleJoined,
          });
        } catch (error) {
          console.error('Failed to initialize Jitsi:', error);
          toast({
            title: t('error'),
            description: t('failed_to_initialize_interview'),
            variant: "destructive",
          });
        }
      }
    };
    
    // Check if the API is already loaded
    if (typeof window.JitsiMeetExternalAPI !== 'undefined') {
      initJitsi();
    } else {
      // Load the Jitsi Meet External API script if not already loaded
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = initJitsi;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
    
    // Cleanup on unmount
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [roomName, toast, t]);

  const handleJoined = () => {
    console.log('Joined the interview room');
    // Could integrate with an API to start recording or saving interview data
  };

  const handleClose = () => {
    if (apiRef.current) {
      apiRef.current.dispose();
    }
    navigate('/interview');
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-primary text-white py-2 px-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white hover:bg-primary/80" 
          onClick={() => navigate('/interview')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="ml-4">
          <h1 className="font-semibold">{t('interview_session')}</h1>
          <p className="text-sm opacity-80">
            {company && role ? 
              `${t('interview_for')} ${company} - ${role}` : 
              t('mock_interview')
            }
          </p>
        </div>
      </header>
      
      <div className="flex-1 relative">
        {/* Jitsi container */}
        <div 
          ref={containerRef} 
          className="absolute inset-0 bg-gray-100"
        >
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-2 text-lg text-gray-500">{t('loading_interview')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
