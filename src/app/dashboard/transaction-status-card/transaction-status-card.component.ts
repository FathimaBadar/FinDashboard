import { Component, Input, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TransactionStatus } from '../../services/dashboard.service';

@Component({
  selector: 'app-transaction-status-card',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="bg-white drop-shadow-xl rounded-lg p-6">
      <h2 class="text-lg font-semibold text-gray-700 mb-2">Monthly Transaction Status</h2>
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
          borderColor: '#34d399', backgroundColor: '#34d399', fill: false, tension: 0.3
        },
        {
          label: 'Pending',
          data: this.transactionData.map(d => d.pendingCount),
          borderColor: '#fbbf24', backgroundColor: '#fbbf24', fill: false, tension: 0.3
        },
        {
          label: 'Failed',
          data: this.transactionData.map(d => d.failedCount),
          borderColor: '#f87171', backgroundColor: '#f87171', fill: false, tension: 0.3
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
