export type ResourceEventType = "open" | "download";
export type ResourceType = "exam_mock" | "question_set" | "exam_resource_link";

export function buildTrackedResourceUrl({
  resourceType,
  resourceId,
  eventType,
  subject,
  levelSlug,
  targetUrl,
}: {
  resourceType: ResourceType;
  resourceId: string;
  eventType: ResourceEventType;
  subject: "english" | "maths";
  levelSlug: string;
  targetUrl: string;
}) {
  const search = new URLSearchParams({
    resourceType,
    resourceId,
    eventType,
    subject,
    levelSlug,
    target: targetUrl,
  });

  return `/api/exam-resources/redirect?${search.toString()}`;
}
