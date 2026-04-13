import React from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../ui';
import { Check } from 'lucide-react';

export default function PlanGrid({ plans, loadingPlan, handlePlanSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
      {plans.map((plan, index) => (
        <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
          <Card className={`h-full flex flex-col relative transition-all duration-500 hover:shadow-2xl ${plan.recommended ? 'border-primary-500 border-2 shadow-primary-100 shadow-2xl scale-105 z-10' : 'hover:-translate-y-2'}`} noPadding>
            {plan.recommended && <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">RECOMMENDED BY EXPERTS</div>}
            <div className="p-8 pb-0">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-4"><span className="text-5xl font-extrabold text-slate-900">{plan.price}</span><span className="ml-1.5 text-slate-500 font-medium">{plan.period}</span></div>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">{plan.description}</p>
            </div>
            <div className="flex-1 p-8 pt-0 space-y-4">
              <div className="h-px bg-slate-100 w-full mb-6"></div>
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0"><Check size={12} strokeWidth={3} /></div>
                  <span className="text-sm text-slate-600 font-medium leading-tight">{feature}</span>
                </div>
              ))}
            </div>
            <div className="p-8 pt-0"><Button variant={plan.variant} className="w-full py-4 text-lg font-bold" size="xl" isLoading={loadingPlan === plan.id} onClick={() => handlePlanSelect(plan.id, plan.price)}>{plan.recommended ? 'Subscribe Now' : 'Choose Plan'}</Button></div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
