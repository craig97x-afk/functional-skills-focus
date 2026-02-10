type SendResult = {
  sent: boolean;
  detail?: string;
};

export async function sendGuardianInvite({
  guardianEmail,
  guardianName,
  studentName,
  code,
}: {
  guardianEmail: string;
  guardianName: string;
  studentName: string;
  code: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;

  // Guard against missing email config in dev/staging.
  if (!apiKey || !from) {
    return {
      sent: false,
      detail: "Email provider not configured",
    };
  }

  // Normalize site URL so links work in both local and prod.
  const guardianUrl = siteUrl
    ? `${siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`}/guardian`
    : undefined;

  const subject = "Functional Skills Focus – Guardian access code";
  const body = `Hi ${guardianName},\n\nYou have been granted guardian access for ${studentName}.\n\nYour access code: ${code}\n\nUse this code with the student's full name to view progress.${guardianUrl ? `\n\nOpen the guardian portal: ${guardianUrl}` : ""}\n\nIf you did not request this, you can ignore this email.`;

  // Send via Resend API.
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: guardianEmail,
      subject,
      text: body,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return { sent: false, detail: errorText };
  }

  return { sent: true };
}
