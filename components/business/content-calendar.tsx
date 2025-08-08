"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, FileText, Video, Image, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: string;
  date: string;
  title: string;
  type: "article" | "video" | "image" | "social";
  status: "draft" | "scheduled" | "published";
  platform?: string[];
  description?: string;
}

interface ContentCalendarProps {
  businessId: string;
  contentItems?: ContentItem[];
  onAddContent?: (date: Date) => void;
}

const contentTypeIcons = {
  article: FileText,
  video: Video,
  image: Image,
  social: Hash,
};

const contentTypeColors = {
  article: "bg-blue-100 text-blue-800",
  video: "bg-purple-100 text-purple-800",
  image: "bg-green-100 text-green-800",
  social: "bg-orange-100 text-orange-800",
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
};

export function ContentCalendar({ businessId, contentItems = [], onAddContent }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of week for the first day of the month (0 = Sunday, 6 = Saturday)
  const startDayOfWeek = getDay(monthStart);
  
  // Create empty cells for days before the month starts
  const emptyCells = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const getContentForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return contentItems.filter(item => item.date === dateStr);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendrier de contenu</CardTitle>
            <CardDescription>
              Planifiez et gérez vos publications
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
            >
              Aujourd'hui
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Month and Year */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-[#1E1E1E]">
              {format(currentDate, "MMMM yyyy", { locale: fr })}
            </h3>
          </div>

          {/* Calendar Grid */}
          <div className="border rounded-lg overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b">
              {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {/* Empty cells for alignment */}
              {emptyCells.map((_, index) => (
                <div key={`empty-${index}`} className="min-h-[100px] border-r border-b bg-gray-50" />
              ))}
              
              {/* Actual days */}
              {days.map((day) => {
                const dayContent = getContentForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[100px] border-r border-b p-2 cursor-pointer hover:bg-gray-50 transition-colors",
                      !isCurrentMonth && "bg-gray-50 text-gray-400",
                      isTodayDate && "bg-blue-50"
                    )}
                    onClick={() => {
                      setSelectedDate(day);
                      if (onAddContent) {
                        onAddContent(day);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={cn(
                        "text-sm font-medium",
                        isTodayDate && "text-blue-600 font-bold"
                      )}>
                        {format(day, "d")}
                      </span>
                      {dayContent.length > 0 && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {dayContent.length}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Content items preview */}
                    <div className="space-y-1">
                      {dayContent.slice(0, 2).map((item) => {
                        const Icon = contentTypeIcons[item.type];
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "text-xs p-1 rounded flex items-center gap-1 truncate",
                              contentTypeColors[item.type]
                            )}
                            title={item.title}
                          >
                            <Icon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </div>
                        );
                      })}
                      {dayContent.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayContent.length - 2} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Types de contenu:</span>
              {Object.entries(contentTypeIcons).map(([type, Icon]) => (
                <div key={type} className="flex items-center gap-1">
                  <Icon className="w-4 h-4" />
                  <span className="capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Date Content */}
          {selectedDate && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-2">
                Contenu pour le {format(selectedDate, "d MMMM yyyy", { locale: fr })}
              </h4>
              {getContentForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getContentForDate(selectedDate).map((item) => {
                    const Icon = contentTypeIcons[item.type];
                    return (
                      <div key={item.id} className="flex items-start gap-3 p-2 bg-white rounded-lg border">
                        <Icon className="w-5 h-5 mt-0.5 text-gray-600" />
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{item.title}</h5>
                          {item.description && (
                            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge className={cn("text-xs", statusColors[item.status])}>
                              {item.status}
                            </Badge>
                            {item.platform?.map((platform) => (
                              <Badge key={platform} variant="outline" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun contenu prévu pour cette date</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}