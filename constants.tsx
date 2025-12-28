
import React from 'react';
import { Home, Zap, ShieldCheck, PiggyBank, TrendingUp, Heart } from 'lucide-react';

export const COLORS = {
  fixed: {
    rent: '#2dd4bf', // Teal 400 - Tranquility and stability
    utilities: '#60a5fa', // Blue 400 - Clarity
    other: '#818cf8', // Indigo 400 - Focus
  },
  future: {
    savings: '#38bdf8', // Sky 400 - Growth
    investment: '#fbbf24', // Amber 400 - Opportunity
  },
  remaining: '#334155', // Slate 700 - Subdued foundation
  overbudget: '#f43f5e', // Rose 500 - Alert
  dials: [
    '#f43f5e', // Rose 500
    '#d946ef', // Fuchsia 500
    '#8b5cf6', // Violet 500
    '#06b6d4', // Cyan 500
    '#10b981', // Emerald 500
    '#f97316', // Orange 500
  ]
};

export const INITIAL_DIALS = [
  { id: '1', name: 'Comida', value: 0 },
  { id: '2', name: 'Viaje', value: 0 },
  { id: '3', name: 'Donaciones', value: 0 },
];

export const CATEGORY_ICONS = {
  rent: <Home size={16} />,
  utilities: <Zap size={16} />,
  other: <ShieldCheck size={16} />,
  savings: <PiggyBank size={16} />,
  investment: <TrendingUp size={16} />,
  dials: <Heart size={16} />,
};
