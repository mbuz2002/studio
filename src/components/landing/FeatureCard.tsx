
"use client";

import * as React from "react"; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  color?: string;
}

export function FeatureCard({ icon, title, description, color = "sky" }: FeatureCardProps) {
  const colorClasses: Record<string, { border: string; shadow: string; iconBg: string; iconText: string }> = {
    sky: { border: 'border-sky-500/40 hover:border-sky-400/80', shadow: 'hover:shadow-[0_0_40px_-5px_theme(colors.sky.500/0.4)]', iconBg: 'bg-sky-500/10', iconText: 'text-sky-400' },
    purple: { border: 'border-purple-500/40 hover:border-purple-400/80', shadow: 'hover:shadow-[0_0_40px_-5px_theme(colors.purple.500/0.4)]', iconBg: 'bg-purple-500/10', iconText: 'text-purple-400' },
    teal: { border: 'border-teal-500/40 hover:border-teal-400/80', shadow: 'hover:shadow-[0_0_40px_-5px_theme(colors.teal.500/0.4)]', iconBg: 'bg-teal-500/10', iconText: 'text-teal-400' },
    emerald: { border: 'border-emerald-500/40 hover:border-emerald-400/80', shadow: 'hover:shadow-[0_0_40px_-5px_theme(colors.emerald.500/0.4)]', iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400' },
    rose: { border: 'border-rose-500/40 hover:border-rose-400/80', shadow: 'hover:shadow-[0_0_40px_-5px_theme(colors.rose.500/0.4)]', iconBg: 'bg-rose-500/10', iconText: 'text-rose-400' },
    amber: { border: 'border-amber-500/40 hover:border-amber-400/80', shadow: 'hover:shadow-[0_0_40px_-5px_theme(colors.amber.500/0.4)]', iconBg: 'bg-amber-500/10', iconText: 'text-amber-400' },
    indigo: { border: 'border-indigo-500/40 hover:border-indigo-400/80', shadow: 'hover:shadow-[0_0_40px_-5px_theme(colors.indigo.500/0.4)]', iconBg: 'bg-indigo-500/10', iconText: 'text-indigo-400' },
    pink: { border: 'border-pink-500/40 hover:border-pink-400/80', shadow: 'hover:shadow-[0_0_40px_-5px_theme(colors.pink.500/0.4)]', iconBg: 'bg-pink-500/10', iconText: 'text-pink-400' },
    red: { border: 'border-red-500/40 hover:border-red-400/80', shadow: 'hover:shadow-[0_0_40px_-5px_theme(colors.red.500/0.4)]', iconBg: 'bg-red-500/10', iconText: 'text-red-400' },
  };

  const selectedColorStyle = colorClasses[color] || colorClasses.sky;

  return (
    <Card className={`bg-slate-800/70 border-2 ${selectedColorStyle.border} ${selectedColorStyle.shadow} shadow-xl rounded-xl transition-all duration-300 transform hover:scale-105 flex flex-col h-full animate-fade-in-up`}>
      <CardHeader className="items-center text-center pt-8 pb-4">
        <div className={`mb-5 p-4 rounded-full ${selectedColorStyle.iconBg} shadow-inner flex-shrink-0`}>
          {React.cloneElement(icon, { className: `h-10 w-10 ${selectedColorStyle.iconText} animate-subtle-bob` })}
        </div>
        <CardTitle className="text-xl md:text-2xl font-semibold text-slate-100">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center pb-8 px-6 flex-grow">
        <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">{description}</p>
      </CardContent>
    </Card>
  );
}
