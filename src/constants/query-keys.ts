export const QUERY_KEYS = {
  courseProgress: (courseSlug: string) => ['course-progress', courseSlug],
} as const;
