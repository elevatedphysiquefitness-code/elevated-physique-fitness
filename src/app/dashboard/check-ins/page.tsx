'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Camera,
  Send,
  ChevronRight,
  ClipboardList,
  X,
} from 'lucide-react';

interface CheckIn {
  id: string;
  week_number: number;
  weight: number | null;
  sleep_quality: string | null;
  energy_level: number | null;
  adherence: string | null;
  notes: string | null;
  coach_feedback: string | null;
  status: 'pending' | 'reviewed';
  created_at: string;
}

interface ClientProgram {
  id: string;
  start_date: string;
  current_week: number;
}

export default function CheckInsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pastCheckIns, setPastCheckIns] = useState<CheckIn[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [hasSubmittedThisWeek, setHasSubmittedThisWeek] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);

  // Form state
  const [currentWeight, setCurrentWeight] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [energyLevel, setEnergyLevel] = useState('');
  const [adherence, setAdherence] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchCheckIns();
  }, []);

  const fetchCheckIns = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get client's active program to determine current week
      const { data: program } = await supabase
        .from('client_programs')
        .select('id, start_date, current_week')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single();

      if (program) {
        // Calculate week based on start date
        const startDate = new Date(program.start_date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const calculatedWeek = Math.ceil(diffDays / 7);
        setCurrentWeek(Math.max(1, calculatedWeek));
      }

      // Fetch past check-ins
      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('*')
        .eq('client_id', user.id)
        .order('week_number', { ascending: false });

      if (checkIns) {
        setPastCheckIns(checkIns);

        // Check if already submitted this week
        const thisWeekCheckIn = checkIns.find(c => c.week_number === currentWeek);
        setHasSubmittedThisWeek(!!thisWeekCheckIn);
      }
    } catch (err) {
      console.error('Error fetching check-ins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentWeight || !sleepQuality || !energyLevel || !adherence) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('check_ins')
        .insert({
          client_id: user.id,
          week_number: currentWeek,
          weight: parseFloat(currentWeight),
          sleep_quality: sleepQuality.toLowerCase(),
          energy_level: parseInt(energyLevel),
          adherence: adherence,
          notes: notes || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting check-in:', error);
        alert('Failed to submit check-in. Please try again.');
      } else if (data) {
        // Reset form
        setCurrentWeight('');
        setSleepQuality('');
        setEnergyLevel('');
        setAdherence('');
        setNotes('');

        // Refresh check-ins
        setPastCheckIns([data, ...pastCheckIns]);
        setHasSubmittedThisWeek(true);
      }
    } catch (err) {
      console.error('Error submitting check-in:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDueDate = () => {
    // Check-ins are due on Sundays
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysUntilSunday);
    return sunday.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0) return 0;
    return 7 - dayOfWeek;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Weekly Check-ins</h1>
        <p className="text-grey-600 mt-1">
          Submit your weekly progress and receive personalized feedback from your coach.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-in Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-black">Week {currentWeek} Check-in</h2>
                  <p className="text-sm text-grey-500">Due: {getDueDate()}</p>
                </div>
                {hasSubmittedThisWeek ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Submitted</span>
                  </div>
                ) : daysRemaining > 0 ? (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm font-medium">{daysRemaining} days remaining</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm font-medium">Due today!</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {hasSubmittedThisWeek ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold text-black mb-2">Check-in Submitted!</h3>
                  <p className="text-grey-600">
                    Your Week {currentWeek} check-in has been submitted. Your coach will review it soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Current Weight (lbs) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      placeholder="e.g., 180"
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  {/* Sleep Quality */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Average Sleep Quality *
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {['Poor', 'Fair', 'Good', 'Great', 'Excellent'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSleepQuality(option)}
                          className={`py-3 text-sm font-medium border transition-colors ${
                            sleepQuality === option
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-grey-300 text-grey-600 hover:border-blue-600'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Energy Level */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Average Energy Level *
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {['1', '2', '3', '4', '5'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setEnergyLevel(level)}
                          className={`py-3 text-sm font-medium border transition-colors ${
                            energyLevel === level
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-grey-300 text-grey-600 hover:border-blue-600'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-grey-500 mt-1">1 = Very Low, 5 = Very High</p>
                  </div>

                  {/* Program Adherence */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Program Adherence *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['< 50%', '50-75%', '75-90%', '90-100%'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setAdherence(option)}
                          className={`py-3 text-sm font-medium border transition-colors ${
                            adherence === option
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-grey-300 text-grey-600 hover:border-blue-600'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progress Photos */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Progress Photos (Optional)
                    </label>
                    <div className="border-2 border-dashed border-grey-300 p-8 text-center hover:border-blue-600 transition-colors cursor-pointer">
                      <Camera className="h-10 w-10 mx-auto text-grey-400" />
                      <p className="mt-2 text-grey-600">Click to upload photos</p>
                      <p className="text-xs text-grey-500 mt-1">Front, side, and back recommended</p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Notes / Questions for Coach
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Any wins, struggles, or questions this week?"
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Check-in'}
                    <Send className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Check-in Tips */}
          <Card className="bg-blue-600 text-white">
            <CardContent className="p-6">
              <h3 className="font-semibold">Check-in Tips</h3>
              <ul className="mt-4 space-y-3 text-sm text-blue-100">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Weigh yourself first thing in the morning
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Take photos in the same lighting
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Be honest about adherence
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Include any questions you have
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Past Check-ins */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-black">Past Check-ins</h3>
            </CardHeader>
            <CardContent>
              {pastCheckIns.length > 0 ? (
                <div className="space-y-3">
                  {pastCheckIns.map((checkIn) => (
                    <button
                      key={checkIn.id}
                      onClick={() => setSelectedCheckIn(checkIn)}
                      className="w-full flex items-center justify-between p-3 bg-grey-100 hover:bg-grey-200 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 flex items-center justify-center ${
                          checkIn.status === 'reviewed' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {checkIn.status === 'reviewed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">Week {checkIn.week_number}</p>
                          <p className="text-xs text-grey-500">{formatDate(checkIn.created_at)}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-grey-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ClipboardList className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                  <p className="text-grey-500 text-sm">No check-ins yet</p>
                  <p className="text-grey-400 text-xs mt-1">Submit your first check-in above</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Check-in Detail Modal */}
      {selectedCheckIn && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCheckIn(null)}
        >
          <div
            className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black">Week {selectedCheckIn.week_number} Check-in</h3>
                <button
                  onClick={() => setSelectedCheckIn(null)}
                  className="text-grey-400 hover:text-black"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-grey-200">
                  <span className="text-grey-600">Date</span>
                  <span className="font-medium text-black">{formatDate(selectedCheckIn.created_at)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-grey-200">
                  <span className="text-grey-600">Weight</span>
                  <span className="font-medium text-black">{selectedCheckIn.weight} lbs</span>
                </div>
                <div className="flex justify-between py-2 border-b border-grey-200">
                  <span className="text-grey-600">Sleep Quality</span>
                  <span className="font-medium text-black">{selectedCheckIn.sleep_quality}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-grey-200">
                  <span className="text-grey-600">Energy Level</span>
                  <span className="font-medium text-black">{selectedCheckIn.energy_level}/5</span>
                </div>
                <div className="flex justify-between py-2 border-b border-grey-200">
                  <span className="text-grey-600">Adherence</span>
                  <span className="font-medium text-black">{selectedCheckIn.adherence}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-grey-200">
                  <span className="text-grey-600">Status</span>
                  <span className={`font-medium ${
                    selectedCheckIn.status === 'reviewed' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {selectedCheckIn.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
                  </span>
                </div>

                {selectedCheckIn.notes && (
                  <div className="py-2">
                    <span className="text-grey-600 block mb-2">Your Notes</span>
                    <p className="text-black bg-grey-100 p-3">{selectedCheckIn.notes}</p>
                  </div>
                )}

                {selectedCheckIn.coach_feedback && (
                  <div className="py-2">
                    <span className="text-grey-600 block mb-2">Coach Feedback</span>
                    <p className="text-black bg-blue-50 p-3 border-l-4 border-blue-600">
                      {selectedCheckIn.coach_feedback}
                    </p>
                  </div>
                )}

                {selectedCheckIn.status === 'pending' && !selectedCheckIn.coach_feedback && (
                  <div className="py-2">
                    <p className="text-grey-500 text-sm text-center">
                      Your coach will review this check-in soon and provide feedback.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedCheckIn(null)}
                className="mt-6 w-full py-3 bg-grey-100 text-black font-medium hover:bg-grey-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
