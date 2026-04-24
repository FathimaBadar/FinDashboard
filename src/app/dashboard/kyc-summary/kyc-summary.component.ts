import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration } from 'chart.js';
import { KycSummary } from '../../services/dashboard.service';

@Component({
  selector: 'app-kyc-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white drop-shadow-xl rounded-lg p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-2">KYC Application Summary</h2>
      <div class="justify-items-center m-1">
        <canvas id="kycPyramid"></canvas>
      </div>
    </div>
  `
})
export class KycSummaryComponent implements OnInit {
  @Input() kycData: KycSummary[] = [];

  private statuses = ['Incomplete', 'In Review', 'Verified L1', 'Verified L2', 'Rejected', 'Approved'];
  private typeColors: Record<string, string> = {
    CUSTOMER:  '#003F5C',
    AGENT:     '#BC5090',
    MERCHANT:  '#FFA600',
    CORPORATE: '#FF6361',
  };

  ngOnInit() {
    this.buildChart();
  }

  private buildChart() {
    const ctx = document.getElementById('kycPyramid') as HTMLCanvasElement;
    const datasets = this.kycData.map(t => ({
      label: t.kycType,
      data: [t.incomplete, t.inReview, t.verifiedLevel1, t.verifiedLevel2, t.rejected, t.approved],
      backgroundColor: this.typeColors[t.kycType] ?? '#9CA3AF',
      borderWidth: 1
    }));

    const config: ChartConfiguration = {
      type: 'bar',
      data: { labels: this.statuses, datasets },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue}` }
          }
        },
        scales: { x: { stacked: true }, y: { stacked: true } }
      }
    };
    new Chart(ctx, config);
  }
}
