
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Skill {
  name: string;
  level: number;
  category: 'technical' | 'soft' | 'language' | 'tool';
}

interface SkillsListProps {
  skills: Skill[];
}

const SkillsList: React.FC<SkillsListProps> = ({ skills }) => {
  // Group skills by category
  const groupedSkills = skills.reduce<Record<string, Skill[]>>(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    },
    {}
  );

  const categoryLabels: Record<string, string> = {
    technical: 'Technical Skills',
    soft: 'Soft Skills',
    language: 'Languages',
    tool: 'Tools & Technologies',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className="space-y-2">
              <h3 className="font-medium text-gray-800">{categoryLabels[category]}</h3>
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div key={skill.name} className="flex items-center space-x-2">
                    <div className="min-w-[120px] flex-grow-0">
                      <Badge variant="outline" className="bg-secondary/10 border-secondary/30 text-primary hover:bg-secondary/20">
                        {skill.name}
                      </Badge>
                    </div>
                    <Progress value={skill.level} className="flex-1 h-2" />
                    <span className="text-xs text-gray-500 w-8 text-right">{skill.level}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsList;
