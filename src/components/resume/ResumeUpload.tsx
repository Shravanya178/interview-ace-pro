import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ResumeUploadProps {
  onUploadComplete?: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
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

  const validateAndSetFile = (file: File) => {
    // Check if file is PDF or DOC/DOCX
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF or Word document (.doc, .docx).",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {  // 5MB limit
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
      });
      return;
    }
    
    setFile(file);
    setStatus('idle');
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploading(false);
      setStatus('success');
      toast({
        title: "Resume uploaded successfully",
        description: "Your skills have been extracted and analyzed.",
      });
      
      // Call the onUploadComplete callback if provided
      if (onUploadComplete) {
        onUploadComplete();
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
            accept=".pdf,.doc,.docx"
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
                Support for PDF, DOC, DOCX files
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
