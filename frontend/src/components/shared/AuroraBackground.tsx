import { cn } from "../../lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn("relative flex flex-col items-center justify-center overflow-hidden", className)}
      {...props}
    >
      {/* Aurora Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className={cn(
            "absolute -inset-[10px] opacity-50 will-change-transform animate-aurora",
            showRadialGradient
              ? "[mask-image:radial-gradient(ellipse_at_80%_0%,black_20%,transparent_75%)]"
              : ""
          )}
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                100deg,
                #ffffff 0%, #ffffff 7%,
                transparent 10%, transparent 12%,
                #ffffff 16%
              ),
              repeating-linear-gradient(
                100deg,
                #FF6E6C 10%,
                #FFE1D9 15%,
                #67568C 20%,
                #FFE1D9 25%,
                #FF6E6C 30%
              )
            `,
            backgroundSize: "300%, 200%",
            backgroundPosition: "50% 50%, 50% 50%",
            filter: "blur(14px)",
          }}
        />
      </div>
      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
