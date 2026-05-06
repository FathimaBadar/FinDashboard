export interface TransactionStatus {
  id?: number;
  month: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
}
