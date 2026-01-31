'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Gift,
  Users,
  Share2,
  Copy,
  CheckCircle,
  Clock,
  DollarSign,
  Mail,
  X,
  Twitter,
  Facebook,
  MessageCircle,
} from 'lucide-react';

interface ReferralCode {
  id: string;
  code: string;
  total_referrals: number;
  successful_referrals: number;
  rewards_earned: number;
}

interface Referral {
  id: string;
  referred_email: string;
  referred_name: string | null;
  status: 'pending' | 'signed_up' | 'subscribed' | 'expired';
  reward_type: string;
  reward_amount: number;
  reward_claimed: boolean;
  created_at: string;
  converted_at: string | null;
}

const REWARD_AMOUNT = 25; // $25 credit per successful referral
const REFERRAL_DISCOUNT = 10; // 10% discount for referred person

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserName(profile.full_name || 'Friend');
    }

    // Get or create referral code
    let { data: codeData } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('client_id', user.id)
      .single();

    if (!codeData) {
      // Generate unique code
      const code = generateReferralCode(user.id);
      const { data: newCode } = await supabase
        .from('referral_codes')
        .insert({
          client_id: user.id,
          code: code,
        })
        .select()
        .single();

      codeData = newCode;
    }

    if (codeData) {
      setReferralCode(codeData);
    }

    // Get referrals
    const { data: referralData } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (referralData) {
      setReferrals(referralData);
    }

    setLoading(false);
  };

  const generateReferralCode = (userId: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'EP';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const getReferralLink = () => {
    if (!referralCode) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://elevatedphysiquefitness.com';
    return `${baseUrl}/register?ref=${referralCode.code}`;
  };

  const copyToClipboard = async () => {
    const link = getReferralLink();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = async () => {
    if (!userId || !inviteEmail) return;

    const supabase = createClient();

    await supabase.from('referrals').insert({
      referrer_id: userId,
      referred_email: inviteEmail,
      referred_name: inviteName || null,
      status: 'pending',
    });

    // Update local state
    setReferrals([
      {
        id: crypto.randomUUID(),
        referred_email: inviteEmail,
        referred_name: inviteName || null,
        status: 'pending',
        reward_type: 'none',
        reward_amount: 0,
        reward_claimed: false,
        created_at: new Date().toISOString(),
        converted_at: null,
      },
      ...referrals,
    ]);

    // Update referral code total
    if (referralCode) {
      await supabase
        .from('referral_codes')
        .update({ total_referrals: (referralCode.total_referrals || 0) + 1 })
        .eq('id', referralCode.id);

      setReferralCode({
        ...referralCode,
        total_referrals: (referralCode.total_referrals || 0) + 1,
      });
    }

    setShowInviteModal(false);
    setInviteEmail('');
    setInviteName('');
  };

  const shareOnTwitter = () => {
    const text = `I've been loving my fitness journey with Elevated Physique Fitness! Use my link to get ${REFERRAL_DISCOUNT}% off your first month:`;
    const url = getReferralLink();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = getReferralLink();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareViaText = () => {
    const text = `Hey! I've been using Elevated Physique Fitness and it's been amazing. Use my link to get ${REFERRAL_DISCOUNT}% off: ${getReferralLink()}`;
    window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      signed_up: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Signed Up' },
      subscribed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Subscribed' },
      expired: { bg: 'bg-grey-100', text: 'text-grey-700', label: 'Expired' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'signed_up');
  const successfulReferrals = referrals.filter(r => r.status === 'subscribed');
  const totalEarned = referralCode?.rewards_earned || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Referral Program</h1>
        <p className="mt-2 text-grey-600">Share the gains! Earn ${REWARD_AMOUNT} for every friend who subscribes.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{referralCode?.total_referrals || 0}</p>
                <p className="text-sm text-grey-500">Total Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{pendingReferrals.length}</p>
                <p className="text-sm text-grey-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{referralCode?.successful_referrals || 0}</p>
                <p className="text-sm text-grey-500">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">${totalEarned}</p>
                <p className="text-sm text-grey-500">Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Share Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your Referral Link */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                <h2 className="font-bold text-black">Your Referral Link</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  readOnly
                  value={getReferralLink()}
                  className="flex-1 px-4 py-3 bg-grey-100 border border-grey-200 rounded-lg text-grey-600 text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              <p className="text-sm text-grey-500 mb-4">
                Your code: <span className="font-bold text-black">{referralCode?.code}</span>
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={shareOnTwitter}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4267B2] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </button>
                <button
                  onClick={shareViaText}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="h-4 w-4" />
                  Text
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-grey-800 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Mail className="h-4 w-4" />
                  Email Invite
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Referral History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h2 className="font-bold text-black">Your Referrals</h2>
                </div>
                <span className="text-sm text-grey-500">{referrals.length} total</span>
              </div>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-grey-300 mx-auto mb-4" />
                  <p className="text-grey-500">No referrals yet. Start sharing your link!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-4 bg-grey-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-black">
                          {referral.referred_name || referral.referred_email}
                        </p>
                        {referral.referred_name && (
                          <p className="text-sm text-grey-500">{referral.referred_email}</p>
                        )}
                        <p className="text-xs text-grey-400 mt-1">
                          Invited {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(referral.status)}
                        {referral.status === 'subscribed' && (
                          <p className="text-sm text-green-600 font-medium mt-1">
                            +${REWARD_AMOUNT} earned
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div>
          <Card className="bg-gradient-to-br from-cinnamon to-chocolate text-white relative overflow-hidden">
            {/* EP Pattern */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='40' font-family='Arial, sans-serif' font-size='28' font-weight='bold' fill='%23ffffff'%3EEP%3C/text%3E%3Ctext x='60' y='80' font-family='Arial, sans-serif' font-size='28' font-weight='bold' fill='%23ffffff'%3EEP%3C/text%3E%3C/svg%3E")`,
              }}
            />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Gift className="h-6 w-6" />
                <h2 className="font-bold text-lg">How It Works</h2>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">Share Your Link</p>
                    <p className="text-biscotti text-sm">Send your unique referral link to friends</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">They Sign Up</p>
                    <p className="text-biscotti text-sm">They get {REFERRAL_DISCOUNT}% off their first month</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold">You Earn Rewards</p>
                    <p className="text-biscotti text-sm">${REWARD_AMOUNT} credit for each subscriber</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-sm text-biscotti">
                  No limit on referrals! The more friends you refer, the more you earn.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">Send Email Invite</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-grey-100 rounded-lg"
              >
                <X className="h-5 w-5 text-grey-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Friend&apos;s Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="John"
                  className="w-full px-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Friend&apos;s Email *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowInviteModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={sendInvite}
                variant="primary"
                className="flex-1"
                disabled={!inviteEmail}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
