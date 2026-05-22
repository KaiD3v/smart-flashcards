export type ReviewReminderSubject = {
  subjectId: string;
  subjectName: string;
  dueCount: number;
  reviewUrl: string;
};

export type ReviewReminderEmailPayload = {
  to: string;
  userName: string;
  subjects: ReviewReminderSubject[];
  totalDueCount: number;
};
