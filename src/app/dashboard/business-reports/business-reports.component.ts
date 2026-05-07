import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStats } from '../../core/models/user-stats.model';
import { KycSummary } from '../../core/models/kyc-summary.model';

@Component({
  selector: 'app-business-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-reports.component.html'
})
export class BusinessReportsComponent {
  @Input() userData: UserStats[] = [];
  @Input() kycData: KycSummary[] = [];

  get totalCumulative(): number {
    return this.userData.reduce((s, u) => s + u.cumulativeCount, 0);
  }

  readonly kycStatuses = [
    { label: 'Incomplete', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
    { label: 'In Review',  bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
    { label: 'Verified',   bg: '#d8f3dc', color: '#2d6a4f', border: '#b7e4c7' },
    { label: 'Approved',   bg: '#1a3a28', color: '#74c69d', border: '#2d6a4f' },
    { label: 'Rejected',   bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  ];
}
