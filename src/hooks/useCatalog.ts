import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FrontendItem, OSFirmwareItem } from '../types';
import { frontends as defaultFrontends, osFirmwares as defaultOSFirmwares } from '../data/catalog';

// Helper to map DB row to FrontendItem
export function rowToFrontendItem(row: any): FrontendItem {
  return {
    id: row.id,
    name: row.name,
    shortDesc: row.short_desc,
    pricing: row.pricing,
    status: row.status,
    supportedPlatforms: Array.isArray(row.supported_platforms) ? row.supported_platforms : [],
    hasBuiltInScraper: row.has_built_in_scraper,
    themeSupport: row.theme_support || 'None',
    touchOptimized: row.touch_optimized,
    gamepadOptimized: row.gamepad_optimized,
    canReplaceHomeLauncher: row.can_replace_home_launcher,
    dualScreenOptimized: row.dual_screen_optimized ?? null,
    logoUrl: row.logo_url || '',
    coverImageUrl: row.cover_image_url || '',
    screenshots: Array.isArray(row.screenshots) ? row.screenshots : [],
    officialUrl: row.official_url || undefined,
    downloadUrl: row.download_url || undefined,
    githubRepo: row.github_repo || undefined,
  };
}

// Helper to map DB row to OSFirmwareItem
export function rowToOSFirmwareItem(row: any): OSFirmwareItem {
  return {
    id: row.id,
    name: row.name,
    shortDesc: row.short_desc,
    pricing: row.pricing,
    status: row.status,
    category: row.category || 'First-Party',
    targetDevices: Array.isArray(row.target_devices) ? row.target_devices : [],
    baseSystem: row.base_system || '',
    exploitType: row.exploit_type || undefined,
    defaultFrontend: row.default_frontend || undefined,
    logoUrl: row.logo_url || '',
    coverImageUrl: row.cover_image_url || '',
    screenshots: Array.isArray(row.screenshots) ? row.screenshots : [],
    officialUrl: row.official_url || undefined,
    downloadUrl: row.download_url || undefined,
    githubRepo: row.github_repo || undefined,
  };
}

// Helper to convert item object to DB row for upsert
export function itemToDbRow(item: any, type: 'frontend' | 'cfw') {
  return {
    id: item.id,
    type,
    name: item.name,
    short_desc: item.shortDesc,
    pricing: item.pricing,
    status: item.status,
    supported_platforms: type === 'frontend' ? (item.supportedPlatforms || []) : [],
    has_built_in_scraper: type === 'frontend' ? item.hasBuiltInScraper : null,
    theme_support: type === 'frontend' ? item.themeSupport : null,
    touch_optimized: type === 'frontend' ? item.touchOptimized : null,
    gamepad_optimized: type === 'frontend' ? item.gamepadOptimized : null,
    can_replace_home_launcher: type === 'frontend' ? item.canReplaceHomeLauncher : null,
    dual_screen_optimized: type === 'frontend' ? item.dualScreenOptimized : null,
    category: type === 'cfw' ? item.category : null,
    target_devices: type === 'cfw' ? (item.targetDevices || []) : [],
    base_system: type === 'cfw' ? item.baseSystem : null,
    exploit_type: type === 'cfw' ? item.exploitType : null,
    default_frontend: type === 'cfw' ? item.defaultFrontend : null,
    logo_url: item.logoUrl || '',
    cover_image_url: item.coverImageUrl || '',
    screenshots: Array.isArray(item.screenshots) ? item.screenshots : [],
    official_url: item.officialUrl || null,
    download_url: item.downloadUrl || null,
    github_repo: item.githubRepo || null,
    updated_at: new Date().toISOString(),
  };
}

export function useCatalog() {
  // Initialize with static catalog for 0ms immediate render without layout shift
  const [frontends, setFrontends] = useState<FrontendItem[]>(defaultFrontends);
  const [osFirmwares, setOsFirmwares] = useState<OSFirmwareItem[]>(defaultOSFirmwares);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromDatabase, setIsFromDatabase] = useState(false);

  const fetchCatalog = useCallback(async () => {
    if (!isSupabaseConfigured) {
      // Fallback to static catalog
      setFrontends(defaultFrontends);
      setOsFirmwares(defaultOSFirmwares);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from('items')
        .select('*')
        .order('name', { ascending: true });

      if (fetchErr) {
        console.warn('Failed to load items from Supabase, falling back to static catalog:', fetchErr);
        setError(fetchErr.message);
        // keep fallback
        return;
      }

      if (data && data.length > 0) {
        const dbFrontends: FrontendItem[] = [];
        const dbCFWs: OSFirmwareItem[] = [];

        for (const row of data) {
          if (row.type === 'frontend') {
            dbFrontends.push(rowToFrontendItem(row));
          } else if (row.type === 'cfw') {
            dbCFWs.push(rowToOSFirmwareItem(row));
          }
        }

        setFrontends(dbFrontends);
        setOsFirmwares(dbCFWs);
        setIsFromDatabase(true);
      } else {
        // Table is empty, use default catalog
        setFrontends(defaultFrontends);
        setOsFirmwares(defaultOSFirmwares);
      }
    } catch (err: any) {
      console.warn('Error connecting to Supabase items table:', err);
      setError(err?.message || 'Database connection error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Save (insert or update) an item to Supabase
  const saveItem = async (item: any, type: 'frontend' | 'cfw') => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase가 설정되지 않았습니다. .env 파일을 확인해 주세요.') };
    }

    const row = itemToDbRow(item, type);
    const { error: upsertErr } = await supabase
      .from('items')
      .upsert(row, { onConflict: 'id' });

    if (!upsertErr) {
      await fetchCatalog();
    }
    return { error: upsertErr };
  };

  // Delete an item from Supabase
  const deleteItem = async (itemId: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase가 설정되지 않았습니다.') };
    }

    const { error: delErr } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (!delErr) {
      await fetchCatalog();
    }
    return { error: delErr };
  };

  return {
    frontends,
    osFirmwares,
    loading,
    error,
    isFromDatabase,
    refetch: fetchCatalog,
    saveItem,
    deleteItem,
  };
}
