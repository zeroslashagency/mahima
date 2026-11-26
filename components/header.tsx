"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { siteContent } from "@/lib/cms";

type HeaderProps = {
  variant?: "default" | "pill-light";
};

export function Header({ variant = "default" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isLightPill = variant === "pill-light";
  const isElevated = isLightPill || isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-4 left-1/2 z-50 w-[90%] -translate-x-1/2 transition-all duration-300 ${
        isLightPill
          ? "max-w-[76rem] rounded-full bg-[rgba(255,252,246,0.95)] backdrop-blur-md"
          : `max-w-3xl ${isScrolled ? "rounded-full bg-background/80 backdrop-blur-md" : "bg-transparent"}`
      }`}
      style={{
        boxShadow: isElevated
          ? "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px"
          : "none",
      }}
    >
      <div className="flex items-center justify-between transition-all duration-300 px-2 pl-5 py-2">
        {/* Logo */}
        <Link
          href="/"
          className={`text-lg font-medium tracking-tight transition-colors duration-300 ${
            isElevated ? "text-foreground" : "text-white"
          }`}
        >
          {siteContent.brandName}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          {siteContent.nav.map((item) => {
            const isPageLink = !item.href.startsWith("#");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={
                  isPageLink
                    ? `text-sm font-medium transition-colors ${
                        isElevated ? "text-foreground hover:opacity-80" : "text-white hover:text-white/80"
                      }`
                    : `text-sm transition-colors ${
                        isElevated
                          ? "text-muted-foreground hover:text-foreground"
                          : "text-white/70 hover:text-white"
                      }`
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href={siteContent.ctaButton.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              isLightPill
                ? "bg-[#0f0e0c] text-[#fff9ef] hover:bg-[#1a1814]"
                : isScrolled
                  ? "bg-foreground text-background hover:opacity-80"
                  : "bg-white text-foreground hover:bg-white/90"
            }`}
          >
            {siteContent.ctaButton.label}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`transition-colors md:hidden ${isElevated ? "text-foreground" : "text-white"}`}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background px-6 py-8 md:hidden rounded-b-2xl">
          <nav className="flex flex-col gap-6">
            {siteContent.nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  item.href.startsWith("#")
                    ? "text-lg text-foreground"
                    : "text-lg font-medium text-foreground"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {item.mobileLabel}
              </Link>
            ))}
            <Link
              href={siteContent.ctaButton.href}
              className="mt-4 bg-foreground px-5 py-3 text-center text-sm font-medium text-background rounded-full"
              onClick={() => setIsMenuOpen(false)}
            >
              {siteContent.ctaButton.label}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
