'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadFile, generateFilePath } from '@/lib/supabase/storage';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Camera,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  X,
  Percent,
  Upload,
} from 'lucide-react';

interface Measurement {
  id: string;
  measurement_date: string;
  weight: number | null;
  body_fat_percentage: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  thigh: number | null;
  bicep: number | null;
  notes: string | null;
}

interface ProgressPhoto {
  id: string;
  photo_url: string;
  photo_type: string;
  photo_date: string;
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoType, setPhotoType] = useState<string>('front');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [newMeasurement, setNewMeasurement] = useState({
    weight: '',
    bodyFatPercentage: '',
    chest: '',
    waist: '',
    hips: '',
    thigh: '',
    bicep: '',
    notes: '',
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch measurements
    const { data: measurementData } = await supabase
      .from('measurements')
      .select('*')
      .eq('client_id', user.id)
      .order('measurement_date', { ascending: true });

    if (measurementData) {
      setMeasurements(measurementData);
    }

    // Fetch progress photos
    const { data: photoData } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('client_id', user.id)
      .order('photo_date', { ascending: true });

    if (photoData) {
      setPhotos(photoData);
    }

    setLoading(false);
  };

  const saveMeasurement = async () => {
    if (!newMeasurement.weight) return;

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('measurements')
      .insert({
        client_id: user.id,
        weight: newMeasurement.weight ? parseFloat(newMeasurement.weight) : null,
        body_fat_percentage: newMeasurement.bodyFatPercentage ? parseFloat(newMeasurement.bodyFatPercentage) : null,
        chest: newMeasurement.chest ? parseFloat(newMeasurement.chest) : null,
        waist: newMeasurement.waist ? parseFloat(newMeasurement.waist) : null,
        hips: newMeasurement.hips ? parseFloat(newMeasurement.hips) : null,
        thigh: newMeasurement.thigh ? parseFloat(newMeasurement.thigh) : null,
        bicep: newMeasurement.bicep ? parseFloat(newMeasurement.bicep) : null,
        notes: newMeasurement.notes || null,
      });

    if (error) {
      alert('Failed to save measurement. Please try again.');
      console.error('Error saving measurement:', error);
    } else {
      setNewMeasurement({
        weight: '',
        bodyFatPercentage: '',
        chest: '',
        waist: '',
        hips: '',
        thigh: '',
        bicep: '',
        notes: '',
      });
      setShowAddModal(false);
      fetchProgress();
    }

    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setUploadingPhoto(false);
      return;
    }

    const filePath = generateFilePath(user.id, 'progress', file.name);
    const result = await uploadFile('progress-photos', filePath, file);

    if ('error' in result) {
      alert('Failed to upload photo. Please try again.');
      setUploadingPhoto(false);
      return;
    }

    // Save photo record in the database
    const { error } = await supabase
      .from('progress_photos')
      .insert({
        client_id: user.id,
        photo_url: result.url,
        photo_type: photoType,
        storage_path: result.path,
        photo_date: new Date().toISOString().split('T')[0],
      });

    if (error) {
      alert('Failed to save photo record. Please try again.');
      console.error('Error saving photo:', error);
    } else {
      setShowPhotoModal(false);
      fetchProgress();
    }

    setUploadingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Calculate key metrics
  const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;
  const startingMeasurement = measurements.length > 0 ? measurements[0] : null;

  const startingWeight = startingMeasurement?.weight || null;
  const currentWeight = latestMeasurement?.weight || null;
  const weightChange = startingWeight && currentWeight ? currentWeight - startingWeight : null;

  const startingBodyFat = startingMeasurement?.body_fat_percentage || null;
  const currentBodyFat = latestMeasurement?.body_fat_percentage || null;
  const bodyFatChange = startingBodyFat && currentBodyFat ? currentBodyFat - startingBodyFat : null;

  // Get weight data for chart (last 8 entries)
  const weightData = measurements
    .filter(m => m.weight !== null)
    .slice(-8)
    .map((m, index) => ({
      week: index + 1,
      weight: m.weight as number,
      date: m.measurement_date,
    }));

  // Calculate body measurements changes
  const bodyMeasurements = latestMeasurement && startingMeasurement ? [
    {
      name: 'Chest',
      current: latestMeasurement.chest,
      start: startingMeasurement.chest,
      change: latestMeasurement.chest && startingMeasurement.chest
        ? latestMeasurement.chest - startingMeasurement.chest
        : null,
    },
    {
      name: 'Waist',
      current: latestMeasurement.waist,
      start: startingMeasurement.waist,
      change: latestMeasurement.waist && startingMeasurement.waist
        ? latestMeasurement.waist - startingMeasurement.waist
        : null,
    },
    {
      name: 'Hips',
      current: latestMeasurement.hips,
      start: startingMeasurement.hips,
      change: latestMeasurement.hips && startingMeasurement.hips
        ? latestMeasurement.hips - startingMeasurement.hips
        : null,
    },
    {
      name: 'Thigh',
      current: latestMeasurement.thigh,
      start: startingMeasurement.thigh,
      change: latestMeasurement.thigh && startingMeasurement.thigh
        ? latestMeasurement.thigh - startingMeasurement.thigh
        : null,
    },
    {
      name: 'Bicep',
      current: latestMeasurement.bicep,
      start: startingMeasurement.bicep,
      change: latestMeasurement.bicep && startingMeasurement.bicep
        ? latestMeasurement.bicep - startingMeasurement.bicep
        : null,
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  // Empty state - no measurements yet
  if (measurements.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Progress Tracking</h1>
          <p className="mt-2 text-grey-600">Track your transformation journey with data and visuals</p>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-grey-100 mx-auto mb-6 flex items-center justify-center">
              <Scale className="h-8 w-8 text-grey-400" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Start Tracking Your Progress</h2>
            <p className="text-grey-600 max-w-md mx-auto mb-6">
              Log your first measurement to begin tracking your fitness journey.
              Regular measurements help you and your coach monitor your progress.
            </p>
            <Button onClick={() => setShowAddModal(true)} variant="primary">
              <Plus className="mr-2 h-5 w-5" />
              Log Your First Measurement
            </Button>
          </CardContent>
        </Card>

        {/* Add Measurement Modal */}
        {showAddModal && (
          <MeasurementModal
            newMeasurement={newMeasurement}
            setNewMeasurement={setNewMeasurement}
            onSave={saveMeasurement}
            onClose={() => setShowAddModal(false)}
            saving={saving}
          />
        )}
      </div>
    );
  }

  const maxWeight = weightData.length > 0 ? Math.max(...weightData.map(d => d.weight)) : 0;
  const minWeight = weightData.length > 0 ? Math.min(...weightData.map(d => d.weight)) : 0;
  const range = maxWeight - minWeight || 10;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Progress Tracking</h1>
          <p className="mt-2 text-grey-600">
            Track your transformation journey with data and visuals
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary">
          <Plus className="mr-2 h-5 w-5" />
          Log Measurement
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-grey-500">Starting Weight</p>
                <p className="mt-2 text-2xl font-bold text-black">
                  {startingWeight ? `${startingWeight} lbs` : '--'}
                </p>
              </div>
              <div className="p-2 bg-grey-100">
                <Scale className="h-5 w-5 text-grey-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-grey-500">Current Weight</p>
                <p className="mt-2 text-2xl font-bold text-black">
                  {currentWeight ? `${currentWeight} lbs` : '--'}
                </p>
              </div>
              <div className="p-2 bg-grey-100">
                <Scale className="h-5 w-5 text-grey-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-grey-500">Weight Change</p>
                <p className={`mt-2 text-2xl font-bold ${
                  weightChange !== null && weightChange < 0 ? 'text-green-600' : 'text-black'
                }`}>
                  {weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} lbs` : '--'}
                </p>
              </div>
              <div className={`p-2 ${weightChange !== null && weightChange < 0 ? 'bg-green-100' : 'bg-grey-100'}`}>
                {weightChange !== null && weightChange < 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-grey-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-grey-500">Body Fat %</p>
                <p className={`mt-2 text-2xl font-bold ${
                  bodyFatChange !== null && bodyFatChange < 0 ? 'text-green-600' : 'text-black'
                }`}>
                  {currentBodyFat ? `${currentBodyFat}%` : '--'}
                </p>
                {bodyFatChange !== null && (
                  <p className={`text-xs ${bodyFatChange < 0 ? 'text-green-600' : 'text-grey-500'}`}>
                    {bodyFatChange > 0 ? '+' : ''}{bodyFatChange.toFixed(1)}%
                  </p>
                )}
              </div>
              <div className={`p-2 ${bodyFatChange !== null && bodyFatChange < 0 ? 'bg-green-100' : 'bg-grey-100'}`}>
                <Percent className="h-5 w-5 text-grey-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-grey-500">Entries Logged</p>
                <p className="mt-2 text-2xl font-bold text-black">{measurements.length}</p>
              </div>
              <div className="p-2 bg-grey-100">
                <Ruler className="h-5 w-5 text-grey-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weight Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black">Weight Progress</h2>
                <span className="text-sm text-grey-500">Last {weightData.length} entries</span>
              </div>
            </CardHeader>
            <CardContent>
              {weightData.length > 0 ? (
                <>
                  <div className="h-64 relative">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-grey-500">
                      <span>{maxWeight} lbs</span>
                      <span>{Math.round((maxWeight + minWeight) / 2)} lbs</span>
                      <span>{minWeight} lbs</span>
                    </div>

                    {/* Chart area */}
                    <div className="ml-14 h-full flex items-end gap-4 pb-8 border-l border-b border-grey-200">
                      {weightData.map((data, index) => {
                        const height = ((data.weight - minWeight) / range) * 100 + 10;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors relative group"
                              style={{ height: `${height}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {data.weight} lbs
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* X-axis labels */}
                    <div className="ml-14 flex gap-4 mt-2">
                      {weightData.map((data, index) => (
                        <div key={index} className="flex-1 text-center text-xs text-grey-500">
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {weightChange !== null && weightChange < 0 && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-green-600" />
                        <p className="text-green-800 font-medium">
                          Great progress! You&apos;ve lost {Math.abs(weightChange).toFixed(1)} lbs so far.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-grey-500">
                  Log weight measurements to see your chart
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Measurements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Body Measurements</h2>
              <Button onClick={() => setShowAddModal(true)} variant="ghost" size="sm">Update</Button>
            </div>
          </CardHeader>
          <CardContent>
            {bodyMeasurements.length > 0 && bodyMeasurements.some(m => m.current !== null) ? (
              <div className="space-y-4">
                {bodyMeasurements.filter(m => m.current !== null).map((m) => (
                  <div key={m.name} className="flex items-center justify-between p-3 bg-grey-100">
                    <div className="flex items-center gap-3">
                      <Ruler className="h-5 w-5 text-grey-400" />
                      <div>
                        <p className="font-medium text-black">{m.name}</p>
                        <p className="text-sm text-grey-500">{m.current}&quot;</p>
                      </div>
                    </div>
                    {m.change !== null && (
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        m.change < 0 ? 'text-green-600' : m.change > 0 ? 'text-blue-600' : 'text-grey-500'
                      }`}>
                        {m.change < 0 ? (
                          <ArrowDown className="h-4 w-4" />
                        ) : m.change > 0 ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                        {Math.abs(m.change).toFixed(1)}&quot;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Ruler className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm">
                  No body measurements logged yet
                </p>
                <Button onClick={() => setShowAddModal(true)} variant="outline" size="sm" className="mt-4">
                  Add Measurements
                </Button>
              </div>
            )}
            {latestMeasurement && (
              <p className="mt-4 text-xs text-grey-500 text-center">
                Last updated: {new Date(latestMeasurement.measurement_date).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Photos */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Progress Photos</h2>
              <Button onClick={() => setShowPhotoModal(true)} variant="primary" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Add Photos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {photos.slice(-3).map((photo) => (
                  <div key={photo.id}>
                    <div className="aspect-[3/4] bg-grey-200 overflow-hidden">
                      <img
                        src={photo.photo_url}
                        alt={`Progress photo - ${photo.photo_type}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <p className="font-semibold text-black capitalize">{photo.photo_type}</p>
                      <p className="text-sm text-grey-500">
                        {new Date(photo.photo_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="h-12 w-12 mx-auto text-grey-300 mb-4" />
                <h3 className="font-semibold text-black mb-2">No Progress Photos Yet</h3>
                <p className="text-grey-500 text-sm max-w-md mx-auto">
                  Take photos regularly to visually track your progress.
                  Front, side, and back photos work best.
                </p>
              </div>
            )}
            <p className="mt-6 text-center text-sm text-grey-500">
              Pro tip: Take photos in the same lighting and pose for best comparison
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Measurement Modal */}
      {showAddModal && (
        <MeasurementModal
          newMeasurement={newMeasurement}
          setNewMeasurement={setNewMeasurement}
          onSave={saveMeasurement}
          onClose={() => setShowAddModal(false)}
          saving={saving}
        />
      )}

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black">Upload Progress Photo</h3>
                <button onClick={() => setShowPhotoModal(false)} className="text-grey-400 hover:text-black">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Photo Type</label>
                  <select
                    value={photoType}
                    onChange={(e) => setPhotoType(e.target.value)}
                    className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="front">Front</option>
                    <option value="side">Side</option>
                    <option value="back">Back</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Choose Photo</label>
                  <div className="border-2 border-dashed border-grey-300 p-8 text-center hover:border-blue-500 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      {uploadingPhoto ? (
                        <div>
                          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                          <p className="text-grey-600 text-sm">Uploading...</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-grey-400 mb-3" />
                          <p className="text-grey-600 text-sm">Click to select a photo</p>
                          <p className="text-grey-400 text-xs mt-1">JPG, PNG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={() => setShowPhotoModal(false)} variant="outline" className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Measurement Modal Component
function MeasurementModal({
  newMeasurement,
  setNewMeasurement,
  onSave,
  onClose,
  saving,
}: {
  newMeasurement: {
    weight: string;
    bodyFatPercentage: string;
    chest: string;
    waist: string;
    hips: string;
    thigh: string;
    bicep: string;
    notes: string;
  };
  setNewMeasurement: React.Dispatch<React.SetStateAction<{
    weight: string;
    bodyFatPercentage: string;
    chest: string;
    waist: string;
    hips: string;
    thigh: string;
    bicep: string;
    notes: string;
  }>>;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-black">Log Measurement</h3>
            <button
              onClick={onClose}
              className="text-grey-400 hover:text-black"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Weight (lbs) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.weight}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, weight: e.target.value })}
                  placeholder="e.g., 180.5"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Body Fat %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.bodyFatPercentage}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, bodyFatPercentage: e.target.value })}
                  placeholder="e.g., 18"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Chest (inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.chest}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, chest: e.target.value })}
                  placeholder="e.g., 42"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Waist (inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.waist}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, waist: e.target.value })}
                  placeholder="e.g., 34"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Hips (inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.hips}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, hips: e.target.value })}
                  placeholder="e.g., 40"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Thigh (inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.thigh}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, thigh: e.target.value })}
                  placeholder="e.g., 24"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Bicep (inches)
              </label>
              <input
                type="number"
                step="0.1"
                value={newMeasurement.bicep}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, bicep: e.target.value })}
                placeholder="e.g., 15"
                className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Notes (optional)
              </label>
              <textarea
                value={newMeasurement.notes}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
                placeholder="Any notes about this measurement..."
                rows={3}
                className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={onSave}
              variant="primary"
              className="flex-1"
              disabled={!newMeasurement.weight || saving}
            >
              {saving ? 'Saving...' : 'Save Measurement'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
