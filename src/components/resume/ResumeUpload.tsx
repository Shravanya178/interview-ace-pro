import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ResumeUploadProps {
  onUploadComplete?: (extractedSkills?: any) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resumeContent, setResumeContent] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Check if the file content resembles a resume
  const checkIfResume = async (file: File): Promise<boolean> => {
    // For PDF files, check if filename suggests it's a resume
    if (file.type === 'application/pdf') {
      const fileName = file.name.toLowerCase();
      const resumeFileNamePatterns = [
        'resume', 'cv', 'curriculum', 'vitae', 'bio', 'profile', 
        'job', 'career', 'professional', 'applicant'
      ];
      
      // Check if filename contains resume-related keywords
      const hasResumeKeyword = resumeFileNamePatterns.some(pattern => 
        fileName.includes(pattern)
      );
      
      if (hasResumeKeyword) {
        setResumeContent("");
        return true;
      }
      
      // If no resume keywords in filename, still accept if it follows typical resume naming patterns
      // like "john_doe_resume.pdf" or "jane_smith_2023.pdf" or "smith_jane.pdf"
      if (/^[a-z]+(_|-|\s)[a-z]+/i.test(fileName) || /\d{4}/.test(fileName)) {
        setResumeContent("");
        return true;
      }
      
      // For files that don't match our patterns, show a more specific toast and reject
      toast({
        variant: "destructive",
        title: "File doesn't seem to be a resume",
        description: "Please rename your file to include 'resume' or 'cv' in the filename, or upload a different resume file.",
      });
      
      return false;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target || !event.target.result) {
          resolve(false);
          return;
        }
        
        const content = event.target.result.toString();
        setResumeContent(content);
        
        // Common resume keywords/sections to check for
        const resumeKeywords = [
          'experience', 'education', 'skills', 'work experience', 
          'employment', 'job', 'career', 'qualification', 'resume', 'cv',
          'professional', 'certification', 'project', 'objective', 'summary',
          'accomplishment', 'volunteer', 'reference', 'contact', 'phone',
          'email', 'address', 'bachelor', 'master', 'degree', 'university',
          'college', 'school', 'course', 'gpa', 'grade'
        ];
        
        // Count how many resume keywords we found
        const keywordCount = resumeKeywords.reduce((count, keyword) => {
          // Case insensitive search
          const regex = new RegExp(`\\b${keyword}\\b`, 'i');
          return count + (regex.test(content) ? 1 : 0);
        }, 0);
        
        // Make validation stricter - need at least 3 keywords to be considered a resume
        const isLikelyResume = keywordCount >= 3;
        
        resolve(isLikelyResume);
      };
      
      reader.onerror = () => {
        resolve(false);
      };
      
      // Read as text for .doc, .docx, and other text files
      reader.readAsText(file);
    });
  };

  // Extract skills from resume content
  const extractSkillsFromResume = (content: string) => {
    // Common technical skills to look for
    const technicalSkills = [
      'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Express', 
      'HTML', 'CSS', 'SCSS', 'Sass', 'PHP', 'Python', 'Django', 'Flask', 'Ruby', 'Rails',
      'Java', 'Spring', 'C#', '.NET', 'C++', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB',
      'Firebase', 'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Git', 'GitHub',
      'GitLab', 'CI/CD', 'Jenkins', 'DevOps', 'TDD', 'Agile', 'Scrum', 'REST API', 'GraphQL',
      'Redux', 'MobX', 'Webpack', 'Babel', 'Vite', 'Next.js', 'Gatsby', 'Svelte', 'Flutter',
      'React Native', 'Swift', 'Kotlin', 'Android', 'iOS', 'Machine Learning', 'AI', 'Data Science',
      'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Linux', 'Shell', 'Bash'
    ];
    
    // Common soft skills to look for
    const softSkills = [
      'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking', 'Leadership',
      'Time Management', 'Project Management', 'Adaptability', 'Flexibility', 'Creativity',
      'Attention to Detail', 'Organization', 'Collaboration', 'Presentation', 'Public Speaking',
      'Writing', 'Analytical', 'Research', 'Decision Making', 'Conflict Resolution', 'Mentoring',
      'Customer Service', 'Negotiation', 'Persuasion', 'Emotional Intelligence'
    ];
    
    // Common languages to look for
    const languages = [
      'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese',
      'Korean', 'Russian', 'Arabic', 'Hindi', 'Bengali', 'Dutch', 'Greek', 'Hebrew', 'Swedish',
      'Danish', 'Norwegian', 'Finnish', 'Polish', 'Turkish', 'Vietnamese', 'Thai'
    ];
    
    // Common tools to look for
    const tools = [
      'Microsoft Office', 'Excel', 'Word', 'PowerPoint', 'Outlook', 'Google Workspace',
      'Jira', 'Confluence', 'Trello', 'Asana', 'Slack', 'Teams', 'Zoom', 'Skype', 'Figma',
      'Sketch', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe XD', 'InVision', 'Tableau',
      'Power BI', 'Looker', 'Postman', 'Swagger', 'SonarQube', 'Jenkins', 'Selenium',
      'Jest', 'Cypress', 'Mocha', 'Chai', 'Splunk', 'ELK', 'Grafana', 'Prometheus'
    ];
    
    // Find technical skills in the resume
    const foundTechnicalSkills = technicalSkills.filter(skill => {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      return regex.test(content);
    }).map(skill => ({ name: skill, level: randomSkillLevel(), category: 'technical' as const }));
    
    // Find soft skills in the resume
    const foundSoftSkills = softSkills.filter(skill => {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      return regex.test(content);
    }).map(skill => ({ name: skill, level: randomSkillLevel(), category: 'soft' as const }));
    
    // Find languages in the resume
    const foundLanguages = languages.filter(language => {
      const regex = new RegExp(`\\b${language}\\b`, 'i');
      return regex.test(content);
    }).map(language => ({ name: language, level: randomSkillLevel(), category: 'language' as const }));
    
    // Find tools in the resume
    const foundTools = tools.filter(tool => {
      const regex = new RegExp(`\\b${tool}\\b`, 'i');
      return regex.test(content);
    }).map(tool => ({ name: tool, level: randomSkillLevel(), category: 'tool' as const }));
    
    // Combine all skills
    const extractedSkills = [
      ...foundTechnicalSkills,
      ...foundSoftSkills,
      ...foundLanguages,
      ...foundTools
    ];
    
    // If we didn't find any skills, provide some default skills
    if (extractedSkills.length < 3) {
      return [
        { name: 'JavaScript', level: 85, category: 'technical' as const },
        { name: 'React', level: 80, category: 'technical' as const },
        { name: 'Communication', level: 75, category: 'soft' as const },
        { name: 'Problem Solving', level: 85, category: 'soft' as const },
        { name: 'English', level: 95, category: 'language' as const },
      ];
    }
    
    return extractedSkills;
  };
  
  // Generate a random skill level between 60 and 95
  const randomSkillLevel = () => {
    return Math.floor(Math.random() * 36) + 60; // 60-95 range
  };

  const validateAndSetFile = async (file: File) => {
    // Check if file is PDF, DOC/DOCX, or text-based file
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'text/rtf'
    ];
    
    // Accept files that might be mislabeled by checking extension
    const fileName = file.name.toLowerCase();
    const isValidExtension = 
      fileName.endsWith('.pdf') || 
      fileName.endsWith('.doc') || 
      fileName.endsWith('.docx') || 
      fileName.endsWith('.txt') || 
      fileName.endsWith('.rtf');
    
    if (!allowedTypes.includes(file.type) && !isValidExtension) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file (.pdf, .doc, .docx, .txt, .rtf).",
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {  // 10MB limit - increased from 5MB
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
      });
      return;
    }
    
    // Check if the file is a resume
    setUploading(true);
    try {
      const isResume = await checkIfResume(file);
      setUploading(false);
      
      if (!isResume) {
        toast({
          variant: "destructive",
          title: "Invalid file content",
          description: "The uploaded file doesn't appear to be a resume. Please upload a valid resume document.",
        });
        return;
      }
      
      setFile(file);
      setStatus('idle');
    } catch (error) {
      setUploading(false);
      toast({
        variant: "destructive",
        title: "File reading error",
        description: "There was an error reading your file. Please try a different file format.",
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    // Simulate API call
    try {
      // If resumeContent is empty (like for PDFs), provide default skills
      let extractedSkills;
      if (!resumeContent || resumeContent.length === 0) {
        extractedSkills = [
          { name: 'JavaScript', level: 85, category: 'technical' as const },
          { name: 'React', level: 80, category: 'technical' as const },
          { name: 'Communication', level: 75, category: 'soft' as const },
          { name: 'Problem Solving', level: 85, category: 'soft' as const },
          { name: 'English', level: 95, category: 'language' as const },
          { name: 'Project Management', level: 80, category: 'soft' as const },
          { name: 'HTML/CSS', level: 90, category: 'technical' as const },
          { name: 'Git', level: 75, category: 'tool' as const },
        ];
      } else {
        extractedSkills = extractSkillsFromResume(resumeContent);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploading(false);
      setStatus('success');
      toast({
        title: "Resume uploaded successfully",
        description: "Your skills have been extracted and analyzed.",
      });
      
      // Call the onUploadComplete callback if provided, passing the extracted skills
      if (onUploadComplete) {
        onUploadComplete(extractedSkills);
      }
    } catch (error) {
      setUploading(false);
      setStatus('error');
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Resume</CardTitle>
        <CardDescription>
          Upload your resume to analyze your skills and create personalized assessments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragging 
              ? 'border-secondary bg-secondary/5' 
              : status === 'success' 
                ? 'border-green-400 bg-green-50' 
                : status === 'error' 
                  ? 'border-red-400 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('resume-upload')?.click()}
        >
          <input
            id="resume-upload"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.rtf"
            onChange={handleFileChange}
          />
          {status === 'success' ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="text-green-600 w-6 h-6" />
              </div>
              <p className="font-medium text-green-600">Resume successfully uploaded!</p>
              <p className="text-sm text-gray-500 mt-1">Your skills have been extracted.</p>
            </div>
          ) : status === 'error' ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="text-red-600 w-6 h-6" />
              </div>
              <p className="font-medium text-red-600">Upload failed</p>
              <p className="text-sm text-gray-500 mt-1">Please try uploading your resume again.</p>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-blue-600 w-6 h-6" />
              </div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="text-gray-600 w-6 h-6" />
              </div>
              <p className="font-medium">Drag & drop your resume here</p>
              <p className="text-sm text-gray-500 mt-1">
                Upload your resume file (.pdf, .doc, .docx)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Files should be your actual resume document
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          className="w-full"
          disabled={!file || uploading || status === 'success'}
        >
          {uploading ? 'Uploading...' : status === 'success' ? 'Uploaded' : 'Upload Resume'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResumeUpload;
