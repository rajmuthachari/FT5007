/**
 * EquiCurve - Enhanced Chart Updates for Experiments
 * Updates charts to show experiment-specific visualizations
 * COMPLETE FILE with no-graph message fixes
 */

// Enhanced experiment result handler with chart updates
function updateExperimentResultsWithCharts(experimentType, results) {
    
    console.log('📊 ENHANCED CHARTS: Updating for experiment type:', experimentType);
    console.log('📊 ENHANCED CHARTS: Will show specialized visualization');
    
    // Update the results summary panel (direct call to avoid circular dependency)
    updateExperimentResultsDisplay(experimentType, results);
    
    // Remove any existing no-graph messages first
    removeNoGraphMessage('demandChart');
    removeNoGraphMessage('revenueChart');
    removeNoGraphMessage('logLogChart');
    
    // Update charts based on experiment type
    switch(experimentType) {
        case 'duration-optimization':
            console.log('📈 CHARTS: Duration optimization charts');
            updateDurationOptimizationCharts(results);
            break;
            
        case 'price-elasticity':
            console.log('📈 CHARTS: Price elasticity charts');
            updateElasticityCharts(results, 'gamma', 'Price Elasticity (γ)');
            break;
            
        case 'effort-elasticity':
            console.log('📈 CHARTS: Effort elasticity charts');
            updateElasticityCharts(results, 'beta', 'Effort Elasticity (β)');
            break;
            
        case 'cross-elasticity':
            console.log('📈 CHARTS: Cross elasticity charts');
            updateElasticityCharts(results, 'combination', 'Parameter Combinations');
            break;
            
        case 'fixed-fees':
        case 'dynamic-fees':
        case 'hybrid-fees':
            console.log('📈 CHARTS: Fee comparison charts');
            updateFeeComparisonCharts(results);
            break;
            
        case 'static-pricing':
        case 'dynamic-pricing-exp':
        case 'bonding-curves':
            console.log('📈 CHARTS: Pricing strategy charts');
            updatePricingStrategyCharts(results);
            break;
            
        case 'market-cycles':
        case 'external-shocks':
            console.log('📈 CHARTS: Market condition charts');
            updateMarketConditionCharts(results);
            break;
            
        case 'competition':
            console.log('📈 CHARTS: Competition analysis charts');
            updateCompetitionCharts(results);
            break;
            
        case 'viral-mechanics':
        case 'community-building':
            console.log('📈 CHARTS: Network effects charts');
            updateNetworkEffectsCharts(results);
            break;
        
        case 'multi-round':
            console.log('📈 CHARTS: Multi-round strategy charts');
            updateGenericExperimentCharts(results);
            break;
            
        case 'traditional-vs-web3':
        case 'platform-comparison':
            console.log('📈 CHARTS: Platform comparison charts');
            updatePlatformComparisonCharts(results);
            break;
            
        default:
            console.log('📈 CHARTS: Generic experiment charts for:', experimentType);
            updateGenericExperimentCharts(results);
            break;
    }
}

// Direct results display function (no circular dependency)
function updateExperimentResultsDisplay(experimentType, results) {
    console.log('📊 Displaying experiment results:', results);
    
    const summaryDiv = document.getElementById('resultsSummary');
    
    if (results.experimentType === 'duration-optimization') {
        let html = `
            <div style="border: 2px solid #10b981; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <h4 style="color: #10b981; font-weight: bold; margin-bottom: 0.5rem;">
                    ✅ Duration Optimization Results
                </h4>
                <p style="color: #34d399; margin-bottom: 1rem;">
                    <strong>${results.summary}</strong>
                </p>
                <div style="color: #d1d5db; font-size: 0.875rem;">
        `;
        
        results.results.forEach(result => {
            const isOptimal = result.duration === results.optimal.duration;
            const style = isOptimal ? 'color: #fbbf24; font-weight: bold;' : 'color: #9ca3af;';
            
            html += `
                <p style="${style}">
                    ${result.duration} days: ${result.successRate.toFixed(1)}% success rate 
                    (avg: $${result.avgRaised.toLocaleString(undefined, {maximumFractionDigits: 0})})
                    ${isOptimal ? '⭐ OPTIMAL' : ''}
                </p>
            `;
        });
        
        html += `</div></div>`;
        summaryDiv.innerHTML = html;
        return;
    }
    
    // Generic experiment results display
    let html = `
        <div style="border: 2px solid #8b5cf6; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: #8b5cf6; font-weight: bold; margin-bottom: 0.5rem;">
                🔬 ${experimentType} Results
            </h4>
            <p style="color: #a78bfa; margin-bottom: 1rem;">
                <strong>${results.summary}</strong>
            </p>
        </div>
    `;
    summaryDiv.innerHTML = html;
}

// Duration Optimization Chart Updates
function updateDurationOptimizationCharts(results) {
    const durations = results.results.map(r => r.duration + ' days');
    const successRates = results.results.map(r => r.successRate);
    const avgRaised = results.results.map(r => r.avgRaised);
    
    // Update first chart: Duration vs Success Rate
    demandChart.data.labels = durations;
    demandChart.data.datasets[0].label = 'Success Rate (%)';
    demandChart.data.datasets[0].data = successRates;
    demandChart.data.datasets[0].borderColor = '#10b981';
    demandChart.data.datasets[0].backgroundColor = 'rgba(16, 185, 129, 0.1)';
    
    demandChart.data.datasets[1].label = 'Avg Raised ($1000s)';
    demandChart.data.datasets[1].data = avgRaised.map(val => val / 1000);
    demandChart.data.datasets[1].borderColor = '#f59e0b';
    demandChart.data.datasets[1].backgroundColor = 'rgba(245, 158, 11, 0.1)';
    
    demandChart.options.scales.x.title.text = 'Campaign Duration';
    demandChart.options.scales.y1.title.text = 'Success Rate (%)';
    demandChart.options.scales.y2.title.text = 'Avg Raised ($1000s)';
    demandChart.update('none');
    
    // Update second chart: Duration vs Average Raised
    revenueChart.data.labels = durations;
    revenueChart.data.datasets[0].label = 'Average Raised';
    revenueChart.data.datasets[0].data = avgRaised;
    revenueChart.data.datasets[0].borderColor = '#8b5cf6';
    revenueChart.data.datasets[0].backgroundColor = 'rgba(139, 92, 246, 0.1)';
    
    revenueChart.data.datasets[1].label = 'Optimal Line';
    revenueChart.data.datasets[1].data = avgRaised.map(() => results.optimal.avgRaised);
    revenueChart.data.datasets[1].borderColor = '#ef4444';
    revenueChart.data.datasets[1].borderDash = [5, 5];
    
    revenueChart.options.scales.x.title.text = 'Campaign Duration';
    revenueChart.options.scales.y.title.text = 'Average Raised ($)';
    revenueChart.update('none');
    
    // Update third chart: Success Rate Distribution
    logLogChart.data.datasets[0].label = 'Duration vs Success Rate';
    logLogChart.data.datasets[0].data = results.results.map(r => ({
        x: r.duration,
        y: r.successRate
    }));
    logLogChart.data.datasets[0].backgroundColor = '#10b981';
    logLogChart.data.datasets[0].borderColor = '#10b981';
    
    logLogChart.options.scales.x.title.text = 'Duration (days)';
    logLogChart.options.scales.y.title.text = 'Success Rate (%)';
    logLogChart.update('none');
}

// Elasticity Analysis Chart Updates
function updateElasticityCharts(results, paramName, paramTitle) {
    const paramValues = results.results.map(r => r[paramName]);
    const successRates = results.results.map(r => r.successRate);
    const avgRaised = results.results.map(r => r.avgRaised);
    
    // Chart 1: Parameter vs Success Rate
    demandChart.data.labels = paramValues.map(val => paramName + ' = ' + val);
    demandChart.data.datasets[0].label = 'Success Rate (%)';
    demandChart.data.datasets[0].data = successRates;
    demandChart.data.datasets[0].borderColor = '#8b5cf6';
    
    demandChart.data.datasets[1].label = 'Avg Raised ($1000s)';
    demandChart.data.datasets[1].data = avgRaised.map(val => val / 1000);
    demandChart.data.datasets[1].borderColor = '#f59e0b';
    
    demandChart.options.scales.x.title.text = paramTitle;
    demandChart.options.scales.y1.title.text = 'Success Rate (%)';
    demandChart.options.scales.y2.title.text = 'Avg Raised ($1000s)';
    demandChart.update('none');
    
    // Chart 2: Cumulative Performance
    revenueChart.data.labels = paramValues.map(val => paramName + ' = ' + val);
    revenueChart.data.datasets[0].label = 'Average Raised';
    revenueChart.data.datasets[0].data = avgRaised;
    revenueChart.data.datasets[0].borderColor = '#10b981';
    
    revenueChart.data.datasets[1].label = 'Optimal Level';
    revenueChart.data.datasets[1].data = avgRaised.map(() => results.optimal.avgRaised);
    revenueChart.data.datasets[1].borderColor = '#ef4444';
    revenueChart.data.datasets[1].borderDash = [5, 5];
    
    revenueChart.update('none');
    
    // Chart 3: Parameter Response Curve
    logLogChart.data.datasets[0].label = paramTitle + ' Response';
    logLogChart.data.datasets[0].data = results.results.map(r => ({
        x: r[paramName],
        y: r.successRate
    }));
    logLogChart.data.datasets[0].backgroundColor = '#8b5cf6';
    
    logLogChart.options.scales.x.title.text = paramTitle;
    logLogChart.options.scales.y.title.text = 'Success Rate (%)';
    logLogChart.update('none');
}

// Fee Comparison Chart Updates
function updateFeeComparisonCharts(results) {
    const feeLabels = results.results.map(r => r.name || r.feePercentage + '%');
    const successRates = results.results.map(r => r.successRate);
    const platformRevenue = results.results.map(r => r.avgPlatformRevenue || 0);
    const entrepreneurRevenue = results.results.map(r => r.avgEntrepreneurRevenue || r.avgTotalRaised - r.avgPlatformRevenue || 0);
    
    // Chart 1: Fee Structure vs Success Rate
    demandChart.data.labels = feeLabels;
    demandChart.data.datasets[0].label = 'Success Rate (%)';
    demandChart.data.datasets[0].data = successRates;
    demandChart.data.datasets[0].borderColor = '#10b981';
    
    demandChart.data.datasets[1].label = 'Platform Revenue ($)';
    demandChart.data.datasets[1].data = platformRevenue;
    demandChart.data.datasets[1].borderColor = '#f59e0b';
    
    demandChart.options.scales.x.title.text = 'Fee Structure';
    demandChart.options.scales.y1.title.text = 'Success Rate (%)';
    demandChart.options.scales.y2.title.text = 'Platform Revenue ($)';
    demandChart.update('none');
    
    // Chart 2: Revenue Split Comparison
    revenueChart.data.labels = feeLabels;
    revenueChart.data.datasets[0].label = 'Platform Revenue';
    revenueChart.data.datasets[0].data = platformRevenue;
    revenueChart.data.datasets[0].borderColor = '#8b5cf6';
    revenueChart.data.datasets[0].backgroundColor = 'rgba(139, 92, 246, 0.3)';
    revenueChart.data.datasets[0].fill = true;
    
    revenueChart.data.datasets[1].label = 'Entrepreneur Revenue';
    revenueChart.data.datasets[1].data = entrepreneurRevenue;
    revenueChart.data.datasets[1].borderColor = '#10b981';
    revenueChart.data.datasets[1].backgroundColor = 'rgba(16, 185, 129, 0.3)';
    revenueChart.data.datasets[1].fill = true;
    
    revenueChart.update('none');
    
    // Chart 3: Fee vs Success Relationship
    logLogChart.data.datasets[0].label = 'Fee vs Success Rate';
    logLogChart.data.datasets[0].data = results.results.map(r => ({
        x: (r.feeRate || r.nominalRate || 0.05) * 100, // Convert to percentage
        y: r.successRate
    }));
    
    logLogChart.options.scales.x.title.text = 'Fee Rate (%)';
    logLogChart.options.scales.y.title.text = 'Success Rate (%)';
    logLogChart.update('none');
}

// Market Conditions Chart Updates
function updateMarketConditionCharts(results) {
    const conditions = results.results.map(r => r.name || r.condition);
    const successRates = results.results.map(r => r.successRate);
    const volatility = results.results.map(r => r.avgVolatility || 0);
    
    // Chart 1: Market Conditions vs Performance
    demandChart.data.labels = conditions;
    demandChart.data.datasets[0].label = 'Success Rate (%)';
    demandChart.data.datasets[0].data = successRates;
    demandChart.data.datasets[0].borderColor = '#06b6d4';
    
    demandChart.data.datasets[1].label = 'Volatility';
    demandChart.data.datasets[1].data = volatility;
    demandChart.data.datasets[1].borderColor = '#ef4444';
    
    demandChart.options.scales.x.title.text = 'Market Condition';
    demandChart.options.scales.y1.title.text = 'Success Rate (%)';
    demandChart.options.scales.y2.title.text = 'Volatility';
    demandChart.update('none');
    
    // Update other charts similarly...
    revenueChart.data.labels = conditions;
    revenueChart.data.datasets[0].label = 'Avg Total Raised';
    revenueChart.data.datasets[0].data = results.results.map(r => r.avgTotalRaised || 0);
    revenueChart.update('none');
    
    // Scatter plot for market analysis
    logLogChart.data.datasets[0].label = 'Market Performance';
    logLogChart.data.datasets[0].data = results.results.map((r, i) => ({
        x: i + 1, // Market condition index
        y: r.successRate
    }));
    logLogChart.options.scales.x.title.text = 'Market Condition Index';
    logLogChart.options.scales.y.title.text = 'Success Rate (%)';
    logLogChart.update('none');
}

// Network Effects Charts
function updateNetworkEffectsCharts(results) {
    const labels = results.results.map(r => r.name || r.strategy);
    const viralScores = results.results.map(r => r.avgViralityScore || 0);
    const userBase = results.results.map(r => r.avgUserBase || 0);
    const networkValue = results.results.map(r => r.avgNetworkValue || r.avgLongTermValue || 0);
    
    // Chart 1: Viral Metrics
    demandChart.data.labels = labels;
    demandChart.data.datasets[0].label = 'Virality Score';
    demandChart.data.datasets[0].data = viralScores;
    demandChart.data.datasets[0].borderColor = '#8b5cf6';
    
    demandChart.data.datasets[1].label = 'User Base';
    demandChart.data.datasets[1].data = userBase;
    demandChart.data.datasets[1].borderColor = '#10b981';
    
    demandChart.update('none');
    
    // Chart 2: Network Value Growth
    revenueChart.data.labels = labels;
    revenueChart.data.datasets[0].label = 'Network Value';
    revenueChart.data.datasets[0].data = networkValue;
    revenueChart.data.datasets[0].borderColor = '#f59e0b';
    revenueChart.update('none');
    
    // Chart 3: Network Effects Relationship
    logLogChart.data.datasets[0].label = 'User Base vs Network Value';
    logLogChart.data.datasets[0].data = results.results.map(r => ({
        x: r.avgUserBase || 0,
        y: r.avgNetworkValue || r.avgLongTermValue || 0
    }));
    logLogChart.options.scales.x.title.text = 'User Base';
    logLogChart.options.scales.y.title.text = 'Network Value';
    logLogChart.update('none');
}

// Platform Comparison Charts
function updatePlatformComparisonCharts(results) {
    const platforms = results.results.map(r => r.name || r.platform);
    const successRates = results.results.map(r => r.successRate);
    const netRevenue = results.results.map(r => r.netRevenue || r.avgTotalRaised || 0);
    const userSatisfaction = results.results.map(r => r.avgUserSatisfaction || r.avgUserExperience || 0);
    
    // Chart 1: Platform Performance
    demandChart.data.labels = platforms;
    demandChart.data.datasets[0].label = 'Success Rate (%)';
    demandChart.data.datasets[0].data = successRates;
    demandChart.data.datasets[0].borderColor = '#06b6d4';
    
    demandChart.data.datasets[1].label = 'User Satisfaction';
    demandChart.data.datasets[1].data = userSatisfaction;
    demandChart.data.datasets[1].borderColor = '#10b981';
    
    demandChart.update('none');
    
    // Chart 2: Revenue Comparison
    revenueChart.data.labels = platforms;
    revenueChart.data.datasets[0].label = 'Net Revenue';
    revenueChart.data.datasets[0].data = netRevenue;
    revenueChart.data.datasets[0].borderColor = '#f59e0b';
    revenueChart.update('none');
    
    // Chart 3: Platform Value Matrix
    logLogChart.data.datasets[0].label = 'Success vs Satisfaction';
    logLogChart.data.datasets[0].data = results.results.map(r => ({
        x: r.successRate,
        y: r.avgUserSatisfaction || r.avgUserExperience || 0
    }));
    logLogChart.options.scales.x.title.text = 'Success Rate (%)';
    logLogChart.options.scales.y.title.text = 'User Satisfaction';
    logLogChart.update('none');
}

// Pricing Strategy Charts (for 3.1, 3.2, 3.3)
function updatePricingStrategyCharts(results) {
    console.log('📈 CHARTS: Pricing strategy charts');
    
    const labels = results.results.map(r => r.strategy || r.name || 'Strategy');
    const successRates = results.results.map(r => r.successRate || 0);
    const avgRaised = results.results.map(r => r.avgTotalRaised || 0);
    
    // Chart 1: Strategy vs Success Rate
    demandChart.data.labels = labels;
    demandChart.data.datasets[0].label = 'Success Rate (%)';
    demandChart.data.datasets[0].data = successRates;
    demandChart.data.datasets[0].borderColor = '#f59e0b';
    
    demandChart.data.datasets[1].label = 'Avg Raised ($1000s)';
    demandChart.data.datasets[1].data = avgRaised.map(val => val / 1000);
    demandChart.data.datasets[1].borderColor = '#10b981';
    
    demandChart.options.scales.x.title.text = 'Pricing Strategy';
    demandChart.options.scales.y1.title.text = 'Success Rate (%)';
    demandChart.options.scales.y2.title.text = 'Avg Raised ($1000s)';
    demandChart.update('none');
    
    // Chart 2: Revenue Comparison
    revenueChart.data.labels = labels;
    revenueChart.data.datasets[0].label = 'Average Raised';
    revenueChart.data.datasets[0].data = avgRaised;
    revenueChart.data.datasets[0].borderColor = '#8b5cf6';
    
    revenueChart.data.datasets[1].label = 'Best Strategy';
    revenueChart.data.datasets[1].data = avgRaised.map(() => results.optimal.avgTotalRaised || Math.max(...avgRaised));
    revenueChart.data.datasets[1].borderColor = '#ef4444';
    revenueChart.data.datasets[1].borderDash = [5, 5];
    
    revenueChart.update('none');
    
    // Chart 3: Strategy Performance Matrix
    logLogChart.data.datasets[0].label = 'Strategy Performance';
    logLogChart.data.datasets[0].data = results.results.map((r, i) => ({
        x: i + 1,
        y: r.successRate || 0
    }));
    logLogChart.data.datasets[0].backgroundColor = '#f59e0b';
    
    logLogChart.options.scales.x.title.text = 'Strategy Index';
    logLogChart.options.scales.y.title.text = 'Success Rate (%)';
    logLogChart.update('none');
}

// Competition Charts (for 5.2)
function updateCompetitionCharts(results) {
    console.log('📈 CHARTS: Competition analysis charts');
    
    const competitorCounts = results.results.map(r => r.competitorCount + ' competitors');
    const successRates = results.results.map(r => r.successRate || 0);
    const marketShares = results.results.map(r => r.avgMarketShare || 0);
    
    // Chart 1: Competitor Count vs Success Rate
    demandChart.data.labels = competitorCounts;
    demandChart.data.datasets[0].label = 'Success Rate (%)';
    demandChart.data.datasets[0].data = successRates;
    demandChart.data.datasets[0].borderColor = '#06b6d4';
    
    demandChart.data.datasets[1].label = 'Market Share (%)';
    demandChart.data.datasets[1].data = marketShares;
    demandChart.data.datasets[1].borderColor = '#f59e0b';
    
    demandChart.options.scales.x.title.text = 'Competition Level';
    demandChart.options.scales.y1.title.text = 'Success Rate (%)';
    demandChart.options.scales.y2.title.text = 'Market Share (%)';
    demandChart.update('none');
    
    // Chart 2: Competition Impact
    revenueChart.data.labels = competitorCounts;
    revenueChart.data.datasets[0].label = 'Avg Total Raised';
    revenueChart.data.datasets[0].data = results.results.map(r => r.avgTotalRaised || 0);
    revenueChart.data.datasets[0].borderColor = '#10b981';
    
    revenueChart.data.datasets[1].label = 'No Competition Baseline';
    revenueChart.data.datasets[1].data = results.results.map(() => results.results[0].avgTotalRaised || 0);
    revenueChart.data.datasets[1].borderColor = '#ef4444';
    revenueChart.data.datasets[1].borderDash = [5, 5];
    
    revenueChart.update('none');
    
    // Chart 3: Competition vs Performance
    logLogChart.data.datasets[0].label = 'Competition Impact';
    logLogChart.data.datasets[0].data = results.results.map(r => ({
        x: r.competitorCount || 0,
        y: r.successRate || 0
    }));
    logLogChart.data.datasets[0].backgroundColor = '#06b6d4';
    
    logLogChart.options.scales.x.title.text = 'Number of Competitors';
    logLogChart.options.scales.y.title.text = 'Success Rate (%)';
    logLogChart.update('none');
}

// NEW FUNCTIONS FOR NO-GRAPH HANDLING

// Helper function to get appropriate Chart 1 label based on experiment type
function getChart1Label(experimentType) {
    const labelMap = {
        'effort-patterns': 'Success Rate (%)',
        'effort-allocation': 'Success Rate (%)',
        'platform-effort': 'Success Rate (%)',
        'funding-thresholds': 'Success Rate (%)',
        'success-metrics': 'Overall Score',
        'information-asymmetry': 'Alignment Score',
        'incentive-mechanisms': 'Alignment Score',
        'governance-models': 'Alignment Score',
        'multi-round': 'Success Rate (%)'
    };
    return labelMap[experimentType] || 'Performance Score';
}

// Helper function to get appropriate X-axis label
function getXAxisLabel(experimentType) {
    const labelMap = {
        'effort-patterns': 'Effort Pattern',
        'effort-allocation': 'Allocation Strategy',
        'platform-effort': 'Effort Distribution',
        'funding-thresholds': 'Threshold Configuration',
        'success-metrics': 'Success Strategy',
        'information-asymmetry': 'Information Level',
        'incentive-mechanisms': 'Incentive Mechanism',
        'governance-models': 'Governance Model',
        'multi-round': 'Round Strategy'
    };
    return labelMap[experimentType] || 'Options';
}

// Helper function to get appropriate Y1-axis label
function getY1AxisLabel(experimentType) {
    const labelMap = {
        'effort-patterns': 'Success Rate (%)',
        'effort-allocation': 'Success Rate (%)',
        'platform-effort': 'Success Rate (%)',
        'funding-thresholds': 'Success Rate (%)',
        'success-metrics': 'Overall Score',
        'information-asymmetry': 'Alignment Score',
        'incentive-mechanisms': 'Alignment Score',
        'governance-models': 'Alignment Score',
        'multi-round': 'Success Rate (%)'
    };
    return labelMap[experimentType] || 'Performance Score';
}

// Function to get chart object by name
function getChartByName(chartId) {
    switch(chartId) {
        case 'demandChart': return typeof demandChart !== 'undefined' ? demandChart : null;
        case 'revenueChart': return typeof revenueChart !== 'undefined' ? revenueChart : null;
        case 'logLogChart': return typeof logLogChart !== 'undefined' ? logLogChart : null;
        default: return null;
    }
}

// Function to clear chart data and show "No graph to display" message
function clearChartAndShowMessage(chartId) {
    const chart = getChartByName(chartId);
    
    if (!chart) {
        console.warn(`Chart ${chartId} not found`);
        return;
    }
    
    // Clear all chart data
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    if (chart.data.datasets[1]) {
        chart.data.datasets[1].data = [];
    }
    
    // Clear axis titles
    chart.options.scales.x.title.text = '';
    chart.options.scales.y.title.text = '';
    if (chart.options.scales.y1) chart.options.scales.y1.title.text = '';
    if (chart.options.scales.y2) chart.options.scales.y2.title.text = '';
    
    chart.update('none');
    
    // Add DOM overlay message
    addNoGraphMessage(chartId);
}

// Function to add "No graph to display" DOM overlay
function addNoGraphMessage(chartId) {
    // Remove any existing message first
    removeNoGraphMessage(chartId);
    
    // Find the chart container
    const chartContainer = document.querySelector(`#${chartId}`).parentElement;
    
    if (!chartContainer) {
        console.warn(`Chart container for ${chartId} not found`);
        return;
    }
    
    // Create overlay message
    const overlay = document.createElement('div');
    overlay.className = 'no-graph-message';
    overlay.setAttribute('data-chart', chartId);
    overlay.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #9ca3af;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        pointer-events: none;
        z-index: 10;
        background: rgba(249, 250, 251, 0.9);
        padding: 20px;
        border-radius: 8px;
        border: 2px dashed #d1d5db;
    `;
    overlay.textContent = 'No graph to display';
    
    // Make sure container is positioned relatively
    chartContainer.style.position = 'relative';
    
    // Add the overlay
    chartContainer.appendChild(overlay);
}

// Function to remove "No graph to display" message
function removeNoGraphMessage(chartId) {
    const existingMessage = document.querySelector(`.no-graph-message[data-chart="${chartId}"]`);
    if (existingMessage) {
        existingMessage.remove();
    }
}

// Function to show "No graph" messages for all charts
function showAllNoGraphMessages() {
    clearChartAndShowMessage('demandChart');
    clearChartAndShowMessage('revenueChart');
    clearChartAndShowMessage('logLogChart');
}

// Enhanced generic experiment chart updates with DOM overlay messages
function updateGenericExperimentCharts(results) {
    if (!results.results || results.results.length === 0) {
        console.log('No chart data available for this experiment');
        showAllNoGraphMessages();
        return;
    }
    
    const labels = results.results.map((r, i) => r.name || r.strategy || r.pattern || r.mechanism || `Option ${i + 1}`);
    const successRates = results.results.map(r => r.successRate || r.avgOverallScore || r.avgAlignmentScore || 0);
    
    // Chart 1: Show available data
    demandChart.data.labels = labels;
    demandChart.data.datasets[0].label = getChart1Label(results.experimentType);
    demandChart.data.datasets[0].data = successRates;
    demandChart.data.datasets[0].borderColor = '#8b5cf6';
    demandChart.data.datasets[0].backgroundColor = 'rgba(139, 92, 246, 0.1)';
    
    // Clear second dataset for Chart 1
    demandChart.data.datasets[1].label = '';
    demandChart.data.datasets[1].data = [];
    
    demandChart.options.scales.x.title.text = getXAxisLabel(results.experimentType);
    demandChart.options.scales.y1.title.text = getY1AxisLabel(results.experimentType);
    demandChart.options.scales.y2.title.text = '';
    demandChart.update('none');
    
    // Remove any existing no-graph message from Chart 1
    removeNoGraphMessage('demandChart');
    
    // Charts 2 and 3: Clear data and show "No graph to display" message
    clearChartAndShowMessage('revenueChart');
    clearChartAndShowMessage('logLogChart');
}

// Make enhanced chart function available globally
if (typeof window !== 'undefined') {
    window.updateExperimentResultsWithCharts = updateExperimentResultsWithCharts;
    window.updateGenericExperimentCharts = updateGenericExperimentCharts;
    window.clearChartAndShowMessage = clearChartAndShowMessage;
    window.showAllNoGraphMessages = showAllNoGraphMessages;
    window.removeNoGraphMessage = removeNoGraphMessage;
    window.addNoGraphMessage = addNoGraphMessage;
    window.getChart1Label = getChart1Label;
    window.getXAxisLabel = getXAxisLabel;
    window.getY1AxisLabel = getY1AxisLabel;
    console.log('✅ Enhanced experiment charts with complete no-graph handling loaded');
}