import { Blocks, Boxes, Code2, Database, FileCode2, FileInput, Network, TrendingUp, type LucideIcon } from "lucide-react";
import { brandIcons, type BrandIconKey } from "./brandIconData";

// Skill names are free text (editable in the admin), so lookup is by a normalised key.
// Order matters: more specific keys come first ("github" before "git").
const BRAND_MATCHERS: Array<[string, BrandIconKey]> = [
  ["nextjs", "nextjs"],
  ["next", "nextjs"],
  ["react", "react"],
  ["typescript", "typescript"],
  ["javascript", "javascript"],
  ["html", "html5"],
  ["css", "css"],
  ["tailwind", "tailwindcss"],
  ["sass", "sass"],
  ["scss", "sass"],
  ["bootstrap", "bootstrap"],
  ["nodejs", "nodejs"],
  ["node", "nodejs"],
  ["express", "express"],
  ["jwt", "jwt"],
  ["mongodb", "mongodb"],
  ["mysql", "mysql"],
  ["wordpress", "wordpress"],
  ["elementor", "elementor"],
  ["woocommerce", "woocommerce"],
  ["yoast", "yoast"],
  ["wprocket", "wprocket"],
  ["github", "github"],
  ["git", "git"],
  ["figma", "figma"],
];

// No brand mark is available for these, so a descriptive generic icon stands in.
const GENERIC_MATCHERS: Array<[string, LucideIcon]> = [
  // The CSS Modules mark is a wordmark that is unreadable at icon size.
  ["cssmodules", FileCode2],
  ["rest", Network],
  ["api", Network],
  ["sql", Database],
  ["database", Database],
  ["acf", Blocks],
  ["advancedcustomfields", Blocks],
  ["rankmath", TrendingUp],
  ["wpforms", FileInput],
  ["liferay", Boxes],
  ["vscode", Code2],
  ["visualstudiocode", Code2],
];

const findBrand = (key: string) => (key.startsWith("cssmodules") ? undefined : BRAND_MATCHERS.find(([k]) => key.startsWith(k)));

const normalise = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Very dark brand colours (Next.js, Express, GitHub…) are lifted so they stay visible on the dark UI. */
function readableAccent(hex: string): string {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.28 ? "#e6edf5" : `#${hex}`;
}

export interface TechIconMatch {
  /** Colour used for the glow / hover accent. */
  accent: string;
  brand: boolean;
}

export function techIconInfo(name: string): TechIconMatch {
  const key = normalise(name);
  const brand = findBrand(key);
  if (brand) return { accent: readableAccent(brandIcons[brand[1]].hex), brand: true };
  return { accent: "#22e4ff", brand: false };
}

interface TechIconProps {
  name: string;
  size?: number;
  className?: string;
}

/** Recognisable technology mark for a skill name, with a generic icon or monogram as fallback. */
export default function TechIcon({ name, size = 22, className }: TechIconProps) {
  const key = normalise(name);
  const brand = findBrand(key);
  if (brand) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={brandIcons[brand[1]].path} />
      </svg>
    );
  }
  const generic = GENERIC_MATCHERS.find(([k]) => key.startsWith(k) || key.includes(k));
  if (generic) {
    const Icon = generic[1];
    return <Icon size={size} aria-hidden="true" className={className} strokeWidth={1.75} />;
  }
  const initials = name
    .split(/[\s.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="var(--font-mono)">
        {initials || "•"}
      </text>
    </svg>
  );
}
