import Link from "next/link";
import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "@/components/theme-toggle";

export default async function Header() {
  const session = await getUser();
  const supabase = await createClient();
  const { data: latestAchievement } = session
    ? await supabase
        .from("user_achievements")
        .select("earned_at, achievement:achievements(id, title, icon)")
        .eq("user_id", session.user.id)
        .order("earned_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null as { achievement: unknown } | null };
  const achievement = Array.isArray(latestAchievement?.achievement)
    ? latestAchievement?.achievement[0]
    : latestAchievement?.achievement;
  const achievementIcon =
    typeof achievement === "object" && achievement && "icon" in achievement
      ? (achievement as { icon?: string | null }).icon
      : null;

  const dayMs = 24 * 60 * 60 * 1000;
  const now = new Date();
  const weekAgoIso = new Date(now.getTime() - 7 * dayMs).toISOString();
  const weekAhead = new Date(now.getTime() + 7 * dayMs);
  const todayDate = now.toISOString().slice(0, 10);
  const weekAheadDate = weekAhead.toISOString().slice(0, 10);

  let unreadMessages = 0;
  const notifications: { label: string; href: string; count: number }[] = [];

  if (session) {
    const { data: conversations } = await supabase
      .from("support_conversations")
      .select("id")
      .or(`student_id.eq.${session.user.id},admin_id.eq.${session.user.id}`);

    const conversationIds = (conversations ?? []).map((c) => c.id) as string[];

    if (conversationIds.length > 0) {
      const { count } = await supabase
        .from("support_messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .is("read_at", null)
        .neq("sender_id", session.user.id);
      unreadMessages = count ?? 0;
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
  const navPill = "apple-nav-pill";
  const navPrimary = "apple-nav-primary";
  const iconButton =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]";
  const badgeClass =
    "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-semibold text-white flex items-center justify-center";
  const messagesHref = session?.profile?.role === "admin" ? "/admin/messages" : "/messages";

  return (
    <header className="apple-header sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Functional Skills Focus
        </Link>

        <nav className="flex items-center gap-2 flex-wrap justify-end">
          {session && (
            <>
              <div className="apple-nav-group">
                <button className={navItem} type="button">
                  Maths
                </button>
                <div className="apple-nav-menu">
                  <Link className="apple-nav-menu-item" href="/maths">
                    Overview
                  </Link>
                  <Link className="apple-nav-menu-item" href="/maths/learn">
                    Learning
                  </Link>
                  <Link className="apple-nav-menu-item" href="/maths/practice">
                    Practice
                  </Link>
                  <Link className="apple-nav-menu-item" href="/maths/mocks">
                    Exam mocks
                  </Link>
                  <Link className="apple-nav-menu-item" href="/maths/resources">
                    Resources
                  </Link>
                </div>
              </div>

              <div className="apple-nav-group">
                <button className={navItem} type="button">
                  English
                </button>
                <div className="apple-nav-menu">
                  <Link className="apple-nav-menu-item" href="/english">
                    Overview
                  </Link>
                  <Link className="apple-nav-menu-item" href="/english">
                    Learning (soon)
                  </Link>
                  <Link className="apple-nav-menu-item" href="/english">
                    Practice (soon)
                  </Link>
                </div>
              </div>

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
                  <Link className="apple-nav-menu-item" href="/messages">
                    Messages
                  </Link>
                  <Link className="apple-nav-menu-item" href="/guides">
                    Guides
                  </Link>
                </div>
              </div>
            </>
          )}

          {!session && (
            <Link href="/guides" className={navItem}>
              Guides
            </Link>
          )}

          {session && session.profile?.role !== "admin" && (
            <Link href="/pricing" className={navItem}>
              Pricing
            </Link>
          )}

          {session?.profile?.role === "admin" && (
            <Link href="/admin" className={navPill}>
              Admin
            </Link>
          )}

          {session && (
            <>
              <Link href={messagesHref} className={iconButton} aria-label="Messages">
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
              </Link>

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

          {session ? (
            <div className="apple-nav-group">
              <button className={navPill} type="button">
                <span>Account</span>
                {achievementIcon && (
                  <span className="ml-2 text-base" title="Latest badge">
                    {achievementIcon}
                  </span>
                )}
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
          ) : (
            <Link href="/login" className={navPrimary}>
              Login
            </Link>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
