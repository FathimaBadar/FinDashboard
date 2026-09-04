import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { UserStats } from '../../../core/models/user-stats.model';
import { KycSummary } from '../../../core/models/kyc-summary.model';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-business-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, CardComponent, BadgeComponent],
  templateUrl: './business-reports.component.html'
})
export class BusinessReportsComponent {
  readonly userData = input<UserStats[]>([]);
  readonly kycData = input<KycSummary[]>([]);

  // A computed() memoizes: it only re-runs when userData() actually changes,
  // unlike a plain getter, which re-runs on every change-detection pass.
  readonly totalCumulative = computed(() =>
    this.userData().reduce((s, u) => s + u.cumulativeCount, 0)
  );

  // The legend now names a semantic variant rather than three raw hex values —
  // the Badge decides what those mean in the current theme.
  readonly kycStatuses: ReadonlyArray<{ label: string; variant: BadgeVariant }> = [
    { label: 'Incomplete', variant: 'warn'    },
    { label: 'In Review',  variant: 'info'    },
    { label: 'Verified',   variant: 'success' },
    { label: 'Approved',   variant: 'accent'  },
    { label: 'Rejected',   variant: 'danger'  },
  ];
}
