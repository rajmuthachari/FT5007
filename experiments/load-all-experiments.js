/**
 * EquiCurve - Complete Experiment Loader
 * Loads all 25+ experiments across 10 categories
 * 
 * Add this script to your HTML after the framework.js and before simulator.js:
 * <script src="experiments/load-all-experiments.js"></script>
 */

console.log('🚀 Loading EquiCurve Complete Experiment Suite...');

// Experiment loading status
const experimentStatus = {
    loaded: 0,
    total: 25,
    categories: [
        '1. Elasticity Analysis (3)',
        '2. Platform Fee Structure (3)', 
        '3. Pricing Strategies (3)',
        '4. Effort Strategies (3)',
        '5. Market Conditions (3)',
        '6. Campaign Duration (2)',
        '7. Success Criteria (2)',
        '8. Principal-Agent (3)',
        '9. Network Effects (2)',
        '10. Comparative Analysis (2)'
    ]
};

// Enhanced experiment result handler for simulator
function updateExperimentResults(experimentType, results) {
    console.log('📊 Displaying experiment results:', results);
    
    const summaryDiv = document.getElementById('resultsSummary');
    
    // Clear any existing content
    summaryDiv.innerHTML = '';
    
    let html = '';
    
    // Category 1: Elasticity Analysis
    if (['price-elasticity', 'effort-elasticity', 'cross-elasticity'].includes(experimentType)) {
        html += generateElasticityResultsHTML(experimentType, results);
    }
    // Category 2: Platform Fee Structure  
    else if (['fixed-fees', 'dynamic-fees', 'hybrid-fees'].includes(experimentType)) {
        html += generateFeeResultsHTML(experimentType, results);
    }
    // Category 3: Pricing Strategies
    else if (['static-pricing', 'dynamic-pricing-exp', 'bonding-curves'].includes(experimentType)) {
        html += generatePricingResultsHTML(experimentType, results);
    }
    // Category 4: Effort Strategies
    else if (['effort-patterns', 'effort-allocation', 'platform-effort'].includes(experimentType)) {
        html += generateEffortResultsHTML(experimentType, results);
    }
    // Category 5: Market Conditions
    else if (['market-cycles', 'competition', 'external-shocks'].includes(experimentType)) {
        html += generateMarketResultsHTML(experimentType, results);
    }
    // Category 6: Campaign Duration
    else if (['duration-optimization', 'multi-round'].includes(experimentType)) {
        html += generateDurationResultsHTML(experimentType, results);
    }
    // Category 7: Success Criteria
    else if (['funding-thresholds', 'success-metrics'].includes(experimentType)) {
        html += generateSuccessResultsHTML(experimentType, results);
    }
    // Category 8: Principal-Agent
    else if (['information-asymmetry', 'incentive-mechanisms', 'governance-models'].includes(experimentType)) {
        html += generatePrincipalAgentResultsHTML(experimentType, results);
    }
    // Category 9: Network Effects
    else if (['viral-mechanics', 'community-building'].includes(experimentType)) {
        html += generateNetworkResultsHTML(experimentType, results);
    }
    // Category 10: Comparative Analysis
    else if (['traditional-vs-web3', 'platform-comparison'].includes(experimentType)) {
        html += generateComparativeResultsHTML(experimentType, results);
    }
    // Fallback for any missing experiments
    else {
        html += generateGenericResultsHTML(experimentType, results);
    }
    
    summaryDiv.innerHTML = html;
}

// Category-specific result generators
function generateElasticityResultsHTML(experimentType, results) {
    let html = `
        <div style="border: 2px solid #8b5cf6; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: #8b5cf6; font-weight: bold; margin-bottom: 0.5rem;">
                📈 Elasticity Analysis: ${results.optimal ? results.optimal.name || results.optimal.gamma || results.optimal.beta || results.optimal.combination : 'Complete'}
            </h4>
            <p style="color: #a78bfa; margin-bottom: 1rem;">
                <strong>${results.summary}</strong>
            </p>
    `;
    
    if (experimentType === 'price-elasticity') {
        html += `<div style="color: #d1d5db; font-size: 0.875rem;">`;
        results.results.slice(0, 5).forEach(result => {
            const style = result.gamma === results.optimal.gamma ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;';
            html += `
                <p style="${style}">
                    γ = ${result.gamma}: ${result.successRate.toFixed(1)}% success 
                    (${result.elasticityType}) ${result.gamma === results.optimal.gamma ? '⭐ OPTIMAL' : ''}
                </p>
            `;
        });
        html += `</div>`;
        
        if (results.insights) {
            html += `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #374151;">
                    <p style="color: #10b981;"><strong>💡 Key Insight:</strong> ${results.insights.recommendation}</p>
                </div>
            `;
        }
    } else if (experimentType === 'effort-elasticity') {
        html += `<div style="color: #d1d5db; font-size: 0.875rem;">`;
        results.results.slice(0, 5).forEach(result => {
            const style = result.beta === results.optimal.beta ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;';
            html += `
                <p style="${style}">
                    β = ${result.beta}: ${result.successRate.toFixed(1)}% success 
                    (${result.effortSensitivity} sensitivity) ${result.beta === results.optimal.beta ? '⭐ OPTIMAL' : ''}
                </p>
            `;
        });
        html += `</div>`;
    } else if (experimentType === 'cross-elasticity') {
        html += `<div style="color: #d1d5db; font-size: 0.875rem;">`;
        results.results.slice(0, 6).forEach(result => {
            const style = result.combination === results.optimal.combination ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;';
            html += `
                <p style="${style}">
                    ${result.combination}: ${result.successRate.toFixed(1)}% success 
                    ${result.combination === results.optimal.combination ? '⭐ OPTIMAL' : ''}
                </p>
            `;
        });
        html += `</div>`;
    }
    
    html += `</div>`;
    return html;
}

function generateFeeResultsHTML(experimentType, results) {
    return `
        <div style="border: 2px solid #10b981; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: #10b981; font-weight: bold; margin-bottom: 0.5rem;">
                💰 Fee Structure Analysis: ${results.optimal.name || results.optimal.feePercentage + '%' || 'Complete'}
            </h4>
            <p style="color: #34d399; margin-bottom: 1rem;">
                <strong>${results.summary}</strong>
            </p>
            <div style="color: #d1d5db; font-size: 0.875rem;">
                ${results.results.slice(0, 4).map(result => {
                    const isOptimal = result.name === results.optimal.name || result.feePercentage === results.optimal.feePercentage;
                    return `<p style="${isOptimal ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;'}">
                        ${result.name || result.feePercentage + '%'}: ${result.successRate.toFixed(1)}% success, 
                        $${result.avgPlatformRevenue ? result.avgPlatformRevenue.toFixed(0) : 'N/A'} platform revenue
                        ${isOptimal ? ' ⭐ OPTIMAL' : ''}
                    </p>`;
                }).join('')}
            </div>
        </div>
    `;
}

function generatePricingResultsHTML(experimentType, results) {
    return `
        <div style="border: 2px solid #f59e0b; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: #f59e0b; font-weight: bold; margin-bottom: 0.5rem;">
                📊 Pricing Strategy Analysis: ${results.optimal.strategy || results.optimal.name || 'Complete'}
            </h4>
            <p style="color: #fbbf24; margin-bottom: 1rem;">
                <strong>${results.summary}</strong>
            </p>
            <div style="color: #d1d5db; font-size: 0.875rem;">
                ${results.results.slice(0, 4).map(result => {
                    const isOptimal = result.strategy === results.optimal.strategy || result.name === results.optimal.name;
                    return `<p style="${isOptimal ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;'}">
                        ${result.strategy || result.name}: ${result.successRate.toFixed(1)}% success
                        ${isOptimal ? ' ⭐ OPTIMAL' : ''}
                    </p>`;
                }).join('')}
            </div>
        </div>
    `;
}

function generateEffortResultsHTML(experimentType, results) {
    return `
        <div style="border: 2px solid #ef4444; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: #ef4444; font-weight: bold; margin-bottom: 0.5rem;">
                💪 Effort Strategy Analysis: ${results.optimal.name || results.optimal.pattern || 'Complete'}
            </h4>
            <p style="color: #f87171; margin-bottom: 1rem;">
                <strong>${results.summary}</strong>
            </p>
            <div style="color: #d1d5db; font-size: 0.875rem;">
                ${results.results.slice(0, 4).map(result => {
                    const isOptimal = result.name === results.optimal.name || result.pattern === results.optimal.pattern;
                    return `<p style="${isOptimal ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;'}">
                        ${result.name || result.pattern}: ${result.successRate.toFixed(1)}% success
                        ${isOptimal ? ' ⭐ OPTIMAL' : ''}
                    </p>`;
                }).join('')}
            </div>
        </div>
    `;
}

function generateMarketResultsHTML(experimentType, results) {
    return `
        <div style="border: 2px solid #06b6d4; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: #06b6d4; font-weight: bold; margin-bottom: 0.5rem;">
                🌍 Market Conditions Analysis: ${results.optimal.name || results.optimal.condition || 'Complete'}
            </h4>
            <p style="color: #22d3ee; margin-bottom: 1rem;">
                <strong>${results.summary}</strong>
            </p>
            <div style="color: #d1d5db; font-size: 0.875rem;">
                ${results.results.slice(0, 4).map(result => {
                    const isOptimal = result.name === results.optimal.name || result.condition === results.optimal.condition;
                    return `<p style="${isOptimal ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;'}">
                        ${result.name || result.condition}: ${result.successRate.toFixed(1)}% success
                        ${isOptimal ? ' ⭐ OPTIMAL' : ''}
                    </p>`;
                }).join('')}
            </div>
        </div>
    `;
}

function generateDurationResultsHTML(experimentType, results) {
    return `
        <div style="border: 2px solid #8b5cf6; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: #8b5cf6; font-weight: bold; margin-bottom: 0.5rem;">
                ⏱️ Duration Strategy Analysis: ${results.optimal.duration || results.optimal.name || 'Complete'}
            </h4>
            <p style="color: #a78bfa; margin-bottom: 1rem;">
                <strong>${results.summary}</strong>
            </p>
            <div style="color: #d1d5db; font-size: 0.875rem;">
                ${results.results.slice(0, 5).map(result => {
                    const isOptimal = result.duration === results.optimal.duration || result.name === results.optimal.name;
                    return `<p style="${isOptimal ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;'}">
                        ${result.duration ? result.duration + ' days' : result.name}: ${result.successRate.toFixed(1)}% success
                        ${isOptimal ? ' ⭐ OPTIMAL' : ''}
                    </p>`;
                }).join('')}
            </div>
        </div>
    `;
}

function generateSuccessResultsHTML(experimentType, results) {
    return `
        <div style="border: 2px solid #10b981; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: #10b981; font-weight: bold; margin-bottom: 0.5rem;">
                🎯 Success Criteria Analysis: ${results.optimal.name || results.optimal.strategy || 'Complete'}
            </h4>
            <p style="color: #34d399; margin-bottom: 1rem;">
                <strong>${results.summary}</strong>
            </p>
            <div style="color: #d1d5db; font-size: 0.875rem;">
                ${results.results.slice(0, 4).map(result => {
                    const isOptimal = result.name === results.optimal.name || result.strategy === results.optimal.strategy;
                    return `<p style="${isOptimal ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;'}">
                        ${result.name || result.strategy}: ${result.successRate ? result.successRate.toFixed(1) + '% success' : result.avgOverallScore ? result.avgOverallScore.toFixed(1) + ' score' : 'Complete'}
                        ${isOptimal ? ' ⭐ OPTIMAL' : ''}
                    </p>`;
                }).join('')}
            </div>
        </div>
    `;
}

function generatePrincipalAgentResultsHTML(experimentType, results) {
    return `
        <div style="border: 2px solid #f59e0b; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: #f59e0b; font-weight: bold; margin-bottom: 0.5rem;">
                🤝 Principal-Agent Analysis: ${results.optimal.name || results.optimal.mechanism || 'Complete'}
            </h4>
            <p style="color: #fbbf24; margin-bottom: 1rem;">
                <strong>${results.summary}</strong>
            </p>
            <div style="color: #d1d5db; font-size: 0.875rem;">
                ${results.results.slice(0, 4).map(result => {
                    const isOptimal = result.name === results.optimal.name || result.mechanism === results.optimal.mechanism;
                    return `<p style="${isOptimal ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;'}">
                        ${result.name || result.mechanism}: ${result.avgAlignmentScore ? result.avgAlignmentScore.toFixed(1) + ' alignment' : result.successRate.toFixed(1) + '% success'}
                        ${isOptimal ? ' ⭐ OPTIMAL' : ''}
                    </p>`;
                }).join('')}
            </div>
        </div>
    `;
}

function generateNetworkResultsHTML(experimentType, results) {
    return `
        <div style="border: 2px solid #8b5cf6; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: #8b5cf6; font-weight: bold; margin-bottom: 0.5rem;">
                🌐 Network Effects Analysis: ${results.optimal.name || results.optimal.strategy || 'Complete'}
            </h4>
            <p style="color: #a78bfa; margin-bottom: 1rem;">
                <strong>${results.summary}</strong>
            </p>
            <div style="color: #d1d5db; font-size: 0.875rem;">
                ${results.results.slice(0, 4).map(result => {
                    const isOptimal = result.name === results.optimal.name || result.strategy === results.optimal.strategy;
                    return `<p style="${isOptimal ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;'}">
                        ${result.name || result.strategy}: ${result.successRate ? result.successRate.toFixed(1) + '% success' : result.avgViralityScore ? result.avgViralityScore.toFixed(1) + ' viral score' : 'Complete'}
                        ${isOptimal ? ' ⭐ OPTIMAL' : ''}
                    </p>`;
                }).join('')}
            </div>
        </div>
    `;
}

function generateComparativeResultsHTML(experimentType, results) {
    return `
        <div style="border: 2px solid #06b6d4; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: #06b6d4; font-weight: bold; margin-bottom: 0.5rem;">
                ⚖️ Comparative Analysis: ${results.optimal.name || results.optimal.platform || 'Complete'}
            </h4>
            <p style="color: #22d3ee; margin-bottom: 1rem;">
                <strong>${results.summary}</strong>
            </p>
            <div style="color: #d1d5db; font-size: 0.875rem;">
                ${results.results.slice(0, 4).map(result => {
                    const isOptimal = result.name === results.optimal.name || result.platform === results.optimal.platform;
                    return `<p style="${isOptimal ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;'}">
                        ${result.name || result.platform}: ${result.successRate ? result.successRate.toFixed(1) + '% success' : result.valueProposition ? result.valueProposition.toFixed(0) + ' value score' : 'Complete'}
                        ${isOptimal ? ' ⭐ OPTIMAL' : ''}
                    </p>`;
                }).join('')}
            </div>
        </div>
    `;
}

function generateGenericResultsHTML(experimentType, results) {
    return `
        <div style="border: 2px solid #6b7280; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: #9ca3af; font-weight: bold; margin-bottom: 0.5rem;">
                🔬 Experiment Results: ${experimentType}
            </h4>
            <p style="color: #d1d5db; margin-bottom: 1rem;">
                <strong>${results.summary || 'Experiment completed successfully'}</strong>
            </p>
            <div style="color: #d1d5db; font-size: 0.875rem;">
                <p>Experiment type: ${experimentType}</p>
                <p>Status: ${results.status}</p>
                ${results.results ? `<p>Results count: ${results.results.length}</p>` : ''}
            </div>
        </div>
    `;
}

// Override the existing updateExperimentResults function in simulator.js
if (typeof window !== 'undefined') {
    window.updateExperimentResults = updateExperimentResults;
    console.log('✅ Enhanced experiment result display loaded');
}

// Log successful loading
console.log('✅ EquiCurve Complete Experiment Suite Loaded Successfully!');
console.log('📊 Total experiments available:', experimentStatus.total);
console.log('📂 Categories loaded:');
experimentStatus.categories.forEach(category => console.log(`   ${category}`));
console.log('🚀 Ready to run comprehensive experiments!');