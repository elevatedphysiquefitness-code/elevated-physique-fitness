'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Dumbbell,
  Scale,
  Target,
  ClipboardCheck,
  MessageSquare,
  X,
  Save,
} from 'lucide-react';
import Link from 'next/link';

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  role: string;
}

interface ClientDetails {
  fitness_goals: string[] | null;
  fitness_level: string | null;
  available_equipment: string | null;
  workout_days_per_week: number | null;
  injuries: string[] | null;
  onboarding_completed: boolean;
}

interface ClientProgram {
  id: string;
  program_name: string;
  current_week: number;
  total_weeks: number;
  status: string;
  start_date: string;
  program_id: string;
}

interface WorkoutProgram {
  id: string;
  title: string;
  description: string;
  duration_weeks: number;
}

interface Measurement {
  measurement_date: string;
  weight: number | null;
  body_fat_percentage: number | null;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [details, setDetails] = useState<ClientDetails | null>(null);
  const [programs, setPrograms] = useState<ClientProgram[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [allPrograms, setAllPrograms] = useState<WorkoutProgram[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    const supabase = createClient();

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clientId)
      .single();
    if (profileData) setProfile(profileData);

    // Fetch client details
    const { data: detailsData } = await supabase
      .from('client_details')
      .select('*')
      .eq('user_id', clientId)
      .single();
    if (detailsData) setDetails(detailsData);

    // Fetch assigned programs
    const { data: programData } = await supabase
      .from('client_programs')
      .select('*')
      .eq('client_id', clientId)
      .order('assigned_at', { ascending: false });
    if (programData) setPrograms(programData);

    // Fetch recent measurements
    const { data: measurementData } = await supabase
      .from('measurements')
      .select('measurement_date, weight, body_fat_percentage')
      .eq('client_id', clientId)
      .order('measurement_date', { ascending: false })
      .limit(5);
    if (measurementData) setMeasurements(measurementData);

    // Fetch all available programs for assignment
    const { data: allProgramData } = await supabase
      .from('workout_programs')
      .select('id, title, description, duration_weeks')
      .order('title');
    if (allProgramData) setAllPrograms(allProgramData);

    setLoading(false);
  };

  const assignProgram = async () => {
    if (!selectedProgramId) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const selectedProgram = allPrograms.find(p => p.id === selectedProgramId);

    // Deactivate existing programs
    await supabase
      .from('client_programs')
      .update({ status: 'completed' })
      .eq('client_id', clientId)
      .eq('status', 'active');

    // Assign new program
    const { error } = await supabase
      .from('client_programs')
      .insert({
        client_id: clientId,
        program_id: selectedProgramId,
        program_name: selectedProgram?.title || 'Program',
        start_date: new Date().toISOString().split('T')[0],
        current_week: 1,
        total_weeks: selectedProgram?.duration_weeks || 12,
        status: 'active',
        assigned_by: user?.id,
        assignment_notes: assignmentNotes || null,
        is_custom: false,
      });

    if (!error) {
      setShowAssignModal(false);
      setSelectedProgramId('');
      setAssignmentNotes('');
      fetchClientData();
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-grey-500">Client not found</p>
        <Button href="/admin/clients" variant="outline" className="mt-4">Back to Clients</Button>
      </div>
    );
  }

  const activeProgram = programs.find(p => p.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-grey-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-grey-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-black">{profile.full_name || 'Client'}</h1>
          <p className="text-grey-600">{profile.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/messages?client=${clientId}`}>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </Link>
          <Button onClick={() => setShowAssignModal(true)} variant="primary">
            <Dumbbell className="h-4 w-4 mr-2" />
            Assign Program
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-black flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Client Info
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-grey-500">Email</p>
              <p className="text-sm text-black">{profile.email}</p>
            </div>
            {profile.phone && (
              <div>
                <p className="text-xs text-grey-500">Phone</p>
                <p className="text-sm text-black">{profile.phone}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-grey-500">Joined</p>
              <p className="text-sm text-black">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>
            {details && (
              <>
                {details.fitness_level && (
                  <div>
                    <p className="text-xs text-grey-500">Fitness Level</p>
                    <p className="text-sm text-black capitalize">{details.fitness_level}</p>
                  </div>
                )}
                {details.fitness_goals && details.fitness_goals.length > 0 && (
                  <div>
                    <p className="text-xs text-grey-500">Goals</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {details.fitness_goals.map(g => (
                        <span key={g} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5">{g.replace('_', ' ')}</span>
                      ))}
                    </div>
                  </div>
                )}
                {details.available_equipment && (
                  <div>
                    <p className="text-xs text-grey-500">Equipment</p>
                    <p className="text-sm text-black capitalize">{details.available_equipment.replace('_', ' ')}</p>
                  </div>
                )}
                {details.injuries && details.injuries.length > 0 && (
                  <div>
                    <p className="text-xs text-grey-500">Injuries / Conditions</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {details.injuries.map(i => (
                        <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5">{i.replace('_', ' ')}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Current Program */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-black flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Current Program
            </h2>
          </CardHeader>
          <CardContent>
            {activeProgram ? (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-black">{activeProgram.program_name}</p>
                  <p className="text-sm text-grey-500">
                    Week {activeProgram.current_week} of {activeProgram.total_weeks}
                  </p>
                </div>
                <div className="h-2 bg-grey-200">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${(activeProgram.current_week / activeProgram.total_weeks) * 100}%` }}
                  />
                </div>
                <div className="text-sm text-grey-600">
                  Started: {new Date(activeProgram.start_date).toLocaleDateString()}
                </div>
                <Button onClick={() => setShowAssignModal(true)} variant="outline" className="w-full">
                  Change Program
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Dumbbell className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm mb-4">No active program</p>
                <Button onClick={() => setShowAssignModal(true)} variant="primary" className="w-full">
                  Assign Program
                </Button>
              </div>
            )}

            {programs.length > 1 && (
              <div className="mt-6 pt-4 border-t border-grey-200">
                <p className="text-xs text-grey-500 mb-2">Previous Programs</p>
                {programs.filter(p => p.status !== 'active').slice(0, 3).map(p => (
                  <div key={p.id} className="flex justify-between text-sm py-1">
                    <span className="text-grey-600">{p.program_name}</span>
                    <span className="text-grey-400 capitalize">{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Measurements */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-black flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              Recent Measurements
            </h2>
          </CardHeader>
          <CardContent>
            {measurements.length > 0 ? (
              <div className="space-y-3">
                {measurements.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-grey-50">
                    <div>
                      <p className="text-sm text-grey-500">
                        {new Date(m.measurement_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {m.weight && <p className="font-semibold text-black">{m.weight} lbs</p>}
                      {m.body_fat_percentage && (
                        <p className="text-xs text-grey-500">{m.body_fat_percentage}% BF</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Scale className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm">No measurements logged yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign Program Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black">Assign Program</h3>
                <button onClick={() => setShowAssignModal(false)} className="text-grey-400 hover:text-black">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Select Program *
                  </label>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Choose a program...</option>
                    {allPrograms.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.duration_weeks} weeks)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProgramId && (
                  <div className="bg-blue-50 p-3 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      {allPrograms.find(p => p.id === selectedProgramId)?.description || 'No description'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Assignment Notes (optional)
                  </label>
                  <textarea
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    rows={3}
                    placeholder="Notes about this assignment..."
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>

                {activeProgram && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3">
                    <p className="text-sm text-yellow-800">
                      This will replace the current program: <strong>{activeProgram.program_name}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={() => setShowAssignModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={assignProgram}
                  variant="primary"
                  className="flex-1"
                  disabled={saving || !selectedProgramId}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Assigning...' : 'Assign Program'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
