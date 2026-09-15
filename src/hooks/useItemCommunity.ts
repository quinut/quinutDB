import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ScoreValue } from '../types';

export interface ItemRatingStats {
  itemId: string;
  totalRatings: number;
  avgUserScore: number;
  textReviewCount: number;
  voteCount?: number;
}

export interface CommunityReview {
  id: string;
  userId: string;
  itemId: string;
  username: string;
  avatarUrl?: string;
  rating: ScoreValue;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MyReview {
  rating: ScoreValue;
  content: string;
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
            totalRatings: Number(row.total_ratings || 0),
            avgUserScore: Number(row.avg_user_score || 0),
            textReviewCount: Number(row.text_review_count || 0),
            voteCount: Number(row.total_ratings || 0),
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
  const [myReview, setMyReview] = useState<MyReview | null>(null);
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
          totalRatings: Number(data.total_ratings || 0),
          avgUserScore: Number(data.avg_user_score || 0),
          textReviewCount: Number(data.text_review_count || 0),
          voteCount: Number(data.total_ratings || 0),
        });
      } else {
        setStats(null);
      }
    } catch {
      // ignore
    }
  }, [itemId]);

  // Fetch logged in user's own review
  const fetchMyReview = useCallback(async () => {
    if (!isSupabaseConfigured || !user || !itemId) {
      setMyReview(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('item_reviews')
        .select('rating, content')
        .eq('item_id', itemId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && !error) {
        setMyReview({
          rating: (data.rating || 5) as ScoreValue,
          content: data.content || '',
        });
      } else {
        setMyReview(null);
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
          rating,
          content,
          created_at,
          updated_at,
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
          rating: (r.rating || 5) as ScoreValue,
          content: r.content || '',
          createdAt: r.created_at,
          updatedAt: r.updated_at,
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
    Promise.all([fetchStats(), fetchMyReview(), fetchReviews()]).finally(() => {
      setLoading(false);
    });
  }, [fetchStats, fetchMyReview, fetchReviews]);

  // Submit or update rating & review (Google Play Store style)
  const submitUserScore = async (
    rating: ScoreValue,
    content: string = ''
  ): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured || !user) {
      return { error: new Error('로그인이 필요합니다.') };
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('item_reviews').upsert(
        {
          user_id: user.id,
          item_id: itemId,
          rating,
          content: content.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,item_id' }
      );

      if (error) throw error;

      setMyReview({ rating, content: content.trim() });
      await Promise.all([fetchStats(), fetchReviews()]);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    } finally {
      setSubmitting(false);
    }
  };

  // Delete review
  const deleteMyReview = async (): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured || !user) {
      return { error: new Error('권한이 없습니다.') };
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('item_reviews')
        .delete()
        .eq('item_id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;

      setMyReview(null);
      await Promise.all([fetchStats(), fetchReviews()]);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    stats,
    myReview,
    reviews,
    loading,
    submitting,
    submitUserScore,
    deleteMyReview,
    refetch: () => Promise.all([fetchStats(), fetchMyReview(), fetchReviews()]),
  };
}
