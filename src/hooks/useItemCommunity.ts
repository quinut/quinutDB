import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ScoreValue } from '../types';

export interface ItemRatingStats {
  itemId: string;
  voteCount: number;
  avgAdoption: number;
  avgEaseOfUse: number;
  avgActivity: number;
}

export interface CommunityReview {
  id: string;
  userId: string;
  itemId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface MyRating {
  adoption: ScoreValue;
  easeOfUse: ScoreValue;
  activity: ScoreValue;
}

// 1. Hook for all items rating stats map (for ItemCards)
export function useAllRatingStats() {
  const [statsMap, setStatsMap] = useState<Record<string, ItemRatingStats>>({});
  const [loading, setLoading] = useState(false);

  const fetchAllStats = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('item_rating_stats')
        .select('*');

      if (data && !error) {
        const map: Record<string, ItemRatingStats> = {};
        for (const row of data) {
          map[row.item_id] = {
            itemId: row.item_id,
            voteCount: row.vote_count,
            avgAdoption: Number(row.avg_adoption),
            avgEaseOfUse: Number(row.avg_ease_of_use),
            avgActivity: Number(row.avg_activity),
          };
        }
        setStatsMap(map);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  return { statsMap, loading, refetch: fetchAllStats };
}

// 2. Hook for single item detail: stats, my vote, reviews
export function useItemCommunity(itemId: string) {
  const { user } = useAuth();
  const [stats, setStats] = useState<ItemRatingStats | null>(null);
  const [myRating, setMyRating] = useState<MyRating | null>(null);
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch stats for this item
  const fetchStats = useCallback(async () => {
    if (!isSupabaseConfigured || !itemId) return;
    try {
      const { data, error } = await supabase
        .from('item_rating_stats')
        .select('*')
        .eq('item_id', itemId)
        .maybeSingle();

      if (data && !error) {
        setStats({
          itemId: data.item_id,
          voteCount: data.vote_count,
          avgAdoption: Number(data.avg_adoption),
          avgEaseOfUse: Number(data.avg_ease_of_use),
          avgActivity: Number(data.avg_activity),
        });
      } else {
        setStats(null);
      }
    } catch {
      // ignore
    }
  }, [itemId]);

  // Fetch logged in user's own vote
  const fetchMyRating = useCallback(async () => {
    if (!isSupabaseConfigured || !user || !itemId) {
      setMyRating(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('item_ratings')
        .select('adoption, ease_of_use, activity')
        .eq('item_id', itemId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && !error) {
        setMyRating({
          adoption: data.adoption as ScoreValue,
          easeOfUse: data.ease_of_use as ScoreValue,
          activity: data.activity as ScoreValue,
        });
      } else {
        setMyRating(null);
      }
    } catch {
      // ignore
    }
  }, [itemId, user]);

  // Fetch reviews for this item
  const fetchReviews = useCallback(async () => {
    if (!isSupabaseConfigured || !itemId) return;
    try {
      const { data, error } = await supabase
        .from('item_reviews')
        .select(`
          id,
          user_id,
          item_id,
          content,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (data && !error) {
        const formatted: CommunityReview[] = data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          itemId: r.item_id,
          content: r.content,
          createdAt: r.created_at,
          username: r.profiles?.username || '익명 유저',
          avatarUrl: r.profiles?.avatar_url || '',
        }));
        setReviews(formatted);
      }
    } catch {
      // ignore
    }
  }, [itemId]);

  // Load everything
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(), fetchMyRating(), fetchReviews()]).finally(() => {
      setLoading(false);
    });
  }, [fetchStats, fetchMyRating, fetchReviews]);

  // Submit or update rating
  const submitRating = async (
    adoption: ScoreValue,
    easeOfUse: ScoreValue,
    activity: ScoreValue
  ): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured || !user) {
      return { error: new Error('로그인이 필요합니다.') };
    }

    setSubmittingRating(true);
    try {
      const { error } = await supabase.from('item_ratings').upsert(
        {
          user_id: user.id,
          item_id: itemId,
          adoption,
          ease_of_use: easeOfUse,
          activity,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,item_id' }
      );

      if (error) throw error;

      setMyRating({ adoption, easeOfUse, activity });
      await fetchStats();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    } finally {
      setSubmittingRating(false);
    }
  };

  // Submit review
  const submitReview = async (content: string): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured || !user) {
      return { error: new Error('로그인이 필요합니다.') };
    }

    if (!content.trim()) {
      return { error: new Error('리뷰 내용을 입력해 주세요.') };
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase.from('item_reviews').insert({
        user_id: user.id,
        item_id: itemId,
        content: content.trim(),
      });

      if (error) throw error;

      await fetchReviews();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete review
  const deleteReview = async (reviewId: string): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured || !user) {
      return { error: new Error('권한이 없습니다.') };
    }

    try {
      const { error } = await supabase
        .from('item_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  return {
    stats,
    myRating,
    reviews,
    loading,
    submittingRating,
    submittingReview,
    submitRating,
    submitReview,
    deleteReview,
    refetch: () => Promise.all([fetchStats(), fetchMyRating(), fetchReviews()]),
  };
}
