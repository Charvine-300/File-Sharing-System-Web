import { Link } from "react-router-dom";

export default function BrandLogo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/vault.svg" alt="" className="h-8 w-8" />
      <span className="font-heading text-lg font-semibold text-foreground">
        Vault
      </span>
    </Link>
  );
}
