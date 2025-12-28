
import React from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  colorClass?: string;
  prefix?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ 
  label, value, onChange, icon, colorClass = "text-slate-400", prefix = "$" 
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className={`text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 ${colorClass}`}>
        {icon} {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">{prefix}</span>
        <input 
          type="number"
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="0"
          className="w-full bg-slate-900 border border-slate-700/50 rounded-lg pl-8 pr-3 py-2.5 text-slate-100 font-mono text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all hover:border-slate-600"
        />
      </div>
    </div>
  );
};

export default NumberInput;
