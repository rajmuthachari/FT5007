/**
 * EquiCurve - Market Conditions Experiments (Category 5)
 * 5.1 Bull vs Bear Markets
 * 5.2 Competition Effects
 * 5.3 External Shocks
 */

// Enhanced model with market conditions
class MarketAwareCrowdfundingModel extends CrowdfundingModel {
    constructor(params = {}) {
        super(params);
        this.marketCondition = params.marketCondition || 'neutral';
        this.competitorCount = params.competitorCount || 0;
        this.shockEvents = params.shockEvents || [];
    }
    
    calculateDemand(price, effort, day = 1, includeNoise = true) {
        let baseDemand = this.alpha * Math.pow(effort, this.beta) * Math.pow(price, -this.gamma);
        
        // Apply market condition multiplier
        const marketMultiplier = this.getMarketMultiplier(day);
        baseDemand *= marketMultiplier;
        
        // Apply competition effects
        const competitionMultiplier = this.getCompetitionMultiplier();
        baseDemand *= competitionMultiplier;
        
        // Apply external shocks
        const shockMultiplier = this.getShockMultiplier(day);
        baseDemand *= shockMultiplier;
        
        if (includeNoise) {
            const epsilon = this.generateLogNormalNoise();
            return baseDemand * epsilon;
        }
        
        return baseDemand;
    }
    
    getMarketMultiplier(day) {
        switch(this.marketCondition) {
            case 'bull':
                // Bull market: increasing optimism over time
                return 1.2 + (day / this.duration) * 0.3;
            
            case 'bear':
                // Bear market: declining confidence
                return 0.8 - (day / this.duration) * 0.2;
            
            case 'volatile':
                // Volatile market: sine wave pattern
                return 1.0 + 0.3 * Math.sin(2 * Math.PI * day / (this.duration / 3));
            
            case 'recession':
                // Recession: severely depressed demand
                return 0.6 - (day / this.duration) * 0.1;
            
            default: // neutral
                return 1.0;
        }
    }
    
    getCompetitionMultiplier() {
        if (this.competitorCount === 0) return 1.0;
        
        // Each competitor reduces demand by ~15%
        return Math.pow(0.85, this.competitorCount);
    }
    
    getShockMultiplier(day) {
        let multiplier = 1.0;
        
        for (const shock of this.shockEvents) {
            if (day >= shock.startDay && day <= shock.endDay) {
                multiplier *= shock.impact;
            }
        }
        
        return multiplier;
    }
    
    simulateCampaignWithMarket(strategy) {
        this.history = [];
        let cumulativeRaised = 0;
        let cumulativeDemand = 0;
        
        for (let day = 1; day <= this.duration; day++) {
            const price = strategy.getPrice(day, cumulativeRaised, this.target);
            const effort = strategy.getEffort(day, cumulativeRaised, this.target);
            
            // Use market-aware demand calculation
            const demand = this.calculateDemand(price, effort, day);
            const revenue = demand * price;
            
            cumulativeRaised += revenue;
            cumulativeDemand += demand;
            
            this.history.push({
                day,
                price,
                effort,
                demand,
                revenue,
                cumulativeRaised,
                cumulativeDemand,
                percentComplete: (cumulativeRaised / this.target) * 100,
                marketMultiplier: this.getMarketMultiplier(day),
                competitionMultiplier: this.getCompetitionMultiplier(),
                shockMultiplier: this.getShockMultiplier(day)
            });
        }
        
        return {
            success: cumulativeRaised >= this.target,
            totalRaised: cumulativeRaised,
            totalDemand: cumulativeDemand,
            history: this.history,
            marketCondition: this.marketCondition,
            competitorCount: this.competitorCount
        };
    }
}

// 5.1 Bull vs Bear Markets Experiment
class MarketCyclesExperiment extends BaseExperiment {
    constructor() {
        super('market-cycles', 'Bull vs Bear Markets',
              'Test campaign performance across different market conditions');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Market Cycles Experiment...');
        
        const marketConditions = [
            { condition: 'bull', name: 'Bull Market', description: 'Rising optimism, 20-50% demand boost' },
            { condition: 'neutral', name: 'Neutral Market', description: 'Stable conditions, baseline demand' },
            { condition: 'bear', name: 'Bear Market', description: 'Declining confidence, 20-40% demand reduction' },
            { condition: 'volatile', name: 'Volatile Market', description: 'Cyclical swings, ±30% demand variation' },
            { condition: 'recession', name: 'Recession', description: 'Severe downturn, 40-50% demand reduction' }
        ];
        
        const results = [];
        const numTrials = 100;
        
        for (const market of marketConditions) {
            console.log(`Testing ${market.name} conditions`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
            let avgVolatility = 0;
            let avgRecoveryTime = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new MarketAwareCrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    marketCondition: market.condition
                });
                
                let strategy;
                switch(parameters.strategy) {
                    case 'dynamic':
                        strategy = new DynamicPricingStrategy(parameters.initialPrice, 150, parameters.duration);
                        break;
                    case 'bonding':
                        strategy = new BondingCurveStrategy(parameters.initialPrice);
                        break;
                    default:
                        strategy = new FixedPricingStrategy(parameters.initialPrice);
                }
                
                const result = model.simulateCampaignWithMarket(strategy);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                
                // Calculate demand volatility
                const demands = result.history.map(h => h.demand);
                const avgDemand = demands.reduce((sum, d) => sum + d, 0) / demands.length;
                const variance = demands.reduce((sum, d) => sum + Math.pow(d - avgDemand, 2), 0) / demands.length;
                avgVolatility += Math.sqrt(variance);
                
                // Calculate recovery time (days to reach 50% of target)
                const recoveryDay = result.history.findIndex(h => h.cumulativeRaised >= parameters.target * 0.5);
                avgRecoveryTime += recoveryDay === -1 ? parameters.duration : recoveryDay + 1;
            }
            
            results.push({
                condition: market.condition,
                name: market.name,
                description: market.description,
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgVolatility: avgVolatility / numTrials,
                avgRecoveryTime: avgRecoveryTime / numTrials,
                trials: numTrials
            });
        }
        
        const bestMarket = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'market-cycles',
            results: results,
            optimal: bestMarket,
            summary: `Best market condition: ${bestMarket.name} (${bestMarket.successRate.toFixed(1)}% success rate)`,
            insights: this.generateMarketCycleInsights(results)
        };
    }
    
    generateMarketCycleInsights(results) {
        const bull = results.find(r => r.condition === 'bull');
        const bear = results.find(r => r.condition === 'bear');
        const neutral = results.find(r => r.condition === 'neutral');
        const volatile = results.find(r => r.condition === 'volatile');
        const recession = results.find(r => r.condition === 'recession');
        
        return {
            bullVsBear: `Bull markets provide ${((bull.successRate - bear.successRate) / bear.successRate * 100).toFixed(1)}% higher success rate`,
            volatilityImpact: volatile.avgVolatility > neutral.avgVolatility ?
                'Market volatility increases demand uncertainty' :
                'Volatility has minimal impact on demand stability',
            recessionResilience: recession.successRate > 30 ?
                'Campaigns show resilience during recessions' :
                'Recession severely impacts campaign viability',
            marketTiming: 'Campaign timing relative to market cycles significantly affects outcomes',
            recommendation: 'Consider market conditions when planning campaign launch and strategy'
        };
    }
}

// 5.2 Competition Effects Experiment
class CompetitionExperiment extends BaseExperiment {
    constructor() {
        super('competition', 'Competition Effects',
              'Analyze impact of competing campaigns on success rates');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Competition Effects Experiment...');
        
        // Test different competition levels
        const competitionLevels = [0, 1, 2, 3, 5, 8, 12];
        const results = [];
        const numTrials = 100;
        
        for (const competitorCount of competitionLevels) {
            console.log(`Testing with ${competitorCount} competitors`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
            let avgMarketShare = 0;
            let avgCompetitiveAdvantage = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new MarketAwareCrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    competitorCount: competitorCount
                });
                
                let strategy;
                switch(parameters.strategy) {
                    case 'dynamic':
                        strategy = new DynamicPricingStrategy(parameters.initialPrice, 150, parameters.duration);
                        break;
                    case 'bonding':
                        strategy = new BondingCurveStrategy(parameters.initialPrice);
                        break;
                    default:
                        strategy = new FixedPricingStrategy(parameters.initialPrice);
                }
                
                const result = model.simulateCampaignWithMarket(strategy);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                
                // Calculate market share (simplified)
                const totalMarketSize = parameters.target * (competitorCount + 1);
                avgMarketShare += (result.totalRaised / totalMarketSize) * 100;
                
                // Calculate competitive advantage
                const baselineDemand = parameters.alpha * Math.pow(5, parameters.beta) * Math.pow(parameters.initialPrice, -parameters.gamma);
                const actualAvgDemand = result.history.reduce((sum, h) => sum + h.demand, 0) / result.history.length;
                avgCompetitiveAdvantage += (actualAvgDemand / baselineDemand - 1) * 100;
            }
            
            results.push({
                competitorCount: competitorCount,
                competitionLevel: competitorCount === 0 ? 'None' : 
                                competitorCount <= 2 ? 'Low' :
                                competitorCount <= 5 ? 'Medium' : 'High',
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgMarketShare: avgMarketShare / numTrials,
                avgCompetitiveAdvantage: avgCompetitiveAdvantage / numTrials,
                trials: numTrials
            });
        }
        
        const bestCompetition = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'competition',
            results: results,
            optimal: bestCompetition,
            summary: `Optimal competition level: ${bestCompetition.competitorCount} competitors (${bestCompetition.successRate.toFixed(1)}% success rate)`,
            insights: this.generateCompetitionInsights(results)
        };
    }
    
    generateCompetitionInsights(results) {
        const noCompetition = results.find(r => r.competitorCount === 0);
        const lowCompetition = results.filter(r => r.competitorCount > 0 && r.competitorCount <= 2);
        const highCompetition = results.filter(r => r.competitorCount > 5);
        
        const avgLowSuccess = lowCompetition.reduce((sum, r) => sum + r.successRate, 0) / lowCompetition.length;
        const avgHighSuccess = highCompetition.reduce((sum, r) => sum + r.successRate, 0) / highCompetition.length;
        
        const competitionImpact = ((noCompetition.successRate - avgHighSuccess) / noCompetition.successRate) * 100;
        
        return {
            competitionImpact: `High competition reduces success rate by ${competitionImpact.toFixed(1)}%`,
            optimalCompetition: avgLowSuccess > noCompetition.successRate ?
                'Light competition can improve market validation' :
                'Competition consistently reduces success rates',
            marketSaturation: highCompetition.length > 0 && avgHighSuccess < 30 ?
                'Market becomes saturated with 5+ competitors' :
                'Market can sustain multiple competitors',
            differentiationNeed: 'Strong differentiation becomes critical in competitive markets',
            recommendation: 'Monitor competitive landscape and adjust strategy accordingly'
        };
    }
}

// 5.3 External Shocks Experiment
class ExternalShocksExperiment extends BaseExperiment {
    constructor() {
        super('external-shocks', 'External Shocks',
              'Test campaign resilience to unexpected market events');
    }

    async run(parameters = {}) {
        console.log('🔬 Running External Shocks Experiment...');
        
        const shockScenarios = [
            {
                name: 'No Shocks (Control)',
                shocks: []
            },
            {
                name: 'Early Positive Shock',
                shocks: [{ startDay: 5, endDay: 10, impact: 1.5, type: 'positive' }]
            },
            {
                name: 'Early Negative Shock',
                shocks: [{ startDay: 5, endDay: 10, impact: 0.6, type: 'negative' }]
            },
            {
                name: 'Mid-Campaign Crisis',
                shocks: [{ startDay: 15, endDay: 20, impact: 0.4, type: 'crisis' }]
            },
            {
                name: 'Late Rally',
                shocks: [{ startDay: 25, endDay: 30, impact: 1.8, type: 'rally' }]
            },
            {
                name: 'Multiple Shocks',
                shocks: [
                    { startDay: 8, endDay: 10, impact: 0.7, type: 'negative' },
                    { startDay: 18, endDay: 22, impact: 1.4, type: 'positive' }
                ]
            }
        ];
        
        const results = [];
        const numTrials = 100;
        
        for (const scenario of shockScenarios) {
            console.log(`Testing ${scenario.name} scenario`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
            let avgRecoveryTime = 0;
            let avgResilience = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new MarketAwareCrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    shockEvents: scenario.shocks
                });
                
                let strategy;
                switch(parameters.strategy) {
                    case 'dynamic':
                        strategy = new DynamicPricingStrategy(parameters.initialPrice, 150, parameters.duration);
                        break;
                    case 'bonding':
                        strategy = new BondingCurveStrategy(parameters.initialPrice);
                        break;
                    default:
                        strategy = new FixedPricingStrategy(parameters.initialPrice);
                }
                
                const result = model.simulateCampaignWithMarket(strategy);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                
                // Calculate recovery time after negative shocks
                let recoveryTime = 0;
                for (const shock of scenario.shocks) {
                    if (shock.impact < 1.0) { // Negative shock
                        const preShockDemand = result.history[Math.max(0, shock.startDay - 2)].demand;
                        
                        for (let day = shock.endDay + 1; day < result.history.length; day++) {
                            if (result.history[day].demand >= preShockDemand * 0.9) {
                                recoveryTime = day - shock.endDay;
                                break;
                            }
                        }
                    }
                }
                avgRecoveryTime += recoveryTime;
                
                // Calculate resilience (ability to maintain performance despite shocks)
                const controlRevenue = parameters.target; // Expected revenue without shocks
                const resilience = result.totalRaised / controlRevenue;
                avgResilience += resilience;
            }
            
            results.push({
                scenario: scenario.name,
                shocks: scenario.shocks,
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgRecoveryTime: avgRecoveryTime / numTrials,
                avgResilience: avgResilience / numTrials,
                trials: numTrials
            });
        }
        
        const mostResilient = results.reduce((best, current) => 
            current.avgResilience > best.avgResilience ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'external-shocks',
            results: results,
            optimal: mostResilient,
            summary: `Most resilient scenario: ${mostResilient.scenario} (${mostResilient.avgResilience.toFixed(2)} resilience score)`,
            insights: this.generateShockInsights(results)
        };
    }
    
    generateShockInsights(results) {
        const control = results.find(r => r.shocks.length === 0);
        const positiveShocks = results.filter(r => r.shocks.some(s => s.impact > 1.0));
        const negativeShocks = results.filter(r => r.shocks.some(s => s.impact < 1.0));
        const multipleShocks = results.filter(r => r.shocks.length > 1);
        
        const avgPositiveSuccess = positiveShocks.reduce((sum, r) => sum + r.successRate, 0) / positiveShocks.length;
        const avgNegativeSuccess = negativeShocks.reduce((sum, r) => sum + r.successRate, 0) / negativeShocks.length;
        
        return {
            positiveShockBoost: `Positive shocks increase success rate by ${((avgPositiveSuccess - control.successRate) / control.successRate * 100).toFixed(1)}%`,
            negativeShockImpact: `Negative shocks reduce success rate by ${((control.successRate - avgNegativeSuccess) / control.successRate * 100).toFixed(1)}%`,
            timingMatters: 'Shock timing significantly affects campaign outcomes',
            recoveryCapacity: 'Campaigns show varying recovery speeds after negative events',
            diversificationBenefit: multipleShocks.length > 0 ? 'Multiple smaller shocks may be less damaging than single large shocks' : 'Single shock analysis complete',
            recommendation: 'Build contingency plans and maintain flexibility to handle external shocks'
        };
    }
}

// Register market experiments
if (typeof experimentFramework !== 'undefined') {
    experimentFramework.registerExperiment('market-cycles', new MarketCyclesExperiment());
    experimentFramework.registerExperiment('competition', new CompetitionExperiment());
    experimentFramework.registerExperiment('external-shocks', new ExternalShocksExperiment());
    console.log('✅ Market condition experiments registered');
}
                        