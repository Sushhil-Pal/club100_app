export type Member = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  memberType: "Individual" | "Corporate" | "Society";
  dateOfBirth?: string | null;
  gender?: string | null;
  fitnessLevel?: string | null;
  fitnessGoal?: string | null;
  preferredDeliveryMode?: string | null;
  medicalNotes?: string | null;
  onboardingStatus:
    | "Not Started"
    | "In Progress"
    | "Completed";
  onboardingCompletedOn?: string | null;
};