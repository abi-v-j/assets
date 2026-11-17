import React, { useState } from 'react';
import CustomInput from '../../utilities/inputs/CustomInput';
import CustomTextarea from '../../utilities/inputs/CustomTextarea';
import CustomButton from '../../utilities/buttons/CustomButton';
import Navbar from '../components/Navbar';

interface ContactProps {
  embedded?: boolean;
}

const Contact: React.FC<ContactProps> = ({ embedded = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 600);
  };

  const content = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          Get in Touch
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          We&apos;d Love to Hear From You
        </h2>
        <p className="mt-3 text-base text-slate-500">
          Have questions about deploying OmniERP or integrating stored procedures? Our team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800">Global Headquarters</h3>
            <p className="text-xs text-slate-500 mt-1">
              450 Innovation Blvd, Suite 800<br />Silicon Valley, CA 94025
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800">Direct Support</h3>
            <p className="text-xs text-slate-500 mt-1">
              support@omnierp.company<br />response time: under 2 hours
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800">Operating Hours</h3>
            <p className="text-xs text-slate-500 mt-1">
              Monday &ndash; Friday: 9am &ndash; 6pm EST<br />24/7 Priority Emergency Support
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Thank you for contacting us. A solutions architect will follow up with you shortly.
              </p>
              <div className="mt-6">
                <CustomButton
                  name="Send Another Message"
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitted(false)}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Your Name *
                  </label>
                  <CustomInput
                    id="contact-name"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email Address *
                  </label>
                  <CustomInput
                    id="contact-email"
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Subject
                </label>
                <CustomInput
                  id="contact-subject"
                  placeholder="e.g. Multi-tenant database deployment inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Message *
                </label>
                <CustomTextarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="How can our enterprise engineering team help your organization?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <CustomButton
                  name={loading ? 'Sending Message...' : 'Send Message'}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 font-semibold text-sm shadow-md"
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between">
      <div>
        <Navbar />
        {content}
      </div>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        OmniERP Suite &copy; 2026. High-performance enterprise operations.
      </footer>
    </div>
  );
};

export default Contact;
