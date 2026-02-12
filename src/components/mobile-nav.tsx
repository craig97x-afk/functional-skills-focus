"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "@/components/theme-toggle";

type LevelLink = {
  slug: string;
  label: string;
};

type Props = {
  iconButtonClassName: string;
  levelLinks: LevelLink[];
  isLoggedIn: boolean;
  isAdmin: boolean;
  showPricing: boolean;
  messagesHref: string;
  unreadMessages: number;
  messageBadge: string;
  onSignOut: (formData: FormData) => void | Promise<void>;
};

export default function MobileNav({
  iconButtonClassName,
  levelLinks,
  isLoggedIn,
  isAdmin,
  showPricing,
  messagesHref,
  unreadMessages,
  messageBadge,
  onSignOut,
}: Props) {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="relative lg:hidden mobile-nav">
      <button
        className={iconButtonClassName}
        aria-label="Open menu"
        aria-expanded={open}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[min(90vw,320px)] rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-xl text-[color:var(--foreground)]">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
            Menu
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Link className="apple-nav-menu-item" href="/" onClick={closeMenu}>
              Dashboard
            </Link>

            <details className="mobile-nav-group">
              <summary className="apple-nav-menu-item cursor-pointer">Maths</summary>
              <div className="mt-2 flex flex-col gap-2 pl-3">
                <Link
                  className="apple-nav-menu-item"
                  href="/maths/levels"
                  onClick={closeMenu}
                >
                  Levels
                </Link>
                {levelLinks.map((level) => (
                  <Link
                    key={`mobile-maths-${level.slug}`}
                    className="apple-nav-menu-item"
                    href={`/maths/levels/${level.slug}`}
                    onClick={closeMenu}
                  >
                    {level.label}
                  </Link>
                ))}
              </div>
            </details>

            <details className="mobile-nav-group">
              <summary className="apple-nav-menu-item cursor-pointer">English</summary>
              <div className="mt-2 flex flex-col gap-2 pl-3">
                <Link
                  className="apple-nav-menu-item"
                  href="/english/levels"
                  onClick={closeMenu}
                >
                  Levels
                </Link>
                {levelLinks.map((level) => (
                  <Link
                    key={`mobile-english-${level.slug}`}
                    className="apple-nav-menu-item"
                    href={`/english/levels/${level.slug}`}
                    onClick={closeMenu}
                  >
                    {level.label}
                  </Link>
                ))}
              </div>
            </details>

            {isLoggedIn && (
              <>
                <details className="mobile-nav-group">
                  <summary className="apple-nav-menu-item cursor-pointer">Progress</summary>
                  <div className="mt-2 flex flex-col gap-2 pl-3">
                    <Link className="apple-nav-menu-item" href="/progress" onClick={closeMenu}>
                      Overview
                    </Link>
                    <Link className="apple-nav-menu-item" href="/mastery" onClick={closeMenu}>
                      Mastery
                    </Link>
                    <Link className="apple-nav-menu-item" href="/review" onClick={closeMenu}>
                      Review mistakes
                    </Link>
                    <Link
                      className="apple-nav-menu-item"
                      href="/progress/report"
                      onClick={closeMenu}
                    >
                      Progress report
                    </Link>
                  </div>
                </details>

                <details className="mobile-nav-group">
                  <summary className="apple-nav-menu-item cursor-pointer">Tools</summary>
                  <div className="mt-2 flex flex-col gap-2 pl-3">
                    <Link className="apple-nav-menu-item" href="/study-plan" onClick={closeMenu}>
                      Study plan
                    </Link>
                    <Link className="apple-nav-menu-item" href="/flashcards" onClick={closeMenu}>
                      Flashcards
                    </Link>
                    <Link className="apple-nav-menu-item" href={messagesHref} onClick={closeMenu}>
                      Messages{unreadMessages > 0 ? ` (${messageBadge})` : ""}
                    </Link>
                  </div>
                </details>
              </>
            )}

            <Link className="apple-nav-menu-item" href="/guides" onClick={closeMenu}>
              Shop
            </Link>

            {showPricing && (
              <Link className="apple-nav-menu-item" href="/pricing" onClick={closeMenu}>
                Pricing
              </Link>
            )}

            {isAdmin && (
              <Link className="apple-nav-menu-item" href="/admin" onClick={closeMenu}>
                Admin
              </Link>
            )}

            {isLoggedIn && (
              <>
                <Link className="apple-nav-menu-item" href="/account" onClick={closeMenu}>
                  Account
                </Link>
                <form
                  action={onSignOut}
                  onSubmit={() => {
                    closeMenu();
                  }}
                >
                  <button className="apple-nav-menu-item apple-nav-menu-button" type="submit">
                    Logout
                  </button>
                </form>
              </>
            )}

            {!isLoggedIn && (
              <Link className="apple-nav-menu-item" href="/login" onClick={closeMenu}>
                Login
              </Link>
            )}

            <div className="pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
