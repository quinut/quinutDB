-- ==============================================================================
-- QuinutDB Seed Data for Supabase
-- Run this script in the Supabase SQL Editor if you wish to clear all items
-- ==============================================================================

-- Delete all catalog items (cascades to item_ratings and item_reviews)
truncate table public.items cascade;
