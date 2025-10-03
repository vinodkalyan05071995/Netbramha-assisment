var App = (() => {
  // src/js/sections/nb-score-dashboard.js
  var NBScoreDashboardComponent = class extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.render();
      this.addStyles();
    }
    render() {
      this.innerHTML = `
            <div class="nb-dashboard">
                <div class="dashboard-header">
                    <h2>NB SCORE HISTORY</h2>
                </div>
                
                <div class="dashboard-content">
                    <div class="chart-section">
                        <div class="chart-title">
                            Trended view of the changes in your NB Score with every refresh.
                        </div>
                        <div class="chart-container">
                            <canvas id="score-history-chart" width="800" height="400"></canvas>
                        </div>
                    </div>
                    
                    <div class="list-section">
                        <score-list-component></score-list-component>
                    </div>
                </div>
            </div>
        `;
      setTimeout(() => {
        this.initChart();
      }, 100);
    }
    initChart() {
      const canvas = this.querySelector("#score-history-chart");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const data = {
        labels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
        datasets: [{
          label: "NB Score",
          data: [null, null, null, 520, 580, 493, null, 510, null, null, null, null],
          borderColor: "#1e40af",
          backgroundColor: "#1e40af",
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "#1e40af",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          tension: 0.1,
          fill: false
        }]
      };
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index"
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "#1e40af",
            borderWidth: 1,
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                return `Score: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: true,
              color: "rgba(0, 0, 0, 0.1)",
              lineWidth: 1
            },
            ticks: {
              color: "#666",
              font: {
                size: 12
              }
            }
          },
          y: {
            display: true,
            min: 300,
            max: 900,
            ticks: {
              stepSize: 100,
              color: "#666",
              font: {
                size: 12
              }
            },
            grid: {
              display: true,
              color: "rgba(0, 0, 0, 0.1)",
              lineWidth: 1
            }
          }
        },
        onHover: (event, activeElements) => {
          canvas.style.cursor = activeElements.length > 0 ? "pointer" : "default";
        },
        onClick: (event, activeElements) => {
          if (activeElements.length > 0) {
            const dataIndex = activeElements[0].index;
            const value = data.datasets[0].data[dataIndex];
            if (value !== null) {
              this.showGaugeAtPoint(dataIndex, value);
            }
          }
        }
      };
      const plugins = [{
        id: "gaugeOverlay",
        afterDraw: (chart) => {
          this.drawGaugeOverlay(chart);
        }
      }, {
        id: "dataLabels",
        afterDatasetsDraw: (chart) => {
          this.drawDataLabels(chart);
        }
      }];
      this.chart = new Chart(ctx, {
        type: "line",
        data,
        options,
        plugins
      });
    }
    drawGaugeOverlay(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const data = meta.data;
      const gaugeIndex = 7;
      if (data[gaugeIndex] && !data[gaugeIndex].skip) {
        const point = data[gaugeIndex];
        const value = 510;
        if (value !== null) {
          this.drawGaugeAtPoint(ctx, point.x, point.y, value);
        }
      }
    }
    drawGaugeAtPoint(ctx, x, y, score) {
      const gaugeRadius = 40;
      const needleLength = gaugeRadius * 0.6;
      const centerX = x;
      const centerY = y - gaugeRadius - 20;
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, gaugeRadius, Math.PI, 2 * Math.PI);
      ctx.fillStyle = "#f3f4f6";
      ctx.fill();
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 2;
      ctx.stroke();
      const segments = [
        { start: Math.PI, end: Math.PI + Math.PI * 0.2, color: "#ef4444" },
        { start: Math.PI + Math.PI * 0.2, end: Math.PI + Math.PI * 0.4, color: "#f59e0b" },
        { start: Math.PI + Math.PI * 0.4, end: Math.PI + Math.PI * 0.6, color: "#eab308" },
        { start: Math.PI + Math.PI * 0.6, end: Math.PI + Math.PI * 0.8, color: "#22c55e" },
        { start: Math.PI + Math.PI * 0.8, end: 2 * Math.PI, color: "#16a34a" }
      ];
      segments.forEach((segment) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, gaugeRadius - 5, segment.start, segment.end);
        ctx.lineWidth = 8;
        ctx.strokeStyle = segment.color;
        ctx.stroke();
      });
      const min = 300;
      const max = 900;
      const clamped = Math.max(min, Math.min(max, score));
      const t = (clamped - min) / (max - min);
      const angle = Math.PI + t * Math.PI;
      const tipX = centerX + needleLength * Math.cos(angle);
      const tipY = centerY + needleLength * Math.sin(angle);
      const baseHalf = 4;
      const leftX = centerX + baseHalf * Math.cos(angle + Math.PI / 2);
      const leftY = centerY + baseHalf * Math.sin(angle + Math.PI / 2);
      const rightX = centerX + baseHalf * Math.cos(angle - Math.PI / 2);
      const rightY = centerY + baseHalf * Math.sin(angle - Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(leftX, leftY);
      ctx.lineTo(rightX, rightY);
      ctx.closePath();
      ctx.fillStyle = "#1f2937";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#1f2937";
      ctx.fill();
      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(score.toString(), centerX, centerY + 5);
      ctx.restore();
    }
    drawDataLabels(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const data = meta.data;
      ctx.save();
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      data.forEach((point, index) => {
        const value = [null, null, null, 520, 580, 493, null, 510, null, null, null, null][index];
        if (value !== null) {
          const labelText = `${value} +`;
          const textWidth = ctx.measureText(labelText).width;
          const labelX = point.x;
          const labelY = point.y - 15;
          let bgColor = "#1e40af";
          if (index === 7) bgColor = "#f59e0b";
          ctx.fillStyle = bgColor;
          ctx.fillRect(labelX - textWidth / 2 - 4, labelY - 16, textWidth + 8, 18);
          ctx.fillStyle = "#ffffff";
          ctx.fillText(labelText, labelX, labelY);
        }
      });
      ctx.restore();
    }
    showGaugeAtPoint(dataIndex, value) {
      console.log(`Showing gauge for ${dataIndex}: ${value}`);
    }
    addStyles() {
      if (document.getElementById("nb-dashboard-styles")) return;
      const style = document.createElement("style");
      style.id = "nb-dashboard-styles";
      style.textContent = `
            .nb-dashboard {
                background: #ffffff;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .dashboard-header h2 {
                margin: 0 0 24px 0;
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                letter-spacing: 0.5px;
            }
            
            .dashboard-content {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 24px;
            }
            
            .chart-section {
                background: #ffffff;
                border-radius: 8px;
                padding: 20px;
            }
            
            .chart-title {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 20px;
                font-weight: 500;
            }
            
            .chart-container {
                position: relative;
                height: 400px;
            }
            
            .list-section {
                background: #f9fafb;
                border-radius: 8px;
                padding: 16px;
            }
            
            @media (max-width: 768px) {
                .dashboard-content {
                    grid-template-columns: 1fr;
                }
            }
        `;
      document.head.appendChild(style);
    }
  };
  customElements.define("nb-score-dashboard", NBScoreDashboardComponent);
  window.NBScoreDashboardComponent = NBScoreDashboardComponent;
})();
//# sourceMappingURL=nb-score-dashboard.js.map
