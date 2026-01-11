
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, Phone, MapPin, Globe, Send, CheckCircle2, 
  AlertCircle, ShieldCheck, Loader2, MessageSquare,
  HelpCircle, Sparkles, ChevronDown, CheckCircle, Clock
} from 'lucide-react';
import { InquiryType } from '../types';
import { useLocation } from 'react-router-dom';

const CATEGORIES: InquiryType[] = ['General', 'Quote', 'Payment', 'Claim', 'Technical', 'Feedback'];

const ContactPage: React.FC = () => {
  const { submitInquiry } = useAuth();
  const location = useLocation();
  const formRef = useRef<HTMLDivElement>(null);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Anti-bot state
  const [humanFactor, setHumanFactor] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    subject: '', 
    type: 'General' as InquiryType,
    message: '',
    consent: false
  });

  useEffect(() => {
    if (location.hash === '#contact-form' && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Bot detection
    if (honeypot) return; 
    if (!humanFactor) {
      setError("Please confirm you are human to proceed.");
      return;
    }

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setError("Mandatory fields are missing.");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("A valid email address is required for us to respond.");
      return;
    }

    if (!formData.consent) {
      setError("Data storage consent is required for GDPR compliance.");
      return;
    }

    setIsLoading(true);

    try {
      const success = await submitInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        type: formData.type,
        message: formData.message,
        consent: formData.consent
      });

      if (success) {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError("System gateway error. Please contact us via phone: 0203 137 1752.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fa] py-20">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e91e8c]/5 text-[#e91e8c] text-xs font-black uppercase tracking-widest mb-6">
            <Sparkles size={14} /> Official Support Line
          </div>
          <h1 className="text-4xl md:text-7xl font-bold font-outfit mb-6 text-[#2d1f2d] tracking-tighter">Connect with us.</h1>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">
            All messages are monitored 24/7 by our UK-based specialists at <span className="text-[#e91e8c] font-black underline">info@swiftpolicy.co.uk</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12" id="contact-form" ref={formRef}>
          
          <div className="lg:col-span-2">
            <div className="bg-white p-10 md:p-16 rounded-[64px] border border-gray-100 shadow-2xl relative overflow-hidden transition-all duration-700">
              
              {isSubmitted ? (
                <div className="text-center animate-in zoom-in-95 duration-500 py-16">
                  <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-green-100 shadow-xl shadow-green-900/5">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                  <h2 className="text-4xl font-bold text-[#2d1f2d] mb-6 font-outfit">Message Logged</h2>
                  <p className="text-gray-500 text-xl max-w-md mx-auto mb-12">
                    Your inquiry has been successfully transmitted to <strong>info@swiftpolicy.co.uk</strong>. 
                    <br/><br/>
                    A confirmation receipt has been dispatched to <strong>{formData.email}</strong>.
                  </p>
                  <button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ ...formData, subject: '', message: '' });
                    }}
                    className="px-12 py-5 bg-[#2d1f2d] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#e91e8c]/10 rounded-2xl flex items-center justify-center text-[#e91e8c]">
                        <MessageSquare size={28} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold font-outfit text-[#2d1f2d]">Secure Message Box</h2>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em]">FCA Compliant Intake Form</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end">
                      <Clock className="text-[#e91e8c] mb-1" size={18} />
                      <p className="text-lg font-bold text-[#e91e8c]">~14m Reply</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {error && (
                      <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 text-sm font-bold animate-in shake duration-300">
                        <AlertCircle size={20} /> {error}
                      </div>
                    )}

                    <input type="text" className="hidden" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Full Legal Name *</label>
                        <input 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none transition-all focus:bg-white" 
                          placeholder="Your Name" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Contact Email *</label>
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none transition-all focus:bg-white" 
                          placeholder="email@address.com" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Telephone Number</label>
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none transition-all" 
                          placeholder="+44" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Inquiry Type *</label>
                        <div className="relative">
                          <select 
                            required
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value as InquiryType})}
                            className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none transition-all cursor-pointer pr-12"
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c} Support</option>)}
                          </select>
                          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={20} />
                        </div>
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Inquiry Subject *</label>
                        <input 
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-[#2d1f2d] font-bold focus:border-[#e91e8c] outline-none transition-all" 
                          placeholder="Summarize your request" 
                        />
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Full Message / Inquiry *</label>
                        <textarea 
                          required
                          rows={6} 
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[32px] px-8 py-6 text-[#2d1f2d] font-medium focus:border-[#e91e8c] outline-none transition-all resize-none" 
                          placeholder="Tell us what happened..."
                        ></textarea>
                      </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 space-y-6">
                      <label className="flex items-start gap-4 cursor-pointer group">
                        <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.consent ? 'bg-[#e91e8c] border-[#e91e8c]' : 'border-gray-200'}`}>
                           {formData.consent && <CheckCircle className="text-white" size={16} />}
                        </div>
                        <input type="checkbox" className="hidden" checked={formData.consent} onChange={(e) => setFormData({...formData, consent: e.target.checked})} />
                        <span className="text-sm font-bold text-gray-600">
                          I consent to having my information stored and used by SwiftPolicy to respond to my inquiry.
                        </span>
                      </label>

                      <div className="pt-4 border-t border-gray-200/50">
                        <label className="flex items-center gap-4 cursor-pointer">
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${humanFactor ? 'bg-green-500 border-green-500' : 'border-gray-200'}`}>
                             {humanFactor && <ShieldCheck className="text-white" size={16} />}
                           </div>
                           <input type="checkbox" className="hidden" checked={humanFactor} onChange={(e) => setHumanFactor(e.target.checked)} />
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                             Verification: I am a human user.
                           </span>
                        </label>
                      </div>
                    </div>

                    <button 
                      disabled={isLoading}
                      className="w-full py-6 bg-[#2d1f2d] text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Securely Transmit <Send size={20} /></>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl space-y-10">
              <h3 className="text-2xl font-bold font-outfit text-[#2d1f2d]">Direct Support</h3>
              
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#e91e8c]/10 flex items-center justify-center text-[#e91e8c]">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-1">UK Phone Line</p>
                  <p className="text-xl font-bold text-[#2d1f2d]">0203 137 1752</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Primary Support</p>
                  <p className="text-xl font-bold text-[#2d1f2d] break-all">info@swiftpolicy.co.uk</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#2d1f2d] to-[#1a1a2e] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
              <MapPin className="text-[#e91e8c] mb-6" size={32} />
              <h3 className="text-2xl font-bold font-outfit mb-6">Headquarters</h3>
              <p className="text-lg text-white/70 leading-relaxed font-bold">
                Crown House,<br />
                27 Old Gloucester Street,<br />
                London WC1N 3AX, UK
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
