"use client";

import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

export default function Navbar() {
  const [visible, setVisible] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const companyRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const sc = window.scrollY || window.pageYOffset;
      // show navbar once user scrolls down a bit
      if (sc > 20) setVisible(true);
      else setVisible(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking/touching outside the company menu or mobile menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      // If click is inside desktop company menu or inside mobile menu, don't close
      if (
        (companyRef.current && target && companyRef.current.contains(target)) ||
        (mobileMenuRef.current && target && mobileMenuRef.current.contains(target))
      ) {
        return;
      }

      // otherwise close the company dropdown
      setCompanyOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
    return undefined;
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transform transition-transform duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="backdrop-blur-2xl bg-white/90 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            <div className="flex items-center gap-8">
              <a href="/" className="font-bold text-2xl text-[var(--color-primary-dark)] hover:text-[var(--color-primary-light)] transition-colors duration-300">
                Solopreneur
              </a>
              <nav className="hidden md:flex md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:z-10 items-center gap-6 text-sm text-slate-700 dark:text-slate-200">
                <a href="/" className="font-medium hover:underline text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors duration-300">
                  Home
                </a>
                <a href="#" className="font-medium hover:underline text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors duration-300">
                  Features
                </a>
                <a href="#" className="font-medium hover:underline text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors duration-300">
                  Pricing
                </a>
                <a href="#" className="font-medium hover:underline text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors duration-300">
                  Security
                </a>

                <div
                  className="relative"
                  ref={companyRef}
                  onMouseEnter={() => {
                    if (closeTimeoutRef.current) {
                      clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = null;
                    }
                    setCompanyOpen(true);
                  }}
                  onMouseLeave={() => {
                    // delay closing slightly so moving from button -> menu doesn't close it
                    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                    closeTimeoutRef.current = setTimeout(() => {
                      setCompanyOpen(false);
                      closeTimeoutRef.current = null;
                    }, 150);
                  }}
                >
                  <button
                    onClick={() => setCompanyOpen((s) => !s)}
                    className="flex items-center gap-1 hover:underline font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] cursor-pointer transition-colors duration-300"
                    aria-expanded={companyOpen}
                  >
                    Company
                    <ChevronDown className="w-3 h-3" aria-hidden />
                  </button>

                  {companyOpen && (
                    <div className="absolute mt-2 w-40 bg-green-700 border-gray-200 rounded shadow-lg py-2">
                      <a className="block px-4 py-2 font-medium hover:underline hover:bg-green-600 transition-colors duration-300" href="#">
                        About
                      </a>
                      <a className="block px-4 py-2 font-medium hover:underline hover:bg-green-600 transition-colors duration-300" href="#">
                        Team
                      </a>
                      <a className="block px-4 py-2 font-medium hover:underline hover:bg-green-600 transition-colors duration-300" href="#">
                        Careers
                      </a>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <a href="/login" className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium border bg-green-600 border-green-600 text-white hover:bg-white hover:text-green-600 transition-colors duration-300">
                Sign In
              </a>
              <a
                href="/register"
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium border border-green-600 bg-green-600 hover:bg-green-700 text-white transition-colors duration-300 shadow-lg"
              >
                Get Started
              </a>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden ml-2 p-2"
              aria-label="open menu"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((s) => !s)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden /> : <Menu className="w-6 h-6" aria-hidden />}
            </button>

            {/* Mobile menu panel */}
            <div
              id="mobile-menu"
              ref={mobileMenuRef}
              className={`md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-md transition-transform origin-top ${
                mobileMenuOpen ? "scale-y-100" : "scale-y-0 pointer-events-none"
              }`}
              style={{ transformOrigin: "top" }}
            >
              <div className="px-4 pt-4 pb-6 space-y-3">
                <a href="/" className="block px-3 py-2 rounded-md text-base font-medium hover:underline hover:text-[var(--color-primary)]" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </a>
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:underline hover:text-[var(--color-primary)]" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </a>
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:underline hover:text-[var(--color-primary)]" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </a>
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:underline hover:text-[var(--color-primary)]" onClick={() => setMobileMenuOpen(false)}>
                  Security
                </a>

                <div className="pt-2">
                  <button
                    className="w-full text-left px-3 py-2 flex items-center font-medium justify-between rounded-md hover:underline hover:text-[var(--color-primary)]"
                    onClick={() => setCompanyOpen((s) => !s)}
                    aria-expanded={companyOpen}
                  >
                    <span>Company</span>
                    <ChevronDown className="w-4 h-4" aria-hidden />
                  </button>
                  {companyOpen && (
                    <div className="mt-2 space-y-1 pl-4">
                      <a href="#" className="block px-3 py-2 rounded-md hover:underline hover:text-[var(--color-primary)]" onClick={() => setMobileMenuOpen(false)}>
                        About
                      </a>
                      <a href="#" className="block px-3 py-2 rounded-md hover:underline hover:text-[var(--color-primary)]" onClick={() => setMobileMenuOpen(false)}>
                        Team
                      </a>
                      <a href="#" className="block px-3 py-2 rounded-md hover:underline hover:text-[var(--color-primary)]" onClick={() => setMobileMenuOpen(false)}>
                        Careers
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <a href="/login" className="block w-full text-center px-4 py-2 rounded-md bg-white text-green-600 border border-green-600 hover:bg-green-600 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </a>
                  <a href="/register" className="mt-2 block w-full text-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
