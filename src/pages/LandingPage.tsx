import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check, Upload, Video, BookOpen, FileText, Brain, UserCheck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-primary">Interview</span>
                <span className="text-xl font-bold text-secondary">Ace Pro</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/resume" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                Resume Analysis
              </Link>
              <Link to="/interview" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                Interview Prep
              </Link>
              <Link to="/dashboard">
                <Button>Start Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-8">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                  AI-Powered Interview Prep
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                  Ace Your Next Tech Interview
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Prepare for tech interviews with AI-powered resume analysis, 
                  personalized skill assessments, and realistic mock interviews.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/resume">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Try Resume Analysis
                      <Upload className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/interview">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Try Mock Interview
                      <Video className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">AI Resume Analysis</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Skill Assessments</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Mock Interviews</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Detailed Feedback</span>
                </div>
              </div>
            </div>
            
            <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
                  <div className="bg-primary p-4 text-white">
                    <h3 className="font-medium">AI Interview Session</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 text-sm">
                        Tell me about a challenging project you worked on and how you overcame obstacles.
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="bg-primary/10 rounded-lg p-3 text-sm">
                        I led a team to redesign our company's e-commerce platform...
                      </div>
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 text-sm">
                        That's interesting. What specific challenges did you face with the team?
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Interview Ace Pro Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform prepares you for interviews by analyzing your skills and providing personalized feedback.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/resume" className="block">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Resume Analysis</h3>
                  <p className="text-gray-600">
                    Upload your resume and our AI will analyze your skills, identify strengths and areas for improvement.
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/mock-test" className="block">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Skill Assessment</h3>
                  <p className="text-gray-600">
                    Take a tailored assessment to evaluate your technical and soft skills with detailed feedback.
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/interview" className="block">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Mock Interviews</h3>
                  <p className="text-gray-600">
                    Practice with AI-powered mock interviews customized for specific companies and roles.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Thousands of professionals have landed their dream jobs with the help of Interview Ace Pro.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                title: "Frontend Developer at Google",
                quote: "The AI mock interviews were surprisingly realistic. I felt prepared for every question in my actual interview."
              },
              {
                name: "Michael Chen",
                title: "Software Engineer at Microsoft",
                quote: "The resume analysis found gaps in my skills I hadn't noticed. The recommended courses helped me level up quickly."
              },
              {
                name: "Priya Patel",
                title: "Data Scientist at Amazon",
                quote: "I was nervous about system design interviews, but the practice sessions gave me the confidence I needed to succeed."
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Ready to ace your next interview?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of professionals who are getting hired at top tech companies.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/resume">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100">
                  Try Resume Analysis
                  <Upload className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Interview Ace Pro</h3>
              <p className="text-gray-400">
                AI-powered interview preparation to help you land your dream job.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2">
                <li><Link to="/resume" className="text-gray-400 hover:text-white">Resume Analysis</Link></li>
                <li><Link to="/mock-test" className="text-gray-400 hover:text-white">Skill Assessments</Link></li>
                <li><Link to="/interview" className="text-gray-400 hover:text-white">Mock Interviews</Link></li>
                <li><Link to="/reports" className="text-gray-400 hover:text-white">Reports</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigate</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link></li>
                <li><Link to="/profile" className="text-gray-400 hover:text-white">Profile</Link></li>
                <li><Link to="/settings" className="text-gray-400 hover:text-white">Settings</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Interview Ace Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 