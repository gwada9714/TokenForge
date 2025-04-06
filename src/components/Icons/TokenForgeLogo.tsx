interface TokenForgeLogoProps {
  className?: string;
}

export const TokenForgeLogo = ({
  className = "h-8 w-auto",
}: TokenForgeLogoProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-2xl font-bold bg-gradient-to-r from-[#D97706] to-[#F59E0B] bg-clip-text text-transparent">
        TokenForge
      </span>
    </div>
  );
};
