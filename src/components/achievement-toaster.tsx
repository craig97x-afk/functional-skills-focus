"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AchievementToast from "@/components/achievement-toast";

export type AchievementToastData = {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  earned_at: string;
};

export default function AchievementToaster() {
  const [latest, setLatest] = useState<AchievementToastData | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let isMounted = true;

    async function fetchLatest(userId: string) {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("earned_at, achievement:achievement_id (id, title, description, icon)")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data || !isMounted) return;

      const achievement = Array.isArray(data.achievement)
        ? data.achievement[0]
        : data.achievement;

      if (!achievement) return;

      setLatest({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description ?? null,
        icon: achievement.icon ?? null,
        earned_at: data.earned_at,
      });
    }

    async function init() {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData.user) return;

      const userId = authData.user.id;
      await fetchLatest(userId);

      channel = supabase
        .channel("achievement-toast")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "user_achievements",
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            const newRow = payload.new as { achievement_id?: string; earned_at?: string };
            const achievementId = newRow.achievement_id;
            if (!achievementId || !newRow.earned_at || !isMounted) return;

            const { data: achievement } = await supabase
              .from("achievements")
              .select("id, title, description, icon")
              .eq("id", achievementId)
              .maybeSingle();

            if (!achievement || !isMounted) return;

            setLatest({
              id: achievement.id,
              title: achievement.title,
              description: achievement.description,
              icon: achievement.icon,
              earned_at: newRow.earned_at,
            });
          }
        )
        .subscribe();
    }

    init();

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return <AchievementToast achievement={latest} />;
}
