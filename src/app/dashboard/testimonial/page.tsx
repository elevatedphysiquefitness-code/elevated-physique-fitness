'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Star,
  MessageSquare,
  CheckCircle,
  Camera,
  Send,
  Heart,
} from 'lucide-react';

interface ExistingTestimonial {
  id: string;
  rating: number;
  testimonial_text: string;
  results_achieved: string | null;
  status: string;
  submitted_at: string;
}

export default function TestimonialPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingTestimonial, setExistingTestimonial] = useState<ExistingTestimonial | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const [formData, setFormData] = useState({
    rating: 5,
    testimonial_text: '',
    results_achieved: '',
    is_anonymous: false,
  });

  useEffect(() => {
    checkExistingTestimonial();
  }, []);

  const checkExistingTestimonial = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    // Get user name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserName(profile.full_name || '');
    }

    // Check for existing testimonial
    const { data: testimonial } = await supabase
      .from('testimonials')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (testimonial) {
      setExistingTestimonial(testimonial);
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!userId || !formData.testimonial_text) return;

    setSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.from('testimonials').insert({
      client_id: userId,
      rating: formData.rating,
      testimonial_text: formData.testimonial_text,
      results_achieved: formData.results_achieved || null,
      is_anonymous: formData.is_anonymous,
      status: 'pending',
    });

    if (!error) {
      setSubmitted(true);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  // Already submitted
  if (submitted || existingTestimonial) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">
              Thank You for Your Testimonial!
            </h1>
            <p className="text-grey-600 mb-6">
              Your feedback means the world to us. We&apos;ll review your testimonial and may feature it on our website.
            </p>

            {existingTestimonial && (
              <div className="bg-grey-50 rounded-lg p-6 text-left">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= existingTestimonial.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-grey-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-grey-700 italic">&ldquo;{existingTestimonial.testimonial_text}&rdquo;</p>
                {existingTestimonial.results_achieved && (
                  <p className="text-sm text-grey-500 mt-3">
                    Results: {existingTestimonial.results_achieved}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    existingTestimonial.status === 'approved' || existingTestimonial.status === 'featured'
                      ? 'bg-green-100 text-green-700'
                      : existingTestimonial.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-grey-100 text-grey-700'
                  }`}>
                    {existingTestimonial.status.charAt(0).toUpperCase() + existingTestimonial.status.slice(1)}
                  </span>
                  <span className="text-xs text-grey-500">
                    Submitted {new Date(existingTestimonial.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            <Button href="/dashboard" variant="outline" className="mt-6">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-black">Share Your Experience</h1>
        <p className="mt-2 text-grey-600">
          Your feedback helps others discover the power of personalized fitness coaching
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-grey-700 mb-3">
              How would you rate your experience? *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= formData.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-grey-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-grey-500 mt-2">
              {formData.rating === 5 && 'Excellent! We love to hear that!'}
              {formData.rating === 4 && 'Great! Thank you for your feedback!'}
              {formData.rating === 3 && 'Good - we appreciate your honesty!'}
              {formData.rating <= 2 && 'We\'d love to hear how we can improve.'}
            </p>
          </div>

          {/* Testimonial Text */}
          <div>
            <label className="block text-sm font-medium text-grey-700 mb-2">
              Tell us about your experience *
            </label>
            <textarea
              value={formData.testimonial_text}
              onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
              placeholder="What did you enjoy most? How has your fitness journey changed? What would you tell someone considering our coaching?"
              rows={5}
              className="w-full px-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-grey-500 mt-1">
              {formData.testimonial_text.length} characters
            </p>
          </div>

          {/* Results */}
          <div>
            <label className="block text-sm font-medium text-grey-700 mb-2">
              What results have you achieved? (optional)
            </label>
            <input
              type="text"
              value={formData.results_achieved}
              onChange={(e) => setFormData({ ...formData, results_achieved: e.target.value })}
              placeholder="e.g., Lost 20 lbs, Gained muscle, More energy, etc."
              className="w-full px-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.is_anonymous}
              onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
              className="mt-1 rounded border-grey-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="anonymous" className="text-sm text-grey-600">
              <span className="font-medium text-black">Keep me anonymous</span>
              <br />
              Your testimonial will be displayed without your name
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!formData.testimonial_text || submitting}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Submit Testimonial
                </>
              )}
            </Button>
            <p className="text-xs text-grey-500 text-center mt-3">
              By submitting, you agree that we may use your testimonial on our website and marketing materials.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
