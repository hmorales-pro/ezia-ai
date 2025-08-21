import React from 'react';
import { Button as BaseButton } from '@/components/ui/button';
import { Card as BaseCard, CardContent as BaseCardContent, CardHeader as BaseCardHeader, CardTitle as BaseCardTitle } from '@/components/ui/card';
import { Badge as BaseBadge } from '@/components/ui/badge';
import { Avatar as BaseAvatar, AvatarFallback as BaseAvatarFallback, AvatarImage as BaseAvatarImage } from '@/components/ui/avatar';

// Memoized UI components for better performance
export const Button = React.memo(BaseButton);
export const Card = React.memo(BaseCard);
export const CardContent = React.memo(BaseCardContent);
export const CardHeader = React.memo(BaseCardHeader);
export const CardTitle = React.memo(BaseCardTitle);
export const Badge = React.memo(BaseBadge);
export const Avatar = React.memo(BaseAvatar);
export const AvatarFallback = React.memo(BaseAvatarFallback);
export const AvatarImage = React.memo(BaseAvatarImage);

// Memoized icon wrapper - prevents re-renders when icon props don't change
export const MemoizedIcon = React.memo(({ Icon, ...props }: { Icon: any } & React.SVGProps<SVGSVGElement>) => {
  return <Icon {...props} />;
});

// Memoized loading spinner component
export const LoadingSpinner = React.memo(({ className = "w-8 h-8", text }: { className?: string; text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`border-3 border-[#6D3FC8] border-t-transparent rounded-full animate-spin ${className}`}></div>
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
});
LoadingSpinner.displayName = 'LoadingSpinner';

// Memoized stat card component
export const StatCard = React.memo(({ 
  icon: Icon, 
  title, 
  value, 
  description 
}: { 
  icon: any; 
  title: string; 
  value: string | number; 
  description?: string;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#666666]">{title}</p>
            <p className="text-2xl font-bold text-[#1E1E1E]">{value}</p>
            {description && (
              <p className="text-sm text-[#666666]">{description}</p>
            )}
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#6D3FC8]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
StatCard.displayName = 'StatCard';