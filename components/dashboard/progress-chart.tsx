"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressItem {
  label: string;
  value: number;
  color?: string;
}

interface ProgressChartProps {
  title: string;
  items: ProgressItem[];
}

export function ProgressChart({ title, items }: ProgressChartProps) {
  return (
    <Card className="bg-white backdrop-blur-sm border border-[#E0E0E0] shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[#666666]">{item.label}</span>
              <span className="text-sm font-medium">{item.value}%</span>
            </div>
            <Progress 
              value={item.value} 
              className="h-2"
              style={{ 
                // @ts-ignore
                '--progress-color': item.color || '#6D3FC8' 
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}