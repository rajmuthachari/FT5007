/**
 * EquiCurve - Elasticity Analysis Experiments (Category 1)
 * 1.1 Price Elasticity (γ) Variations
 * 1.2 Effort Elasticity (β) Variations  
 * 1.3 Cross-Elasticity Effects
 */

// 1.1 Price Elasticity Experiment
class PriceElasticityExperiment extends BaseExperiment {
    constructor() {
        super('price-elasticity', 'Price Elasticity (γ) Variations', 
              'Test different price elasticity values to understand demand sensitivity');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Price Elasticity Experiment...');
        
        // Test gamma values from inelastic (0.5) to highly elastic (2.0)
        const gammaValues = [0.5, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0];
        const results = [];
        const numTrials = 5; // Multiple trials for statistical significance
        
        for (const gamma of gammaValues) {
            console.log(`Testing price elasticity γ = ${gamma}`);
            
            let successCount = 0;
            let totalRaised = 0;
            let avgPrice = 0;
            let totalDemand = 0;
            
            // Run multiple trials for this gamma value
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new CrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: gamma, // Test this gamma value
                    duration: parameters.duration || 30,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice
                });
                
                // Use the selected strategy
                let strategy;
                switch(parameters.strategy) {
                    case 'dynamic':
                        strategy = new DynamicPricingStrategy(parameters.initialPrice, 150, parameters.duration || 30);
                        break;
                    case 'bonding':
                        strategy = new BondingCurveStrategy(parameters.initialPrice);
                        break;
                    default:
                        strategy = new FixedPricingStrategy(parameters.initialPrice);
                }
                
                const result = model.simulateCampaign(strategy);
                
                if (result.success) successCount++;
                totalRaised += result.totalRaised;
                totalDemand += result.totalDemand;
                
                // Calculate average price
                const trialAvgPrice = result.history.reduce((sum, h) => sum + h.price, 0) / result.history.length;
                avgPrice += trialAvgPrice;
            }
            
            // Calculate averages for this gamma
            results.push({
                gamma: gamma,
                successRate: (successCount / numTrials) * 100,
                avgRaised: totalRaised / numTrials,
                avgPrice: avgPrice / numTrials,
                avgDemand: totalDemand / numTrials,
                trials: numTrials,
                elasticityType: gamma < 1 ? 'Inelastic' : gamma === 1 ? 'Unit Elastic' : 'Elastic'
            });
        }
        
        // Find optimal gamma
        const bestGamma = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'price-elasticity',
            results: results,
            optimal: bestGamma,
            summary: `Optimal price elasticity: γ = ${bestGamma.gamma} (${bestGamma.successRate.toFixed(1)}% success rate)`,
            insights: this.generatePriceElasticityInsights(results)
        };
    }
    
    generatePriceElasticityInsights(results) {
        const inelastic = results.filter(r => r.gamma < 1);
        const elastic = results.filter(r => r.gamma > 1);
        
        const avgInelasticSuccess = inelastic.reduce((sum, r) => sum + r.successRate, 0) / inelastic.length;
        const avgElasticSuccess = elastic.reduce((sum, r) => sum + r.successRate, 0) / elastic.length;
        
        return {
            inelasticPerformance: avgInelasticSuccess.toFixed(1),
            elasticPerformance: avgElasticSuccess.toFixed(1),
            recommendation: avgInelasticSuccess > avgElasticSuccess ? 
                'Inelastic demand (γ < 1) performs better - consider premium pricing' :
                'Elastic demand (γ > 1) performs better - consider competitive pricing'
        };
    }
}

// 1.2 Effort Elasticity Experiment
class EffortElasticityExperiment extends BaseExperiment {
    constructor() {
        super('effort-elasticity', 'Effort Elasticity (β) Variations',
              'Test different effort elasticity values to understand marketing ROI');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Effort Elasticity Experiment...');
        
        // Test beta values from low (0.1) to high (0.9)
        const betaValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
        const results = [];
        const numTrials = 5;
        
        for (const beta of betaValues) {
            console.log(`Testing effort elasticity β = ${beta}`);
            
            let successCount = 0;
            let totalRaised = 0;
            let avgEffort = 0;
            let totalDemand = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new CrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: beta, // Test this beta value
                    gamma: parameters.gamma,
                    duration: parameters.duration || 30,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice
                });
                
                let strategy;
                switch(parameters.strategy) {
                    case 'dynamic':
                        strategy = new DynamicPricingStrategy(parameters.initialPrice, 150, parameters.duration || 30);
                        break;
                    case 'bonding':
                        strategy = new BondingCurveStrategy(parameters.initialPrice);
                        break;
                    default:
                        strategy = new FixedPricingStrategy(parameters.initialPrice);
                }
                
                const result = model.simulateCampaign(strategy);
                
                if (result.success) successCount++;
                totalRaised += result.totalRaised;
                totalDemand += result.totalDemand;
                
                // Calculate average effort
                const trialAvgEffort = result.history.reduce((sum, h) => sum + h.effort, 0) / result.history.length;
                avgEffort += trialAvgEffort;
            }
            
            results.push({
                beta: beta,
                successRate: (successCount / numTrials) * 100,
                avgRaised: totalRaised / numTrials,
                avgEffort: avgEffort / numTrials,
                avgDemand: totalDemand / numTrials,
                trials: numTrials,
                effortSensitivity: beta < 0.3 ? 'Low' : beta < 0.6 ? 'Medium' : 'High'
            });
        }
        
        const bestBeta = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'effort-elasticity',
            results: results,
            optimal: bestBeta,
            summary: `Optimal effort elasticity: β = ${bestBeta.beta} (${bestBeta.successRate.toFixed(1)}% success rate)`,
            insights: this.generateEffortElasticityInsights(results)
        };
    }
    
    generateEffortElasticityInsights(results) {
        // Calculate ROI for different beta values
        const roiAnalysis = results.map(r => ({
            beta: r.beta,
            roi: r.avgRaised / (r.avgEffort * 100), // Simplified ROI calculation
            successRate: r.successRate
        }));
        
        const highestROI = roiAnalysis.reduce((best, current) => 
            current.roi > best.roi ? current : best
        );
        
        return {
            optimalROI: `β = ${highestROI.beta} provides highest ROI`,
            diminishingReturns: results[results.length-1].successRate < results[results.length-2].successRate ? 
                'Diminishing returns observed at high β values' : 'No diminishing returns detected',
            recommendation: highestROI.beta < 0.5 ? 
                'Focus on targeting efficiency over effort quantity' :
                'High effort elasticity - scale marketing aggressively'
        };
    }
}

// 1.3 Cross-Elasticity Effects Experiment
class CrossElasticityExperiment extends BaseExperiment {
    constructor() {
        super('cross-elasticity', 'Cross-Elasticity Effects',
              'Analyze interaction effects between price and effort elasticity');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Cross-Elasticity Experiment...');
        
        // Test combinations of beta and gamma
        const betaValues = [0.3, 0.5, 0.7];
        const gammaValues = [0.8, 1.2, 1.6];
        const results = [];
        const numTrials = 3; // Reduced for computational efficiency
        
        for (const beta of betaValues) {
            for (const gamma of gammaValues) {
                console.log(`Testing β = ${beta}, γ = ${gamma}`);
                
                let successCount = 0;
                let totalRaised = 0;
                let synergy = 0;
                
                for (let trial = 0; trial < numTrials; trial++) {
                    const model = new CrowdfundingModel({
                        alpha: parameters.alpha,
                        beta: beta,
                        gamma: gamma,
                        duration: parameters.duration || 30,
                        target: parameters.target,
                        initialPrice: parameters.initialPrice
                    });
                    
                    let strategy;
                    switch(parameters.strategy) {
                        case 'dynamic':
                            strategy = new DynamicPricingStrategy(parameters.initialPrice, 150, parameters.duration || 30);
                            break;
                        case 'bonding':
                            strategy = new BondingCurveStrategy(parameters.initialPrice);
                            break;
                        default:
                            strategy = new FixedPricingStrategy(parameters.initialPrice);
                    }
                    
                    const result = model.simulateCampaign(strategy);
                    
                    if (result.success) successCount++;
                    totalRaised += result.totalRaised;
                    
                    // Calculate synergy effect (simplified)
                    synergy += (beta * gamma) / (beta + gamma);
                }
                
                results.push({
                    beta: beta,
                    gamma: gamma,
                    successRate: (successCount / numTrials) * 100,
                    avgRaised: totalRaised / numTrials,
                    synergy: synergy / numTrials,
                    trials: numTrials,
                    combination: `β=${beta}, γ=${gamma}`
                });
            }
        }
        
        // Find best combination
        const bestCombination = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        // Analyze interaction patterns
        const interactions = this.analyzeInteractions(results);
        
        return {
            status: 'complete',
            experimentType: 'cross-elasticity',
            results: results,
            optimal: bestCombination,
            summary: `Optimal combination: β = ${bestCombination.beta}, γ = ${bestCombination.gamma} (${bestCombination.successRate.toFixed(1)}% success rate)`,
            interactions: interactions
        };
    }
    
    analyzeInteractions(results) {
        // Simple interaction analysis
        const highBeta = results.filter(r => r.beta >= 0.5);
        const lowBeta = results.filter(r => r.beta < 0.5);
        const highGamma = results.filter(r => r.gamma >= 1.2);
        const lowGamma = results.filter(r => r.gamma < 1.2);
        
        const highBetaAvg = highBeta.reduce((sum, r) => sum + r.successRate, 0) / highBeta.length;
        const lowBetaAvg = lowBeta.reduce((sum, r) => sum + r.successRate, 0) / lowBeta.length;
        const highGammaAvg = highGamma.reduce((sum, r) => sum + r.successRate, 0) / highGamma.length;
        const lowGammaAvg = lowGamma.reduce((sum, r) => sum + r.successRate, 0) / lowGamma.length;
        
        return {
            betaEffect: highBetaAvg > lowBetaAvg ? 'Higher β generally better' : 'Lower β generally better',
            gammaEffect: highGammaAvg > lowGammaAvg ? 'Higher γ generally better' : 'Lower γ generally better',
            recommendation: 'Optimize both parameters jointly for best results'
        };
    }
}

// Register experiments with the framework
if (typeof experimentFramework !== 'undefined') {
    experimentFramework.registerExperiment('price-elasticity', new PriceElasticityExperiment());
    experimentFramework.registerExperiment('effort-elasticity', new EffortElasticityExperiment());
    experimentFramework.registerExperiment('cross-elasticity', new CrossElasticityExperiment());
    console.log('✅ Elasticity experiments registered');
}