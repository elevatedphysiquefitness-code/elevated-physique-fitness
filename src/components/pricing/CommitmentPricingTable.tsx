'use client';

import { useState } from 'react';
import { ArrowRight, X, Check, Loader2 } from 'lucide-react';

const commitmentPricing = {
  '3-month': { label: '3-Month', sublabel: 'Minimum', bestValue: false, prices: { 2: 345, 3: 520, 4: 690, 5: 865 } },
  '6-month': { label: '6-Month', sublabel: 'Recommended', bestValue: true, prices: { 2: 335, 3: 500, 4: 670, 5: 835 } },
  '1-year': { label: '1-Year', sublabel: 'Maximum Savings', bestValue: false, prices: { 2: 325, 3: 485, 4: 650, 5: 810 } },
};

type CommitmentKey = keyof typeof commitmentPricing;
type SessionsKey = 2 | 3 | 4 | 5;

export default function CommitmentPricingTable() {
  const [selectedCommitment, setSelectedCommitment] = useState<CommitmentKey | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<SessionsKey | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleCellClick = (commitment: CommitmentKey, sessions: SessionsKey) => {
    setSelectedCommitment(commitment);
    setSelectedSessions(sessions);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommitment || !selectedSessions) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/commitment-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          commitment: selectedCommitment,
          sessionsPerWeek: selectedSessions,
          monthlyPrice: commitmentPricing[selectedCommitment].prices[selectedSessions],
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    }

    setSubmitting(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitted(false);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const isSelected = (commitment: CommitmentKey, sessions: SessionsKey) => {
    return selectedCommitment === commitment && selectedSessions === sessions;
  };

  return (
    <>
      {/* Pricing Table */}
      <div className="max-w-4xl mx-auto overflow-x-auto">
        <table className="w-full bg-white border-2 border-[#3D2314]">
          <thead>
            <tr className="bg-[#3D2314] text-white">
              <th className="px-4 py-4 text-left font-semibold">Commitment</th>
              <th className="px-4 py-4 text-center font-semibold">2x/week</th>
              <th className="px-4 py-4 text-center font-semibold">3x/week</th>
              <th className="px-4 py-4 text-center font-semibold">4x/week</th>
              <th className="px-4 py-4 text-center font-semibold">5x/week</th>
            </tr>
          </thead>
          <tbody>
            {(Object.entries(commitmentPricing) as [CommitmentKey, typeof commitmentPricing['3-month']][]).map(
              ([key, commitment]) => (
                <tr
                  key={key}
                  className={`border-b border-grey-200 ${
                    commitment.bestValue ? 'bg-[#EBE4D6]/50' : 'hover:bg-[#EBE4D6]/30'
                  } transition-colors`}
                >
                  <td className="px-4 py-5 font-semibold text-[#3D2314]">
                    <div className="flex items-center gap-2">
                      {commitment.label}
                      {commitment.bestValue && (
                        <span className="bg-[#3D2314] text-white text-[10px] font-bold px-2 py-0.5">
                          BEST VALUE
                        </span>
                      )}
                    </div>
                    <span className="block text-xs text-grey-500 font-normal">{commitment.sublabel}</span>
                  </td>
                  {([2, 3, 4, 5] as SessionsKey[]).map((sessions) => (
                    <td key={sessions} className="px-2 py-3 text-center">
                      <button
                        onClick={() => handleCellClick(key, sessions)}
                        className={`w-full py-3 px-2 transition-all border-2 ${
                          isSelected(key, sessions)
                            ? 'border-[#3D2314] bg-[#3D2314] text-white'
                            : 'border-transparent hover:border-[#3D2314] hover:bg-[#EBE4D6]'
                        }`}
                      >
                        <span className={`text-xl font-bold ${isSelected(key, sessions) ? 'text-white' : commitment.bestValue ? 'text-[#3D2314]' : 'text-black'}`}>
                          ${commitment.prices[sessions]}
                        </span>
                        <span className={`text-sm ${isSelected(key, sessions) ? 'text-white/80' : 'text-grey-500'}`}>/mo</span>
                      </button>
                    </td>
                  ))}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="max-w-4xl mx-auto mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-[#6B4423]">
          <strong>Click any price</strong> to get started with that plan.
        </p>
        <p className="text-sm text-[#6B4423]">
          <strong>No commitment?</strong> See our monthly plans above.
        </p>
      </div>

      <p className="text-center text-sm text-[#6B4423] mt-8">
        Minimum commitment details and cancellation terms in our{' '}
        <a href="/policies" className="text-[#3D2314] underline hover:text-[#4D3324]">
          Policies page
        </a>
        .
      </p>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto">
            {!submitted ? (
              <>
                <div className="p-6 border-b border-grey-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#3D2314]">Get Started</h3>
                    <button onClick={closeModal} className="p-2 hover:bg-grey-100">
                      <X className="h-5 w-5 text-grey-500" />
                    </button>
                  </div>
                  {selectedCommitment && selectedSessions && (
                    <div className="mt-4 p-4 bg-[#EBE4D6]">
                      <p className="text-sm text-[#6B4423]">Selected Plan:</p>
                      <p className="text-lg font-bold text-[#3D2314]">
                        {commitmentPricing[selectedCommitment].label} Commitment • {selectedSessions}x/week
                      </p>
                      <p className="text-2xl font-bold text-[#3D2314] mt-1">
                        ${commitmentPricing[selectedCommitment].prices[selectedSessions]}/month
                      </p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-[#3D2314]"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-[#3D2314]"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-[#3D2314]"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-[#3D2314] resize-none"
                      placeholder="Any questions or goals you'd like to share..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#3D2314] text-white py-4 font-semibold hover:bg-[#4D3324] transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Inquiry
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-grey-500 text-center">
                    We'll reach out within 24 hours to finalize your membership.
                  </p>
                </form>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-[#3D2314] mb-2">Inquiry Submitted!</h3>
                <p className="text-grey-600 mb-6">
                  Thank you for your interest! We'll contact you within 24 hours to discuss your{' '}
                  {selectedCommitment && commitmentPricing[selectedCommitment].label} commitment plan.
                </p>
                <button
                  onClick={closeModal}
                  className="bg-[#3D2314] text-white px-6 py-3 font-semibold hover:bg-[#4D3324] transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
