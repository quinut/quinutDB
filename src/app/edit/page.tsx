import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Code2,
  PlusCircle,
  Edit3,
  Eye,
  Image as ImageIcon,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
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
  CFWFeatures,
} from '../../types';
import { useCatalog } from '../../hooks/useCatalog';
import { useAuth } from '../../contexts/AuthContext';
import { ItemCard } from '../../components/ItemCard';
import { Database } from 'lucide-react';

export interface EditPageProps {
  onNavigateHome?: () => void;
}

type Mode = 'create' | 'edit';
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

const FORM_FACTOR_OPTIONS: FormFactor[] = ['Handheld', 'Home', 'Hybrid'];

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

const RATING_DESCRIPTIONS: Record<
  'adoption' | 'easeOfUse' | 'activity',
  Record<ScoreValue, string>
> = {
  adoption: {
    5: '사실상 표준 (Industry Standard & Ecosystem)',
    4: '높은 대중성 (Widely Adopted & Strong Community)',
    3: '안정적 생태계 (Established Base & Community)',
    2: '성장/틈새 (Emerging Niche Alternative)',
    1: '소수/신생 (Specialized or Early Stage)',
  },
  easeOfUse: {
    5: '원클릭 완벽 (Zero Setup / Instant Out-of-the-Box)',
    4: '간편한 GUI 설정 (Straightforward UI Setup)',
    3: '보통 난이도 (Standard Setup / Guide Recommended)',
    2: '수동 설정 필요 (Complex Manual Configuration)',
    1: '전문가 수준 (CLI / Deep Modding Skills)',
  },
  activity: {
    5: '매우 활발 (Frequent Releases & Very Active)',
    4: '정기적 업데이트 (Regular Stable Updates)',
    3: '안정화 단계 (Mature Stage / Occasional Patch)',
    2: '업데이트 저조 (Infrequent Updates / Near Stale)',
    1: '방치 / EOL (Dormant or Discontinued)',
  },
};

const RatingPicker: React.FC<RatingPickerProps> = ({
  label,
  category,
  value,
  onChange,
}) => {
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
              aria-label={`${label} ${level}점`}
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
        {RATING_DESCRIPTIONS[category][value]}
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
          <span>Yes</span>
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
          <span>✕ No</span>
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
          <span>? Unknown</span>
        </button>
      </div>
    </div>
  );
};

export default function EditPage({ onNavigateHome }: EditPageProps) {
  const { frontends, osFirmwares, saveItem, isFromDatabase } = useCatalog();
  const { user, profile, openAuthModal, signOut } = useAuth();
  const [isSavingDb, setIsSavingDb] = useState(false);

  const [dbSaveSuccess, setDbSaveSuccess] = useState(false);
  const [dbSaveError, setDbSaveError] = useState<string | null>(null);

  // Navigation & Mode selection
  const [mode, setMode] = useState<Mode>('create');
  const [targetType, setTargetType] = useState<ItemType>('frontend');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isSlugLocked, setIsSlugLocked] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Switch Mode or Type
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setSelectedItemId('');
    if (newMode === 'create') {
      resetForm(targetType);
    }
  };

  const handleTypeChange = (newType: ItemType) => {
    setTargetType(newType);
    setSelectedItemId('');
    resetForm(newType);
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
    if (!name.trim()) list.push('이름(Name)을 입력해 주세요.');
    if (!id.trim()) list.push('ID (Slug)를 입력해 주세요.');
    else if (!/^[a-z0-9-]+$/.test(id))
      list.push('ID는 영문 소문자, 숫자, 대시(-)만 사용 가능합니다.');
    if (!shortDesc.trim()) list.push('한 줄 설명(shortDesc)을 입력해 주세요.');
    if (targetType === 'frontend' && supportedPlatforms.length === 0)
      list.push('지원 플랫폼을 하나 이상 선택해 주세요.');
    if (targetType === 'cfw' && !targetDevicesText.trim())
      list.push('타겟 디바이스(Target Devices)를 입력해 주세요.');
    return list;
  }, [name, id, shortDesc, targetType, supportedPlatforms, targetDevicesText]);

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
        coverImageUrl: coverImageUrl || logoUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        officialUrl: officialUrl || undefined,
        downloadUrl: downloadUrl || undefined,
        githubRepo: githubRepo || undefined,
      };
      return item;
    } else {
      const devices = targetDevicesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const featuresObj: CFWFeatures = {
        portMaster,
        sleepMode,
        hdmiOut,
        otaUpdate,
        pluginLoader,
        emuNandOrSandbox,
      };

      const item: OSFirmwareItem = {
        id: id || 'preview-slug',
        name: name || 'Preview CFW / OS Name',
        shortDesc: shortDesc || 'A short description of this custom firmware will appear here in the preview.',
        pricing,
        status,
        category,
        formFactor,
        targetDevices: devices.length > 0 ? devices : ['Custom Handheld'],
        baseSystem: baseSystem || 'Linux / Kernel',
        exploitType: exploitType || undefined,
        defaultFrontend: defaultFrontend || undefined,
        features: featuresObj,
        ratings: ratingsObj,
        logoUrl: logoUrl || 'https://avatars.githubusercontent.com/u/37918415?v=4',
        coverImageUrl: coverImageUrl || logoUrl || '',
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

  // Formatted TypeScript Code for export
  const generatedCode = useMemo(() => {
    const obj: Record<string, any> = {
      id,
      name,
      shortDesc,
      pricing,
      status,
    };

    if (targetType === 'frontend') {
      obj.supportedPlatforms = supportedPlatforms;
      obj.hasBuiltInScraper = hasBuiltInScraper;
      obj.themeSupport = themeSupport;
      obj.touchOptimized = touchOptimized;
      obj.gamepadOptimized = gamepadOptimized;
      obj.canReplaceHomeLauncher = canReplaceHomeLauncher;
    } else {
      obj.category = category;
      obj.formFactor = formFactor;
      obj.targetDevices = targetDevicesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      obj.baseSystem = baseSystem;
      if (exploitType) obj.exploitType = exploitType;
      if (defaultFrontend) obj.defaultFrontend = defaultFrontend;
      obj.features = {
        portMaster,
        sleepMode,
        hdmiOut,
        otaUpdate,
        pluginLoader,
        emuNandOrSandbox,
      };
    }

    obj.ratings = {
      adoption,
      easeOfUse,
      activity,
    };

    if (logoUrl) obj.logoUrl = logoUrl;
    if (coverImageUrl) obj.coverImageUrl = coverImageUrl;
    if (officialUrl) obj.officialUrl = officialUrl;
    if (downloadUrl) obj.downloadUrl = downloadUrl;
    if (githubRepo) obj.githubRepo = githubRepo;

    return JSON.stringify(obj, null, 2);
  }, [
    targetType,
    id,
    name,
    shortDesc,
    pricing,
    status,
    supportedPlatforms,
    hasBuiltInScraper,
    themeSupport,
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
    adoption,
    easeOfUse,
    activity,
    logoUrl,
    coverImageUrl,
    officialUrl,
    downloadUrl,
    githubRepo,
  ]);

  // Action 1: Copy TypeScript Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Action 2: Save to Supabase Database
  const handleSaveToDb = async () => {
    if (!user) {
      openAuthModal('데이터베이스에 아이템을 저장하려면 로그인이 필요합니다.');
      return;
    }
    if (!name.trim() || !id.trim()) {
      setDbSaveError('아이템 이름과 고유 식별자(ID)를 입력해 주세요.');
      return;
    }

    setIsSavingDb(true);
    setDbSaveError(null);
    setDbSaveSuccess(false);

    const { error } = await saveItem(previewItem, targetType);
    setIsSavingDb(false);

    if (error) {
      setDbSaveError(error.message || '데이터베이스 저장 중 오류가 발생했습니다.');
    } else {
      setDbSaveSuccess(true);
      setTimeout(() => setDbSaveSuccess(false), 3500);
    }
  };

  // Action 2: GitHub Issue URL
  const githubIssueUrl = useMemo(() => {
    const issueTitle = encodeURIComponent(
      `[Catalog] ${mode === 'create' ? 'Add' : 'Update'} ${name || id || 'New Item'} (${targetType.toUpperCase()})`
    );

    const issueBody = encodeURIComponent(
      `### 🎮 Item Contribution Summary\n` +
        `- **Name**: ${name}\n` +
        `- **Type**: ${targetType === 'frontend' ? 'Frontend' : 'CFW / OS'}\n` +
        `- **Slug / ID**: \`${id}\`\n` +
        `- **Pricing**: ${pricing}\n` +
        `- **Status**: ${status}\n` +
        `- **Official Website**: ${officialUrl || 'N/A'}\n` +
        `- **GitHub Repository**: ${githubRepo ? `https://github.com/${githubRepo}` : 'N/A'}\n` +
        `- **Download URL**: ${downloadUrl || 'N/A'}\n\n` +
        `### ⭐ 1–5 Ratings\n` +
        `- **Adoption**: ${adoption}/5 (${RATING_DESCRIPTIONS.adoption[adoption]})\n` +
        `- **Ease of Use**: ${easeOfUse}/5 (${RATING_DESCRIPTIONS.easeOfUse[easeOfUse]})\n` +
        `- **Activity**: ${activity}/5 (${RATING_DESCRIPTIONS.activity[activity]})\n\n` +
        `### 📝 Description\n${shortDesc}\n\n` +
        `### 💻 TypeScript Object Code\n\`\`\`typescript\n${generatedCode}\n\`\`\`\n\n` +
        `---\n*Generated with QuinutDB Catalog Editor (db.quinut.xyz/edit)*`
    );

    return `https://github.com/quinut/db/issues/new?title=${issueTitle}&body=${issueBody}`;
  }, [
    name,
    id,
    mode,
    targetType,
    pricing,
    status,
    officialUrl,
    githubRepo,
    downloadUrl,
    adoption,
    easeOfUse,
    activity,
    shortDesc,
    generatedCode,
  ]);

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
              <span>QuinutDB 홈으로 돌아가기</span>
            </button>
            <div className="h-4 w-px bg-[#e5e5e5] hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-semibold tracking-[-0.4px] text-[#0a0a0a]">
                Catalog Web Editor
              </span>
              <span className="rounded-[18px] bg-[#0a0a0a] px-2 py-0.5 text-[10px] font-medium text-[#fafafa]">
                PR Assistant
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-[18px] bg-[#0a0a0a] px-3.5 py-1.5 text-[12px] font-medium text-[#fafafa] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? '복사 완료!' : 'TS 코드 복사'}</span>
            </button>

            <a
              href={githubIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] px-3 py-1.5 text-[12px] font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">GitHub 이슈 제보</span>
            </a>

            {/* User Auth Section */}
            {user ? (
              <div className="flex items-center gap-1.5 p-0.5 pr-2.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa]">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile?.username || 'User'}
                    className="h-6 w-6 rounded-full object-cover border border-[#e5e5e5]"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0a0a0a] text-[10px] font-bold text-[#fafafa]">
                    {(profile?.username || user.email || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="text-[12px] font-medium text-[#0a0a0a] max-w-[80px] truncate hidden sm:inline">
                  {profile?.username || user.user_metadata?.user_name || 'User'}
                </span>
                {profile?.is_admin && (
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
                <span>로그인</span>
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
          {/* Mode Selector: Create vs Edit */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-[#737373]">작업 모드:</span>
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
                <span>신규 아이템 생성</span>
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
                <span>기존 아이템 수정</span>
              </button>
            </div>
          </div>

          {/* Category: Frontend */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-[#737373]">카테고리:</span>
            <div className="inline-flex items-center gap-1.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-[12px] font-medium text-[#0a0a0a] shadow-2xs">
              <Layers size={13} />
              <span>Frontend ({frontends.length})</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. Main Workspace: 2-Column Responsive Layout                */}
      {/* ============================================================ */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                    수정할 {targetType === 'frontend' ? 'Frontend' : 'CFW / OS'} 선택
                  </span>
                  <span className="text-[11px] text-[#737373]">
                    선택 시 폼에 모든 데이터가 자동 프리필됩니다
                  </span>
                </div>

                <select
                  value={selectedItemId}
                  onChange={(e) => handleSelectItemToEdit(e.target.value)}
                  className="w-full rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] py-2 px-3.5 text-[13px] font-medium text-[#0a0a0a] hover:border-[#737373] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none cursor-pointer"
                >
                  <option value="">-- 아이템을 선택해 주세요 --</option>
                  {targetType === 'frontend'
                    ? frontends.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.pricing}) — {f.supportedPlatforms.join(', ')}
                        </option>
                      ))
                    : osFirmwares.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.category}) — {c.targetDevices.join(', ')}
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
                    필수 입력 항목 확인 ({errors.length}개)
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
                  1. 기본 메타데이터 (Core Info)
                </h3>
                <span className="text-[11px] text-[#737373]">* 필수 입력</span>
              </div>

              {/* Name & ID Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[#0a0a0a]">
                    아이템 이름 (Name) *
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
                      고유 ID / Slug *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setId(sanitizeSlug(name));
                        setIsSlugLocked(false);
                      }}
                      title="이름을 바탕으로 슬러그 자동 생성"
                      className="text-[11px] text-[#737373] hover:text-[#0a0a0a] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={11} />
                      <span>자동 생성</span>
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
                  한 줄 설명 (Short Description) *
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
                    가격 정책 (Pricing)
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
                          {price === 'Free & Open Source' ? 'FOSS' : price}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Radio Group */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[#0a0a0a]">
                    프로젝트 상태 (Status)
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
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Resource Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#e5e5e5] pt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-[#737373]">공식 웹사이트 URL</label>
                  <input
                    type="url"
                    value={officialUrl}
                    onChange={(e) => setOfficialUrl(e.target.value)}
                    placeholder="https://..."
                    className="rounded-[16px] border border-[#e5e5e5] bg-[#fafafa] py-1.5 px-3 text-[12px] text-[#0a0a0a] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-[#737373]">다운로드 / 배포 URL</label>
                  <input
                    type="url"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https://..."
                    className="rounded-[16px] border border-[#e5e5e5] bg-[#fafafa] py-1.5 px-3 text-[12px] text-[#0a0a0a] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-[#737373]">GitHub 저장소 (owner/repo)</label>
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
                    로고 / 1:1 박스아트 이미지 URL (Logo URL)
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://... (1:1 권장)"
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
                      {logoUrl ? '로고 미리보기' : 'URL을 입력하면 실시간 미리보기가 표시됩니다'}
                    </span>
                  </div>
                </div>

                {/* Cover Image URL */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[#0a0a0a]">
                    커버 / 배너 이미지 URL (Cover Image URL)
                  </label>
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://... (배너 권장)"
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
                      {coverImageUrl ? '배너 미리보기' : '모달 배경 및 오픈그래프용 커버'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section B: 3 Curation Ratings (1-5 Picker) */}
            <div className="rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#737373]">
                  2. 3대 큐레이션 평가 점수 (Ratings: 1–5점)
                </h3>
                <span className="text-[11px] text-[#737373]">클릭하여 점수 부여</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <RatingPicker
                  label="대중성 & 생태계 (Adoption)"
                  category="adoption"
                  value={adoption}
                  onChange={setAdoption}
                />

                <RatingPicker
                  label="설정 난이도 (Ease of Use)"
                  category="easeOfUse"
                  value={easeOfUse}
                  onChange={setEaseOfUse}
                />

                <RatingPicker
                  label="업데이트 활성도 (Activity)"
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
                    3. 프론트엔드 전용 사양 (Frontend Specs)
                  </h3>
                  <span className="text-[11px] text-[#737373]">지원 플랫폼 & 기능</span>
                </div>

                {/* Supported Platforms Checkbox Chips */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[#0a0a0a]">
                    지원 플랫폼 (Supported Platforms) * (다중 선택)
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
                    테마 커스터마이징 지원 (Theme Support)
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
                          {theme} {theme === 'Rich' ? '🎨' : theme === 'Basic' ? '📐' : '🚫'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TriState Feature Toggles */}
                <div className="flex flex-col gap-2.5 border-t border-[#e5e5e5] pt-4">
                  <label className="text-[12px] font-medium text-[#0a0a0a]">
                    핵심 기능 지원 여부 (TriState Features)
                  </label>

                  <div className="flex flex-col gap-2">
                    <TriStateControl
                      label="내장 스크래퍼 (Built-in Scraper)"
                      description="인게임 및 온라인 커버/박스아트 자동 다운로드 기능"
                      value={hasBuiltInScraper}
                      onChange={setHasBuiltInScraper}
                    />

                    <TriStateControl
                      label="터치 최적화 (Touch Optimized)"
                      description="터치스크린 및 모바일 스마트폰 전용 조작 인터페이스"
                      value={touchOptimized}
                      onChange={setTouchOptimized}
                    />

                    <TriStateControl
                      label="게임패드 최적화 (Gamepad Optimized)"
                      description="컨트롤러 십자키 및 아날로그 스틱 완벽 탐색"
                      value={gamepadOptimized}
                      onChange={setGamepadOptimized}
                    />

                    <TriStateControl
                      label="홈 런처 대체 (Replace Home Launcher)"
                      description="안드로이드 등의 기본 홈 화면으로 교체 지정 가능 여부"
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
                    3. CFW / 커스텀 OS 전용 사양 (OS Specs)
                  </h3>
                  <span className="text-[11px] text-[#737373]">타겟 기기 & 베이스 시스템</span>
                </div>

                {/* Category & FormFactor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      기기 카테고리 (Device Category)
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
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* FormFactor */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      폼팩터 (Form Factor)
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
                            {ff}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Target Devices (comma-separated) */}
                <div className="flex flex-col gap-1.5 border-t border-[#e5e5e5] pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-medium text-[#0a0a0a]">
                      타겟 지원 기기 (Target Devices) * (쉼표로 구분)
                    </label>
                    <span className="text-[11px] text-[#737373]">
                      예: Nintendo Switch, Switch OLED, Switch Lite
                    </span>
                  </div>
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
                      베이스 커널/OS (Base System) *
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
                      익스플로잇/부팅 방식 (Exploit)
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
                      기본 런처/UI (Default Frontend)
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
                    CFW 기능 지원 여부 (Features)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <TriStateControl
                      label="PortMaster 지원"
                      value={portMaster}
                      onChange={setPortMaster}
                    />
                    <TriStateControl
                      label="슬립 모드 (Sleep Mode)"
                      value={sleepMode}
                      onChange={setSleepMode}
                    />
                    <TriStateControl
                      label="HDMI TV 출력"
                      value={hdmiOut}
                      onChange={setHdmiOut}
                    />
                    <TriStateControl
                      label="무선 OTA 업데이트"
                      value={otaUpdate}
                      onChange={setOtaUpdate}
                    />
                    <TriStateControl
                      label="플러그인 로더 (Tesla/Plugin)"
                      value={pluginLoader}
                      onChange={setPluginLoader}
                    />
                    <TriStateControl
                      label="에뮤낸드 / 샌드박스 (EmuNAND)"
                      value={emuNandOrSandbox}
                      onChange={setEmuNandOrSandbox}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Right Column (col-span-5): Live Preview & Code Export      */}
          {/* ---------------------------------------------------------- */}
          <aside className="lg:col-span-5 flex flex-col gap-6 sticky top-20">
            {/* Top: Live ItemCard Preview */}
            <div className="rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-xs flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={15} className="text-[#737373]" />
                  <span className="text-[13px] font-semibold text-[#0a0a0a]">
                    실시간 카드 라이브 프리뷰
                  </span>
                </div>
                <span className="text-[11px] text-[#737373]">Live Card Preview</span>
              </div>

              {/* Render actual ItemCard with current preview data */}
              <div className="max-w-[340px] mx-auto w-full">
                <ItemCard item={previewItem} type={targetType} />
              </div>
            </div>

            {/* Bottom: Generated TypeScript Object Code Viewer */}
            <div className="rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-xs flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 size={15} className="text-[#737373]" />
                  <span className="text-[13px] font-semibold text-[#0a0a0a]">
                    생성된 TypeScript 코드
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 rounded-[14px] border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-[11px] font-medium text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copied ? '복사됨' : '복사'}</span>
                </button>
              </div>

              {/* Monochromatic code viewer block */}
              <div className="relative max-h-[300px] overflow-auto rounded-[16px] border border-[#e5e5e5] bg-[#0a0a0a] p-4 text-[11px] font-mono text-[#fafafa] leading-relaxed select-all">
                <pre>{generatedCode}</pre>
              </div>

              {/* Export Actions Box */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#e5e5e5]">
                {dbSaveSuccess && (
                  <div className="flex items-center gap-2 p-2.5 rounded-[14px] bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-[12px] font-medium">
                    <CheckCircle2 size={15} />
                    <span>✓ 데이터베이스에 성공적으로 저장되었습니다!</span>
                  </div>
                )}
                {dbSaveError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-[14px] bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[12px] font-medium">
                    <AlertCircle size={15} />
                    <span>{dbSaveError}</span>
                  </div>
                )}

                {/* 1. Database Direct Save Button */}
                <button
                  type="button"
                  onClick={handleSaveToDb}
                  disabled={isSavingDb}
                  className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#0a0a0a] px-4 text-[13px] font-medium text-[#fafafa] hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
                >
                  <Database size={15} />
                  <span>
                    {isSavingDb
                      ? '데이터베이스 저장 중...'
                      : '💾 데이터베이스(Supabase)에 즉시 저장'}
                  </span>
                </button>

                {/* 2. Copy TypeScript Code */}
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex h-[40px] w-full items-center justify-center gap-2 rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] px-4 text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors cursor-pointer shadow-2xs"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>클립보드 복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>📋 TypeScript 코드 복사하기 (기여용)</span>
                    </>
                  )}
                </button>

                {/* 3. GitHub Issue Submission */}
                <a
                  href={githubIssueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[40px] w-full items-center justify-center gap-2 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-4 text-[13px] font-medium text-[#737373] hover:text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors shadow-2xs"
                >
                  <ExternalLink size={15} />
                  <span>🐙 GitHub 이슈로 제보하기 (코드 자동 첨부)</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
