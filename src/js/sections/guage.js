class CreditScoreComponent extends HTMLElement {
    constructor() {
        super();
        this.score = parseInt(this.getAttribute("score"));
        this.min = parseInt(this.getAttribute("min"));
        this.max = parseInt(this.getAttribute("max"));
        this.canvas = this.querySelector(".gauge");
        this.scoreEl = this.querySelector("#score");
        this.ctx = this.canvas.getContext("2d");
    }

    connectedCallback() {
        this.hasAttribute("credit-score") && this.creditScoreComponent();
        this.hasAttribute("doughnut") && this.doughnutComponent();
        this.hasAttribute("line-chart") && this.lineChartComponent();
    }

    lineChartComponent() {
        const settings = {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'NB Score',
                    data: [null, null, null, 520, 580, 493, null, 510, null, null, null, null],
                    borderColor: '#1e3a8a',
                    borderWidth: 2,
                    tension: 0,
                    spanGaps: true,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                layout: {
                    padding: 20
                },
                scales: {
                    y: {
                        min: 300,
                        max: 900,
                        ticks: { stepSize: 100 },
                        grid: { color: '#ccc', borderDash: [0, 6], drawOnChartArea: true, drawTicks: true }
                    },
                    x: {
                        grid: { color: '#ccc', borderDash: [0, 6], drawOnChartArea: true, drawTicks: true }
                    }
                }
            },
            plugins: [{
                id: 'callout',
                afterDatasetsDraw(chart) {
                    const lastIndex = 7;
                    const highlightIndexes = [3, 4, 5, 7]; // Apr, May, Jun, Aug
                    const { ctx } = chart;
                    chart.data.datasets[0].data.forEach((value, index) => {
                        if (!highlightIndexes.includes(index)) return;
                        const meta = chart.getDatasetMeta(0);
                        const point = meta.data[index].x !== undefined ? meta.data[index] : meta.data[index].getProps(['x', 'y'], true);

                        const x = point.x;
                        const y = point.y;

                        // Draw circle point
                        ctx.beginPath();
                        ctx.arc(x, y, 6, 0, 2 * Math.PI);
                        ctx.fillStyle = '#fff';
                        ctx.fill();
                        ctx.lineWidth = 4;
                        ctx.strokeStyle = '#004364';
                        ctx.stroke();

                        // Tooltip dimensions
                        const boxWidth = 64;
                        const boxHeight = 27;
                        const darkWidth = 20;
                        const leftRadius = 8;
                        const boxX = x - 10;
                        const boxY = y - 40;

                        // Left rectangle
                        ctx.fillStyle = index === lastIndex ? '#facc15' : '#00A6CA';
                        ctx.beginPath();
                        ctx.moveTo(boxX + leftRadius, boxY);
                        ctx.lineTo(boxX + boxWidth - darkWidth, boxY);
                        ctx.lineTo(boxX + boxWidth - darkWidth, boxY + boxHeight);
                        ctx.lineTo(boxX + leftRadius, boxY + boxHeight);
                        ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - leftRadius);
                        ctx.lineTo(boxX, boxY + leftRadius);
                        ctx.quadraticCurveTo(boxX, boxY, boxX + leftRadius, boxY);
                        ctx.closePath();
                        ctx.fill();

                        // Right pill section
                        ctx.fillStyle = index === lastIndex ? '#00A6CA' : '#004364';
                        ctx.beginPath();
                        ctx.moveTo(boxX + boxWidth - darkWidth, boxY);
                        ctx.arc(
                            boxX + boxWidth - darkWidth / 2,
                            boxY + boxHeight / 2,
                            boxHeight / 2,
                            -Math.PI / 2,
                            Math.PI / 2,
                            false
                        );
                        ctx.lineTo(boxX + boxWidth - darkWidth, boxY + boxHeight);
                        ctx.closePath();
                        ctx.fill();

                        // Value text
                        ctx.fillStyle = '#fff';
                        ctx.font = '700 12px Roboto';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(value, boxX + (boxWidth - darkWidth) / 2, boxY + boxHeight / 2);

                        // Plus or right arrow
                        ctx.font = 'bold 16px Roboto';
                        const symbol = index === lastIndex ? '>' : '+';
                        ctx.fillText(symbol, boxX + boxWidth - darkWidth / 2, boxY + boxHeight / 2);
                    });
                }
            }]
        }
        this.drawChart(settings);
    }

    doughnutComponent() {
        const settings = {
            type: 'doughnut',
            data: {
                labels: ['Closed credit cards', 'Closed loans', 'Open credit cards', 'Open loans'],
                datasets: [{
                    data: [4, 1, 2, 6],
                    backgroundColor: ['#8b77d9', '#f7e07b', '#9bdaf1', '#7edb95'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        }
        this.drawChart(settings);
    }

    creditScoreComponent() {
        let segments = [200, 50, 50, 50, 50];
        let colors = ["#d9534f", "#f0ad4e", "#ffd700", "#a6d785", "#3cb371"];

        if (this.hasAttribute("segments")) {
            try {
                segments = JSON.parse(this.getAttribute("segments"));
            } catch { }
        }
        if (this.hasAttribute("colors")) {
            try {
                colors = JSON.parse(this.getAttribute("colors").replace(/'/g, '"'));
            } catch { }
        }

        if (!this.canvas || !this.scoreEl) return;


        const settings = {
            type: "doughnut",
            data: {
                datasets: [{
                    data: segments,
                    backgroundColor: colors,
                    borderColor: "#fff",
                    borderWidth: 2,
                    circumference: 180,
                    rotation: 270,
                    cutout: "90%",
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                // 👇 Pass values to plugin via custom options
                custom: {
                    score: this.score,
                    min: this.min,
                    max: this.max
                }
            },
            plugins: [{
                id: "needle",
                afterDatasetDraw(chart) {
                    const { ctx } = chart;
                    const meta = chart.getDatasetMeta(0);
                    const arcs = meta.data;
                    if (!arcs.length) return;

                    const centerX = arcs[0].x;
                    const centerY = arcs[0].y;
                    const outerRadius = arcs[0].outerRadius;

                    const { score, min, max } = chart.config.options.custom;

                    const clamped = Math.max(min, Math.min(max, score));
                    const t = (clamped - min) / (max - min);

                    const startAngle = arcs[0].startAngle;
                    const endAngle = arcs[arcs.length - 1].endAngle;
                    const angle = startAngle + t * (endAngle - startAngle);

                    const needleLength = outerRadius * 0.7;
                    const baseHalf = 6;
                    const tipHalf = 2;

                    // Gray half-circle radius
                    const grayRadius = 34;
                    // Offset to lift needle/hub above center
                    const liftOffset = 30;
                    const hubX = centerX;
                    const hubY = centerY + grayRadius / 2 - liftOffset;

                    // Tip position
                    const tipX = hubX + needleLength * Math.cos(angle);
                    const tipY = hubY + needleLength * Math.sin(angle);

                    // Near-tip left/right
                    const tipLeftX = tipX + tipHalf * Math.cos(angle + Math.PI / 2);
                    const tipLeftY = tipY + tipHalf * Math.sin(angle + Math.PI / 2);
                    const tipRightX = tipX + tipHalf * Math.cos(angle - Math.PI / 2);
                    const tipRightY = tipY + tipHalf * Math.sin(angle - Math.PI / 2);

                    // Base left/right (at hub)
                    const leftX = hubX + baseHalf * Math.cos(angle + Math.PI / 2);
                    const leftY = hubY + baseHalf * Math.sin(angle + Math.PI / 2);
                    const rightX = hubX + baseHalf * Math.cos(angle - Math.PI / 2);
                    const rightY = hubY + baseHalf * Math.sin(angle - Math.PI / 2);

                    ctx.save();
                    // Gray half-circle
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, grayRadius, Math.PI, 2 * Math.PI);
                    ctx.fillStyle = "#eee";
                    ctx.fill();

                    // Needle
                    ctx.beginPath();
                    ctx.moveTo(tipLeftX, tipLeftY);
                    ctx.lineTo(tipRightX, tipRightY);
                    ctx.lineTo(rightX, rightY);
                    ctx.lineTo(leftX, leftY);
                    ctx.closePath();
                    ctx.fillStyle = "#222";
                    ctx.fill();
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "rgba(0,0,0,0.25)";
                    ctx.stroke();

                    // Center hub
                    ctx.beginPath();
                    ctx.arc(hubX, hubY, 6, 0, 2 * Math.PI);
                    ctx.fillStyle = "#222";
                    ctx.fill();

                    // Tip hub (small circle at needle tip)
                    // Tip hub (small circle at needle tip)
                    ctx.beginPath();
                    ctx.arc(tipX, tipY, 2, 0, 2 * Math.PI); // smaller radius
                    ctx.fillStyle = "#222";
                    ctx.fill();
                    ctx.strokeStyle = "rgba(0,0,0,0.25)";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.restore();
                }
            }]
        }
        this.drawChart(settings);

        this.animateNumber();
    }

    drawChart(settings) {
        this.gaugeChart = new Chart(this.ctx, settings);
    }

    animateNumber() {
        const from = this.min;
        const to = this.score;
        const duration = 800;
        const start = performance.now();
        const el = this.scoreEl;

        const step = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const value = Math.round(from + (to - from) * eased);
            el.textContent = value;
            if (t < 1) requestAnimationFrame(step);
            else el.textContent = to;
        };
        requestAnimationFrame(step);
    }
}
customElements.define("credit-score-component", CreditScoreComponent);
