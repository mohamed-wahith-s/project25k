import React from 'react';
import { motion } from 'framer-motion';
import { Card, Input, Button } from '../ui';
import { Sparkles } from 'lucide-react';

export default function MetadataForm({ metadata, handleMetadataChange, handleSubscribe, setShowMetadataForm, loadingPlan }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="shadow-2xl shadow-primary-200/20 p-10 border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Sparkles size={32} /></div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">One Last Step</h2>
            <p className="text-slate-500 mt-2">Help us personalize your counseling experience</p>
          </div>
          <form onSubmit={handleSubscribe} className="space-y-6">
            <div className="space-y-4">
              <Input label="12th Standard Marks (%)" name="marks" type="number" step="0.01" placeholder="e.g. 95.5" value={metadata.marks} onChange={handleMetadataChange} required />
              <Input label="TNEA Cutoff (out of 200)" name="cutoff" type="number" step="0.01" placeholder="e.g. 192.5" value={metadata.cutoff} onChange={handleMetadataChange} required />
              <Input label="TNEA Counseling Rank (Optional)" name="counselingRank" type="number" placeholder="e.g. 12450" value={metadata.counselingRank} onChange={handleMetadataChange} />
              <Input label="Date of Birth" name="dateOfBirth" type="date" value={metadata.dateOfBirth} onChange={handleMetadataChange} required />
              <Input label="Full Address" name="address" type="text" placeholder="Street, City, Pincode" value={metadata.address} onChange={handleMetadataChange} required />
              <Input label="Alternate Phone Number (Optional)" name="alternatePhone" type="tel" placeholder="e.g. 9876543210" value={metadata.alternatePhone} onChange={handleMetadataChange} />
              <div className="space-y-1.5"><label className="text-sm font-medium text-slate-700 ml-1">Caste / Category</label>
                <select name="caste" value={metadata.caste} onChange={handleMetadataChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-700 font-medium" required>
                  <option value="">Select Category</option>{["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-sm font-medium text-slate-700 ml-1">Religion</label>
                <select name="religion" value={metadata.religion} onChange={handleMetadataChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-700 font-medium" required>
                  <option value="">Select Religion</option>{["Hindu", "Muslim", "Christian", "Other"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="pt-4 flex space-x-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowMetadataForm(false)} disabled={loadingPlan}>Back</Button>
              <Button type="submit" variant="premium" className="flex-[2]" isLoading={!!loadingPlan}>Confirm & Subscribe</Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
