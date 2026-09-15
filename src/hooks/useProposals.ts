import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FrontendItem, OSFirmwareItem } from '../types';

export interface ItemProposal {
  id: string;
  item_id: string;
  type: 'frontend' | 'cfw';
  name: string;
  data: FrontendItem | OSFirmwareItem;
  submitted_by: string;
  status: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
  created_at: string;
  reviewed_at?: string;
  submitter_username?: string;
}

export function useProposals(isAdmin: boolean = false) {
  const [proposals, setProposals] = useState<ItemProposal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProposals = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('item_proposals')
        .select(`
          *,
          profiles:submitted_by (username)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProposals(
          data.map((row: any) => ({
            id: row.id,
            item_id: row.item_id,
            type: row.type,
            name: row.name,
            data: row.data,
            submitted_by: row.submitted_by,
            status: row.status,
            review_notes: row.review_notes,
            created_at: row.created_at,
            reviewed_at: row.reviewed_at,
            submitter_username: row.profiles?.username || '익명 기여자',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch proposals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchProposals();
    }
  }, [isAdmin, fetchProposals]);

  const submitProposal = async (item: FrontendItem | OSFirmwareItem, type: 'frontend' | 'cfw') => {
    if (!isSupabaseConfigured) {
      return { error: new Error('데이터베이스가 연결되어 있지 않습니다.') };
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { error: new Error('기여 제안을 제출하려면 로그인이 필요합니다.') };
    }

    const { error } = await supabase.from('item_proposals').insert({
      item_id: item.id,
      type,
      name: item.name,
      data: item,
      submitted_by: userData.user.id,
      status: 'pending',
    });

    return { error: error ? new Error(error.message) : null };
  };

  const rejectProposal = async (proposalId: string) => {
    if (!isSupabaseConfigured) return { error: new Error('DB 미연결') };
    const { error } = await supabase
      .from('item_proposals')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', proposalId);

    if (!error) {
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: 'rejected' } : p))
      );
    }
    return { error: error ? new Error(error.message) : null };
  };

  const markProposalApproved = async (proposalId: string) => {
    if (!isSupabaseConfigured) return;
    await supabase
      .from('item_proposals')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', proposalId);

    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'approved' } : p))
    );
  };

  const pendingCount = proposals.filter((p) => p.status === 'pending').length;

  return {
    proposals,
    pendingCount,
    loading,
    fetchProposals,
    submitProposal,
    rejectProposal,
    markProposalApproved,
  };
}
