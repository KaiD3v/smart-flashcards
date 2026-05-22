export type SubjectDueCount = {
  subjectId: string;
  subjectName: string;
  dueCount: number;
};

export type UserDueSummary = {
  userId: string;
  email: string;
  userName: string;
  lastReviewReminderSentAt: Date | null;
  subjects: SubjectDueCount[];
  totalDueCount: number;
};
