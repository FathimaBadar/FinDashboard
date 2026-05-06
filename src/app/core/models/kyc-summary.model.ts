export interface KycSummary {
  id?: number;
  kycType: 'CUSTOMER' | 'AGENT' | 'MERCHANT' | 'CORPORATE';
  incomplete: number;
  inReview: number;
  verifiedLevel1: number;
  verifiedLevel2: number;
  approved: number;
  rejected: number;
}
