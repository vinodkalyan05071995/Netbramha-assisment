class ScoreListComponent extends HTMLElement {
    constructor() {
        super();
        this.data = this.parseData();
    }

    connectedCallback() {
        this.render();
    }

    parseData() {
        // Sample data - can be passed via attributes or fetched from API
        return [
            { date: '18/08/2022', score: 493, change: 'up', color: '#22c55e' },
            { date: '16/08/2022', score: 490, change: 'down', color: '#ef4444' },
            { date: '14/08/2022', score: 510, change: 'up', color: '#22c55e' },
            { date: '12/08/2022', score: 509, change: 'right', color: '#3b82f6' },
            { date: '09/08/2022', score: null, change: 'none', color: '#6b7280' }
        ];
    }

    render() {
        this.innerHTML = `
            <div class="score-list-container">
                <div class="score-list-header">
                    <h3>August 2022</h3>
                </div>
                <div class="score-list-items">
                    ${this.data.map(item => this.renderItem(item)).join('')}
                </div>
            </div>
        `;

        this.addStyles();
    }

    renderItem(item) {
        const arrow = this.getArrowIcon(item.change);
        const scoreText = item.score ? item.score.toString() : 'N/H';

        return `
            <div class="score-list-item">
                <div class="score-date">${item.date}</div>
                <div class="score-value" style="color: ${item.color}">
                    ${scoreText}
                </div>
                <div class="score-arrow" style="color: ${item.color}">
                    ${arrow}
                </div>
            </div>
        `;
    }

    getArrowIcon(change) {
        switch (change) {
            case 'up': return '↑';
            case 'down': return '↓';
            case 'right': return '→';
            default: return '';
        }
    }

    addStyles() {
        if (document.getElementById('score-list-styles')) return;

        const style = document.createElement('style');
        style.id = 'score-list-styles';
        style.textContent = `
            .score-list-container {
                background: #ffffff;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                max-height: 300px;
                overflow-y: auto;
            }
            
            .score-list-header h3 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .score-list-item {
                display: flex;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .score-list-item:last-child {
                border-bottom: none;
            }
            
            .score-date {
                flex: 1;
                font-size: 14px;
                color: #6b7280;
            }
            
            .score-value {
                flex: 1;
                font-size: 14px;
                font-weight: 600;
                text-align: center;
            }
            
            .score-arrow {
                flex: 0 0 20px;
                font-size: 16px;
                text-align: center;
            }
            
            .score-list-items::-webkit-scrollbar {
                width: 6px;
            }
            
            .score-list-items::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 3px;
            }
            
            .score-list-items::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 3px;
            }
            
            .score-list-items::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }
        `;
        document.head.appendChild(style);
    }
}

customElements.define('score-list-component', ScoreListComponent);

// Make available globally
window.ScoreListComponent = ScoreListComponent;

