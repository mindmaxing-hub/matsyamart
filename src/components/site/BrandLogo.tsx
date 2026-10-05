import colorLogoAsset from "../../assets/matsyamart-logo-color.png.asset.json";
import whiteLogoAsset from "../../assets/matsyamart-logo-white.png.asset.json";

interface BrandLogoProps {
  variant?: "color" | "white";
  className?: string;
  eager?: boolean;
}

export function BrandLogo({
  variant = "white",
  className = "",
  eager = false,
}: BrandLogoProps) {
  const logo = variant === "color" ? colorLogoAsset : whiteLogoAsset;

  return (
    <img
      src={logo.url}
      alt="MatsyaMart"
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}