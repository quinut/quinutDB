import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Check,
  X,
  HelpCircle,
  AlertCircle,
  PlusCircle,
  Edit3,
  Eye,
  CheckCircle2,
  Layers,
  Database,
  Send,
  Inbox,
  Trash2,
  LogIn,
  RotateCcw,
  RefreshCw,
  Image as ImageIcon,
  Globe,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  FrontendItem,
  OSFirmwareItem,
  PricingModel,
  ProjectStatus,
  TriState,
  ThemeSupportLevel,
  DeviceCategory,
  FormFactor,
  Platform,
  ScoreValue,
  ItemRatings,
} from '../../types';
import { useCatalog } from '../../hooks/useCatalog';
import { useAuth } from '../../contexts/AuthContext';
import { useProposals, ItemProposal } from '../../hooks/useProposals';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserAvatar } from '../../components/UserAvatar';
import { ItemCard } from '../../components/ItemCard';

export interface EditPageProps {
  onNavigateHome?: () => void;
}

type Mode = 'create' | 'edit' | 'proposals';
type ItemType = 'frontend' | 'cfw';

const PRICING_OPTIONS: PricingModel[] = [
  'Free & Open Source',
  'Free',
  'Freemium',
  'Paid',
];

const STATUS_OPTIONS: ProjectStatus[] = ['Active', 'Stale', 'Discontinued'];

const FRONTEND_PLATFORMS = [
  'Android',
  'iOS',
  'Linux',
  'Windows',
  'macOS',
  'iPadOS',
  'tvOS',
];

const THEME_OPTIONS: ThemeSupportLevel[] = ['Rich', 'Basic', 'None'];

const CATEGORY_OPTIONS: DeviceCategory[] = [
  'First-Party',
  'Retro Handheld',
  'PC-Handheld',
];

const FORM_FACTOR_OPTIONS: FormFactor[] = [
  'Handheld',
  'Home',
  'Hybrid',
];

// Helper to sanitize slug
function sanitizeSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 1. Rating Selector Component
interface RatingPickerProps {
  label: string;
  category: 'adoption' | 'easeOfUse' | 'activity';
  value: ScoreValue;
  onChange: (val: ScoreValue) => void;
}

const RatingPicker: React.FC<RatingPickerProps> = ({
  label,
  category,
  value,
  onChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-1.5 p-3.5 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#737373]">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-[14px] font-bold text-[#0a0a0a]">{value}</span>
          <span className="text-[10px] text-[#737373]">/ 5</span>
        </div>
      </div>

      {/* 5-Level Pill Selector */}
      <div className="grid grid-cols-5 gap-1 my-1">
        {([1, 2, 3, 4, 5] as ScoreValue[]).map((level) => {
          const isSelected = value === level;
          const isFilled = level <= value;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              aria-label={`${label} ${level}`}
              className={`h-8 rounded-[12px] text-[12px] font-semibold transition-all flex items-center justify-center cursor-pointer ${
                isSelected
                  ? 'bg-[#0a0a0a] text-[#fafafa] shadow-xs scale-105 border border-[#0a0a0a]'
                  : isFilled
                  ? 'bg-[#ffffff] text-[#0a0a0a] border border-[#0a0a0a]/30 hover:border-[#0a0a0a]'
                  : 'bg-[#ffffff] text-[#737373] border border-[#e5e5e5] hover:border-[#737373]'
              }`}
            >
              {level}
            </button>
          );
        })}
      </div>

      <span className="text-[11px] text-[#171717] font-medium line-clamp-1">
        {t.ratings.scoreLabels[category][value]}
      </span>
    </div>
  );
};

// 2. TriState Segmented Control
interface TriStateControlProps {
  label: string;
  value: TriState;
  onChange: (val: TriState) => void;
  description?: string;
}

const TriStateControl: React.FC<TriStateControlProps> = ({
  label,
  value,
  onChange,
  description,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
      <div>
        <span className="text-[13px] font-medium text-[#0a0a0a] block">{label}</span>
        {description && <span className="text-[11px] text-[#737373]">{description}</span>}
      </div>

      <div className="inline-flex rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] p-0.5 shadow-2xs shrink-0 self-start sm:self-auto">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`inline-flex items-center gap-1 rounded-[16px] px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
            value === true
              ? 'bg-[#0a0a0a] text-[#fafafa] shadow-xs'
              : 'text-[#737373] hover:text-[#0a0a0a]'
          }`}
        >
          <Check size={12} strokeWidth={2.5} />
          <span>{t.common.yes}</span>
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={`inline-flex items-center gap-1 rounded-[16px] px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
            value === false
              ? 'bg-[#0a0a0a] text-[#fafafa] shadow-xs'
              : 'text-[#737373] hover:text-[#0a0a0a]'
          }`}
        >
          <X size={12} strokeWidth={2.5} />
          <span>{t.common.no}</span>
        </button>

        <button
          type="button"
          onClick={() => onChange(null)}
          className={`inline-flex items-center gap-1 rounded-[16px] px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
            value === null
              ? 'bg-[#e5e5e5] text-[#0a0a0a] font-semibold'
              : 'text-[#737373] hover:text-[#0a0a0a]'
          }`}
        >
          <HelpCircle size={12} strokeWidth={2.5} />
          <span>{t.common.unknown}</span>
        </button>
      </div>
    </div>
  );
};

export default function EditPage({ onNavigateHome }: EditPageProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const { frontends, osFirmwares, saveItem } = useCatalog();
  const { user, profile, openAuthModal } = useAuth();
  const isAdmin = Boolean(profile?.is_admin);

  const {
    proposals,
    pendingCount,
    loading: proposalsLoading,
    fetchProposals,
    submitProposal,
    rejectProposal,
    markProposalApproved,
  } = useProposals(isAdmin);

  const [mode, setMode] = useState<Mode>('create');
  const [targetType, setTargetType] = useState<ItemType>('frontend');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [activeProposalId, setActiveProposalId] = useState<string | null>(null);
  const [isSlugLocked, setIsSlugLocked] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Common Form States
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [pricing, setPricing] = useState<PricingModel>('Free & Open Source');
  const [status, setStatus] = useState<ProjectStatus>('Active');
  const [officialUrl, setOfficialUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [newScreenshotUrl, setNewScreenshotUrl] = useState('');

  // Ratings
  const [adoption, setAdoption] = useState<ScoreValue>(4);
  const [easeOfUse, setEaseOfUse] = useState<ScoreValue>(4);
  const [activity, setActivity] = useState<ScoreValue>(4);

  // Frontend Specific States
  const [supportedPlatforms, setSupportedPlatforms] = useState<string[]>([
    'Android',
  ]);
  const [themeSupport, setThemeSupport] = useState<ThemeSupportLevel>('Rich');
  const [hasBuiltInScraper, setHasBuiltInScraper] = useState<TriState>(true);
  const [touchOptimized, setTouchOptimized] = useState<TriState>(true);
  const [gamepadOptimized, setGamepadOptimized] = useState<TriState>(true);
  const [canReplaceHomeLauncher, setCanReplaceHomeLauncher] =
    useState<TriState>(false);

  // CFW / OS Specific States
  const [category, setCategory] = useState<DeviceCategory>('First-Party');
  const [formFactor, setFormFactor] = useState<FormFactor>('Handheld');
  const [targetDevicesText, setTargetDevicesText] = useState('Nintendo Switch, Switch OLED');
  const [baseSystem, setBaseSystem] = useState('Horizon OS Patch');
  const [exploitType, setExploitType] = useState('Fusee-gelee / Modchip');
  const [defaultFrontend, setDefaultFrontend] = useState('Horizon Home Menu');

  // CFW TriState Features
  const [portMaster, setPortMaster] = useState<TriState>(null);
  const [sleepMode, setSleepMode] = useState<TriState>(true);
  const [hdmiOut, setHdmiOut] = useState<TriState>(true);
  const [otaUpdate, setOtaUpdate] = useState<TriState>(true);
  const [pluginLoader, setPluginLoader] = useState<TriState>(true);
  const [emuNandOrSandbox, setEmuNandOrSandbox] = useState<TriState>(true);

  // Auto slug generation on name change (if not locked)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugLocked && mode === 'create') {
      setId(sanitizeSlug(val));
    }
  };

  // Reset form to clean default
  const resetForm = (type: ItemType) => {
    setId('');
    setName('');
    setShortDesc('');
    setPricing('Free & Open Source');
    setStatus('Active');
    setOfficialUrl('');
    setDownloadUrl('');
    setGithubRepo('');
    setLogoUrl('');
    setCoverImageUrl('');
    setScreenshots([]);
    setNewScreenshotUrl('');
    setAdoption(4);
    setEaseOfUse(4);
    setActivity(4);
    setIsSlugLocked(false);

    if (type === 'frontend') {
      setSupportedPlatforms(['Android']);
      setThemeSupport('Rich');
      setHasBuiltInScraper(true);
      setTouchOptimized(true);
      setGamepadOptimized(true);
      setCanReplaceHomeLauncher(false);
    } else {
      setCategory('First-Party');
      setFormFactor('Handheld');
      setTargetDevicesText('Nintendo Switch, Switch OLED');
      setBaseSystem('Horizon OS Patch');
      setExploitType('Fusee-gelee / Modchip');
      setDefaultFrontend('Horizon Home Menu');
      setPortMaster(null);
      setSleepMode(true);
      setHdmiOut(true);
      setOtaUpdate(true);
      setPluginLoader(true);
      setEmuNandOrSandbox(true);
    }
  };

  // Helper methods for managing multi screenshots
  const handleAddScreenshot = () => {
    if (!newScreenshotUrl.trim()) return;
    const splitUrls = newScreenshotUrl
      .split(/[\r\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);

    if (splitUrls.length > 0) {
      setScreenshots((prev) => [...prev, ...splitUrls]);
      setNewScreenshotUrl('');
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveScreenshot = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= screenshots.length) return;
    setScreenshots((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  // Switch Mode
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setSelectedItemId('');
    if (newMode === 'create') {
      resetForm(targetType);
    }
  };

  // Pre-fill on selecting existing item
  const handleSelectItemToEdit = (itemId: string) => {
    setSelectedItemId(itemId);
    if (!itemId) return;

    if (targetType === 'frontend') {
      const found = frontends.find((f) => f.id === itemId);
      if (found) {
        setId(found.id);
        setName(found.name);
        setShortDesc(found.shortDesc);
        setPricing(found.pricing);
        setStatus(found.status);
        setOfficialUrl(found.officialUrl || '');
        setDownloadUrl(found.downloadUrl || '');
        setGithubRepo(found.githubRepo || '');
        setLogoUrl(found.logoUrl || '');
        setCoverImageUrl(found.coverImageUrl || '');
        setScreenshots(
          Array.isArray(found.screenshots) && found.screenshots.length > 0
            ? found.screenshots
            : found.coverImageUrl
            ? [found.coverImageUrl]
            : []
        );
        setNewScreenshotUrl('');
        setAdoption(found.ratings?.adoption || 4);
        setEaseOfUse(found.ratings?.easeOfUse || 4);
        setActivity(found.ratings?.activity || 4);
        setSupportedPlatforms(found.supportedPlatforms || ['Android']);
        setThemeSupport(found.themeSupport || 'Rich');
        setHasBuiltInScraper(found.hasBuiltInScraper ?? true);
        setTouchOptimized(found.touchOptimized ?? true);
        setGamepadOptimized(found.gamepadOptimized ?? true);
        setCanReplaceHomeLauncher(found.canReplaceHomeLauncher ?? false);
        setIsSlugLocked(true);
      }
    } else {
      const found = osFirmwares.find((c) => c.id === itemId);
      if (found) {
        setId(found.id);
        setName(found.name);
        setShortDesc(found.shortDesc);
        setPricing(found.pricing);
        setStatus(found.status);
        setCategory(found.category || 'First-Party');
        setFormFactor(found.formFactor || 'Handheld');
        setTargetDevicesText(found.targetDevices ? found.targetDevices.join(', ') : '');
        setBaseSystem(found.baseSystem || '');
        setExploitType(found.exploitType || '');
        setDefaultFrontend(found.defaultFrontend || '');
        setOfficialUrl(found.officialUrl || '');
        setDownloadUrl(found.downloadUrl || '');
        setGithubRepo(found.githubRepo || '');
        setLogoUrl(found.logoUrl || '');
        setCoverImageUrl(found.coverImageUrl || '');
        setScreenshots(
          Array.isArray(found.screenshots) && found.screenshots.length > 0
            ? found.screenshots
            : found.coverImageUrl
            ? [found.coverImageUrl]
            : []
        );
        setNewScreenshotUrl('');
        setAdoption(found.ratings?.adoption || 4);
        setEaseOfUse(found.ratings?.easeOfUse || 4);
        setActivity(found.ratings?.activity || 4);
        if (found.features) {
          setPortMaster(found.features.portMaster ?? null);
          setSleepMode(found.features.sleepMode ?? true);
          setHdmiOut(found.features.hdmiOut ?? true);
          setOtaUpdate(found.features.otaUpdate ?? true);
          setPluginLoader(found.features.pluginLoader ?? true);
          setEmuNandOrSandbox(found.features.emuNandOrSandbox ?? true);
        }
        setIsSlugLocked(true);
      }
    }
  };

  // Toggle platform checkbox
  const handleTogglePlatform = (plat: string) => {
    setSupportedPlatforms((prev) =>
      prev.includes(plat) ? prev.filter((p) => p !== plat) : [...prev, plat]
    );
  };

  // Validation
  const errors = useMemo(() => {
    const list: string[] = [];
    if (!name.trim()) list.push(t.editor.validationName);
    if (!id.trim()) list.push(t.editor.validationSlug);
    else if (!/^[a-z0-9-]+$/.test(id))
      list.push(t.editor.validationSlugFormat);
    if (!shortDesc.trim()) list.push(t.editor.validationShortDesc);
    if (targetType === 'frontend' && supportedPlatforms.length === 0)
      list.push(t.editor.validationPlatforms);
    if (targetType === 'cfw' && !targetDevicesText.trim())
      list.push(t.editor.validationTargetDevices);
    return list;
  }, [name, id, shortDesc, targetType, supportedPlatforms, targetDevicesText, t]);

  // Construct Live Preview Item
  const previewItem = useMemo<FrontendItem | OSFirmwareItem>(() => {
    const ratingsObj: ItemRatings = { adoption, easeOfUse, activity };

    if (targetType === 'frontend') {
      const item: FrontendItem = {
        id: id || 'preview-slug',
        name: name || 'Preview Frontend Name',
        shortDesc: shortDesc || 'A short description of this emulation frontend will appear here in the preview.',
        pricing,
        status,
        supportedPlatforms:
          supportedPlatforms.length > 0 ? (supportedPlatforms as Platform[]) : ['Android'],
        hasBuiltInScraper,
        themeSupport,
        touchOptimized,
        gamepadOptimized,
        canReplaceHomeLauncher,
        ratings: ratingsObj,
        logoUrl: logoUrl || 'https://avatars.githubusercontent.com/u/130823084?v=4',
        coverImageUrl: coverImageUrl || (screenshots.length > 0 ? screenshots[0] : logoUrl) || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        screenshots: screenshots.length > 0 ? screenshots : (coverImageUrl ? [coverImageUrl] : []),
        officialUrl: officialUrl || undefined,
        downloadUrl: downloadUrl || undefined,
        githubRepo: githubRepo || undefined,
      };
      return item;
    } else {
      const devices = targetDevicesText
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);

      const item: OSFirmwareItem = {
        id: id || 'preview-cfw-slug',
        name: name || 'Preview CFW Name',
        shortDesc: shortDesc || 'A short description of this custom firmware will appear here in the preview.',
        pricing,
        status,
        category,
        formFactor,
        targetDevices: devices.length > 0 ? devices : ['Sample Handheld'],
        baseSystem: baseSystem || 'Linux',
        exploitType: exploitType || 'Software Exploit',
        defaultFrontend: defaultFrontend || 'Default Menu',
        features: {
          portMaster,
          sleepMode,
          hdmiOut,
          otaUpdate,
          pluginLoader,
          emuNandOrSandbox,
        },
        ratings: ratingsObj,
        logoUrl: logoUrl || 'https://avatars.githubusercontent.com/u/130823084?v=4',
        coverImageUrl: coverImageUrl || (screenshots.length > 0 ? screenshots[0] : logoUrl) || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        screenshots: screenshots.length > 0 ? screenshots : (coverImageUrl ? [coverImageUrl] : []),
        officialUrl: officialUrl || undefined,
        downloadUrl: downloadUrl || undefined,
        githubRepo: githubRepo || undefined,
      };
      return item;
    }
  }, [
    targetType,
    id,
    name,
    shortDesc,
    pricing,
    status,
    officialUrl,
    downloadUrl,
    githubRepo,
    logoUrl,
    coverImageUrl,
    screenshots,
    adoption,
    easeOfUse,
    activity,
    supportedPlatforms,
    themeSupport,
    hasBuiltInScraper,
    touchOptimized,
    gamepadOptimized,
    canReplaceHomeLauncher,
    category,
    formFactor,
    targetDevicesText,
    baseSystem,
    exploitType,
    defaultFrontend,
    portMaster,
    sleepMode,
    hdmiOut,
    otaUpdate,
    pluginLoader,
    emuNandOrSandbox,
  ]);

  // Admin: Load a proposal into form for review
  const handleLoadProposal = (proposal: ItemProposal) => {
    setTargetType(proposal.type);
    setSelectedItemId('');
    setActiveProposalId(proposal.id);
    setIsSlugLocked(true);
    setMode('edit');

    const data: any = proposal.data || {};
    setId(data.id || '');
    setName(data.name || '');
    setShortDesc(data.shortDesc || '');
    setPricing(data.pricing || 'Free & Open Source');
    setStatus(data.status || 'Active');
    setOfficialUrl(data.officialUrl || '');
    setDownloadUrl(data.downloadUrl || '');
    setGithubRepo(data.githubRepo || '');
    setLogoUrl(data.logoUrl || '');
    setCoverImageUrl(data.coverImageUrl || '');
    setScreenshots(
      Array.isArray(data.screenshots) && data.screenshots.length > 0
        ? data.screenshots
        : data.coverImageUrl
        ? [data.coverImageUrl]
        : []
    );
    setNewScreenshotUrl('');

    if (data.ratings) {
      setAdoption(data.ratings.adoption || 4);
      setEaseOfUse(data.ratings.easeOfUse || 4);
      setActivity(data.ratings.activity || 4);
    }

    if (proposal.type === 'frontend') {
      setSupportedPlatforms(data.supportedPlatforms || []);
      setHasBuiltInScraper(data.hasBuiltInScraper ?? true);
      setThemeSupport(data.themeSupport || 'Rich');
      setTouchOptimized(data.touchOptimized ?? false);
      setGamepadOptimized(data.gamepadOptimized ?? true);
      setCanReplaceHomeLauncher(data.canReplaceHomeLauncher ?? false);
    } else {
      setCategory(data.category || 'Retro Handheld');
      setFormFactor(data.formFactor || 'Horizontal');
      setTargetDevicesText(
        Array.isArray(data.targetDevices) ? data.targetDevices.join(', ') : ''
      );
      setBaseSystem(data.baseSystem || 'Linux');
      setExploitType(data.exploitType || '');
      setDefaultFrontend(data.defaultFrontend || '');
      if (data.features) {
        setPortMaster(data.features.portMaster ?? null);
        setSleepMode(data.features.sleepMode ?? true);
        setHdmiOut(data.features.hdmiOut ?? null);
        setOtaUpdate(data.features.otaUpdate ?? true);
        setPluginLoader(data.features.pluginLoader ?? false);
        setEmuNandOrSandbox(data.features.emuNandOrSandbox ?? null);
      }
    }

    setStatusMessage({
      type: 'success',
      text: `[${proposal.name}]`,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin: Direct Save or Approve Proposal
  const handleSaveToDb = async () => {
    if (!user) {
      openAuthModal(t.editor.needLoginSave);
      return;
    }
    if (!isAdmin) {
      setStatusMessage({
        type: 'error',
        text: t.editor.adminOnlySave,
      });
      return;
    }
    if (!name.trim() || !id.trim()) {
      setStatusMessage({
        type: 'error',
        text: t.editor.enterRequiredFields,
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const { error } = await saveItem(previewItem, targetType);
    if (error) {
      setIsSubmitting(false);
      setStatusMessage({
        type: 'error',
        text: error.message,
      });
      return;
    }

    if (activeProposalId) {
      await markProposalApproved(activeProposalId);
      setActiveProposalId(null);
      setStatusMessage({
        type: 'success',
        text: t.editor.proposalApproved,
      });
    } else {
      setStatusMessage({
        type: 'success',
        text: t.editor.saveSuccess,
      });
    }

    setIsSubmitting(false);
  };

  // Regular User: Submit Community Proposal
  const handleSubmitProposal = async () => {
    if (!user) {
      openAuthModal(t.editor.needLoginProposal);
      return;
    }
    if (!name.trim() || !id.trim()) {
      setStatusMessage({
        type: 'error',
        text: t.editor.enterRequiredFields,
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const { error } = await submitProposal(previewItem, targetType);
    setIsSubmitting(false);

    if (error) {
      setStatusMessage({
        type: 'error',
        text: error.message,
      });
    } else {
      setStatusMessage({
        type: 'success',
        text: t.editor.proposalSuccess,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col antialiased">
      {/* ============================================================ */}
      {/* 1. Header Bar                                                */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 w-full border-b border-[#e5e5e5] bg-[#ffffff]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Back link & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome || (() => (window.location.href = '/'))}
              className="inline-flex items-center gap-1.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-1.5 text-[12px] font-medium text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{t.common.backToHome}</span>
            </button>
            <div className="h-4 w-px bg-[#e5e5e5] hidden sm:block" />
            <div className="flex items-center gap-2">
              <img
                src="/icon.png"
                alt="quinutDB"
                className="h-5 w-5 rounded-[5px] object-cover border border-[#e5e5e5] shadow-2xs shrink-0"
              />
              <span className="text-[16px] font-semibold tracking-[-0.4px] text-[#0a0a0a]">
                {t.editor.title}
              </span>
              <span className="rounded-[18px] bg-[#0a0a0a] px-2 py-0.5 text-[10px] font-medium text-[#fafafa]">
                Database
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-3 text-[12px] font-semibold text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors cursor-pointer shadow-2xs"
              title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
            >
              <Globe size={14} className="text-[#737373]" />
              <span>{language === 'ko' ? 'EN' : '한국어'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-1.5 p-0.5 pr-2.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa]">
                <UserAvatar
                  userId={user.id}
                  username={profile?.nickname || profile?.username}
                  avatarUrl={profile?.avatar_url}
                  size={24}
                />
                <span className="text-[12px] font-medium text-[#0a0a0a] max-w-[90px] truncate hidden sm:inline">
                  {profile?.nickname || profile?.username || 'User'}
                </span>
                {isAdmin && (
                  <span className="rounded-[6px] bg-[#0a0a0a] px-1.5 py-0.2 text-[8px] font-bold text-[#fafafa]">
                    ADMIN
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="inline-flex items-center gap-1.5 rounded-[18px] bg-[#0a0a0a] px-3 py-1.5 text-[12px] font-medium text-[#fafafa] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                <LogIn size={13} />
                <span>{t.common.login}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. Top Control Sub-Bar: Mode & Type Selector Tabs            */}
      {/* ============================================================ */}
      <section className="border-b border-[#e5e5e5] bg-[#ffffff] py-3">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Mode Selector: Create vs Edit vs Proposals */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-[#737373]">{t.editor.modeLabel}:</span>
            <div className="inline-flex rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleModeChange('create')}
                className={`inline-flex items-center gap-1.5 rounded-[16px] px-3 py-1 text-[12px] font-medium transition-all cursor-pointer ${
                  mode === 'create'
                    ? 'bg-[#0a0a0a] text-[#fafafa] shadow-xs'
                    : 'text-[#737373] hover:text-[#0a0a0a]'
                }`}
              >
                <PlusCircle size={13} />
                <span>{t.editor.createMode}</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('edit')}
                className={`inline-flex items-center gap-1.5 rounded-[16px] px-3 py-1 text-[12px] font-medium transition-all cursor-pointer ${
                  mode === 'edit'
                    ? 'bg-[#0a0a0a] text-[#fafafa] shadow-xs'
                    : 'text-[#737373] hover:text-[#0a0a0a]'
                }`}
              >
                <Edit3 size={13} />
                <span>{t.editor.editMode}</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleModeChange('proposals')}
                  className={`inline-flex items-center gap-1.5 rounded-[16px] px-3 py-1 text-[12px] font-medium transition-all cursor-pointer ${
                    mode === 'proposals'
                      ? 'bg-[#0a0a0a] text-[#fafafa] shadow-xs'
                      : 'text-[#737373] hover:text-[#0a0a0a]'
                  }`}
                >
                  <Inbox size={13} />
                  <span>{t.editor.proposalsMode}</span>
                  {pendingCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white leading-none">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Category: Frontend */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-[#737373]">{t.editor.categoryLabel}:</span>
            <div className="inline-flex items-center gap-1.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-[12px] font-medium text-[#0a0a0a] shadow-2xs">
              <Layers size={13} />
              <span>Frontend ({frontends.length})</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. Main Workspace: Proposals View or 2-Column Form           */}
      {/* ============================================================ */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {mode === 'proposals' ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-6 shadow-xs">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Inbox size={18} className="text-[#0a0a0a]" />
                  <h2 className="text-[16px] font-bold text-[#0a0a0a]">
                    {t.editor.proposalsQueueTitle}
                  </h2>
                  <span className="rounded-[12px] bg-[#0a0a0a] px-2 py-0.5 text-[11px] font-semibold text-[#fafafa]">
                    {t.editor.proposalsPendingBadge.replace('{count}', String(pendingCount))}
                  </span>
                </div>
                <p className="text-[13px] text-[#737373]">
                  {t.editor.proposalsQueueDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchProposals()}
                disabled={proposalsLoading}
                className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-3.5 py-2 text-[12px] font-medium text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors cursor-pointer"
              >
                <RotateCcw size={13} className={proposalsLoading ? 'animate-spin' : ''} />
                <span>{t.editor.refresh}</span>
              </button>
            </div>

            {proposalsLoading ? (
              <div className="flex flex-col items-center justify-center p-16 rounded-[24px] border border-[#e5e5e5] bg-[#ffffff]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent mb-3" />
                <span className="text-[13px] text-[#737373]">{t.editor.proposalsLoading}</span>
              </div>
            ) : proposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] text-center">
                <Inbox size={40} className="text-[#a3a3a3] mb-3 stroke-[1.5]" />
                <span className="text-[14px] font-semibold text-[#0a0a0a]">{t.editor.noProposalsTitle}</span>
                <span className="text-[12px] text-[#737373] mt-1">{t.editor.noProposalsDesc}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proposals.map((prop) => {
                  const data = prop.data as any;
                  return (
                    <div
                      key={prop.id}
                      className="rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-xs flex flex-col justify-between gap-4 transition-all hover:border-[#a3a3a3]"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="rounded-[8px] bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-bold text-[#737373] uppercase shrink-0">
                              {prop.type}
                            </span>
                            <span
                              className={`rounded-[8px] px-2 py-0.5 text-[10px] font-semibold shrink-0 ${
                                prop.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : prop.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {prop.status === 'pending'
                                ? t.editor.statusPending
                                : prop.status === 'approved'
                                ? t.editor.statusApproved
                                : t.editor.statusRejected}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#a3a3a3] shrink-0">
                            {new Date(prop.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-[15px] font-bold text-[#0a0a0a] truncate">
                            {prop.name}
                          </h3>
                          <span className="text-[11px] text-[#737373] font-mono">
                            ID: {data?.id || prop.item_id || '-'}
                          </span>
                          {data?.shortDesc && (
                            <p className="text-[12px] text-[#525252] mt-1 line-clamp-2">
                              {data.shortDesc}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-[#f5f5f5]">
                        <button
                          type="button"
                          onClick={() => handleLoadProposal(prop)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[16px] bg-[#0a0a0a] py-2 text-[12px] font-medium text-[#fafafa] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                        >
                          <Edit3 size={12} />
                          <span>{t.editor.loadAndReview}</span>
                        </button>
                        {prop.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => rejectProposal(prop.id)}
                            className="inline-flex items-center justify-center gap-1 rounded-[16px] border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                            <span>{t.editor.reject}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ---------------------------------------------------------- */}
            {/* Left Column (col-span-7): Form Inputs                      */}
            {/* ---------------------------------------------------------- */}
            <section className="lg:col-span-7 flex flex-col gap-6">
              {/* If Edit Mode: Select existing item to pre-fill */}
              {mode === 'edit' && (
                <div className="rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#0a0a0a]">
                      {t.editor.selectItemToEdit}
                    </span>
                  </div>

                  <select
                    value={selectedItemId}
                    onChange={(e) => handleSelectItemToEdit(e.target.value)}
                    className="w-full rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] py-2 px-3.5 text-[13px] font-medium text-[#0a0a0a] hover:border-[#737373] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none cursor-pointer"
                  >
                    <option value="">{t.editor.selectItemPlaceholder}</option>
                    {targetType === 'frontend'
                      ? frontends.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} — {f.supportedPlatforms.join(', ')}
                          </option>
                        ))
                      : osFirmwares.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} — {c.targetDevices.join(', ')}
                          </option>
                        ))}
                  </select>
                </div>
              )}

              {/* Validation Banner if errors exist */}
              {errors.length > 0 && (
                <div className="rounded-[20px] border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-semibold text-amber-900">
                      {t.editor.errorsTitle.replace('{count}', String(errors.length))}
                    </span>
                    <ul className="list-disc list-inside text-[12px] text-amber-800 space-y-0.5">
                      {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Section A: Common Core Info */}
              <div className="rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-6 shadow-xs flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                  <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#737373]">
                    {t.editor.coreInfo}
                  </h3>
                  <span className="text-[11px] text-[#737373]">* 필수 입력</span>
                </div>

                {/* Name & ID Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      {t.editor.itemName} *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Daijishō, RetroArch, Atmosphère"
                      className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] py-2 px-3.5 text-[13px] text-[#0a0a0a] placeholder-[#737373] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-medium text-[#0a0a0a]">
                        {t.editor.slugId} *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setId(sanitizeSlug(name));
                          setIsSlugLocked(false);
                        }}
                        title={t.editor.autoSlug}
                        className="text-[11px] text-[#737373] hover:text-[#0a0a0a] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={11} />
                        <span>{t.editor.autoSlug}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={id}
                      onChange={(e) => {
                        setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                        setIsSlugLocked(true);
                      }}
                      placeholder="e.g. daijisho, retroarch"
                      className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] py-2 px-3.5 text-[13px] font-mono text-[#0a0a0a] placeholder-[#737373] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[#0a0a0a]">
                    {t.editor.shortDesc} *
                  </label>
                  <textarea
                    rows={2}
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="특징 및 지원 기능을 간결하게 1~2문장으로 설명해 주세요."
                    className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] py-2 px-3.5 text-[13px] text-[#0a0a0a] placeholder-[#737373] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Pricing & Status Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pricing Radio Group */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      {t.editor.pricingModel}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRICING_OPTIONS.map((price) => {
                        const isSelected = pricing === price;
                        return (
                          <button
                            key={price}
                            type="button"
                            onClick={() => setPricing(price)}
                            className={`rounded-[18px] px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a] shadow-xs'
                                : 'bg-[#fafafa] text-[#171717] border border-[#e5e5e5] hover:border-[#737373]'
                            }`}
                          >
                            {t.pricing[price]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Radio Group */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      {t.editor.projectStatus}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {STATUS_OPTIONS.map((st) => {
                        const isSelected = status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setStatus(st)}
                            className={`rounded-[18px] px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a] shadow-xs'
                                : 'bg-[#fafafa] text-[#171717] border border-[#e5e5e5] hover:border-[#737373]'
                            }`}
                          >
                            {t.status[st]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Resource Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#e5e5e5] pt-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-[#737373]">{t.editor.officialUrl}</label>
                    <input
                      type="url"
                      value={officialUrl}
                      onChange={(e) => setOfficialUrl(e.target.value)}
                      placeholder="https://..."
                      className="rounded-[16px] border border-[#e5e5e5] bg-[#fafafa] py-1.5 px-3 text-[12px] text-[#0a0a0a] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-[#737373]">{t.editor.downloadUrl}</label>
                    <input
                      type="url"
                      value={downloadUrl}
                      onChange={(e) => setDownloadUrl(e.target.value)}
                      placeholder="https://..."
                      className="rounded-[16px] border border-[#e5e5e5] bg-[#fafafa] py-1.5 px-3 text-[12px] text-[#0a0a0a] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-[#737373]">{t.editor.githubRepo}</label>
                    <input
                      type="text"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      placeholder="owner/repo"
                      className="rounded-[16px] border border-[#e5e5e5] bg-[#fafafa] py-1.5 px-3 text-[12px] text-[#0a0a0a] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Images & Real-time Thumbnail Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#e5e5e5] pt-4">
                  {/* Logo URL */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      {t.editor.logoUrl}
                    </label>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://..."
                      className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] py-2 px-3.5 text-[12px] text-[#0a0a0a] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
                    />
                    {/* Realtime logo thumbnail */}
                    <div className="flex items-center gap-3 p-2 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                      <div className="h-10 w-10 rounded-[10px] border border-[#e5e5e5] bg-[#ffffff] flex items-center justify-center overflow-hidden shrink-0">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt="Logo thumbnail"
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.src = '')}
                          />
                        ) : (
                          <ImageIcon size={16} className="text-[#737373]" />
                        )}
                      </div>
                      <span className="text-[11px] text-[#737373]">
                        {logoUrl ? '미리보기' : 'URL을 입력하면 실시간 미리보기가 표시됩니다'}
                      </span>
                    </div>
                  </div>

                  {/* Cover Image URL */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      {t.editor.coverImageUrl}
                    </label>
                    <input
                      type="url"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] py-2 px-3.5 text-[12px] text-[#0a0a0a] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
                    />
                    {/* Realtime cover thumbnail */}
                    <div className="flex items-center gap-3 p-2 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                      <div className="h-10 w-16 rounded-[10px] border border-[#e5e5e5] bg-[#ffffff] flex items-center justify-center overflow-hidden shrink-0">
                        {coverImageUrl ? (
                          <img
                            src={coverImageUrl}
                            alt="Cover thumbnail"
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.src = '')}
                          />
                        ) : (
                          <ImageIcon size={16} className="text-[#737373]" />
                        )}
                      </div>
                      <span className="text-[11px] text-[#737373]">
                        {coverImageUrl ? '미리보기' : '모달 배경 및 오픈그래프용 커버'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real UI Screenshot Gallery Manager */}
                <div className="flex flex-col gap-3 border-t border-[#e5e5e5] pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-[12px] font-semibold text-[#0a0a0a]">
                          {t.editor.screenshotsTitle}
                        </label>
                        <span className="rounded-[18px] bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5] px-2 py-0.2 text-[10px] font-medium tabular-nums">
                          {screenshots.length}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#737373] mt-0.5">
                        {t.editor.screenshotsDesc}
                      </p>
                    </div>
                  </div>

                  {/* Add URL Input and Action Row */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={newScreenshotUrl}
                        onChange={(e) => setNewScreenshotUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddScreenshot();
                          }
                        }}
                        placeholder={t.editor.screenshotUrlPlaceholder}
                        className="flex-1 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] py-2 px-3.5 text-[12px] text-[#0a0a0a] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddScreenshot}
                        disabled={!newScreenshotUrl.trim()}
                        className="inline-flex items-center justify-center gap-1.5 rounded-[18px] bg-[#0a0a0a] px-4 py-2 text-[12px] font-medium text-[#fafafa] hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-xs shrink-0"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                        <span>{t.editor.addScreenshot}</span>
                      </button>
                    </div>
                    <span className="text-[10.5px] text-[#a3a3a3]">
                      {t.editor.batchAddHelper}
                    </span>
                  </div>

                  {/* Screenshots Thumbnail List */}
                  {screenshots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 rounded-[18px] border border-dashed border-[#e5e5e5] bg-[#fafafa] text-center gap-1.5">
                      <ImageIcon size={24} className="text-[#a3a3a3] stroke-[1.5]" />
                      <span className="text-[12px] text-[#737373]">
                        {t.editor.noScreenshotsYet}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-1">
                      {screenshots.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video rounded-[14px] border border-[#e5e5e5] bg-[#0a0a0a] overflow-hidden group shadow-xs"
                        >
                          <img
                            src={url}
                            alt={`Screenshot ${idx + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.src = '')}
                          />

                          {/* Index Badge */}
                          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10">
                            <span className="rounded-[6px] bg-[#0a0a0a]/80 text-[#ffffff] px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-xs">
                              #{idx + 1}
                            </span>
                            {idx === 0 && (
                              <span className="rounded-[6px] bg-[#0a0a0a] text-[#ffffff] border border-[#ffffff]/20 px-1.5 py-0.5 text-[9px] font-semibold">
                                {t.editor.primaryScreenshot}
                              </span>
                            )}
                          </div>

                          {/* Top-Right Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(idx)}
                            aria-label="Remove screenshot"
                            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#0a0a0a]/80 hover:bg-rose-600 text-[#ffffff] backdrop-blur-xs transition-colors cursor-pointer z-10"
                          >
                            <X size={12} strokeWidth={2.5} />
                          </button>

                          {/* Bottom Reorder Controls on Hover */}
                          <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-[#0a0a0a]/80 to-transparent flex items-center justify-between opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                            <button
                              type="button"
                              onClick={() => handleMoveScreenshot(idx, idx - 1)}
                              disabled={idx === 0}
                              aria-label="Move left"
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ffffff]/20 hover:bg-[#ffffff]/40 disabled:opacity-20 text-[#ffffff] transition-all cursor-pointer disabled:cursor-not-allowed"
                            >
                              <ChevronLeft size={12} strokeWidth={2.5} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveScreenshot(idx, idx + 1)}
                              disabled={idx === screenshots.length - 1}
                              aria-label="Move right"
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ffffff]/20 hover:bg-[#ffffff]/40 disabled:opacity-20 text-[#ffffff] transition-all cursor-pointer disabled:cursor-not-allowed"
                            >
                              <ChevronRight size={12} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section B: 3 Curation Ratings (1-5 Picker) */}
              <div className="rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-6 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                  <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#737373]">
                    {t.editor.ratingsSection}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <RatingPicker
                    label={t.ratings.adoption}
                    category="adoption"
                    value={adoption}
                    onChange={setAdoption}
                  />

                  <RatingPicker
                    label={t.ratings.easeOfUse}
                    category="easeOfUse"
                    value={easeOfUse}
                    onChange={setEaseOfUse}
                  />

                  <RatingPicker
                    label={t.ratings.activity}
                    category="activity"
                    value={activity}
                    onChange={setActivity}
                  />
                </div>
              </div>

              {/* Section C: Type-Specific Attributes */}
              {targetType === 'frontend' ? (
                /* FRONTEND ATTRIBUTES */
                <div className="rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-6 shadow-xs flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                    <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#737373]">
                      {t.editor.frontendSpecs}
                    </h3>
                  </div>

                  {/* Supported Platforms Checkbox Chips */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      {t.editor.supportedPlatforms} *
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {FRONTEND_PLATFORMS.map((plat) => {
                        const isSelected = supportedPlatforms.includes(plat);
                        return (
                          <button
                            key={plat}
                            type="button"
                            onClick={() => handleTogglePlatform(plat)}
                            className={`rounded-[18px] px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a] shadow-xs'
                                : 'bg-[#fafafa] text-[#171717] border border-[#e5e5e5] hover:border-[#737373]'
                            }`}
                          >
                            {plat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Theme Support Level */}
                  <div className="flex flex-col gap-2 border-t border-[#e5e5e5] pt-4">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      {t.editor.themeSupport}
                    </label>
                    <div className="flex gap-2">
                      {THEME_OPTIONS.map((theme) => {
                        const isSelected = themeSupport === theme;
                        return (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => setThemeSupport(theme)}
                            className={`rounded-[18px] px-3.5 py-1 text-[12px] font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a] shadow-xs'
                                : 'bg-[#fafafa] text-[#171717] border border-[#e5e5e5] hover:border-[#737373]'
                            }`}
                          >
                            {theme}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TriState Feature Toggles */}
                  <div className="flex flex-col gap-2.5 border-t border-[#e5e5e5] pt-4">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      {t.editor.frontendFeatures}
                    </label>

                    <div className="flex flex-col gap-2">
                      <TriStateControl
                        label={t.features.builtInScraper}
                        value={hasBuiltInScraper}
                        onChange={setHasBuiltInScraper}
                      />

                      <TriStateControl
                        label={t.features.touchOptimized}
                        value={touchOptimized}
                        onChange={setTouchOptimized}
                      />

                      <TriStateControl
                        label={t.features.gamepadOptimized}
                        value={gamepadOptimized}
                        onChange={setGamepadOptimized}
                      />

                      <TriStateControl
                        label={t.features.canReplaceHomeLauncher}
                        value={canReplaceHomeLauncher}
                        onChange={setCanReplaceHomeLauncher}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* CFW / OS ATTRIBUTES */
                <div className="rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-6 shadow-xs flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                    <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#737373]">
                      {t.editor.cfwSpecs}
                    </h3>
                  </div>

                  {/* Category & FormFactor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[#0a0a0a]">
                        {t.editor.deviceCategory}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORY_OPTIONS.map((cat) => {
                          const isSelected = category === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setCategory(cat)}
                              className={`rounded-[18px] px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a] shadow-xs'
                                  : 'bg-[#fafafa] text-[#171717] border border-[#e5e5e5] hover:border-[#737373]'
                              }`}
                            >
                              {t.category[cat]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* FormFactor */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[#0a0a0a]">
                        {t.editor.formFactor}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {FORM_FACTOR_OPTIONS.map((ff) => {
                          const isSelected = formFactor === ff;
                          return (
                            <button
                              key={ff}
                              type="button"
                              onClick={() => setFormFactor(ff)}
                              className={`rounded-[18px] px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a] shadow-xs'
                                  : 'bg-[#fafafa] text-[#171717] border border-[#e5e5e5] hover:border-[#737373]'
                              }`}
                            >
                              {t.formFactor[ff]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Target Devices (comma-separated) */}
                  <div className="flex flex-col gap-1.5 border-t border-[#e5e5e5] pt-4">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      {t.editor.targetDevices} *
                    </label>
                    <input
                      type="text"
                      value={targetDevicesText}
                      onChange={(e) => setTargetDevicesText(e.target.value)}
                      placeholder="Nintendo Switch, Switch OLED, Switch Lite"
                      className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] py-2 px-3.5 text-[13px] text-[#0a0a0a] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
                    />
                  </div>

                  {/* Base System, Exploit Type, Default Frontend */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-[#737373]">
                        {t.editor.baseSystem} *
                      </label>
                      <input
                        type="text"
                        value={baseSystem}
                        onChange={(e) => setBaseSystem(e.target.value)}
                        placeholder="Buildroot Linux / Horizon Patch"
                        className="rounded-[16px] border border-[#e5e5e5] bg-[#fafafa] py-1.5 px-3 text-[12px] text-[#0a0a0a] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-[#737373]">
                        {t.editor.exploitType}
                      </label>
                      <input
                        type="text"
                        value={exploitType}
                        onChange={(e) => setExploitType(e.target.value)}
                        placeholder="Fusee-gelee / SD Boot / RGH"
                        className="rounded-[16px] border border-[#e5e5e5] bg-[#fafafa] py-1.5 px-3 text-[12px] text-[#0a0a0a] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-[#737373]">
                        {t.editor.defaultFrontend}
                      </label>
                      <input
                        type="text"
                        value={defaultFrontend}
                        onChange={(e) => setDefaultFrontend(e.target.value)}
                        placeholder="ES-DE / Aurora / Horizon Home"
                        className="rounded-[16px] border border-[#e5e5e5] bg-[#fafafa] py-1.5 px-3 text-[12px] text-[#0a0a0a] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* CFW TriState Feature Toggles */}
                  <div className="flex flex-col gap-2.5 border-t border-[#e5e5e5] pt-4">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      {t.editor.cfwFeatures}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <TriStateControl
                        label={t.features.portMaster}
                        value={portMaster}
                        onChange={setPortMaster}
                      />
                      <TriStateControl
                        label={t.features.sleepMode}
                        value={sleepMode}
                        onChange={setSleepMode}
                      />
                      <TriStateControl
                        label={t.features.hdmiOut}
                        value={hdmiOut}
                        onChange={setHdmiOut}
                      />
                      <TriStateControl
                        label={t.features.otaUpdate}
                        value={otaUpdate}
                        onChange={setOtaUpdate}
                      />
                      <TriStateControl
                        label={t.features.pluginLoader}
                        value={pluginLoader}
                        onChange={setPluginLoader}
                      />
                      <TriStateControl
                        label={t.features.emuNandOrSandbox}
                        value={emuNandOrSandbox}
                        onChange={setEmuNandOrSandbox}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ---------------------------------------------------------- */}
            {/* Right Column (col-span-5): Live Preview & Action Card      */}
            {/* ---------------------------------------------------------- */}
            <aside className="lg:col-span-5 flex flex-col gap-6 sticky top-20">
              {/* Top: Live ItemCard Preview */}
              <div className="rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-xs flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye size={15} className="text-[#737373]" />
                    <span className="text-[13px] font-semibold text-[#0a0a0a]">
                      {t.editor.livePreview}
                    </span>
                  </div>
                </div>

                {/* Render actual ItemCard with current preview data */}
                <div className="max-w-[340px] mx-auto w-full">
                  <ItemCard item={previewItem} type={targetType} />
                </div>
              </div>

              {/* Bottom: Action Card (Admin direct save / User proposal submit) */}
              <div className="rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send size={15} className="text-[#737373]" />
                    <span className="text-[13px] font-semibold text-[#0a0a0a]">
                      {isAdmin ? t.editor.actionCardAdminTitle : t.editor.actionCardUserTitle}
                    </span>
                  </div>
                  {activeProposalId && (
                    <span className="rounded-[10px] bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      {t.editor.reviewingProposal}
                    </span>
                  )}
                </div>

                {/* Status Message */}
                {statusMessage && (
                  <div
                    className={`flex items-start gap-2 p-3 rounded-[16px] text-[12px] leading-relaxed ${
                      statusMessage.type === 'success'
                        ? 'bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534]'
                        : 'bg-[#fef2f2] border border-[#fecaca] text-[#991b1b]'
                    }`}
                  >
                    {statusMessage.type === 'success' ? (
                      <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    )}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5">
                  {isAdmin ? (
                    <>
                      {activeProposalId && (
                        <div className="rounded-[16px] border border-amber-200 bg-amber-50/70 p-3 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-amber-900">
                              {t.editor.reviewingProposalId.replace('{id}', activeProposalId.slice(0, 8))}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveProposalId(null);
                                setStatusMessage(null);
                              }}
                              className="text-[11px] font-medium text-amber-800 hover:underline cursor-pointer"
                            >
                              {t.editor.cancelReview}
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleSaveToDb}
                        disabled={isSubmitting || errors.length > 0}
                        className="inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#0a0a0a] px-4 text-[13px] font-medium text-[#fafafa] hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
                      >
                        <Database size={15} />
                        <span>
                          {isSubmitting
                            ? t.editor.saving
                            : activeProposalId
                            ? t.editor.approveProposal
                            : t.editor.saveToDb}
                        </span>
                        <span className="rounded-[6px] bg-[#262626] px-1.5 py-0.2 text-[9px] font-bold text-amber-400">
                          ADMIN
                        </span>
                      </button>
                      <p className="text-[11px] text-[#737373] text-center px-1">
                        {t.editor.adminSaveSubtext}
                      </p>
                    </>
                  ) : user ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSubmitProposal}
                        disabled={isSubmitting || errors.length > 0}
                        className="inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#0a0a0a] px-4 text-[13px] font-medium text-[#fafafa] hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
                      >
                        <Send size={15} />
                        <span>{isSubmitting ? t.editor.submitting : t.editor.submitProposal}</span>
                      </button>
                      <p className="text-[11px] text-[#737373] text-center px-1 leading-relaxed">
                        {t.editor.userSubmitSubtext}
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <button
                        type="button"
                        onClick={() => openAuthModal(t.editor.needLoginProposal)}
                        className="inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#0a0a0a] px-4 text-[13px] font-medium text-[#fafafa] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                      >
                        <LogIn size={15} />
                        <span>{t.editor.loginToSubmit}</span>
                      </button>
                      <p className="text-[11px] text-[#737373] text-center px-1 leading-relaxed">
                        {t.editor.guestSubmitSubtext}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
