
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  href,
  color = "bg-primary" 
}) => {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-all duration-300 border-t-4" style={{ borderTopColor: 'var(--secondary)' }}>
      <CardHeader className="pb-3">
        <div className={`p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2 ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 text-secondary`} />
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Content could be added here */}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-secondary hover:bg-secondary/80">
          <Link to={href}>Get Started</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DashboardCard;
