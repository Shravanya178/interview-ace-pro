import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Camera, Download, BarChart, Smile, Frown, Meh, Table, Video, RefreshCw, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import EmotionDetector from '@/components/interview/EmotionDetector';
import EmotionReport from '@/components/interview/EmotionReport';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Emotion colors for consistency
const EMOTION_COLORS = {
  angry: 'bg-red-500',
  disgust: 'bg-purple-600',
  fear: 'bg-orange-400',
  happy: 'bg-green-500',
  sad: 'bg-blue-500',
  surprise: 'bg-yellow-400',
  neutral: 'bg-gray-400'
};

const FacialEmotionAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [emotionData, setEmotionData] = useState<{ [key: string]: number }>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('live');
  const [isLoading, setIsLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [useFallbackCamera, setUseFallbackCamera] = useState(false);
  
  // Handle emotion data updates from the detector
  const handleEmotionCapture = useCallback((emotions: { [key: string]: number }) => {
    if (isRecording) {
      setEmotionData(prevEmotions => {
        const newEmotions = { ...prevEmotions };
        
        // If no previous data, just use the new data
        if (Object.keys(newEmotions).length === 0) {
          return emotions;
        }
        
        // Otherwise, calculate a weighted average (90% old, 10% new)
        Object.keys(emotions).forEach(emotion => {
          const prevValue = prevEmotions[emotion] || 0;
          newEmotions[emotion] = prevValue * 0.9 + emotions[emotion] * 0.1;
        });
        
        return newEmotions;
      });
    }
  }, [isRecording]);
  
  // Start or stop recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);
      
      // Check if we have data
      if (Object.keys(emotionData).length === 0) {
        toast({
          title: "No emotion data recorded",
          description: "Try recording again to capture your facial expressions.",
          variant: "destructive",
        });
      } else {
        // Switch to the report tab
        setActiveTab('report');
        toast({
          title: "Recording complete",
          description: `Analyzed your expressions for ${recordingTime} seconds.`,
        });
      }
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingTime(0);
      setEmotionData({});
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording started",
        description: "Your facial expressions are now being analyzed.",
      });
    }
  }, [isRecording, recordingTime, emotionData, toast]);
  
  // Generate PDF report
  const generatePDF = useCallback(async () => {
    if (!reportRef.current) return;
    
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait...",
      });
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('facial-emotion-report.pdf');
      
      toast({
        title: "PDF Generated",
        description: "Your facial emotion report has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report.",
        variant: "destructive",
      });
    }
  }, [toast]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Cleanup on unmount
  useEffect(() => {
    setIsLoading(false);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Callback for fallback camera setup
  const setupFallbackVideo = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false
          });
          node.srcObject = stream;
        } catch (err) {
          console.error("Fallback camera error:", err);
        }
      })();
    }
  }, []);
  
  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/interview")}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Interview
            </Button>
            <h1 className="text-2xl font-bold">Facial Emotion Analysis</h1>
          </div>
          
          <div>
            {activeTab === 'report' && (
              <Button onClick={generatePDF} variant="outline" className="ml-2">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            )}
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Facial Expression Analyzer</CardTitle>
            <CardDescription>
              Analyze your facial expressions in real-time to improve your interview presence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="live" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="live" disabled={isRecording}>
                  <Camera className="mr-2 h-4 w-4" />
                  Live Analysis
                </TabsTrigger>
                <TabsTrigger value="report" disabled={isRecording || Object.keys(emotionData).length === 0}>
                  <BarChart className="mr-2 h-4 w-4" />
                  Report
                </TabsTrigger>
                <TabsTrigger value="tips" disabled={isRecording}>
                  <Smile className="mr-2 h-4 w-4" />
                  Tips & Tricks
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="live" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="bg-gray-100 p-4 rounded-lg mb-4">
                      <h3 className="text-lg font-medium mb-2">How It Works</h3>
                      <p className="text-sm text-gray-700 mb-4">
                        This tool analyzes your facial expressions in real-time using machine learning. Simply start recording, practice your interview responses, and get feedback on how you appear to interviewers.
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mb-2">
                            1
                          </div>
                          <span className="text-xs text-center">Start Recording</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mb-2">
                            2
                          </div>
                          <span className="text-xs text-center">Practice Responses</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mb-2">
                            3
                          </div>
                          <span className="text-xs text-center">Get Analysis</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={toggleRecording}
                      variant={isRecording ? "destructive" : "default"}
                      className="w-full mb-4"
                    >
                      {isRecording ? (
                        <>
                          <Video className="mr-2 h-4 w-4" />
                          Stop Recording ({formatTime(recordingTime)})
                        </>
                      ) : (
                        <>
                          <Video className="mr-2 h-4 w-4" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    
                    {isRecording && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                        <p className="text-sm text-amber-800">
                          <strong>Recording in progress</strong>: Act naturally as if you're in an interview. Try answering some common interview questions to see how your expressions change.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <EmotionDetector
                      width={480}
                      height={360}
                      onEmotionCapture={handleEmotionCapture}
                      isActive={true}
                    />
                    
                    <div className="mt-4 bg-yellow-50 p-3 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800 mb-2">
                        <strong>Not seeing your camera?</strong> Try the simple webcam view instead.
                      </p>
                      <button
                        onClick={() => setUseFallbackCamera(prev => !prev)}
                        className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded"
                      >
                        {useFallbackCamera ? "Switch back to emotion detector" : "Use simple webcam"}
                      </button>
                      
                      {useFallbackCamera && (
                        <div className="mt-4 relative bg-black rounded-md overflow-hidden" style={{ minHeight: '240px' }}>
                          <video
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-auto"
                            style={{ minHeight: '240px' }}
                            ref={setupFallbackVideo}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="report" className="mt-0">
                {Object.keys(emotionData).length > 0 ? (
                  <div ref={reportRef} className="bg-white p-4">
                    <h2 className="text-xl font-bold mb-4">Your Facial Expression Report</h2>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <EmotionReport 
                        emotionData={emotionData}
                        title="Facial Expression Analysis"
                      />
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">What This Means For Your Interview</h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Your facial expressions convey your confidence, enthusiasm, and interest level to interviewers. 
                        Research shows that candidates who display appropriate emotional expressions are more likely to be 
                        perceived positively. Use this report to identify if you appear too nervous, disinterested, or 
                        overly emotional during interviews.
                      </p>
                      
                      <div className="mt-4 flex gap-4">
                        <Button 
                          onClick={() => {
                            setActiveTab('live');
                            setEmotionData({});
                          }}
                          variant="outline"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Try Again
                        </Button>
                        
                        <Button onClick={generatePDF}>
                          <Download className="mr-2 h-4 w-4" />
                          Download Report
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Meh className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Data Available</h3>
                    <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                      You haven't recorded any facial expressions yet. Go to the Live Analysis tab and start a recording to generate a report.
                    </p>
                    <Button onClick={() => setActiveTab('live')} variant="default">
                      Go to Live Analysis
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tips" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Do's for Facial Expressions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <div className="bg-green-500 rounded-full p-1 mr-2 mt-0.5">
                            <Smile className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Smile naturally when introducing yourself</span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-green-500 rounded-full p-1 mr-2 mt-0.5">
                            <Smile className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Maintain a neutral, attentive expression while listening</span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-green-500 rounded-full p-1 mr-2 mt-0.5">
                            <Smile className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Show appropriate enthusiasm when discussing achievements</span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-green-500 rounded-full p-1 mr-2 mt-0.5">
                            <Smile className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Express thoughtfulness when addressing complex questions</span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-green-500 rounded-full p-1 mr-2 mt-0.5">
                            <Smile className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Practice a confident, pleasant resting expression</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Don'ts for Facial Expressions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <div className="bg-red-500 rounded-full p-1 mr-2 mt-0.5">
                            <Frown className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Avoid excessive frowning or appearing confused</span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-red-500 rounded-full p-1 mr-2 mt-0.5">
                            <Frown className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Don't let nervousness show through constant worried looks</span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-red-500 rounded-full p-1 mr-2 mt-0.5">
                            <Frown className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Avoid appearing bored or disinterested</span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-red-500 rounded-full p-1 mr-2 mt-0.5">
                            <Frown className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Don't show frustration when asked challenging questions</span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-red-500 rounded-full p-1 mr-2 mt-0.5">
                            <Frown className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Avoid overly forced or fake smiles</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Practice Exercises</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-4">
                        Here are some exercises to improve your facial expressions for interviews:
                      </p>
                      
                      <div className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-md">
                          <h4 className="font-medium text-sm mb-1">Mirror Practice</h4>
                          <p className="text-sm text-gray-700">
                            Spend 5 minutes a day practicing your expressions in the mirror. Cycle through neutral, friendly, attentive, and thoughtful expressions.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-md">
                          <h4 className="font-medium text-sm mb-1">Video Response</h4>
                          <p className="text-sm text-gray-700">
                            Record yourself answering common interview questions. Watch the recording with the sound off to focus on your expressions.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-md">
                          <h4 className="font-medium text-sm mb-1">Mock Interview</h4>
                          <p className="text-sm text-gray-700">
                            Ask a friend to conduct a mock interview and give feedback specifically on your facial expressions and body language.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => navigate("/ai-interview-simulator")} variant="outline" className="w-full">
                        Try AI Interview Simulator
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FacialEmotionAnalysis; 