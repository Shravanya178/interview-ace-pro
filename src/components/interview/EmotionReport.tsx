import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Frown, Meh, AlertTriangle, Heart, ThumbsUp, ThumbsDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Emotion labels in order of preference for reporting
const EMOTIONS = ['happy', 'neutral', 'surprise', 'sad', 'fear', 'disgust', 'angry'];

// Custom emotion colors
const EMOTION_COLORS = {
  angry: 'text-red-500',
  disgust: 'text-purple-600',
  fear: 'text-orange-400',
  happy: 'text-green-500',
  sad: 'text-blue-500',
  surprise: 'text-yellow-500',
  neutral: 'text-gray-500'
};

// Progress colors
const EMOTION_PROGRESS_COLORS = {
  angry: 'bg-red-500',
  disgust: 'bg-purple-600',
  fear: 'bg-orange-400',
  happy: 'bg-green-500',
  sad: 'bg-blue-500',
  surprise: 'bg-yellow-400',
  neutral: 'bg-gray-400'
};

// Emotion icons
const EMOTION_ICONS: Record<string, React.ReactNode> = {
  happy: <Smile className="h-5 w-5 text-green-500" />,
  sad: <Frown className="h-5 w-5 text-blue-500" />,
  angry: <ThumbsDown className="h-5 w-5 text-red-500" />,
  fear: <AlertTriangle className="h-5 w-5 text-orange-400" />,
  disgust: <ThumbsDown className="h-5 w-5 text-purple-600" />,
  surprise: <Heart className="h-5 w-5 text-yellow-500" />,
  neutral: <Meh className="h-5 w-5 text-gray-500" />
};

interface EmotionReportProps {
  emotionData: Record<string, number>;
  className?: string;
  title?: string;
}

const EmotionReport: React.FC<EmotionReportProps> = ({ 
  emotionData, 
  className = "",
  title = "Emotion Analysis" 
}) => {
  // Get dominant emotion
  const dominantEmotion = Object.entries(emotionData)
    .sort(([, a], [, b]) => b - a)[0] || ['none', 0];
    
  // Get feedback based on dominant emotion
  const getFeedback = () => {
    const [emotion, value] = dominantEmotion;
    
    if (value < 0.15) {
      return "Your expressions were quite balanced throughout the interview.";
    }
    
    switch (emotion) {
      case 'happy':
        return "You appeared confident and positive during the interview, which is excellent!";
      case 'neutral':
        return "You maintained a professional, composed demeanor throughout the interview.";
      case 'surprise':
        return "You showed engagement and interest in the interview questions.";
      case 'sad':
        return "You may have appeared somewhat downcast. Try to maintain more positive expressions.";
      case 'fear':
        return "You showed signs of nervousness. Practice more to build confidence.";
      case 'disgust':
        return "Some of your expressions appeared negative. Work on maintaining a neutral or positive demeanor.";
      case 'angry':
        return "You displayed tension at times. Try relaxation techniques before interviews.";
      default:
        return "No clear emotional pattern was detected.";
    }
  };
  
  // Get actionable tips based on dominant emotion
  const getTips = () => {
    const [emotion] = dominantEmotion;
    
    switch (emotion) {
      case 'happy':
        return "Continue with your positive attitude while ensuring you also convey professionalism.";
      case 'neutral':
        return "While maintaining composure is good, try adding some genuine smiles to build rapport.";
      case 'surprise':
        return "Your expressiveness is good, but ensure it appears natural and not exaggerated.";
      case 'sad':
        return "Practice smiling more during interviews. Try power posing before interviews to boost confidence.";
      case 'fear':
        return "Try deep breathing exercises before interviews. Preparation and practice will help reduce anxiety.";
      case 'disgust':
        return "Be mindful of your facial expressions. Practice in front of a mirror or with interview recordings.";
      case 'angry':
        return "Work on stress management techniques. Try to reframe challenging questions as opportunities.";
      default:
        return "Continue practicing interview scenarios to develop a balanced emotional presence.";
    }
  };
  
  // Sort emotions by value
  const sortedEmotions = Object.entries(emotionData)
    .sort(([, a], [, b]) => b - a);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Dominant emotion display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {EMOTION_ICONS[dominantEmotion[0]] || <Meh className="h-5 w-5" />}
              <h3 className="font-medium">Dominant Expression: <span className={EMOTION_COLORS[dominantEmotion[0] as keyof typeof EMOTION_COLORS] || ""}>
                {dominantEmotion[0].charAt(0).toUpperCase() + dominantEmotion[0].slice(1)}
              </span></h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">{getFeedback()}</p>
            <div className="text-sm font-medium bg-blue-50 p-3 rounded border-l-4 border-blue-500">
              <h4 className="text-blue-700 mb-1">Improvement Tip:</h4>
              <p className="text-gray-700">{getTips()}</p>
            </div>
          </div>
          
          {/* Emotion breakdown */}
          <div>
            <h3 className="font-medium mb-3">Emotion Breakdown</h3>
            <div className="space-y-4">
              {sortedEmotions.map(([emotion, value]) => (
                <div key={emotion} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {EMOTION_ICONS[emotion] || <Meh className="h-4 w-4" />}
                      <span className="text-sm capitalize">{emotion}</span>
                    </div>
                    <span className="text-sm font-medium">{(value * 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={value * 100} 
                    className="h-2" 
                    indicatorClassName={EMOTION_PROGRESS_COLORS[emotion as keyof typeof EMOTION_PROGRESS_COLORS]} 
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* General interview advice */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">General Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Maintain eye contact with the interviewer</li>
              <li>Practice natural smiling to build rapport</li>
              <li>Avoid excessive hand gestures or fidgeting</li>
              <li>Take a moment to collect your thoughts before answering difficult questions</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionReport; 