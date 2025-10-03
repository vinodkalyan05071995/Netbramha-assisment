class ScoreHistoryComponent extends HTMLElement {
    constructor() {
        super();
        this.canvas = this.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.data = this.parseData();
    }

    connectedCallback() {
        this.initChart();
    }

    parseData() {
        // Sample data - can be passed via attributes or fetched from API
        return {
            labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
            datasets: [{
                label: 'NB Score',
                data: [null, null, null, 520, 580, 493, null, 510, null, null, null, null],
                borderColor: '#1e40af',
                backgroundColor: '#1e40af',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#1e40af',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                tension: 0.1,
                fill: false
            }]
        };
    }

    initChart() {
        const settings = {
            type: 'line',
            data: this.data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#1e40af',
                        borderWidth: 1,
                        callbacks: {
                            title: function (context) {
                                return context[0].label;
                            },
                            label: function (context) {
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
                            color: 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#666',
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
                            color: '#666',
                            font: {
                                size: 12
                            },
                            callback: function (value) {
                                return value;
                            }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 1
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#1e40af'
                    }
                },
                onHover: (event, activeElements) => {
                    this.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                },
                onClick: (event, activeElements) => {
                    if (activeElements.length > 0) {
                        const dataIndex = activeElements[0].index;
                        const value = this.data.datasets[0].data[dataIndex];
                        if (value !== null) {
                            this.showGaugeAtPoint(dataIndex, value);
                        }
                    }
                }
            },
            plugins: [{
                id: 'gaugeOverlay',
                afterDraw: (chart) => {
                    this.drawGaugeOverlay(chart);
                }
            }, {
                id: 'dataLabels',
                afterDatasetsDraw: (chart) => {
                    this.drawDataLabels(chart);
                }
            }]
        };

        this.chart = new Chart(this.ctx, settings);
    }

    drawGaugeOverlay(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        const data = meta.data;

        // Find the point with gauge (August - index 7)
        const gaugeIndex = 7; // August
        if (data[gaugeIndex] && !data[gaugeIndex].skip) {
            const point = data[gaugeIndex];
            const value = this.data.datasets[0].data[gaugeIndex];

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

        // Draw gauge background (semicircle)
        ctx.beginPath();
        ctx.arc(centerX, centerY, gaugeRadius, Math.PI, 2 * Math.PI);
        ctx.fillStyle = '#f3f4f6';
        ctx.fill();
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw gauge segments
        const segments = [
            { start: Math.PI, end: Math.PI + Math.PI * 0.2, color: '#ef4444' },
            { start: Math.PI + Math.PI * 0.2, end: Math.PI + Math.PI * 0.4, color: '#f59e0b' },
            { start: Math.PI + Math.PI * 0.4, end: Math.PI + Math.PI * 0.6, color: '#eab308' },
            { start: Math.PI + Math.PI * 0.6, end: Math.PI + Math.PI * 0.8, color: '#22c55e' },
            { start: Math.PI + Math.PI * 0.8, end: 2 * Math.PI, color: '#16a34a' }
        ];

        segments.forEach(segment => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, gaugeRadius - 5, segment.start, segment.end);
            ctx.lineWidth = 8;
            ctx.strokeStyle = segment.color;
            ctx.stroke();
        });

        // Calculate needle angle
        const min = 300;
        const max = 900;
        const clamped = Math.max(min, Math.min(max, score));
        const t = (clamped - min) / (max - min);
        const angle = Math.PI + t * Math.PI;

        // Draw needle
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
        ctx.fillStyle = '#1f2937';
        ctx.fill();

        // Draw center hub
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#1f2937';
        ctx.fill();

        // Draw score text
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(score.toString(), centerX, centerY + 5);

        ctx.restore();
    }

    drawDataLabels(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        const data = meta.data;

        ctx.save();
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        data.forEach((point, index) => {
            const value = this.data.datasets[0].data[index];
            if (value !== null) {
                // Draw label background
                const labelText = `${value} +`;
                const textWidth = ctx.measureText(labelText).width;
                const labelX = point.x;
                const labelY = point.y - 15;

                // Different colors for different points
                let bgColor = '#1e40af';
                if (index === 7) bgColor = '#f59e0b'; // August - yellow

                ctx.fillStyle = bgColor;
                ctx.fillRect(labelX - textWidth / 2 - 4, labelY - 16, textWidth + 8, 18);

                // Draw label text
                ctx.fillStyle = '#ffffff';
                ctx.fillText(labelText, labelX, labelY);
            }
        });

        ctx.restore();
    }

    showGaugeAtPoint(dataIndex, value) {
        // This could trigger a modal or detailed view
        console.log(`Showing gauge for ${this.data.labels[dataIndex]}: ${value}`);
        // You could emit a custom event here for parent components to handle
        this.dispatchEvent(new CustomEvent('gauge-click', {
            detail: { month: this.data.labels[dataIndex], score: value }
        }));
    }
}

customElements.define('score-history-component', ScoreHistoryComponent);

// Make available globally
window.ScoreHistoryComponent = ScoreHistoryComponent;

