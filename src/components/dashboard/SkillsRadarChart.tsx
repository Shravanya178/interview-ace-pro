import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface SkillScore {
  skill: string;
  score: number;
  fullMark: number;
}

interface SkillsRadarChartProps {
  skills: SkillScore[];
}

const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({ skills }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills Assessment</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div style={{ height: '300px', width: '100%', minHeight: '250px', minWidth: '250px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skills}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis />
              <Radar
                name="Skills"
                dataKey="score"
                stroke="hsl(var(--secondary))"
                fill="hsl(var(--secondary))"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsRadarChart;
