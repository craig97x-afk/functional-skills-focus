import Link from "next/link";
import { cookies } from "next/headers";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "@/components/theme-toggle";
import GuardianLogoutButton from "@/components/guardian-logout-button";

export default async function Header() {
  const cookieStore = await cookies();
  const guardianSession = cookieStore.get("guardian_session")?.value;

  if (guardianSession) {
    return (
      <header className="apple-header sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-[7px] flex items-center justify-between">
          <Link href="/guardian/dashboard" className="brand-link text-lg font-semibold tracking-tight">
            <span className="brand-mark-wrap" aria-hidden="true">
              <img src="/brand/logo-mark.png" alt="" className="brand-mark-img" />
            </span>
            <span className="ml-3">Functional Skills Focus</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-200">
              Guardian access
            </span>
            <GuardianLogoutButton />
          </div>
        </div>
      </header>
    );
  }

  const session = await getUser();
  const supabase = await createClient();
  const messagesHref = session?.profile?.role === "admin" ? "/admin/messages" : "/messages";
  const levelLinks = [
    { slug: "entry-1", label: "Entry Level 1" },
    { slug: "entry-2", label: "Entry Level 2" },
    { slug: "entry-3", label: "Entry Level 3" },
    { slug: "fs-1", label: "Functional Skills Level 1" },
    { slug: "fs-2", label: "Functional Skills Level 2" },
  ];
  const dayMs = 24 * 60 * 60 * 1000;
  const now = new Date();
  const weekAgoIso = new Date(now.getTime() - 7 * dayMs).toISOString();
  const weekAhead = new Date(now.getTime() + 7 * dayMs);
  const todayDate = now.toISOString().slice(0, 10);
  const weekAheadDate = weekAhead.toISOString().slice(0, 10);

  let unreadMessages = 0;
  const notifications: { label: string; href: string; count: number }[] = [];
  const recentThreads: {
    id: string;
    student_id: string;
    admin_id: string;
    last_message_at: string | null;
    preview?: string | null;
    unreadCount?: number;
  }[] = [];

  if (session) {
    let unreadRowsAll: { conversation_id: string }[] = [];
    const { data: conversations } = await supabase
      .from("support_conversations")
      .select("id")
      .or(`student_id.eq.${session.user.id},admin_id.eq.${session.user.id}`);

    const conversationIds = (conversations ?? []).map((c) => c.id) as string[];

    if (conversationIds.length > 0) {
      const { data: unreadRows } = await supabase
        .from("support_messages")
        .select("id, conversation_id")
        .in("conversation_id", conversationIds)
        .is("read_at", null)
        .neq("sender_id", session.user.id);
      unreadRowsAll = (unreadRows ?? []) as { conversation_id: string }[];
      unreadMessages = unreadRowsAll.length;
    }

    const { data: recentConversations } = await supabase
      .from("support_conversations")
      .select("id, student_id, admin_id, last_message_at")
      .or(`student_id.eq.${session.user.id},admin_id.eq.${session.user.id}`)
      .order("last_message_at", { ascending: false })
      .limit(5);

    const recentConversationIds = (recentConversations ?? []).map((c) => c.id) as string[];

    if (recentConversationIds.length > 0) {
      const { data: recentMessages } = await supabase
        .from("support_messages")
        .select("conversation_id, body, created_at")
        .in("conversation_id", recentConversationIds)
        .order("created_at", { ascending: false });

      const previews = new Map<string, string>();
      (recentMessages ?? []).forEach((msg) => {
        if (!previews.has(msg.conversation_id)) {
          previews.set(msg.conversation_id, msg.body);
        }
      });

      const unreadMap = new Map<string, number>();
      unreadRowsAll.forEach((row) => {
        if (recentConversationIds.includes(row.conversation_id)) {
          unreadMap.set(row.conversation_id, (unreadMap.get(row.conversation_id) ?? 0) + 1);
        }
      });

      (recentConversations ?? []).forEach((thread) => {
        recentThreads.push({
          ...thread,
          preview: previews.get(thread.id) ?? null,
          unreadCount: unreadMap.get(thread.id) ?? 0,
        });
      });
    }

    const { count: guidesCount } = await supabase
      .from("guides")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .gte("created_at", weekAgoIso);

    if ((guidesCount ?? 0) > 0) {
      notifications.push({
        label: `${guidesCount} new guide${guidesCount === 1 ? "" : "s"} available`,
        href: "/guides",
        count: guidesCount ?? 0,
      });
    }

    const { count: lessonsCount, error: lessonsErr } = await supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("published", true)
      .gte("created_at", weekAgoIso);

    if (!lessonsErr && (lessonsCount ?? 0) > 0) {
      notifications.push({
        label: `${lessonsCount} new lesson${lessonsCount === 1 ? "" : "s"} added`,
        href: "/maths",
        count: lessonsCount ?? 0,
      });
    }

    if (unreadMessages > 0) {
      notifications.push({
        label: `${unreadMessages} unread message${unreadMessages === 1 ? "" : "s"}`,
        href: messagesHref,
        count: unreadMessages,
      });
    }

    if (session.profile?.role !== "admin") {
      const { count: commentCount } = await supabase
        .from("progress_comments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .gte("created_at", weekAgoIso);

      if ((commentCount ?? 0) > 0) {
        notifications.push({
          label: `New tutor feedback`,
          href: "/progress/report",
          count: commentCount ?? 0,
        });
      }

      const { count: examCount } = await supabase
        .from("user_exams")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .gte("exam_date", todayDate)
        .lte("exam_date", weekAheadDate);

      if ((examCount ?? 0) > 0) {
        notifications.push({
          label: `${examCount} upcoming exam${examCount === 1 ? "" : "s"}`,
          href: "/account",
          count: examCount ?? 0,
        });
      }

      const { count: badgeCount } = await supabase
        .from("user_achievements")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .gte("earned_at", weekAgoIso);

      if ((badgeCount ?? 0) > 0) {
        notifications.push({
          label: `${badgeCount} new badge${badgeCount === 1 ? "" : "s"}`,
          href: "/account",
          count: badgeCount ?? 0,
        });
      }
    }
  }

  const notificationCount = notifications.reduce((sum, item) => sum + item.count, 0);
  const notificationBadge = notificationCount > 99 ? "99+" : `${notificationCount}`;
  const messageBadge = unreadMessages > 99 ? "99+" : `${unreadMessages}`;

  async function signOut() {
    "use server";
    const actionClient = await createClient();
    await actionClient.auth.signOut();
  }

  const navItem = "apple-nav";
  const iconButton =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]";
  const badgeClass =
    "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-semibold text-white flex items-center justify-center";

  return (
    <header className="apple-header sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-6 py-[7px] flex items-center justify-between">
        <Link href="/" className="brand-link text-lg font-semibold tracking-tight">
          <span className="brand-mark-wrap" aria-hidden="true">
            <img
              src="/brand/logo-mark.png"
              alt=""
              className="brand-mark-img"
            />
          </span>
          <span className="brand-link-text">Functional Skills Focus</span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="primary-nav hidden lg:flex items-center gap-2 flex-wrap justify-end">
            <div className="apple-nav-group">
              <button className={navItem} type="button">
                Maths
              </button>
            <div className="apple-nav-menu">
              <Link className="apple-nav-menu-item" href="/maths/levels/resources">
                Resources
              </Link>
              <Link className="apple-nav-menu-item" href="/maths/levels">
                Levels
              </Link>
              <div className="my-2 border-t border-[color:var(--border)]" />
              {levelLinks.map((level) => (
                <Link
                  key={`maths-${level.slug}`}
                  className="apple-nav-menu-item"
                  href={`/maths/levels/${level.slug}`}
                >
                  {level.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="apple-nav-group">
            <button className={navItem} type="button">
              English
            </button>
            <div className="apple-nav-menu">
              <Link className="apple-nav-menu-item" href="/english/levels/resources">
                Resources
              </Link>
              <Link className="apple-nav-menu-item" href="/english/levels">
                Levels
              </Link>
              <div className="my-2 border-t border-[color:var(--border)]" />
              {levelLinks.map((level) => (
                <Link
                  key={`english-${level.slug}`}
                  className="apple-nav-menu-item"
                  href={`/english/levels/${level.slug}`}
                >
                  {level.label}
                </Link>
              ))}
            </div>
          </div>

          {session && (
            <>
              <div className="apple-nav-group">
                <button className={navItem} type="button">
                  Progress
                </button>
                <div className="apple-nav-menu">
                  <Link className="apple-nav-menu-item" href="/progress">
                    Progress
                  </Link>
                  <Link className="apple-nav-menu-item" href="/mastery">
                    Mastery
                  </Link>
                  <Link className="apple-nav-menu-item" href="/review">
                    Review mistakes
                  </Link>
                  <Link className="apple-nav-menu-item" href="/progress/report">
                    Progress report
                  </Link>
                </div>
              </div>

              <div className="apple-nav-group">
                <button className={navItem} type="button">
                  Tools
                </button>
                <div className="apple-nav-menu">
                  <Link className="apple-nav-menu-item" href="/study-plan">
                    Study plan
                  </Link>
                  <Link className="apple-nav-menu-item" href="/flashcards">
                    Flashcards
                  </Link>
                  <Link className="apple-nav-menu-item" href={messagesHref}>
                    Messages
                  </Link>
                </div>
              </div>
            </>
          )}

          <Link href="/guides" className={navItem}>
            Shop
          </Link>

          {session && session.profile?.role !== "admin" && (
            <Link href="/pricing" className={navItem}>
              Pricing
            </Link>
          )}

          {session?.profile?.role === "admin" && (
            <Link href="/admin" className={navItem}>
              Admin
            </Link>
          )}

          {session && (
            <>
              <div className="apple-nav-group">
                <button className={iconButton} type="button" aria-label="Messages">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H8l-4 4v-4H4a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 4 5.5Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {unreadMessages > 0 && (
                    <span className={badgeClass} aria-label={`${unreadMessages} unread messages`}>
                      {messageBadge}
                    </span>
                  )}
                </button>
                <div className="apple-nav-menu apple-nav-menu-right min-w-[260px]">
                  <Link className="apple-nav-menu-item" href={messagesHref}>
                    Open inbox
                  </Link>
                  <div className="my-2 border-t border-[color:var(--border)]" />
                  {recentThreads.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-[color:var(--muted-foreground)]">
                      No conversations yet.
                    </div>
                  ) : (
                    recentThreads.map((thread) => {
                      const label =
                        session.profile?.role === "admin"
                          ? `Student ${thread.student_id.slice(0, 6)}…`
                          : "Teacher";
                      const previewRaw = thread.preview ?? "No messages yet.";
                      const preview =
                        previewRaw.length > 56 ? `${previewRaw.slice(0, 56)}…` : previewRaw;
                      const unreadCount = thread.unreadCount ?? 0;
                      return (
                        <Link
                          key={thread.id}
                          href={`${messagesHref}?conversationId=${thread.id}`}
                          className="apple-nav-menu-item"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={unreadCount > 0 ? "font-semibold" : "font-medium"}>
                              {label}
                            </span>
                            {unreadCount > 0 && (
                              <span className="rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-white">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                            {preview}
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="apple-nav-group">
                <button className={iconButton} type="button" aria-label="Notifications">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      d="M12 3.5a5 5 0 0 0-5 5v2.8c0 .9-.3 1.8-.9 2.5l-.9 1.1h13.6l-.9-1.1c-.6-.7-.9-1.6-.9-2.5V8.5a5 5 0 0 0-5-5Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.5 18a2.5 2.5 0 0 0 5 0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  {notificationCount > 0 && (
                    <span className={badgeClass} aria-label={`${notificationCount} notifications`}>
                      {notificationBadge}
                    </span>
                  )}
                </button>
                <div className="apple-nav-menu apple-nav-menu-right">
                  {notifications.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-[color:var(--muted-foreground)]">
                      You are all caught up.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <Link key={item.label} href={item.href} className="apple-nav-menu-item">
                        {item.label}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {session && (
            <div className="apple-nav-group">
              <button className={navItem} type="button">
                <span>Account</span>
              </button>
              <div className="apple-nav-menu apple-nav-menu-right">
                <Link className="apple-nav-menu-item" href="/account">
                  Account
                </Link>
                <form action={signOut}>
                  <button className="apple-nav-menu-item apple-nav-menu-button" type="submit">
                    Logout
                  </button>
                </form>
              </div>
            </div>
          )}

          {!session && (
            <Link href="/login" className={navItem}>
              Login
            </Link>
          )}

          <ThemeToggle />
          </nav>

          <details className="relative lg:hidden mobile-nav">
            <summary className={iconButton} aria-label="Open menu">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <div className="absolute right-0 mt-3 w-[min(90vw,320px)] rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-xl text-[color:var(--foreground)]">
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                Menu
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <Link className="apple-nav-menu-item" href="/">
                  Dashboard
                </Link>

                <details className="mobile-nav-group">
                  <summary className="apple-nav-menu-item cursor-pointer">Maths</summary>
                  <div className="mt-2 flex flex-col gap-2 pl-3">
                    <Link className="apple-nav-menu-item" href="/maths/levels/resources">
                      Resources
                    </Link>
                    <Link className="apple-nav-menu-item" href="/maths/levels">
                      Levels
                    </Link>
                    {levelLinks.map((level) => (
                      <Link
                        key={`mobile-maths-${level.slug}`}
                        className="apple-nav-menu-item"
                        href={`/maths/levels/${level.slug}`}
                      >
                        {level.label}
                      </Link>
                    ))}
                  </div>
                </details>

                <details className="mobile-nav-group">
                  <summary className="apple-nav-menu-item cursor-pointer">English</summary>
                  <div className="mt-2 flex flex-col gap-2 pl-3">
                    <Link className="apple-nav-menu-item" href="/english/levels/resources">
                      Resources
                    </Link>
                    <Link className="apple-nav-menu-item" href="/english/levels">
                      Levels
                    </Link>
                    {levelLinks.map((level) => (
                      <Link
                        key={`mobile-english-${level.slug}`}
                        className="apple-nav-menu-item"
                        href={`/english/levels/${level.slug}`}
                      >
                        {level.label}
                      </Link>
                    ))}
                  </div>
                </details>

                {session && (
                  <>
                    <details className="mobile-nav-group">
                      <summary className="apple-nav-menu-item cursor-pointer">Progress</summary>
                      <div className="mt-2 flex flex-col gap-2 pl-3">
                        <Link className="apple-nav-menu-item" href="/progress">
                          Progress
                        </Link>
                        <Link className="apple-nav-menu-item" href="/mastery">
                          Mastery
                        </Link>
                        <Link className="apple-nav-menu-item" href="/review">
                          Review mistakes
                        </Link>
                        <Link className="apple-nav-menu-item" href="/progress/report">
                          Progress report
                        </Link>
                      </div>
                    </details>

                    <details className="mobile-nav-group">
                      <summary className="apple-nav-menu-item cursor-pointer">Tools</summary>
                      <div className="mt-2 flex flex-col gap-2 pl-3">
                        <Link className="apple-nav-menu-item" href="/study-plan">
                          Study plan
                        </Link>
                        <Link className="apple-nav-menu-item" href="/flashcards">
                          Flashcards
                        </Link>
                        <Link className="apple-nav-menu-item" href={messagesHref}>
                          Messages{unreadMessages > 0 ? ` (${messageBadge})` : ""}
                        </Link>
                      </div>
                    </details>
                  </>
                )}

                <Link className="apple-nav-menu-item" href="/guides">
                  Shop
                </Link>

                {session && session.profile?.role !== "admin" && (
                  <Link className="apple-nav-menu-item" href="/pricing">
                    Pricing
                  </Link>
                )}

                {session?.profile?.role === "admin" && (
                  <Link className="apple-nav-menu-item" href="/admin">
                    Admin
                  </Link>
                )}

                {session && (
                  <>
                    <Link className="apple-nav-menu-item" href="/account">
                      Account
                    </Link>
                    <form action={signOut}>
                      <button
                        className="apple-nav-menu-item apple-nav-menu-button"
                        type="submit"
                      >
                        Logout
                      </button>
                    </form>
                  </>
                )}

                {!session && (
                  <Link className="apple-nav-menu-item" href="/login">
                    Login
                  </Link>
                )}

                <div className="pt-2">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
