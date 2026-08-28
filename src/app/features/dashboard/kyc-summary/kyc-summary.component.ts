import { ChangeDetectionStrategy, Component, ElementRef, effect, input, viewChild } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { KycSummary } from '../../../core/models/kyc-summary.model';

@Component({
  selector: 'app-kyc-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 class="text-base font-bold mb-2" style="color:#1a3a28">KYC Application Summary</h2>
      <div class="justify-items-center m-1">
        <canvas #kycCanvas></canvas>
      </div>
    </div>
  `
})
export class KycSummaryComponent {
  readonly kycData = input<KycSummary[]>([]);
  private readonly kycCanvas = viewChild<ElementRef<HTMLCanvasElement>>('kycCanvas');

  private readonly statuses = ['Incomplete', 'In Review', 'Verified L1', 'Verified L2', 'Rejected', 'Approved'];
  private readonly typeColors: Record<string, string> = {
    CUSTOMER:  '#1a3a28',
    AGENT:     '#2d6a4f',
    MERCHANT:  '#40916c',
    CORPORATE: '#74c69d',
  };

  private chart?: Chart;

  constructor() {
    effect(() => {
      const canvasRef = this.kycCanvas();
      const data = this.kycData();
      if (!canvasRef) return;

      // Re-run on every data change, not just on first render — otherwise the
      // chart would silently go stale after a refetch/edit (Phase 5, Phase 8).
      this.chart?.destroy();
      this.chart = this.buildChart(canvasRef.nativeElement, data);
    });
  }

  private buildChart(ctx: HTMLCanvasElement, data: KycSummary[]): Chart {
    const datasets = data.map(t => ({
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
    return new Chart(ctx, config);
  }
}
