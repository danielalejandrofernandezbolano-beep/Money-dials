
import React, { useState, useMemo, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  Sector
} from 'recharts';
import { 
  Plus, AlertCircle, Sparkles, 
  Wallet, Settings2, Activity
} from 'lucide-react';
import { BudgetData, ChartDataItem } from './types';
import { COLORS, INITIAL_DIALS, CATEGORY_ICONS } from './constants';
import NumberInput from './components/NumberInput';
import DialControl from './components/DialControl';

const App: React.FC = () => {
  // --- STATE ---
  const [budget, setBudget] = useState<BudgetData>({
    income: 0,
    fixed: {
      rent: 0,
      utilities: 0,
      other: 0,
    },
    future: {
      savings: 0,
      investment: 0,
    },
    dials: INITIAL_DIALS,
  });

  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('money-dials-data');
    if (saved) {
      try {
        setBudget(JSON.parse(saved));
      } catch (e) {
        console.error("No se pudo cargar el presupuesto", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('money-dials-data', JSON.stringify(budget));
  }, [budget]);

  // --- CALCULATIONS ---
  const totals = useMemo(() => {
    const fixed = budget.fixed.rent + budget.fixed.utilities + budget.fixed.other;
    const future = budget.future.savings + budget.future.investment;
    const dials = budget.dials.reduce((acc, d) => acc + d.value, 0);
    const expenses = fixed + future + dials;
    const remaining = budget.income - expenses;
    return { fixed, future, dials, expenses, remaining };
  }, [budget]);

  const isOverBudget = totals.remaining < 0;

  // --- HANDLERS ---
  const updateBudget = (path: string, value: number) => {
    const parts = path.split('.');
    if (parts.length === 2) {
      const [category, sub] = parts as [keyof BudgetData, string];
      setBudget(prev => ({
        ...prev,
        [category]: {
          ...(prev[category] as object),
          [sub]: value
        }
      }));
    } else {
      setBudget(prev => ({ ...prev, [path]: value }));
    }
  };

  const updateDial = (id: string, name: string, value: number) => {
    setBudget(prev => ({
      ...prev,
      dials: prev.dials.map(d => d.id === id ? { ...d, name, value } : d)
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

  // --- CHART DATA ---
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

    if (!isOverBudget) {
      data.push({ name: 'Restante', value: totals.remaining, color: COLORS.remaining });
    }

    return data.filter(d => d.value > 0);
  }, [budget, totals, isOverBudget]);

  // --- RENDER HELPERS ---
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const offset = 14; 
    const tx = offset * cos;
    const ty = offset * sin;
    
    return (
      <g transform={`translate(${tx}, ${ty})`}>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 12}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.3}
          cornerRadius={10}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          cornerRadius={10}
          stroke="#0f172a"
          strokeWidth={3}
        />
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      
      {/* HEADER */}
      <header className="w-full max-w-7xl px-6 py-8 flex justify-between items-center border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Settings2 className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Perillas del Dinero</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">PLAN DE GASTO CONSCIENTE</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">INGRESO MENSUAL</span>
            <span className="text-lg font-mono font-bold text-slate-200">{formatMoney(budget.income)}</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 relative">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
          
          {/* INCOME CARD */}
          <section className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-3xl border border-slate-800/50 space-y-4 shadow-xl">
             <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Wallet size={16} className="text-purple-400" /> Ingresos y Básicos
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 uppercase">Frecuencia: Mensual</span>
             </div>
             <NumberInput 
                label="Ingreso Neto"
                value={budget.income}
                onChange={(val) => updateBudget('income', val)}
                colorClass="text-purple-400"
                prefix="$"
             />
             <div className="grid grid-cols-2 gap-4 pt-2">
                <NumberInput 
                  label="Vivienda" 
                  value={budget.fixed.rent} 
                  onChange={(val) => updateBudget('fixed.rent', val)}
                  icon={CATEGORY_ICONS.rent}
                  colorClass="text-teal-400"
                />
                <NumberInput 
                  label="Servicios" 
                  value={budget.fixed.utilities} 
                  onChange={(val) => updateBudget('fixed.utilities', val)}
                  icon={CATEGORY_ICONS.utilities}
                  colorClass="text-blue-400"
                />
             </div>
             <NumberInput 
                label="Otros Fijos" 
                value={budget.fixed.other} 
                onChange={(val) => updateBudget('fixed.other', val)}
                icon={CATEGORY_ICONS.other}
                colorClass="text-indigo-400"
              />
          </section>

          {/* FUTURE CARD */}
          <section className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-3xl border border-slate-800/50 space-y-5 shadow-xl">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-sky-400" /> Fondo para el Futuro
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput 
                label="Ahorros" 
                value={budget.future.savings} 
                onChange={(val) => updateBudget('future.savings', val)}
                icon={CATEGORY_ICONS.savings}
                colorClass="text-sky-400"
              />
              <NumberInput 
                label="Inversiones" 
                value={budget.future.investment} 
                onChange={(val) => updateBudget('future.investment', val)}
                icon={CATEGORY_ICONS.investment}
                colorClass="text-amber-400"
              />
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-slate-500 font-medium">Tasa de Futuro (Ahorro + Inv)</span>
                 <span className={`font-mono font-bold ${budget.income > 0 && ((totals.future / budget.income) * 100) >= 20 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {budget.income > 0 ? ((totals.future / budget.income) * 100).toFixed(1) : '0.0'}%
                 </span>
               </div>
            </div>
          </section>

          {/* DIALS SECTION */}
          <section className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-rose-400" /> Perillas de Estilo de Vida
                </h2>
                <p className="text-xs text-slate-500">Gasta sin culpa en lo que realmente te apasiona.</p>
              </div>
              <button 
                onClick={addDial}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-all hover:scale-110 active:scale-95 shadow-lg"
                title="Añadir Perilla"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {budget.dials.map((dial, index) => (
                <DialControl 
                  key={dial.id}
                  dial={dial}
                  index={index}
                  max={Math.max(100, budget.income)}
                  color={COLORS.dials[index % COLORS.dials.length]}
                  onUpdate={updateDial}
                  onRemove={removeDial}
                  formatCurrency={formatMoney}
                />
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: VISUALIZATION */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          <div className="sticky top-10 space-y-8">
            {/* CHART CARD */}
            <div className="bg-slate-900/40 backdrop-blur-md p-6 lg:p-12 rounded-[3.5rem] border border-slate-800/40 shadow-2xl min-h-[600px] lg:min-h-[700px] flex flex-col items-center justify-center animate-in zoom-in duration-700 relative overflow-hidden">
              
              {/* Decorative background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] -z-10 rounded-full" />

              <div className="relative w-full aspect-square max-w-[550px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart onMouseLeave={() => setActiveIndex(undefined)}>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={160} 
                      outerRadius={210}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      // @ts-ignore
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(undefined)}
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as ChartDataItem;
                          return (
                            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl ring-1 ring-white/10">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{data.name}</p>
                              <p className="text-xl font-mono font-black text-white">{formatMoney(data.value)}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 bg-slate-800/50 inline-block px-1.5 py-0.5 rounded">
                                {budget.income > 0 ? ((data.value / budget.income) * 100).toFixed(1) : '0.0'}% del ingreso
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* CENTRAL STATS */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                  <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.5em] font-black mb-1.5">
                    {isOverBudget ? 'Déficit' : 'Saldo Libre'}
                  </p>
                  <p className={`text-2xl md:text-4xl font-mono font-black tracking-tighter transition-all duration-500 ${isOverBudget ? 'text-rose-500' : 'text-white'}`}>
                    {formatMoney(Math.abs(totals.remaining))}
                  </p>
                  <div className="flex items-center gap-1 mt-3">
                    <span className={`text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest border transition-colors duration-500 ${isOverBudget ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                       {budget.income > 0 ? ((Math.abs(totals.remaining) / budget.income) * 100).toFixed(1) : '0.0'}% {isOverBudget ? 'Excedido' : 'Disponible'}
                    </span>
                  </div>
                </div>
              </div>

              {/* LEGEND GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full mt-14 border-t border-slate-800/30 pt-10">
                <div className="flex flex-col gap-2 items-center md:items-start group">
                   <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 group-hover:text-teal-400 transition-colors">
                     <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" /> Fijos
                   </span>
                   <span className="text-lg font-mono font-black text-slate-200">{formatMoney(totals.fixed)}</span>
                </div>
                <div className="flex flex-col gap-2 items-center md:items-start group">
                   <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 group-hover:text-sky-400 transition-colors">
                     <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]" /> Futuro
                   </span>
                   <span className="text-lg font-mono font-black text-slate-200">{formatMoney(totals.future)}</span>
                </div>
                <div className="flex flex-col gap-2 items-center md:items-start group">
                   <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 group-hover:text-rose-400 transition-colors">
                     <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]" /> Perillas
                   </span>
                   <span className="text-lg font-mono font-black text-slate-200">{formatMoney(totals.dials)}</span>
                </div>
                <div className="flex flex-col gap-2 items-center md:items-start group">
                   <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 group-hover:text-white transition-colors">
                     <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" /> Total
                   </span>
                   <span className="text-lg font-mono font-black text-slate-200">{formatMoney(totals.expenses)}</span>
                </div>
              </div>

              {isOverBudget && (
                <div className="mt-12 flex items-center gap-3 text-rose-400 bg-rose-500/5 px-8 py-5 rounded-[2.5rem] border border-rose-500/20 w-full justify-center backdrop-blur-sm animate-pulse shadow-lg">
                  <AlertCircle size={24} />
                  <span className="text-base font-black uppercase tracking-tight">Sobregirado por {formatMoney(Math.abs(totals.remaining))}</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl px-6 py-20 mt-20 border-t border-slate-900 flex flex-col items-center gap-8">
        <div className="flex items-center gap-4">
           <div className="h-px w-12 bg-slate-800" />
           <p className="text-slate-600 text-[11px] uppercase tracking-[0.6em] font-black text-center">MARCO DE GASTO CONSCIENTE</p>
           <div className="h-px w-12 bg-slate-800" />
        </div>
        <p className="text-slate-500 text-sm max-w-xl text-center leading-relaxed font-medium italic opacity-70">
          "Gasta extravagantemente en las cosas que amas y recorta costos sin piedad en las cosas que no. La riqueza no se trata de ahorrar en café; se trata de asignar capital a tus valores."
        </p>
        <div className="flex gap-6 mt-2">
           <div className="w-2 h-2 rounded-full bg-teal-500/40" />
           <div className="w-2 h-2 rounded-full bg-sky-500/40" />
           <div className="w-2 h-2 rounded-full bg-rose-500/40" />
        </div>
      </footer>
    </div>
  );
};

export default App;
