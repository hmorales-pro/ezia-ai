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
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-zinc-400">{item.label}</span>
              <span className="text-sm font-medium">{item.value}%</span>
            </div>
            <Progress 
              value={item.value} 
              className="h-2"
              style={{ 
                // @ts-ignore
                '--progress-color': item.color || '#8b5cf6' 
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}