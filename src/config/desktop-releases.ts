import { MBMC_DESKTOP_DOWNLOAD_URL } from "@/config/public-destinations";

export type DesktopRelease = {
  version: string;
  build?: number;
  label?: string;
  releasedAt?: string;
  minMacOS?: string;
  architecture?: string;
  notarized?: boolean;
  downloadUrl: string;
  filename: string;
  sha256?: string;
  current?: boolean;
  legacy?: boolean;
};

export const MBMC_DESKTOP_RELEASES: readonly DesktopRelease[] = [
  {
    version: "1.0.0",
    build: 3,
    minMacOS: "13+",
    architecture: "Universal · arm64 + x86_64",
    notarized: true,
    downloadUrl: MBMC_DESKTOP_DOWNLOAD_URL,
    filename: "MBMC-Desktop-1.0.0-3.dmg",
    current: true,
  },
  {
    version: "1.0.0 Beta",
    label: "v1.0.0 Beta · Legacy",
    architecture: "Universal ZIP",
    downloadUrl:
      "https://download.mbmc.vn/mbmc-desktop/MBMC-Desktop-V1.0-Beta-Universal.zip",
    filename: "MBMC-Desktop-V1.0-Beta-Universal.zip",
    legacy: true,
    current: false,
  },
];

function hasValidDownloadUrl(release: DesktopRelease) {
  try {
    return new URL(release.downloadUrl).protocol === "https:";
  } catch {
    return false;
  }
}

export const DOWNLOADABLE_MBMC_DESKTOP_RELEASES = [
  ...MBMC_DESKTOP_RELEASES.filter(hasValidDownloadUrl),
].sort((left, right) => {
  if (left.current !== right.current) return left.current ? -1 : 1;
  return (right.releasedAt ?? "").localeCompare(left.releasedAt ?? "");
});

export const CURRENT_MBMC_DESKTOP_RELEASE =
  DOWNLOADABLE_MBMC_DESKTOP_RELEASES.find((release) => release.current) ??
  DOWNLOADABLE_MBMC_DESKTOP_RELEASES[0];

