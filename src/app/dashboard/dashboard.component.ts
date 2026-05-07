import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../services/dashboard.service';
import { UserStats } from '../core/models/user-stats.model';
import { KycSummary } from '../core/models/kyc-summary.model';
import { TransactionStatus } from '../core/models/transaction-status.model';
import { TransactionAmount } from '../core/models/transaction-amount.model';
import { Balances } from '../core/models/balances.model';
import { KycSummaryComponent } from './kyc-summary/kyc-summary.component';
import { TransactionStatusCardComponent } from './transaction-status-card/transaction-status-card.component';
import { BusinessReportsComponent } from './business-reports/business-reports.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    NgClass,
    BaseChartDirective,
    KycSummaryComponent,
    TransactionStatusCardComponent,
    BusinessReportsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);

  // UI state
  readonly activeTabMain = signal<'dashboard' | 'reports'>('dashboard');
  readonly activeTab = signal<'daily' | 'all'>('all');
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  // Raw data signals
  readonly usersData = signal<UserStats[]>([]);
  readonly kycData = signal<KycSummary[]>([]);
  readonly transactionStatusData = signal<TransactionStatus[]>([]);
  readonly transactionAmountData = signal<TransactionAmount[]>([]);
  readonly balances = signal<Balances | null>(null);

  // Static config
  readonly currentYear = new Date().getFullYear();
  readonly pieChartLabels = ['Customer', 'BO', 'Agent', 'Corporate', 'Merchant'];
  readonly pieColors = ['#003F5C', '#58508D', '#BC5090', '#FF6361', '#FFA600'];
  readonly pieChartType: ChartType = 'pie';

  readonly pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { display: false } }
  };

  readonly donutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '50%',
    plugins: { legend: { display: false }, tooltip: { enabled: true } }
  };

  // Derived computed values — recalculate automatically when signals change
  readonly chartLegends = computed(() =>
    this.pieChartLabels.map((label, i) => ({ label, color: this.pieColors[i] }))
  );

  readonly userSubTitle = computed(() =>
    this.activeTab() === 'all' ? 'Accumulated Count' : 'New Users Last Day'
  );

  readonly totalUsersCount = computed(() => {
    const tab = this.activeTab();
    return this.usersData().reduce(
      (sum, u) => sum + (tab === 'all' ? u.cumulativeCount : u.userCount),
      0
    );
  });

  readonly dayUsersCount = computed(() =>
    this.usersData().reduce((sum, u) => sum + u.userCount, 0)
  );

  readonly pieChartData = computed<ChartData<'pie', number[], string | string[]> | null>(() => {
    const data = this.usersData();
    if (!data.length) return null;
    const tab = this.activeTab();
    return {
      labels: this.pieChartLabels,
      datasets: [{
        data: data.map(u => tab === 'all' ? u.cumulativeCount : u.userCount),
        backgroundColor: this.pieColors,
        borderWidth: 0
      }]
    };
  });

  readonly transactionSubTitle = computed(() => {
    if (this.activeTab() === 'all') return `Year - ${this.currentYear}`;
    const month = new Date().getMonth();
    return `Current Month - ${
      new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(this.currentYear, month))
    }`;
  });

  readonly donutChartData = computed<ChartData<'doughnut'> | null>(() => {
    const data = this.transactionStatusData();
    if (!data.length) return null;
    const colors = ['#47B39C', '#EC6B56', '#FFC154'];
    const labels = ['Success', 'Failed', 'Pending'];

    if (this.activeTab() === 'all') {
      return {
        labels,
        datasets: [{
          data: [
            data.reduce((s, m) => s + m.successCount, 0),
            data.reduce((s, m) => s + m.failedCount, 0),
            data.reduce((s, m) => s + m.pendingCount, 0)
          ],
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      };
    }

    const month = new Date().getMonth();
    const m = data[month] ?? data[data.length - 1];
    return {
      labels,
      datasets: [{
        data: [m.successCount, m.failedCount, m.pendingCount],
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4
      }]
    };
  });

  readonly totalTransactionCount = computed(() => {
    const donut = this.donutChartData();
    if (!donut) return 0;
    return (donut.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
  });

  readonly chartConfig = computed<ChartConfiguration<'bar' | 'line'> | null>(() => {
    const amounts = this.transactionAmountData();
    if (!amounts.length) return null;
    const labels = amounts.map((_, i) =>
      new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(this.currentYear, i))
    );
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Total Amount (ر.س)',
            data: amounts.map(d => d.totalAmount),
            backgroundColor: '#74c69d',
            borderRadius: 4
          },
          {
            type: 'line',
            label: 'No. of Transactions',
            data: amounts.map(d => d.noOfTxn),
            borderColor: '#1a3a28',
            backgroundColor: '#1a3a28',
            tension: 0.4,
            borderWidth: 2,
            yAxisID: 'y1',
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#1a3a28'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#374151' } },
          tooltip: {
            callbacks: {
              label: ctx => ctx.dataset.label?.includes('Amount')
                ? `ر.س ${ctx.formattedValue}`
                : `Transactions: ${ctx.formattedValue}`
            }
          }
        },
        scales: {
          y:  { beginAtZero: true, title: { display: true, text: 'Total Amount (ر.س)' } },
          y1: { beginAtZero: true, position: 'right', title: { display: true, text: 'Transactions' }, grid: { drawOnChartArea: false } }
        }
      }
    };
  });

  constructor() {
    this.loadDashboardData();
  }

  setTab(tab: 'daily' | 'all'): void {
    this.activeTab.set(tab);
  }

  private loadDashboardData(): void {
    forkJoin({
      users:   this.dashboardService.getUsers(),
      kyc:     this.dashboardService.getKyc(),
      txns:    this.dashboardService.getTransactions(),
      amounts: this.dashboardService.getTransactionAmounts(),
      balances: this.dashboardService.getBalances()
    })
    .pipe(takeUntilDestroyed())
    .subscribe({
      next: ({ users, kyc, txns, amounts, balances }) => {
        this.usersData.set(users);
        this.kycData.set(kyc);
        this.transactionStatusData.set(txns);
        this.transactionAmountData.set(amounts);
        this.balances.set(balances);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dashboard data. Please refresh the page.');
        this.isLoading.set(false);
      }
    });
  }
}
