import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { forkJoin } from 'rxjs';
import {
  DashboardService,
  UserStats,
  KycSummary,
  TransactionStatus,
  TransactionAmount,
  Balances
} from '../services/dashboard.service';
import { KycSummaryComponent } from './kyc-summary/kyc-summary.component';
import { TransactionStatusCardComponent } from './transaction-status-card/transaction-status-card.component';
import { BusinessReportsComponent } from './business-reports/business-reports.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    KycSummaryComponent,
    TransactionStatusCardComponent,
    BusinessReportsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  activeTabMain: 'dashboard' | 'reports' = 'dashboard';
  activeTab: 'daily' | 'all' = 'all';

  totalUsersData: UserStats[] = [];
  kycData: KycSummary[] = [];
  transactionStatusData: TransactionStatus[] = [];
  transactionAmountData: TransactionAmount[] = [];
  balances!: Balances;

  totalUsersCount = 0;
  dayUsersCount = 0;
  totalTransactionCount = 0;
  users_subTitle = 'Accumulated Count';
  transactionSubTitle = '';
  chartLegends: { label: string; color: string }[] = [];
  currentYear = new Date().getFullYear();

  readonly pieColors = ['#003F5C', '#58508D', '#BC5090', '#FF6361', '#FFA600'];

  pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { display: false } }
  };
  pieChartLabels = ['Customer', 'BO', 'Agent', 'Corporate', 'Merchant'];
  pieChartData!: ChartData<'pie', number[], string | string[]>;
  pieChartType: ChartType = 'pie';

  donutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '50%',
    plugins: { legend: { display: false }, tooltip: { enabled: true } }
  };
  donutChartData!: ChartData<'doughnut'>;

  chartConfig!: ChartConfiguration<'bar' | 'line'>;

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    forkJoin({
      users: this.dashboardService.getUsers(),
      kyc: this.dashboardService.getKyc(),
      txns: this.dashboardService.getTransactions(),
      amounts: this.dashboardService.getTransactionAmounts(),
      balances: this.dashboardService.getBalances()
    }).subscribe(({ users, kyc, txns, amounts, balances }) => {
      this.totalUsersData = users;
      this.kycData = kyc;
      this.transactionStatusData = txns;
      this.transactionAmountData = amounts;
      this.balances = balances;

      this.totalUsersCount = users.reduce((s, u) => s + u.cumulativeCount, 0);
      this.dayUsersCount = users.reduce((s, u) => s + u.userCount, 0);

      this.cdr.detectChanges();

      setTimeout(() => {
        this.generateUserCountChartData();
        this.generateTransactionStatusChart();
        this.generateTransactionAmountChart();
        this.cdr.detectChanges();
      }, 100);
    });
  }

  setTab(tab: 'daily' | 'all', graphIndex: number) {
    this.activeTab = tab;
    if (graphIndex === 1) this.generateUserCountChartData();
    else this.generateTransactionStatusChart();
  }

  generateUserCountChartData() {
    if (this.activeTab === 'all') {
      this.users_subTitle = 'Accumulated Count';
      this.totalUsersCount = this.totalUsersData.reduce((s, u) => s + u.cumulativeCount, 0);
      this.pieChartData = {
        labels: this.pieChartLabels,
        datasets: [{
          data: this.totalUsersData.map(u => u.cumulativeCount),
          backgroundColor: this.pieColors,
          borderWidth: 0
        }]
      };
    } else {
      this.users_subTitle = 'New Users Last Day';
      this.totalUsersCount = this.totalUsersData.reduce((s, u) => s + u.userCount, 0);
      this.pieChartData = {
        labels: this.pieChartLabels,
        datasets: [{
          data: this.totalUsersData.map(u => u.userCount),
          backgroundColor: this.pieColors,
          borderWidth: 0
        }]
      };
    }
    this.chartLegends = this.pieChartLabels.map((label, i) => ({ label, color: this.pieColors[i] }));
  }

  generateTransactionStatusChart() {
    const data = this.transactionStatusData;
    if (this.activeTab === 'all') {
      this.transactionSubTitle = `Year - ${this.currentYear}`;
      const totalSuccess = data.reduce((s, m) => s + m.successCount, 0);
      const totalFailed  = data.reduce((s, m) => s + m.failedCount, 0);
      const totalPending = data.reduce((s, m) => s + m.pendingCount, 0);
      this.totalTransactionCount = totalSuccess + totalFailed + totalPending;
      this.donutChartData = {
        labels: ['Success', 'Failed', 'Pending'],
        datasets: [{
          data: [totalSuccess, totalFailed, totalPending],
          backgroundColor: ['#47B39C', '#EC6B56', '#FFC154'],
          borderWidth: 0, hoverOffset: 4
        }]
      };
    } else {
      const month = new Date().getMonth();
      const monthName = new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(this.currentYear, month));
      this.transactionSubTitle = `Current Month - ${monthName}`;
      const m = data[month] ?? data[data.length - 1];
      this.totalTransactionCount = m.successCount + m.failedCount + m.pendingCount;
      this.donutChartData = {
        labels: ['Success', 'Failed', 'Pending'],
        datasets: [{
          data: [m.successCount, m.failedCount, m.pendingCount],
          backgroundColor: ['#47B39C', '#EC6B56', '#FFC154'],
          borderWidth: 0, hoverOffset: 4
        }]
      };
    }
  }

  generateTransactionAmountChart() {
    this.chartConfig = {
      type: 'bar',
      data: {
        labels: this.getMonthLabels(),
        datasets: [
          {
            type: 'bar',
            label: 'Total Amount (ر.س)',
            data: this.transactionAmountData.map(d => d.totalAmount),
            backgroundColor: '#74c69d',
            borderRadius: 4
          },
          {
            type: 'line',
            label: 'No. of Transactions',
            data: this.transactionAmountData.map(d => d.noOfTxn),
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
  }

  private getMonthLabels(): string[] {
    const year = new Date().getFullYear();
    return this.transactionAmountData.map((_, i) =>
      new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(year, i))
    );
  }
}
