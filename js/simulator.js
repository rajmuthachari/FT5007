/**
 * EquiCurve - Simulator Interface Logic
 * Handles UI interactions, chart updates, and simulation controls
 */

// Global variables
let demandChart, revenueChart, logLogChart;
let currentModel, currentResults;

// Chart configuration
const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
        legend: {
            labels: {
                color: 'white'
            }
        }
    },
    scales: {
        x: {
            ticks: { color: 'white' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
            ticks: { color: 'white' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    updateParameters();
    setupEventListeners();
});

/**
 * Initialize all charts
 */
function initializeCharts() {
    initializeDemandChart();
    initializeRevenueChart();
    initializeLogLogChart();
}

/**
 * Initialize Price & Demand Chart
 */
function initializeDemandChart() {
    const ctx = document.getElementById('demandChart').getContext('2d');
    demandChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Token Price ($)',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                yAxisID: 'y1',
                tension: 0.4
            }, {
                label: 'Daily Demand',
                data: [],
                borderColor: '#f687b3',
                backgroundColor: 'rgba(246, 135, 179, 0.1)',
                yAxisID: 'y2',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Day', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Price ($)', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y2: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Demand', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

/**
 * Initialize Revenue Chart
 */
function initializeRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Cumulative Revenue ($)',
                data: [],
                borderColor: '#48bb78',
                backgroundColor: 'rgba(72, 187, 120, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Target',
                data: [],
                borderColor: '#ed8936',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                x: {
                    title: { display: true, text: 'Day', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    title: { display: true, text: 'Revenue ($)', color: 'white' },
                    ticks: { 
                        color: 'white',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

/**
 * Initialize Log-Log Chart
 */
function initializeLogLogChart() {
    const ctx = document.getElementById('logLogChart').getContext('2d');
    logLogChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Log(Demand) vs Log(Price)',
                data: [],
                backgroundColor: '#e53e3e',
                borderColor: '#e53e3e',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                x: {
                    title: { display: true, text: 'Log(Price)', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    title: { display: true, text: 'Log(Demand)', color: 'white' },
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

/**
 * Setup event listeners for sliders and controls
 */
function setupEventListeners() {
    // Parameter sliders
    document.getElementById('durationSlider').addEventListener('input', updateParameters);
    document.getElementById('alphaSlider').addEventListener('input', updateParameters);
    document.getElementById('betaSlider').addEventListener('input', updateParameters);
    document.getElementById('gammaSlider').addEventListener('input', updateParameters);
    document.getElementById('targetSlider').addEventListener('input', updateParameters);
    document.getElementById('priceSlider').addEventListener('input', updateParameters);
    document.getElementById('strategySelect').addEventListener('change', updateParameters);
    
    // Buttons
    document.getElementById('runSimBtn').addEventListener('click', runSimulation);
    document.getElementById('resetBtn').addEventListener('click', resetSimulation);
    document.getElementById('exportBtn').addEventListener('click', exportResults);
}

/**
 * Update parameter displays
 */
function updateParameters() {
    const alpha = document.getElementById('alphaSlider').value;
    const beta = document.getElementById('betaSlider').value;
    const gamma = document.getElementById('gammaSlider').value;
    const target = document.getElementById('targetSlider').value;
    const price = document.getElementById('priceSlider').value;
    const duration = document.getElementById('durationSlider').value;
    document.getElementById('durationValue').textContent = parseInt(duration);
    
    // Update display values
    document.getElementById('alphaValue').textContent = parseInt(alpha).toLocaleString();
    document.getElementById('betaValue').textContent = parseFloat(beta).toFixed(2);
    document.getElementById('gammaValue').textContent = parseFloat(gamma).toFixed(2);
    document.getElementById('targetValue').textContent = parseInt(target).toLocaleString();
    document.getElementById('priceValue').textContent = parseFloat(price).toFixed(2);
    
    // Update equation display
    document.getElementById('alphaDisplay').textContent = parseInt(alpha).toLocaleString();
    document.getElementById('betaDisplay').textContent = parseFloat(beta).toFixed(2);
    document.getElementById('gammaDisplay').textContent = parseFloat(gamma).toFixed(2);
}

/**
 * Run simulation or experiment
 */
function runSimulation() {
    const button = document.getElementById('runSimBtn');
    button.classList.add('loading');
    button.disabled = true;
    
    // Small delay to show loading state
    setTimeout(() => {
        try {
            const experimentType = document.getElementById('experimentSelect').value;
            
            if (experimentType === 'basic') {
                runBasicSimulation();
            } else {
                runExperiment(experimentType);
            }
            
        } catch (error) {
            console.error('Simulation error:', error);
            alert('An error occurred during simulation. Please check the console for details.');
        } finally {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }, 100);
}

/**
 * Run basic simulation (original functionality)
 */
function runBasicSimulation() {
    // Get parameters
    const duration = parseFloat(document.getElementById('durationSlider').value);
    const alpha = parseFloat(document.getElementById('alphaSlider').value);
    const beta = parseFloat(document.getElementById('betaSlider').value);
    const gamma = parseFloat(document.getElementById('gammaSlider').value);
    const target = parseFloat(document.getElementById('targetSlider').value);
    const initialPrice = parseFloat(document.getElementById('priceSlider').value);
    const strategyType = document.getElementById('strategySelect').value;
    
    // Create model
    currentModel = new CrowdfundingModel({
    alpha: alpha,
    beta: beta,
    gamma: gamma,
    duration: duration,  // Now dynamic instead of hardcoded 30
    target: target,
    initialPrice: initialPrice
    });
    
    // Create strategy
    let strategy;
    switch(strategyType) {
        case 'bonding':
            strategy = new BondingCurveStrategy(initialPrice);
            break;
        case 'dynamic':
            strategy = new DynamicPricingStrategy(initialPrice, 150, duration);
            break;
        default:
            strategy = new FixedPricingStrategy(initialPrice);

    }
    
    // Run simulation
    currentResults = currentModel.simulateCampaign(strategy);
    
    // Update charts
    updateCharts(currentResults.history);
    
    // Update results summary
    updateResultsSummary(currentResults);
}


/**
 * Run experiment (placeholder for future implementation)
 */
async function runExperiment(experimentType) {
    console.log('🔍 DEBUG: Starting runExperiment');
    console.log('🔍 DEBUG: Framework loaded?', typeof experimentFramework);
    console.log('🔍 DEBUG: Selected experiment:', experimentType);
    
    try {
        // Check if experiment framework is loaded
        if (typeof experimentFramework === 'undefined') {
            console.warn('❌ Experiment framework not loaded. Running basic simulation instead.');
            runBasicSimulation();
            return;
        }
        
        console.log('✅ Framework loaded successfully');
        
        // Get current parameters
        const parameters = {
            alpha: parseFloat(document.getElementById('alphaSlider').value),
            beta: parseFloat(document.getElementById('betaSlider').value),
            gamma: parseFloat(document.getElementById('gammaSlider').value),
            target: parseFloat(document.getElementById('targetSlider').value),
            initialPrice: parseFloat(document.getElementById('priceSlider').value),
            strategy: document.getElementById('strategySelect').value
        };
        
        console.log('🔍 DEBUG: Parameters:', parameters);
        
        // Run experiment
        console.log('🔍 DEBUG: Calling experimentFramework.runExperiment...');
        const results = await experimentFramework.runExperiment(experimentType, parameters);
        console.log('🔍 DEBUG: Results received:', results);
        
        if (results.status === 'placeholder') {
            console.log('✅ DEBUG: Found placeholder status, calling updateExperimentPlaceholder');
            console.log('🔍 DEBUG: Function exists?', typeof updateExperimentPlaceholder);
            
            // Call the placeholder function
            updateExperimentPlaceholder(experimentType, results.message);
            console.log('✅ DEBUG: updateExperimentPlaceholder called');
        } else {
            console.log('🔍 DEBUG: Not placeholder, calling updateExperimentResults');
            updateExperimentResults(experimentType, results);
        }
        
    } catch (error) {
        console.error('❌ DEBUG: Caught error:', error);
        console.log('🔍 DEBUG: Error message:', error.message);
        
        // Check if it's a "not found" error - show placeholder instead of fallback
        if (error.message.includes('not found')) {
            console.log('✅ DEBUG: Not found error, calling updateExperimentPlaceholder');
            updateExperimentPlaceholder(experimentType, 'Experiment not yet implemented');
        } else {
            console.log('❌ DEBUG: Other error, running basic simulation');
            runBasicSimulation();
        }
    }
}

/**
 * Show placeholder message for unimplemented experiments
 */
function updateExperimentPlaceholder(experimentType, message) {
  // 1) Run the fallback first (this overwrites the panel)
  runBasicSimulation();

  // 2) Then inject the banner at the top so it persists
  const summary = document.getElementById('resultsSummary');
  const notice = `
    <p id="exp-notice" style="color: orange; font-weight: bold; margin-bottom: 6px;">
      🚧 EXPERIMENT "${experimentType}" NOT IMPLEMENTED YET
    </p>
    <p style="color: gray; margin-top: -4px; margin-bottom: 8px;">
      Showing basic simulation instead…
    </p>
  `;
  summary.insertAdjacentHTML('afterbegin', notice);
}

/**
 * Update results with experiment data
 */
function updateExperimentResults(experimentType, results) {
    // TODO: Implement experiment-specific result visualization
    console.log('Experiment results:', results);
    

}

/**
 * Update all charts with new data
 */
function updateCharts(history) {
    updateDemandChart(history);
    updateRevenueChart(history);
    updateLogLogChart(history);
}

/**
 * Update Price & Demand Chart
 */
function updateDemandChart(history) {
    demandChart.data.labels = history.map(h => h.day);
    demandChart.data.datasets[0].data = history.map(h => h.price);
    demandChart.data.datasets[1].data = history.map(h => h.demand);
    demandChart.update('none'); // No animation for better performance
}

/**
 * Update Revenue Chart
 */
function updateRevenueChart(history) {
    const target = currentModel.target;
    revenueChart.data.labels = history.map(h => h.day);
    revenueChart.data.datasets[0].data = history.map(h => h.cumulativeRaised);
    revenueChart.data.datasets[1].data = history.map(h => target);
    revenueChart.update('none');
}

/**
 * Update Log-Log Chart
 */
function updateLogLogChart(history) {
    const logData = history.map(h => ({
        x: Math.log(h.price),
        y: Math.log(h.demand)
    }));
    logLogChart.data.datasets[0].data = logData;
    logLogChart.update('none');
}

/**
 * Update results summary
 */
function updateResultsSummary(results) {
    const summaryDiv = document.getElementById('resultsSummary');
    const successClass = results.success ? 'status-success' : 'status-failed';
    
    summaryDiv.innerHTML = `
        <p>Status: <span class="${successClass}">${results.success ? 'SUCCESS' : 'FAILED'}</span></p>
        <p>Total Raised: <span class="parameter-value">$${results.totalRaised.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></p>
        <p>Total Tokens: <span class="parameter-value">${results.totalDemand.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></p>
        <p>Success Rate: <span class="parameter-value">${((results.totalRaised / currentModel.target) * 100).toFixed(1)}%</span></p>
        <p>Avg Token Price: <span class="parameter-value">$${(results.totalRaised / results.totalDemand).toFixed(2)}</span></p>
    `;
}

/**
 * Reset simulation
 */
function resetSimulation() {
    // Reset sliders to default values
    document.getElementById('alphaSlider').value = 1000;
    document.getElementById('betaSlider').value = 0.5;
    document.getElementById('gammaSlider').value = 1.2;
    document.getElementById('targetSlider').value = 100000;
    document.getElementById('priceSlider').value = 1;
    document.getElementById('strategySelect').value = 'fixed';
    document.getElementById('durationSlider').value = 30;

    
    updateParameters();
    
    // Clear charts
    clearCharts();
    
    // Clear results
    document.getElementById('resultsSummary').innerHTML = '<p>Run a simulation to see results...</p>';
    
    // Reset global variables
    currentModel = null;
    currentResults = null;
}

/**
 * Clear all chart data
 */
function clearCharts() {
    demandChart.data.labels = [];
    demandChart.data.datasets.forEach(dataset => dataset.data = []);
    demandChart.update('none');
    
    revenueChart.data.labels = [];
    revenueChart.data.datasets.forEach(dataset => dataset.data = []);
    revenueChart.update('none');
    
    logLogChart.data.datasets[0].data = [];
    logLogChart.update('none');
}

/**
 * Export results as CSV
 */
function exportResults() {
    if (!currentResults) {
        alert('Please run a simulation first!');
        return;
    }
    
    try {
        // Create CSV content
        let csv = 'Day,Price,Effort,Demand,Revenue,Cumulative Raised,Percent Complete\n';
        currentResults.history.forEach(h => {
            csv += `${h.day},${h.price},${h.effort},${h.demand},${h.revenue},${h.cumulativeRaised},${h.percentComplete}\n`;
        });
        
        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'equicurve_simulation_results.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Export error:', error);
        alert('An error occurred while exporting results.');
    }
}

// Make functions globally accessible for any remaining inline handlers
window.runSimulation = runSimulation;
window.updateParameters = updateParameters;
window.resetSimulation = resetSimulation;
window.exportResults = exportResults;