import type { ReactNode } from "react";
import type { Site } from "@/lib/content";

export type SocialPlatform = "instagram" | "tiktok" | "pinterest" | "facebook" | "youtube" | "linkedin";

type SocialAccount = {
  platform: SocialPlatform;
  label: string;
  /** Account name as shown on the site, or undefined while it is still to be added. */
  handle?: string;
  href?: string;
  icon: ReactNode;
};

const platforms: {
  platform: SocialPlatform;
  label: string;
  url: (handle: string) => string;
  display: (handle: string) => string;
  icon: ReactNode;
}[] = [
  {
    platform: "instagram",
    label: "Instagram",
    url: (h) => `https://www.instagram.com/${h}/`,
    display: (h) => h,
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </>
    ),
  },
  {
    platform: "tiktok",
    label: "TikTok",
    url: (h) => `https://www.tiktok.com/@${h}`,
    display: (h) => `@${h}`,
    icon: (
      <>
        <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M14 3c.5 2.5 2.5 4.5 5 5" />
      </>
    ),
  },
  {
    platform: "pinterest",
    label: "Pinterest",
    url: (h) => `https://www.pinterest.com/${h}/`,
    display: (h) => h,
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M11.2 20.5 12.8 13" />
        <path d="M10.4 14.2c.5.6 1.2.9 2 .9 2.1 0 3.4-1.7 3.4-3.8 0-2.1-1.7-3.7-3.9-3.7-2.4 0-4 1.7-4 3.7 0 .8.3 1.5.8 2" />
      </>
    ),
  },
  {
    platform: "facebook",
    label: "Facebook",
    url: (h) => `https://facebook.com/${h}`,
    display: (h) => h,
    icon: <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />,
  },
  {
    platform: "youtube",
    label: "YouTube",
    url: (h) => `https://youtube.com/@${h}`,
    display: (h) => `@${h}`,
    icon: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
        <path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" />
      </>
    ),
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    url: (h) => `https://linkedin.com/in/${h}`,
    display: (h) => h,
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 10.5V17M8 7.5v.01M12 17v-6.5M12 13.5a2.5 2.5 0 0 1 5 0V17" />
      </>
    ),
  },
];

/** The platforms that have an account name in content/site.yaml; the others are not shown. */
export function socialAccounts(site: Pick<Site, SocialPlatform>): SocialAccount[] {
  return platforms.flatMap(({ platform, label, url, display, icon }) => {
    const handle = site[platform];
    return handle ? [{ platform, label, icon, handle: display(handle), href: url(handle) }] : [];
  });
}

export function SocialIcon({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
