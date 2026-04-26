import React from 'react';
import { Card, Button } from './ui';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UnlockProCard = ({ onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="relative">
      <Card className="max-w-xl mx-auto p-10 bg-white border-blue-100 shadow-2xl rounded-[3rem] relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors z-30"
        >
          <X size={24} />
        </button>
        
        <div className="relative z-20 text-center">
          <div className="p-4 bg-blue-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-blue-600 border border-blue-100 shadow-lg shadow-blue-100">
            <Sparkles size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Unlock Full Engineering Data</h3>
          <p className="text-slate-500 font-medium mb-10 text-lg leading-relaxed">
            Upgrade to Pro to access precise cutoffs and rankings for all colleges. Get the full detailed profile for every institution in Tamil Nadu.
          </p>
          <Button 
            className="w-full py-6 text-lg bg-indigo-600 text-white rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            onClick={() => {
              onClose?.();
              navigate('/subscribe');
            }}
          >
            Unlock Now
            <ArrowRight size={20} />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UnlockProCard;
