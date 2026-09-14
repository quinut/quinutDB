import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rawFrontends, rawOSFirmwares } from '../src/data/registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to extract GitHub owner & repo
function parseGitHub(urlOrRepo) {
  if (!urlOrRepo) return null;
  const cleaned = urlOrRepo.replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').trim();
  const parts = cleaned.split('/');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

// Helper to extract GitLab project path
function parseGitLab(url) {
  if (!url || !url.includes('gitlab.com')) return null;
  const match = url.match(/gitlab\.com\/([^\/]+\/[^\/\.]+)/i);
  return match ? match[1] : null;
}

// Fetch GitHub metadata
async function fetchGitHubMeta(owner, repo) {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'User-Agent': 'QuinutDB-Catalog-Bot'
      }
    });

    if (!res.ok) {
      console.warn(`  ⚠️ [GitHub API] ${owner}/${repo} returned HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();

    // Check if owner is an Organization or User
    let orgAvatar = data.owner?.avatar_url || '';
    if (data.owner?.type === 'User') {
      // Check if an organization exists with the repo's name (e.g. Daijishou)
      try {
        const orgRes = await fetch(`https://api.github.com/orgs/${data.name}`, {
          headers: { 'User-Agent': 'QuinutDB-Catalog-Bot' }
        });
        if (orgRes.ok) {
          const orgData = await orgRes.json();
          if (orgData.avatar_url) {
            orgAvatar = orgData.avatar_url;
          }
        }
      } catch {
        // ignore
      }
    }

    return {
      name: data.name,
      description: data.description,
      homepage: data.homepage || data.html_url,
      avatarUrl: orgAvatar,
      releasesUrl: `${data.html_url}/releases`,
      githubRepo: `${data.owner.login}/${data.name}`
    };
  } catch (err) {
    console.warn(`  ⚠️ [GitHub Fetch Error] ${owner}/${repo}:`, err.message);
    return null;
  }
}

// Fetch GitLab metadata
async function fetchGitLabMeta(projectPath) {
  try {
    const encoded = encodeURIComponent(projectPath);
    const res = await fetch(`https://gitlab.com/api/v4/projects/${encoded}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.name,
      description: data.description,
      homepage: data.web_url,
      avatarUrl: data.avatar_url || (data.namespace?.avatar_url ? `https://gitlab.com${data.namespace.avatar_url}` : ''),
      releasesUrl: `${data.web_url}/-/releases`
    };
  } catch {
    return null;
  }
}

async function run() {
  console.log('🔄 QuinutDB Catalog Fetcher: Processing entries...');

  // 1. Process Frontends
  const processedFrontends = [];
  for (const item of rawFrontends) {
    console.log(`  -> Fetching Frontend: ${item.name} (${item.url})`);
    const gh = parseGitHub(item.url);
    const glPath = parseGitLab(item.url);

    let fetched = null;
    if (gh) {
      fetched = await fetchGitHubMeta(gh.owner, gh.repo);
    } else if (glPath) {
      fetched = await fetchGitLabMeta(glPath);
    }

    const id = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const finalLogo = item.logoUrl || fetched?.avatarUrl || '';
    const finalDesc = item.shortDesc || fetched?.description || `${item.name} retro emulation launcher.`;
    const finalOfficial = item.officialUrl || (item.url.startsWith('http') ? item.url : (fetched?.homepage || `https://github.com/${item.url}`));
    const finalDownload = item.downloadUrl || fetched?.releasesUrl || finalOfficial;
    const isFOSS = Boolean(gh || glPath);

    processedFrontends.push({
      id,
      name: item.name,
      shortDesc: finalDesc,
      pricing: item.pricing || (isFOSS ? 'Free & Open Source' : 'Free'),
      status: 'Active',
      supportedPlatforms: item.supportedPlatforms || ['Android', 'Linux', 'Windows'],
      hasBuiltInScraper: item.hasBuiltInScraper ?? true,
      themeSupport: item.themeSupport || 'Rich',
      touchOptimized: item.touchOptimized ?? false,
      gamepadOptimized: item.gamepadOptimized ?? true,
      canReplaceHomeLauncher: item.canReplaceHomeLauncher ?? false,
      ratings: item.ratings || { adoption: 3, easeOfUse: 3, activity: 3 },
      logoUrl: finalLogo,
      coverImageUrl: item.coverImageUrl || (gh ? `https://opengraph.githubassets.com/1/${gh.owner}/${gh.repo}` : finalLogo),
      officialUrl: finalOfficial,
      downloadUrl: finalDownload,
      githubRepo: gh ? `${gh.owner}/${gh.repo}` : undefined
    });
  }

  // 2. Process CFWs
  const processedCFWs = [];
  for (const item of rawOSFirmwares) {
    console.log(`  -> Fetching CFW: ${item.name} (${item.url})`);
    const gh = parseGitHub(item.url);
    const glPath = parseGitLab(item.url);

    let fetched = null;
    if (gh) {
      fetched = await fetchGitHubMeta(gh.owner, gh.repo);
    } else if (glPath) {
      fetched = await fetchGitLabMeta(glPath);
    }

    const id = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const finalLogo = item.logoUrl || fetched?.avatarUrl || '';
    const finalDesc = item.shortDesc || fetched?.description || `${item.name} custom firmware system.`;
    const finalOfficial = item.officialUrl || (item.url.startsWith('http') ? item.url : (fetched?.homepage || `https://github.com/${item.url}`));
    const finalDownload = item.downloadUrl || fetched?.releasesUrl || finalOfficial;
    const isFOSS = Boolean(gh || glPath);

    processedCFWs.push({
      id,
      name: item.name,
      shortDesc: finalDesc,
      pricing: item.pricing || (isFOSS ? 'Free & Open Source' : 'Free'),
      status: 'Active',
      category: item.category,
      targetDevices: item.targetDevices,
      baseSystem: item.baseSystem,
      exploitType: item.exploitType,
      defaultFrontend: item.defaultFrontend,
      ratings: item.ratings || { adoption: 3, easeOfUse: 3, activity: 3 },
      logoUrl: finalLogo,
      coverImageUrl: item.coverImageUrl || (gh ? `https://opengraph.githubassets.com/1/${gh.owner}/${gh.repo}` : finalLogo),
      officialUrl: finalOfficial,
      downloadUrl: finalDownload,
      githubRepo: gh ? `${gh.owner}/${gh.repo}` : undefined
    });
  }

  // 3. Write output to src/data/catalog.ts (Primary real catalog database)
  const catalogFilePath = path.join(ROOT_DIR, 'src', 'data', 'catalog.ts');
  const catalogContent = `// AUTO-GENERATED by scripts/fetchMetadata.mjs. DO NOT EDIT DIRECTLY.
// Update src/data/registry.js and run: npm run fetch-meta

import { FrontendItem, OSFirmwareItem } from '../types';

export const frontends: FrontendItem[] = ${JSON.stringify(processedFrontends, null, 2)};

export const osFirmwares: OSFirmwareItem[] = ${JSON.stringify(processedCFWs, null, 2)};

// Aliases for backwards compatibility
export const mockFrontends = frontends;
export const mockOSFirmwares = osFirmwares;
`;

  fs.writeFileSync(catalogFilePath, catalogContent, 'utf-8');

  // Also write src/data/mockData.ts as a re-export
  const mockDataFilePath = path.join(ROOT_DIR, 'src', 'data', 'mockData.ts');
  const mockDataContent = `// Re-export from production catalog database
export * from './catalog';
`;
  fs.writeFileSync(mockDataFilePath, mockDataContent, 'utf-8');

  console.log(`\n✨ Done! Generated ${processedFrontends.length} Frontends & ${processedCFWs.length} CFWs in src/data/catalog.ts`);
}

run();
