import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStats, KycSummary } from '../../services/dashboard.service';

@Component({
  selector: 'app-business-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-reports.component.html'
})
export class BusinessReportsComponent {
  @Input() userData: UserStats[] = [];
  @Input() kycData: KycSummary[] = [];
}
