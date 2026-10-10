import React, { useState, useEffect } from 'react';
import { awardPoints } from '../../services/pointsService';
import { demoUsers } from '../../lib/demoData';
import { db, isFirebaseReady } from '../../lib/firebase';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { collection, getDocs } from 'firebase/firestore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Award,
  PlusCircle,
  MinusCircle,
  Search,
  Sparkles,
  User,
  ShieldCheck,
  History,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface MemberItem {
  uid: string;
  fullName: string;
  email: string;
  totalPoints: number;
  memberId: string;
}

export const PointsManagement = () => {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
  const [pointsAmount, setPointsAmount] = useState<number>(100);
  const [reason, setReason] = useState<string>('Workshop Speaker Contribution');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const list: MemberItem[] = data.map((d: any) => ({
            uid: d.id,
            fullName: d.full_name || 'Operative',
            email: d.email || '',
            totalPoints: Number(d.xp || 0),
            memberId: d.member_id || 'DC-000',
          }));
          setMembers(list);
          setLoading(false);
          return;
        }
      }

      if (isFirebaseReady) {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          const list: MemberItem[] = snap.docs.map(d => {
            const data = d.data();
            return {
              uid: d.id,
              fullName: data.fullName || 'Operative',
              email: data.email || '',
              totalPoints: Number(data.totalPoints) || 0,
              memberId: data.memberId || 'DC-000',
            };
          });
          setMembers(list);
          setLoading(false);
          return;
        }
      }

      // Demo fallback
      const demoList: MemberItem[] = demoUsers.map((u: any, idx: number) => ({
        uid: u.uid || `demo-${idx}`,
        fullName: u.fullName,
        email: u.email,
        totalPoints: (4 - idx) * 350 + 100,
        memberId: u.memberId,
      }));
      setMembers(demoList);
    } catch (err) {
      console.error('Error fetching members for points:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleGrantBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !pointsAmount) return;

    setIsSubmitting(true);
    if (isSupabaseConfigured) {
      try {
        const { data: prof } = await supabase.from('profiles').select('xp').eq('id', selectedMember.uid).single();
        const currentPoints = Number(prof?.xp || 0);
        const newPoints = Math.max(0, currentPoints + pointsAmount);
        await supabase.from('profiles').update({ xp: newPoints }).eq('id', selectedMember.uid);
        await supabase.from('audit_logs').insert({
          user_id: selectedMember.uid,
          action: 'ADMIN_BONUS',
          details: { points: pointsAmount, reason: reason || 'Manual Admin XP Bonus' }
        });
        toast.success(`Successfully granted +${pointsAmount} XP to ${selectedMember.fullName}!`);
        setMembers(prev =>
          prev.map(m =>
            m.uid === selectedMember.uid ? { ...m, totalPoints: newPoints } : m
          )
        );
        setSelectedMember(null);
      } catch {
        toast.error('Failed to grant points in database.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      await awardPoints({
        userId: selectedMember.uid,
        action: 'ADMIN_BONUS',
        description: reason || 'Manual Admin XP Bonus',
        customPoints: pointsAmount,
      });

      toast.success(`Successfully granted +${pointsAmount} XP to ${selectedMember.fullName}!`);

      // Update in-memory state
      setMembers(prev =>
        prev.map(m =>
          m.uid === selectedMember.uid ? { ...m, totalPoints: m.totalPoints + pointsAmount } : m
        )
      );

      setSelectedMember(null);
    } catch {
      toast.error('Failed to grant points.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = members.filter(
    m =>
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black font-cyber text-foreground">POINTS_&_GAMIFICATION_ADMIN</h2>
        <p className="text-xs font-mono text-muted-foreground">
          Award manual XP bounties, reward hackathon participants, or adjust student rankings.
        </p>
      </div>

      {/* Preset Bounties Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
          <span className="text-[10px] font-cyber text-primary uppercase tracking-widest">WORKSHOP SPEAKER</span>
          <p className="text-xl font-cyber font-bold text-primary mt-1">+200 XP</p>
          <p className="text-[11px] font-mono text-muted-foreground">For delivering student lectures.</p>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <span className="text-[10px] font-cyber text-amber-400 uppercase tracking-widest">HACKATHON PODIUM</span>
          <p className="text-xl font-cyber font-bold text-amber-400 mt-1">+350 XP</p>
          <p className="text-[11px] font-mono text-muted-foreground">For top 3 ranking in club competitions.</p>
        </div>

        <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
          <span className="text-[10px] font-cyber text-cyan-400 uppercase tracking-widest">FEATURED PROJECT</span>
          <p className="text-xl font-cyber font-bold text-cyan-400 mt-1">+150 XP</p>
          <p className="text-[11px] font-mono text-muted-foreground">For accepted data science projects.</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search member by name or ID..."
          className="pl-10 font-mono text-xs bg-dark-navy/60 border-primary/20 h-11"
        />
      </div>

      {/* Members Points Table */}
      <div className="rounded-xl border border-white/10 bg-dark-navy/60 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-cyber tracking-widest text-muted-foreground uppercase">
                <th className="py-4 px-6">MEMBER</th>
                <th className="py-4 px-6">MEMBER ID</th>
                <th className="py-4 px-6">CURRENT XP</th>
                <th className="py-4 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(member => (
                <tr key={member.uid} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-cyber text-primary text-xs">
                        {member.fullName[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground text-sm block">{member.fullName}</span>
                        <span className="text-[10px] text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-muted-foreground">{member.memberId}</td>

                  <td className="py-4 px-6 font-cyber font-bold text-primary text-sm">
                    {member.totalPoints} XP
                  </td>

                  <td className="py-4 px-6 text-right">
                    <Button
                      variant="cyber"
                      className="h-8 px-3 text-[11px] font-cyber tracking-wider"
                      onClick={() => setSelectedMember(member)}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> GRANT_XP
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant Bonus Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-dark-navy border border-primary/30 rounded-2xl p-6 space-y-6 shadow-[0_0_40px_rgba(0,255,204,0.2)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-cyber font-bold text-primary text-base">AWARD_BONUS_XP</h3>
                <p className="text-xs font-mono text-muted-foreground">Recipient: {selectedMember.fullName}</p>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantBonus} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-cyber text-muted-foreground uppercase">XP Amount</label>
                <div className="flex gap-2">
                  {[50, 100, 200, 350, 500].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPointsAmount(amt)}
                      className={`px-2.5 py-1 text-xs font-mono rounded border transition-all ${
                        pointsAmount === amt
                          ? 'bg-primary text-black font-bold border-primary'
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={pointsAmount}
                  onChange={e => setPointsAmount(Number(e.target.value))}
                  className="font-mono text-xs mt-2"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-cyber text-muted-foreground uppercase">Reason / Justification</label>
                <Input
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Outstanding presentation in Week 3"
                  className="font-mono text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedMember(null)}
                  className="font-cyber text-xs border-white/20"
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  variant="cyber"
                  className="font-cyber text-xs tracking-wider"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'DISPATCHING...' : 'DISPATCH_POINTS'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PointsManagement;
