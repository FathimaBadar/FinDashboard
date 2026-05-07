import { Component, Input, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TransactionStatus } from '../../core/models/transaction-status.model';

@Component({
  selector: 'app-transaction-status-card',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 class="text-base font-bold mb-2" style="color:#1a3a28">Monthly Transaction Status</h2>
      <div class="w-full h-full">
        <canvas baseChart [data]="lineChartData" [options]="lineChartOptions" [type]="'line'"></canvas>
      </div>
    </div>
  `
})
export class TransactionStatusCardComponent implements OnInit {
  @Input() transactionData: TransactionStatus[] = [];

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { title: { display: false } },
      y: { beginAtZero: true, title: { display: true, text: 'Count' } }
    }
  };

  lineChartData!: ChartData<'line'>;

  ngOnInit() {
    this.lineChartData = {
      labels: this.getMonthLabels(),
      datasets: [
        {
          label: 'Success',
          data: this.transactionData.map(d => d.successCount),
          borderColor: '#40916c', backgroundColor: 'rgba(64,145,108,0.12)', fill: true, tension: 0.4
        },
        {
          label: 'Pending',
          data: this.transactionData.map(d => d.pendingCount),
          borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.10)', fill: true, tension: 0.4
        },
        {
          label: 'Failed',
          data: this.transactionData.map(d => d.failedCount),
          borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.10)', fill: true, tension: 0.4
        }
      ]
    };
  }

  private getMonthLabels(): string[] {
    const year = new Date().getFullYear();
    return this.transactionData.map((_, i) =>
      new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(year, i))
    );
  }
}
