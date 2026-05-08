'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Trophy, Star, Lock, CheckCircle2, TrendingUp,
  Medal, Crown, Zap, Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore, Reward, LeaderboardEntry } from '@/lib/store';
import { api } from '@/lib/api';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function RewardsView() {
  const { currentUser, setCurrentView, setAuthDialogOpen, setAuthDialogMode } = useAppStore();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.rewards.list(), api.rewards.leaderboard()])
      .then(([r, l]) => {
        setRewards(r);
        setLeaderboard(l);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const earnedRewardIds = new Set(
    rewards.filter((r) => currentUser && currentUser.points >= r.pointsRequired).map((r) => r.id)
  );

  const nextReward = rewards.find((r) => currentUser && currentUser.points < r.pointsRequired);
  const prevReward = rewards.filter((r) => currentUser && currentUser.points >= r.pointsRequired).pop();
  const progressPercent = nextReward && prevReward
    ? ((currentUser!.points - prevReward.pointsRequired) / (nextReward.pointsRequired - prevReward.pointsRequired)) * 100
    : nextReward
    ? (currentUser!.points / nextReward.pointsRequired) * 100
    : 100;

  const rewardIcons: Record<string, string> = {
    'First Donation': '🩸',
    'Regular Donor': '⭐',
    'Five Club': '🤝',
    'Life Saver': '❤️',
    'Hero Award': '🏆',
    'Community Champion': '🎖️',
  };

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-500" />;
    return <span className="flex h-5 w-5 items-center justify-center text-xs font-bold text-muted-foreground">{rank}</span>;
  };

  const rankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    return '';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div {...fadeUp} className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Rewards & Recognition
        </h1>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
          Earn points for every donation and unlock achievements. Climb the leaderboard and get recognized for saving lives.
        </p>
      </motion.div>

      {!currentUser ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h2 className="mb-2 text-xl font-bold">Sign in to view your rewards</h2>
            <p className="mb-4 text-muted-foreground">Join LifeBlood Connect to start earning points and badges.</p>
            <Button className="bg-primary text-white" onClick={() => { setAuthDialogMode('login'); setAuthDialogOpen(true); }}>
              Sign In
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Points Summary */}
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }}>
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-red-700 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Your Points</p>
                    <p className="text-4xl font-extrabold text-white">{currentUser.points}</p>
                    <p className="mt-1 text-sm text-white/70">
                      {currentUser.totalDonations} donations made
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm font-medium text-white/80">
                      {nextReward ? `Next: ${nextReward.name}` : 'All rewards unlocked!'}
                    </p>
                    {nextReward && (
                      <>
                        <p className="text-2xl font-bold text-white">{nextReward.pointsRequired} pts</p>
                        <Progress
                          value={progressPercent}
                          className="mt-2 h-2.5 bg-white/20 [&>div]:bg-white"
                        />
                        <p className="mt-1 text-xs text-white/70">
                          {nextReward.pointsRequired - currentUser.points} points to go
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Rewards Grid */}
            <div className="lg:col-span-3">
              <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }}>
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className="h-5 w-5 text-amber-500" /> Available Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-28 w-full rounded-xl" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {rewards.map((reward, i) => {
                          const earned = earnedRewardIds.has(reward.id);
                          return (
                            <motion.div
                              key={reward.id}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05, duration: 0.3 }}
                              className={`relative rounded-xl border p-4 transition-all ${
                                earned
                                  ? 'border-green-200 bg-green-50/50'
                                  : 'border-border/50 bg-white'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                                  earned ? 'bg-green-100' : 'bg-muted'
                                }`}>
                                  {earned ? rewardIcons[reward.name] || reward.icon : '🔒'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-foreground truncate">{reward.name}</p>
                                    {earned && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />}
                                  </div>
                                  <p className="mt-0.5 text-xs text-muted-foreground">{reward.description}</p>
                                  <Badge variant="outline" className={`mt-2 text-xs ${
                                    earned ? 'border-green-200 text-green-700' : ''
                                  }`}>
                                    <Zap className="mr-1 h-3 w-3" /> {reward.pointsRequired} points
                                  </Badge>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:col-span-2">
              {/* How Points Work */}
              <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }}>
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Info className="h-5 w-5 text-primary" /> How Points Work
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { pts: '10 pts', desc: 'Per blood donation', icon: '🩸' },
                      { pts: '25 pts', desc: 'Regular Donor (3 donations)', icon: '⭐' },
                      { pts: '50 pts', desc: 'Five Club (5 donations)', icon: '🤝' },
                      { pts: '100 pts', desc: 'Life Saver (10 donations)', icon: '❤️' },
                      { pts: '150 pts', desc: 'Hero Award (15 donations)', icon: '🏆' },
                      { pts: '200 pts', desc: 'Community Champion', icon: '🎖️' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.pts}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Leaderboard */}
              <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }}>
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Trophy className="h-5 w-5 text-amber-500" /> Top Donors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                      </div>
                    ) : (
                      <div className="max-h-96 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                        {leaderboard.map((entry, i) => {
                          const isCurrentUser = entry.id === currentUser.id;
                          return (
                            <div
                              key={entry.id}
                              className={`flex items-center gap-3 rounded-lg border p-2.5 transition-all ${
                                isCurrentUser
                                  ? 'border-primary/30 bg-primary/5'
                                  : rankBg(i + 1) || 'border-transparent'
                              }`}
                            >
                              <div className="shrink-0">{rankIcon(i + 1)}</div>
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-red-600 text-xs font-bold text-white">
                                {entry.name?.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                                  {entry.name}{isCurrentUser && ' (You)'}
                                </p>
                                <p className="text-xs text-muted-foreground">{entry.city || ''}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-foreground">{entry.points}</p>
                                <p className="text-xs text-muted-foreground">{entry.totalDonations} donations</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
