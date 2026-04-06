import React from 'react';
import { Card, Button } from './ui';
import { Sparkles, ArrowRight } from 'lucide-react';

const UnlockProCard = ({ onUpgrade }) => {
  return (
    <div className="relative pt-8 pb-12">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-10" />
      <div className="relative z-20 text-center">
        <Card className="max-w-xl mx-auto p-10 bg-white border-blue-100 shadow-2xl shadow-blue-50 rounded-[3rem]">
          <div className="p-4 bg-blue-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-blue-600 border border-blue-100 shadow-lg shadow-blue-100">
            <Sparkles size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Unlock Full Engineering Data</h3>
          <p className="text-slate-500 font-medium mb-10 text-lg leading-relaxed">
            You've reached the free limit. Upgrade to your Pro Account to access precise cutoffs and rankings for all 1,000+ branch combinations in 500+ Engineering institutions across Tamil Nadu.
          </p>
          <Button 
            className="w-full py-6 text-lg bg-slate-900 text-white rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform"
            onClick={onUpgrade}
          >
            Unlock 500+ More Colleges
            <ArrowRight className="ml-3" size={20} />
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default UnlockProCard;
