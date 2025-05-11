"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  color?: string;
}

export function FeatureCard({ icon, title, description, color = "sky" }: FeatureCardProps) {
  const colorClasses: Record<string, string> = {
    sky: 'border-sky-500/30 hover:border-sky-500/70 hover:shadow-sky-500/20',
    purple: 'border-purple-500/30 hover:border-purple-500/70 hover:shadow-purple-500/20',
    teal: 'border-teal-500/30 hover:border-teal-500/70 hover:shadow-teal-500/20',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/70 hover:shadow-emerald-500/20',
    rose: 'border-rose-500/30 hover:border-rose-500/70 hover:shadow-rose-500/20',
    amber: 'border-amber-500/30 hover:border-amber-500/70 hover:shadow-amber-500/20',
    indigo: 'border-indigo-500/30 hover:border-indigo-500/70 hover:shadow-indigo-500/20',
    pink: 'border-pink-500/30 hover:border-pink-500/70 hover:shadow-pink-500/20',
    red: 'border-red-500/30 hover:border-red-500/70 hover:shadow-red-500/20',
  };

  return (
    <Card className={`bg-slate-800/70 border-2 ${colorClasses[color] || colorClasses.sky} shadow-xl rounded-xl transition-all duration-300 transform hover:scale-105`}>
      <CardHeader className="items-center text-center pt-8 pb-4">
        <div className={`mb-4 p-3 rounded-full bg-slate-700 shadow-inner`}>
          {icon}
        </div>
        <CardTitle className="text-xl md:text-2xl font-semibold text-slate-100">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center pb-8 px-6">
        <p className="text-sm md:text-base text-slate-300 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
