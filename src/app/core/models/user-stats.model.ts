export interface UserStats {
  id?: number;
  userType: 'CUSTOMER' | 'BO' | 'AGENT' | 'CORPORATE' | 'MERCHANT';
  userCount: number;
  cumulativeCount: number;
}
