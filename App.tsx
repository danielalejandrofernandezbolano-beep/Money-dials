
import React, { useState, useMemo, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  Sector
} from 'recharts';
import { 
  Plus, AlertCircle, Sparkles, 
  Wallet, Settings2, Activity,
  CheckCircle2, Target, Info, BarChart3
} from 'lucide-react';
import { BudgetData, ChartDataItem } from './types';
import { COLORS, INITIAL_DIALS, CATEGORY_ICONS } from './constants';
import NumberInput from './components/NumberInput';
import DialControl from './components/DialControl';

const App: React.FC = () => {
  const [budget, setBudget] = useState<BudgetData>({
    income: 0,
    fixed: { rent: 0, utilities: 0, other: 0 },
    future: { savings: 0, investment: 0 },
    dials: INITIAL_DIALS,
  });

  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    const saved = localStorage.getItem('money-dials-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBudget(parsed);
      } catch (e) {
        console.error("Error loading data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('money-dials-data', JSON.stringify(budget));
  }, [budget]);

  const totals = useMemo(() => {
    const fixed = budget.fixed.rent + budget.fixed.utilities + budget.fixed.other;
    const future = budget.future.savings + budget.future.investment;
    const dials = budget.dials.reduce((acc, d) => acc + d.value, 0);
    const expenses = fixed + future + dials;
    const remaining = budget.income - expenses;
    
    const pctFixed = budget.income > 0 ? (fixed / budget.income) * 100 : 0;
    const pctSavings = budget.income > 0 ? (budget.future.savings / budget.income) * 100 : 0;
    const pctInvest = budget.income > 0 ? (budget.future.investment / budget.income) * 100 : 0;
    const pctDials = budget.income > 0 ? (dials / budget.income) * 100 : 0;

    return { fixed, future, dials, expenses, remaining, pctFixed, pctSavings, pctInvest, pctDials };
  }, [budget]);

  const updateBudget = (path: string, value: number) => {
    const parts = path.split('.');
    if (parts.length === 2) {
      const [category, sub] = parts as [keyof BudgetData, string];
      setBudget(prev => ({
        ...prev,
        [category]: { ...(prev[category] as object), [sub]: value }
      }));
    } else {
      setBudget(prev => ({ ...prev, [path]: value }));
    }
  };

  const updateDial = (id: string, name: string, value: number, description?: string) => {
    setBudget(prev => ({
      ...prev,
      dials: prev.dials.map(d => d.id === id ? { ...d, name, value, description } : d)
    }));
  };

  const addDial = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setBudget(prev => ({
      ...prev,
      dials: [...prev.dials, { id: newId, name: 'Nuevo Gusto', value: 0 }]
    }));
  };

  const removeDial = (id: string) => {
    setBudget(prev => ({
      ...prev,
      dials: prev.dials.filter(d => d.id !== id)
    }));
  };

  const chartData: ChartDataItem[] = useMemo(() => {
    const data: ChartDataItem[] = [
      { name: 'Arriendo', value: budget.fixed.rent, color: COLORS.fixed.rent },
      { name: 'Servicios', value: budget.fixed.utilities, color: COLORS.fixed.utilities },
      { name: 'Otros Fijos', value: budget.fixed.other, color: COLORS.fixed.other },
      { name: 'Ahorro', value: budget.future.savings, color: COLORS.future.savings },
      { name: 'Inversión', value: budget.future.investment, color: COLORS.future.investment },
      ...budget.dials.map((d, i) => ({
        name: d.name,
        value: d.value,
        color: COLORS.dials[i % COLORS.dials.length]
      }))
    ];
    if (totals.remaining > 0) {
      data.push({ name: 'Libre', value: totals.remaining, color: COLORS.remaining });
    }
    return data.filter(d => d.value > 0);
  }, [budget, totals]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const healthCheck = [
    { 
      label: 'Costos Fijos', 
      current: totals.pctFixed, 
      target: '50-60%', 
      status: totals.pctFixed <= 60 ? 'good' : 'bad' 
    },
    { 
      label: 'Ahorros', 
      current: totals.pctSavings, 
      target: '5-10%', 
      status: totals.pctSavings >= 5 ? 'good' : 'warning' 
    },
    { 
      label: 'Inversiones', 
      current: totals.pctInvest, 
      target: '5-10%', 
      status: totals.pctInvest >= 5 ? 'good' : 'warning' 
    },
    { 
      label: 'Gasto Libre', 
      current: totals.pctDials, 
      target: '20-35%', 
      status: (totals.pctDials >= 20 && totals.pctDials <= 35) ? 'good' : 'neutral' 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* HERO HEADER */}
      <header className="w-full bg-slate-950/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Settings2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">Perillas del Dinero</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Conscious Spending Framework</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden sm:block text-right">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Saldo Mensual</p>
              <p className={`text-lg font-mono font-black ${totals.remaining < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                {formatMoney(totals.remaining)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* INCOME SECTION */}
          <section className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet size={80} />
            </div>
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
               Base Financiera
            </h2>
            <NumberInput 
                label="Ingreso Neto Mensual"
                value={budget.income}
                onChange={(val) => updateBudget('income', val)}
                colorClass="text-purple-400"
             />
             <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Vivienda" value={budget.fixed.rent} onChange={(val) => updateBudget('fixed.rent', val)} icon={CATEGORY_ICONS.rent} />
                <NumberInput label="Servicios" value={budget.fixed.utilities} onChange={(val) => updateBudget('fixed.utilities', val)} icon={CATEGORY_ICONS.utilities} />
             </div>
             <NumberInput label="Otros Gastos Fijos" value={budget.fixed.other} onChange={(val) => updateBudget('fixed.other', val)} icon={CATEGORY_ICONS.other} />
          </section>

          {/* FUTURE SECTION */}
          <section className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
               Tu Futuro Yo
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Ahorro" value={budget.future.savings} onChange={(val) => updateBudget('future.savings', val)} icon={CATEGORY_ICONS.savings} colorClass="text-sky-400" />
              <NumberInput label="Inversión" value={budget.future.investment} onChange={(val) => updateBudget('future.investment', val)} icon={CATEGORY_ICONS.investment} colorClass="text-amber-400" />
            </div>
          </section>

          {/* DIALS SECTION */}
          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                   Tus Perillas
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold italic">"Gasta en lo que amas sin culpa"</p>
              </div>
              <button 
                onClick={addDial}
                className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {budget.dials.map((dial, index) => (
                <DialControl 
                  key={dial.id}
                  dial={dial}
                  index={index}
                  max={Math.max(1000, budget.income)}
                  color={COLORS.dials[index % COLORS.dials.length]}
                  onUpdate={updateDial}
                  onRemove={removeDial}
                  formatCurrency={formatMoney}
                />
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: VISUALS */}
        <div className="lg:col-span-7 flex flex-col gap-12">
          
          <div className="sticky top-32 space-y-12">
            
            {/* RAMIT SETHI BENCHMARKS SECTION */}
            <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 space-y-6 shadow-xl">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <BarChart3 size={14} className="text-purple-400" /> Benchmarks de Ramit Sethi
                </h2>
                <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Rich Life Standards</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {healthCheck.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1 p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-colors">
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{item.label}</span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-mono font-black ${item.status === 'good' ? 'text-emerald-400' : item.status === 'warning' ? 'text-amber-400' : 'text-rose-400'}`}>
                        {item.current.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[9px] text-slate-600 font-bold italic">Meta: {item.target}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'good' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : item.status === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MAIN CHART */}
            <div className="bg-slate-900/40 p-8 lg:p-16 rounded-[4rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] -z-10 rounded-full group-hover:bg-indigo-500/15 transition-all duration-700" />
              
              <div className="relative w-full aspect-square max-w-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart onMouseLeave={() => setActiveIndex(undefined)}>
                    <Pie
                      data={chartData}
                      cx="50%" cy="50%"
                      innerRadius={150} outerRadius={200}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      // @ts-ignore
                      activeIndex={activeIndex}
                      activeShape={(props: any) => {
                        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                        return (
                          <g>
                            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 12} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={12} opacity={0.4} />
                            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={12} stroke="#0f172a" strokeWidth={3} />
                          </g>
                        );
                      }}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      animationDuration={1200}
                    >
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={() => null} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Presupuesto Gastado</span>
                  <span className={`text-4xl md:text-5xl font-mono font-black tracking-tighter ${totals.remaining < 0 ? 'text-rose-500' : 'text-white'}`}>
                    {((totals.expenses / (budget.income || 1)) * 100).toFixed(0)}%
                  </span>
                  <div className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${totals.remaining < 0 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {totals.remaining < 0 ? 'Sobre el Límite' : 'Flujo Positivo'}
                  </div>
                </div>
              </div>

              {/* DETAILED STATS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full mt-12 pt-12 border-t border-white/5">
                {[
                  { label: 'Fijos', value: totals.fixed, color: 'text-teal-400' },
                  { label: 'Futuro', value: totals.future, color: 'text-sky-400' },
                  { label: 'Gusto', value: totals.dials, color: 'text-rose-400' },
                  { label: 'Restante', value: Math.max(0, totals.remaining), color: 'text-slate-400' },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center md:items-start group/stat">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover/stat:text-white transition-colors">{stat.label}</span>
                    <span className={`text-base font-mono font-black ${stat.color}`}>{formatMoney(stat.value)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 pt-20 flex flex-col items-center gap-8 opacity-40">
        <div className="flex items-center gap-6">
           <div className="h-px w-10 bg-slate-800" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em]">Money Dials System</p>
           <div className="h-px w-10 bg-slate-800" />
        </div>
        <div className="flex gap-4">
           <Info size={14} className="text-slate-600" />
           <p className="text-[10px] text-slate-500 text-center max-w-sm font-bold uppercase tracking-tighter">
             Los datos se guardan localmente en tu navegador. 
           </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
