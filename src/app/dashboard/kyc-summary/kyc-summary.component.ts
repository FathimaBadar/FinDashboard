import { Component, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration } from 'chart.js';
import { KycSummary } from '../../core/models/kyc-summary.model';

@Component({
  selector: 'app-kyc-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 class="text-base font-bold mb-2" style="color:#1a3a28">KYC Application Summary</h2>
      <div class="justify-items-center m-1">
        <canvas #kycCanvas></canvas>
      </div>
    </div>
  `
})
export class KycSummaryComponent implements AfterViewInit {
  @Input() kycData: KycSummary[] = [];
  @ViewChild('kycCanvas') kycCanvas!: ElementRef<HTMLCanvasElement>;

  private statuses = ['Incomplete', 'In Review', 'Verified L1', 'Verified L2', 'Rejected', 'Approved'];
  private typeColors: Record<string, string> = {
    CUSTOMER:  '#1a3a28',
    AGENT:     '#2d6a4f',
    MERCHANT:  '#40916c',
    CORPORATE: '#74c69d',
  };

  ngAfterViewInit() {
    this.buildChart();
  }

  private buildChart() {
    const ctx = this.kycCanvas.nativeElement;
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
