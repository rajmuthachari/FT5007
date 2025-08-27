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
//function updateExperimentResults(experimentType, results) {
function updateExperimentResultsDisplay(experimentType, results) {

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
// Category 1: Elasticity Analysis
function generateElasticityResultsHTML(experimentType, results) {
    const optimal = results.optimal;
    
    // Interpret the elasticity values
    let interpretation, action, impact;
    
    if (experimentType === 'price-elasticity') {
        interpretation = optimal.gamma < 1 ? 
            "🎯 Price-insensitive market detected" :
            optimal.gamma > 1.5 ? 
            "⚠️ Highly price-sensitive market" :
            "📊 Moderately elastic market";
        
        impact = `1% price increase → ${(optimal.gamma).toFixed(1)}% demand drop`;
        action = optimal.gamma < 1 ? 
            "Implement premium pricing with 20-30% margins" :
            "Focus on volume with competitive 5-10% margins";
    } 
    else if (experimentType === 'effort-elasticity') {
        interpretation = optimal.beta > 0.6 ? 
            "📈 Marketing has strong impact" :
            optimal.beta < 0.3 ? 
            "⚠️ Marketing shows diminishing returns" :
            "📊 Normal marketing effectiveness";
        
        impact = `$100 marketing → ${(100 * optimal.beta).toFixed(0)} new backers`;
        action = optimal.beta > 0.5 ? 
            "Increase marketing budget by 50%" :
            "Optimize existing channels before scaling";
    }
    else { // cross-elasticity
        interpretation = "🔄 Interaction effects detected";
        impact = `Optimal mix: β=${optimal.beta}, γ=${optimal.gamma}`;
        action = "Balance price and effort based on these parameters";
    }
    
    const roi = ((optimal.avgRaised - 50000) / 50000 * 100).toFixed(0);
    
    return `
        <div style="border: 2px solid #8b5cf6; border-radius: 8px; padding: 1rem;">
            <h4 style="color: #8b5cf6;">${interpretation}</h4>
            
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                <p style="color: #fbbf24; font-weight: bold;">${impact}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <span style="color: #10b981;">Success: ${optimal.successRate.toFixed(0)}%</span>
                    <span style="color: #f59e0b;">ROI: ${roi}%</span>
                    <span style="color: #06b6d4;">Avg: $${(optimal.avgRaised/1000).toFixed(0)}k</span>
                </div>
            </div>
            
            <p style="color: #10b981; margin-top: 10px;">
                <strong>💡 Action:</strong> ${action}
            </p>
        </div>
    `;
}

// Category 2: Fee Structure
function generateFeeResultsHTML(experimentType, results) {
    const optimal = results.optimal;
    const feeRate = optimal.feeRate || optimal.nominalRate || (optimal.avgPlatformRevenue / optimal.avgTotalRaised);
    const entrepreneurNet = optimal.avgTotalRaised - optimal.avgPlatformRevenue;
    
    return `
        <div style="border: 2px solid #10b981; border-radius: 8px; padding: 1rem;">
            <h4 style="color: #10b981;">💰 Optimal: ${optimal.name || optimal.feePercentage + '%'}</h4>
            
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <p style="color: #9ca3af; font-size: 0.8rem;">Platform Revenue</p>
                        <p style="color: #fbbf24; font-size: 1.2rem;">$${(optimal.avgPlatformRevenue/1000).toFixed(1)}k</p>
                    </div>
                    <div>
                        <p style="color: #9ca3af; font-size: 0.8rem;">Entrepreneur Net</p>
                        <p style="color: #10b981; font-size: 1.2rem;">$${(entrepreneurNet/1000).toFixed(1)}k</p>
                    </div>
                </div>
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #374151;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #06b6d4;">Success Rate: ${optimal.successRate.toFixed(0)}%</span>
                        <span style="color: #f59e0b;">Effective Fee: ${(feeRate * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
            
            <p style="color: #a78bfa; margin-top: 10px;">
                <strong>📊 Insight:</strong> ${
                    optimal.successRate > 60 ? 
                    "This fee structure maximizes both success and revenue" :
                    "Consider lower fees to improve campaign success rates"
                }
            </p>
        </div>
    `;
}

// Category 3: Pricing Strategies
function generatePricingResultsHTML(experimentType, results) {
    const optimal = results.optimal;
    //const baseline = results.results.find(r => r.strategy.includes('Fixed')) || results.results[0];
    const baseline = results.results.find(r => r.strategy && r.strategy.includes('Fixed')) || results.results[0];

    const improvement = ((optimal.avgTotalRaised - baseline.avgTotalRaised) / baseline.avgTotalRaised * 100);
    
    return `
        <div style="border: 2px solid #f59e0b; border-radius: 8px; padding: 1rem;">
            <h4 style="color: #f59e0b;">📈 Winner: ${optimal.strategy || optimal.name}</h4>
            
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                <p style="color: #fbbf24; font-size: 1.1rem; margin-bottom: 10px;">
                    ${improvement > 0 ? '+' : ''}${improvement.toFixed(0)}% vs Fixed Price
                </p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                    <div>
                        <p style="color: #9ca3af; font-size: 0.75rem;">Success</p>
                        <p style="color: #10b981;">${optimal.successRate.toFixed(0)}%</p>
                    </div>
                    <div>
                        <p style="color: #9ca3af; font-size: 0.75rem;">Avg Raised</p>
                        <p style="color: #06b6d4;">$${(optimal.avgTotalRaised/1000).toFixed(0)}k</p>
                    </div>
                    <div>
                        <p style="color: #9ca3af; font-size: 0.75rem;">Volatility</p>
                        <p style="color: #f59e0b;">${optimal.avgPriceVolatility ? optimal.avgPriceVolatility.toFixed(1) : 'N/A'}</p>
                    </div>
                </div>
            </div>
            
            <p style="color: #a78bfa; margin-top: 10px;">
                <strong>🎯 Best for:</strong> ${
                    optimal.strategy?.includes('Dynamic') ? "Adaptive campaigns with real-time optimization" :
                    optimal.strategy?.includes('Bonding') ? "Token launches with price discovery" :
                    "Simple, predictable fundraising"
                }
            </p>
        </div>
    `;
}

// Category 4: Effort Strategies
function generateEffortResultsHTML(experimentType, results) {
    const optimal = results.optimal;
    const effortROI = optimal.avgEffortUtilization || (optimal.avgTotalRaised / 150); // $per effort unit
    
    return `
        <div style="border: 2px solid #ef4444; border-radius: 8px; padding: 1rem;">
            <h4 style="color: #ef4444;">💪 Best: ${optimal.name || optimal.pattern}</h4>
            
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                <p style="color: #fbbf24; margin-bottom: 10px;">
                    $${effortROI.toFixed(0)} revenue per effort unit
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #9ca3af;">Success Rate</span>
                            <span style="color: #10b981;">${optimal.successRate.toFixed(0)}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #9ca3af;">Total Raised</span>
                            <span style="color: #06b6d4;">$${(optimal.avgTotalRaised/1000).toFixed(0)}k</span>
                        </div>
                    </div>
                    <div>
                        <p style="color: #f59e0b; font-size: 0.9rem;">${
                            optimal.pattern === 'front-loaded' ? "📊 Peak effort days 1-10" :
                            optimal.pattern === 'back-loaded' ? "📊 Peak effort days 20-30" :
                            optimal.pattern === 'u-shape' ? "📊 Peak at start & end" :
                            "📊 Steady daily effort"
                        }</p>
                    </div>
                </div>
            </div>
            
            <p style="color: #a78bfa; margin-top: 10px;">
                <strong>💡 Strategy:</strong> ${
                    results.insights?.recommendation || 
                    "Align effort timing with campaign momentum"
                }
            </p>
        </div>
    `;
}

// Category 5: Market Conditions
function generateMarketResultsHTML(experimentType, results) {
    const optimal = results.optimal;
    const worstCase = results.results.reduce((worst, current) => 
        current.successRate < worst.successRate ? current : worst
    );
    
    return `
        <div style="border: 2px solid #06b6d4; border-radius: 8px; padding: 1rem;">
            <h4 style="color: #06b6d4;">🌍 ${optimal.name || optimal.condition}</h4>
            
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #10b981;">Best Case</span>
                        <span style="color: #10b981; font-size: 1.2rem;">${optimal.successRate.toFixed(0)}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                        <span style="color: #ef4444;">Worst Case</span>
                        <span style="color: #ef4444; font-size: 1.2rem;">${worstCase.successRate.toFixed(0)}%</span>
                    </div>
                </div>
                <div style="padding-top: 10px; border-top: 1px solid #374151;">
                    <p style="color: #f59e0b;">
                        Risk Factor: ${((optimal.successRate - worstCase.successRate) / optimal.successRate * 100).toFixed(0)}% variance
                    </p>
                </div>
            </div>
            
            <p style="color: #a78bfa; margin-top: 10px;">
                <strong>🛡️ Mitigation:</strong> ${
                    experimentType === 'competition' ? "Differentiate strongly when >3 competitors present" :
                    experimentType === 'market-cycles' ? "Time launch for favorable market conditions" :
                    "Build contingency plans for 20% revenue shortfall"
                }
            </p>
        </div>
    `;
}

// Category 6: Campaign Duration
function generateDurationResultsHTML(experimentType, results) {
    const optimal = results.optimal;
    
    if (experimentType === 'duration-optimization') {
        const shortCampaign = results.results.find(r => r.duration <= 14);
        const longCampaign = results.results.find(r => r.duration >= 60);
        const urgencyEffect = shortCampaign ? (shortCampaign.successRate / optimal.successRate) : 0;
        
        return `
            <div style="border: 2px solid #8b5cf6; border-radius: 8px; padding: 1rem;">
                <h4 style="color: #8b5cf6;">⏱️ Optimal: ${optimal.duration} Days</h4>
                
                <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                        <div style="border-right: 1px solid #374151;">
                            <p style="color: #ef4444; font-size: 0.75rem;">Too Short (≤14d)</p>
                            <p style="color: #f87171;">${shortCampaign ? shortCampaign.successRate.toFixed(0) + '%' : 'N/A'}</p>
                        </div>
                        <div style="border-right: 1px solid #374151;">
                            <p style="color: #10b981; font-size: 0.75rem;">Sweet Spot</p>
                            <p style="color: #34d399; font-size: 1.3rem;">${optimal.successRate.toFixed(0)}%</p>
                        </div>
                        <div>
                            <p style="color: #fbbf24; font-size: 0.75rem;">Too Long (≥60d)</p>
                            <p style="color: #fde047;">${longCampaign ? longCampaign.successRate.toFixed(0) + '%' : 'N/A'}</p>
                        </div>
                    </div>
                    <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #374151;">
                        <p style="color: #06b6d4;">Avg per day: $${(optimal.avgRaised / optimal.duration).toFixed(0)}</p>
                        <p style="color: #f59e0b; margin-top: 5px;">Total potential: $${(optimal.avgRaised/1000).toFixed(0)}k</p>
                    </div>
                </div>
                
                <p style="color: #a78bfa; margin-top: 10px;">
                    <strong>💡 Strategy:</strong> ${
                        optimal.duration <= 14 ? "Create strong urgency with limited-time offers" :
                        optimal.duration <= 30 ? "Balance momentum with sufficient exposure time" :
                        "1Maintain engagement with milestone rewards throughout"
                    }
                </p>
            </div>
        `;
    } else { // multi-round
        const improvement = optimal.successRate - (results.results.find(r => r.rounds === 1)?.successRate || 0);
        
        return `
            <div style="border: 2px solid #8b5cf6; border-radius: 8px; padding: 1rem;">
                <h4 style="color: #8b5cf6;">🔄 Best: ${optimal.name}</h4>
                
                <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <p style="color: #10b981; font-size: 1.1rem; margin-bottom: 10px;">
                        +${improvement.toFixed(0)}% vs single round
                    </p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <p style="color: #9ca3af; font-size: 0.8rem;">Success Rate</p>
                            <p style="color: #34d399;">${optimal.successRate.toFixed(0)}%</p>
                        </div>
                        <div>
                            <p style="color: #9ca3af; font-size: 0.8rem;">Brand Value</p>
                            <p style="color: #f59e0b;">${optimal.avgBrandValue?.toFixed(0) || 'N/A'}</p>
                        </div>
                    </div>
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #374151;">
                        <p style="color: #06b6d4;">Efficiency: $${optimal.efficiency?.toFixed(0) || 'N/A'}/day</p>
                    </div>
                </div>
                
                <p style="color: #a78bfa; margin-top: 10px;">
                    <strong>📊 Recommendation:</strong> ${
                        optimal.rounds > 1 ? 
                        `Run ${optimal.rounds} rounds to build momentum and reduce risk` :
                        "Single round is sufficient for this campaign type"
                    }
                </p>
            </div>
        `;
    }
}

// Category 7: Success Criteria
function generateSuccessResultsHTML(experimentType, results) {
    const optimal = results.optimal;
    
    if (experimentType === 'funding-thresholds') {
        const softCapPercent = (optimal.softCapRatio * 100).toFixed(0);
        const hardCapPercent = (optimal.hardCapRatio * 100).toFixed(0);
        
        return `
            <div style="border: 2px solid #10b981; border-radius: 8px; padding: 1rem;">
                <h4 style="color: #10b981;">🎯 Optimal Thresholds: ${optimal.name}</h4>
                
                <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <div style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        <div style="text-align: center;">
                            <p style="color: #fbbf24; font-size: 1.8rem;">${softCapPercent}%</p>
                            <p style="color: #9ca3af; font-size: 0.75rem;">Soft Cap</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="color: #10b981; font-size: 1.8rem;">100%</p>
                            <p style="color: #9ca3af; font-size: 0.75rem;">Target</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="color: #06b6d4; font-size: 1.8rem;">${hardCapPercent}%</p>
                            <p style="color: #9ca3af; font-size: 0.75rem;">Hard Cap</p>
                        </div>
                    </div>
                    <div style="padding-top: 10px; border-top: 1px solid #374151;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #9ca3af;">Success Rate</span>
                            <span style="color: #10b981;">${optimal.combinedSuccessRate.toFixed(0)}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                            <span style="color: #9ca3af;">Exceptional Rate</span>
                            <span style="color: #f59e0b;">${optimal.exceptionalRate.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
                
                <p style="color: #a78bfa; margin-top: 10px;">
                    <strong>💰 Impact:</strong> ${
                        optimal.softCapRatio <= 0.5 ? 
                        "Lower threshold reduces failure risk but may signal weak commitment" :
                        "Higher threshold ensures viability but increases failure risk"
                    }
                </p>
            </div>
        `;
    } else { // success-metrics
        const bestCategory = results.categoryLeaders;
        
        return `
            <div style="border: 2px solid #10b981; border-radius: 8px; padding: 1rem;">
                <h4 style="color: #10b981;">📈 Holistic Success: ${optimal.strategy}</h4>
                
                <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <div style="margin-bottom: 10px;">
                        <p style="color: #fbbf24; font-size: 1.2rem;">Overall Score: ${optimal.avgOverallScore.toFixed(0)}/100</p>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                        <div>
                            <p style="color: #10b981;">${optimal.avgFundingScore.toFixed(0)}</p>
                            <p style="color: #9ca3af; font-size: 0.7rem;">Funding</p>
                        </div>
                        <div>
                            <p style="color: #f59e0b;">${optimal.avgCommunityScore.toFixed(0)}</p>
                            <p style="color: #9ca3af; font-size: 0.7rem;">Community</p>
                        </div>
                        <div>
                            <p style="color: #06b6d4;">${optimal.avgBrandScore.toFixed(0)}</p>
                            <p style="color: #9ca3af; font-size: 0.7rem;">Brand</p>
                        </div>
                    </div>
                </div>
                
                <p style="color: #a78bfa; margin-top: 10px;">
                    <strong>🎯 Focus Area:</strong> ${
                        optimal.avgFundingScore > 80 ? "Funding target achieved, invest in community" :
                        optimal.avgCommunityScore < 50 ? "Build community for long-term success" :
                        "Maintain balanced approach across all metrics"
                    }
                </p>
            </div>
        `;
    }
}

// Category 8: Principal-Agent
function generatePrincipalAgentResultsHTML(experimentType, results) {
    const optimal = results.optimal;
    
    const alignmentLevel = optimal.avgAlignmentScore > 70 ? "High" :
                           optimal.avgAlignmentScore > 50 ? "Moderate" : "Low";
    const alignmentColor = optimal.avgAlignmentScore > 70 ? "#10b981" :
                           optimal.avgAlignmentScore > 50 ? "#f59e0b" : "#ef4444";
    
    return `
        <div style="border: 2px solid #f59e0b; border-radius: 8px; padding: 1rem;">
            <h4 style="color: #f59e0b;">🤝 ${alignmentLevel} Alignment: ${optimal.name || optimal.mechanism}</h4>
            
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <p style="color: ${alignmentColor}; font-size: 2rem; font-weight: bold;">
                        ${optimal.avgAlignmentScore.toFixed(0)}/100
                    </p>
                    <p style="color: #9ca3af; font-size: 0.8rem;">Alignment Score</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #9ca3af;">Trust Level</span>
                            <span style="color: #10b981;">${(optimal.avgTrustLevel * 100).toFixed(0)}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #9ca3af;">Success Rate</span>
                            <span style="color: #06b6d4;">${optimal.successRate.toFixed(0)}%</span>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #9ca3af;">Platform ROI</span>
                            <span style="color: #f59e0b;">${((optimal.platformROI || 0.05) * 100).toFixed(1)}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #9ca3af;">Moral Hazard</span>
                            <span style="color: ${optimal.avgMoralHazard > 0.5 ? '#ef4444' : '#10b981'};">
                                ${optimal.avgMoralHazard > 0.5 ? 'High' : 'Low'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <p style="color: #a78bfa; margin-top: 10px;">
                <strong>⚖️ Solution:</strong> ${
                    experimentType === 'information-asymmetry' ? 
                        "Implement transparency dashboards and regular reporting" :
                    experimentType === 'incentive-mechanisms' ? 
                        "Use success-based fees with effort monitoring" :
                        "Adopt hybrid governance with clear accountability"
                }
            </p>
        </div>
    `;
}

// Category 9: Network Effects
function generateNetworkResultsHTML(experimentType, results) {
    const optimal = results.optimal;
    
    if (experimentType === 'viral-mechanics') {
        const viralMultiplier = 1 + optimal.viralCoefficient;
        const organicReach = 1000 * viralMultiplier;
        const cac = 50; // Customer acquisition cost
        const viralCAC = cac / viralMultiplier;
        
        return `
            <div style="border: 2px solid #8b5cf6; border-radius: 8px; padding: 1rem;">
                <h4 style="color: #8b5cf6;">🚀 Viral K-Factor: ${optimal.viralCoefficient.toFixed(2)}</h4>
                
                <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <p style="color: #fbbf24; font-size: 1.5rem;">
                            1 user → ${viralMultiplier.toFixed(1)} users
                        </p>
                        <p style="color: #9ca3af; font-size: 0.8rem;">Viral multiplication effect</p>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div style="text-align: center;">
                            <p style="color: #ef4444; text-decoration: line-through;">$${cac}</p>
                            <p style="color: #10b981; font-size: 1.3rem;">$${viralCAC.toFixed(0)}</p>
                            <p style="color: #9ca3af; font-size: 0.7rem;">Effective CAC</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="color: #06b6d4; font-size: 1.3rem;">${(organicReach/1000).toFixed(1)}k</p>
                            <p style="color: #9ca3af; font-size: 0.7rem;">Organic reach</p>
                        </div>
                    </div>
                </div>
                
                <p style="color: #a78bfa; margin-top: 10px;">
                    <strong>💡 Growth hack:</strong> ${
                        optimal.viralCoefficient > 0.2 ? 
                        "You have viral product-market fit! Double down on sharing features" :
                        optimal.viralCoefficient > 0.1 ?
                        "Add referral incentives to push K-factor above 0.2" :
                        "Focus on product improvements before viral mechanics"
                    }
                </p>
            </div>
        `;
    } else { // community-building
        const ltv = optimal.avgLongTermValue;
        const engagementRate = optimal.avgCommunityEngagement;
        
        return `
            <div style="border: 2px solid #8b5cf6; border-radius: 8px; padding: 1rem;">
                <h4 style="color: #8b5cf6;">👥 Community Strategy: ${optimal.strategy}</h4>
                
                <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">
                        <div style="text-align: center;">
                            <p style="color: #10b981; font-size: 1.5rem;">$${(ltv/1000).toFixed(1)}k</p>
                            <p style="color: #9ca3af; font-size: 0.8rem;">Long-term value</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="color: #f59e0b; font-size: 1.5rem;">${engagementRate.toFixed(0)}%</p>
                            <p style="color: #9ca3af; font-size: 0.8rem;">Engagement rate</p>
                        </div>
                    </div>
                    <div style="padding-top: 10px; border-top: 1px solid #374151;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #9ca3af;">User Retention</span>
                            <span style="color: #06b6d4;">${(optimal.avgUserRetention * 100).toFixed(0)}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                            <span style="color: #9ca3af;">Success Rate</span>
                            <span style="color: #10b981;">${optimal.successRate.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
                
                <p style="color: #a78bfa; margin-top: 10px;">
                    <strong>🎯 Priority:</strong> ${
                        engagementRate > 60 ? 
                        "Monetize highly engaged community with premium offerings" :
                        engagementRate > 40 ?
                        "Increase engagement frequency with daily activities" :
                        "Build core community before scaling"
                    }
                </p>
            </div>
        `;
    }
}

// Category 10: Comparative Analysis
function generateComparativeResultsHTML(experimentType, results) {
    const optimal = results.optimal;
    
    if (experimentType === 'traditional-vs-web3') {
        const platforms = results.results;
        const web3 = platforms.find(p => p.platform === 'web3');
        const traditional = platforms.find(p => p.platform === 'traditional');
        const revenueDiff = ((web3.netRevenue - traditional.netRevenue) / traditional.netRevenue * 100);
        
        return `
            <div style="border: 2px solid #06b6d4; border-radius: 8px; padding: 1rem;">
                <h4 style="color: #06b6d4;">⚖️ Winner: ${optimal.name}</h4>
                
                <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <div style="margin-bottom: 15px;">
                        <p style="color: #10b981; font-size: 1.2rem; text-align: center;">
                            Web3 delivers ${revenueDiff > 0 ? '+' : ''}${revenueDiff.toFixed(0)}% revenue
                        </p>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="border-right: 1px solid #374151; padding-right: 10px;">
                            <p style="color: #f59e0b; font-weight: bold; margin-bottom: 5px;">Traditional</p>
                            <div style="font-size: 0.9rem;">
                                <p style="color: #10b981;">✓ ${traditional.avgAccessibility.toFixed(0)}% accessible</p>
                                <p style="color: #ef4444;">✗ ${traditional.features.fees * 100}% fees</p>
                                <p style="color: #ef4444;">✗ Low liquidity</p>
                            </div>
                        </div>
                        <div style="padding-left: 10px;">
                            <p style="color: #8b5cf6; font-weight: bold; margin-bottom: 5px;">Web3</p>
                            <div style="font-size: 0.9rem;">
                                <p style="color: #10b981;">✓ ${web3.features.fees * 100}% fees</p>
                                <p style="color: #10b981;">✓ High liquidity</p>
                                <p style="color: #ef4444;">✗ ${web3.avgAccessibility.toFixed(0)}% accessible</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <p style="color: #a78bfa; margin-top: 10px;">
                    <strong>📊 Recommendation:</strong> ${
                        optimal.platform === 'web3' ? 
                        "Use Web3 for tech-savvy audiences seeking ownership" :
                        optimal.platform === 'hybrid' ?
                        "Hybrid approach balances accessibility with innovation" :
                        "Traditional platform for mainstream consumer campaigns"
                    }
                </p>
            </div>
        `;
    } else { // platform-comparison
        const topTwo = results.results.sort((a,b) => b.valueProposition - a.valueProposition).slice(0, 2);
        
        return `
            <div style="border: 2px solid #06b6d4; border-radius: 8px; padding: 1rem;">
                <h4 style="color: #06b6d4;">🏆 Best Platform: ${optimal.platform}</h4>
                
                <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <div style="margin-bottom: 15px;">
                        <p style="color: #fbbf24; font-size: 1.1rem;">Value Score: ${optimal.valueProposition.toFixed(0)}</p>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        ${topTwo.map(p => `
                            <div style="padding: 8px; border: 1px solid #374151; border-radius: 5px;">
                                <p style="color: ${p === optimal ? '#10b981' : '#f59e0b'}; font-weight: bold;">
                                    ${p.platform}
                                </p>
                                <div style="font-size: 0.8rem; margin-top: 5px;">
                                    <p style="color: #9ca3af;">Fee: ${(p.fees * 100).toFixed(1)}%</p>
                                    <p style="color: #9ca3af;">Success: ${p.successRate.toFixed(0)}%</p>
                                    <p style="color: #9ca3af;">Features: ${p.avgFeatureValue.toFixed(0)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <p style="color: #a78bfa; margin-top: 10px;">
                    <strong>💼 Key differentiator:</strong> ${
                        optimal.fees <= 0.03 ? 
                        "Low fees attract more campaigns and enable higher margins" :
                        optimal.avgFeatureValue > 30 ?
                        "Advanced features justify premium pricing" :
                        "Strong network effects drive platform value"
                    }
                </p>
            </div>
        `;
    }
}

// Override the existing updateExperimentResults function in simulator.js
if (typeof window !== 'undefined') {
    //window.updateExperimentResults = updateExperimentResults;
    console.log('✅ Enhanced experiment result display loaded');
}

// Log successful loading
console.log('✅ EquiCurve Complete Experiment Suite Loaded Successfully!');
console.log('📊 Total experiments available:', experimentStatus.total);
console.log('📂 Categories loaded:');
experimentStatus.categories.forEach(category => console.log(`   ${category}`));
console.log('🚀 Ready to run comprehensive experiments!');