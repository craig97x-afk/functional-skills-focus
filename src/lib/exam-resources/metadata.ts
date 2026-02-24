export const paperTypeOptions = [
  { value: "sample-paper", label: "Sample paper" },
  { value: "practice-paper", label: "Practice paper" },
  { value: "past-paper", label: "Past paper" },
  { value: "mark-scheme", label: "Mark scheme" },
  { value: "specification", label: "Specification" },
  { value: "worked-solutions", label: "Worked solutions" },
  { value: "revision-pack", label: "Revision pack" },
] as const;

export const getPaperTypeLabel = (value?: string | null) => {
  if (!value) return null;
  const found = paperTypeOptions.find((option) => option.value === value);
  if (found) return found.label;
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
};

export const parseTagsInput = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag, index, arr) => arr.indexOf(tag) === index);
