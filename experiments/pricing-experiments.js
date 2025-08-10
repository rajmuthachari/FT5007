/**
 * EquiCurve - Pricing Strategy Experiments (Category 3)
 * 3.1 Static Pricing Strategies
 * 3.2 Dynamic Pricing Rules
 * 3.3 Bonding Curve Experiments
 */

// Extended pricing strategies for experiments
class LinearDecayStrategy extends PricingStrategy {
    constructor(initialPrice, finalPrice, duration, constantEffort = 5) {
        super(initialPrice);
        this.finalPrice = finalPrice;
        this.duration = duration;
        this.constantEffort = constantEffort;
    }
    
    getPrice(day, cumulativeRaised, target) {
        const progress = (day - 1) / (this.duration - 1);
        return this.initialPrice + (this.finalPrice - this.initialPrice) * progress;
    }
    
    getEffort(day, cumulativeRaised, target) {
        return this.constantEffort;
    }
}

class StepFunctionStrategy extends PricingStrategy {
    constructor(initialPrice, steps, duration, constantEffort = 5) {
        super(initialPrice);
        this.steps = steps; // Array of {day: X, price: Y}
        this.duration = duration;
        this.constantEffort = constantEffort;
    }
    
    getPrice(day, cumulativeRaised, target) {
        for (let i = this.steps.length - 1; i >= 0; i--) {
            if (day >= this.steps[i].day) {
                return this.steps[i].price;
            }
        }
        return this.initialPrice;
    }
    
    getEffort(day, cumulativeRaised, target) {
        return this.constantEffort;
    }
}

class AdaptivePricingStrategy extends PricingStrategy {
    constructor(initialPrice, effortBudget = 150, duration = 30, sensitivity = 0.1) {
        super(initialPrice);
        this.effortBudget = effortBudget;
        this.duration = duration;
        this.sensitivity = sensitivity;
        this.priceHistory = [];
    }
    
    getPrice(day, cumulativeRaised, target) {
        const progressRatio = cumulativeRaised / target;
        const timeRatio = day / this.duration;
        
        // Adaptive adjustment based on performance
        const expectedProgress = timeRatio;
        const performance = progressRatio / expectedProgress;
        
        // More aggressive adjustments
        let adjustment = 0;
        if (performance > 1.2) {
            adjustment = this.sensitivity * 2; // Increase price significantly
        } else if (performance > 1.0) {
            adjustment = this.sensitivity; // Moderate increase
        } else if (performance < 0.8) {
            adjustment = -this.sensitivity * 2; // Significant decrease
        } else if (performance < 1.0) {
            adjustment = -this.sensitivity; // Moderate decrease
        }
        
        const newPrice = this.initialPrice * (1 + adjustment);
        this.priceHistory.push(newPrice);
        return Math.max(newPrice, this.initialPrice * 0.5); // Floor price
    }
    
    getEffort(day, cumulativeRaised, target) {
        const remainingDays = this.duration - day + 1;
        const remainingBudget = this.effortBudget * (1 - day/this.duration);
        const progressRatio = cumulativeRaised / target;
        const urgency = progressRatio < day/this.duration ? 2 : 1;
        
        return (remainingBudget / remainingDays) * urgency;
    }
}

class AdvancedBondingCurveStrategy extends PricingStrategy {
    constructor(initialPrice, curveType = 'exponential', steepness = 0.5) {
        super(initialPrice);
        this.curveType = curveType;
        this.steepness = steepness;
        this.totalTokensSold = 0;
    }
    
    getPrice(day, cumulativeRaised, target) {
        const tokensSold = cumulativeRaised / this.initialPrice;
        const targetTokens = target / this.initialPrice;
        const progress = tokensSold / targetTokens;
        
        switch(this.curveType) {
            case 'linear':
                return this.initialPrice * (1 + this.steepness * progress);
            
            case 'exponential':
                return this.initialPrice * Math.exp(this.steepness * progress);
            
            case 'logarithmic':
                return this.initialPrice * (1 + this.steepness * Math.log(1 + progress));
            
            case 'sigmoid':
                const sigmoid = 1 / (1 + Math.exp(-10 * (progress - 0.5)));
                return this.initialPrice * (1 + this.steepness * sigmoid);
            
            default:
                return this.initialPrice * (1 + this.steepness * progress);
        }
    }
    
    getEffort(day, cumulativeRaised, target) {
        const currentPrice = this.getPrice(day, cumulativeRaised, target);
        const priceRatio = currentPrice / this.initialPrice;
        return 5 * Math.sqrt(priceRatio);
    }
}

// 3.1 Static Pricing Strategies Experiment
class StaticPricingExperiment extends BaseExperiment {
    constructor() {
        super('static-pricing', 'Static Pricing Strategies',
              'Compare fixed price vs linear decay vs step function pricing');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Static Pricing Strategies Experiment...');
        
        const strategies = [
            {
                name: 'Fixed Price',
                strategy: new FixedPricingStrategy(parameters.initialPrice, 5)
            },
            {
                name: 'Linear Decay (50% reduction)',
                strategy: new LinearDecayStrategy(parameters.initialPrice, parameters.initialPrice * 0.5, parameters.duration, 5)
            },
            {
                name: 'Linear Increase (50% increase)',
                strategy: new LinearDecayStrategy(parameters.initialPrice, parameters.initialPrice * 1.5, parameters.duration, 5)
            },
            {
                name: 'Step Function (3 steps)',
                strategy: new StepFunctionStrategy(parameters.initialPrice, [
                    {day: 1, price: parameters.initialPrice},
                    {day: 10, price: parameters.initialPrice * 0.8},
                    {day: 20, price: parameters.initialPrice * 0.6}
                ], parameters.duration, 5)
            }
        ];
        
        const results = [];
        const numTrials = 5;
        
        for (const strategyConfig of strategies) {
            console.log(`Testing ${strategyConfig.name}`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
            let avgTotalDemand = 0;
            let avgFinalPrice = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new CrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice
                });
                
                const result = model.simulateCampaign(strategyConfig.strategy);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                avgTotalDemand += result.totalDemand;
                avgFinalPrice += result.history[result.history.length - 1].price;
            }
            
            results.push({
                strategy: strategyConfig.name,
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgTotalDemand: avgTotalDemand / numTrials,
                avgFinalPrice: avgFinalPrice / numTrials,
                avgTokenPrice: (avgTotalRaised / numTrials) / (avgTotalDemand / numTrials),
                trials: numTrials
            });
        }
        
        const bestStrategy = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'static-pricing',
            results: results,
            optimal: bestStrategy,
            summary: `Best static strategy: ${bestStrategy.strategy} (${bestStrategy.successRate.toFixed(1)}% success rate)`,
            insights: this.generateStaticPricingInsights(results)
        };
    }
    
    generateStaticPricingInsights(results) {
        const fixed = results.find(r => r.strategy.includes('Fixed'));
        const decay = results.find(r => r.strategy.includes('Decay'));
        const increase = results.find(r => r.strategy.includes('Increase'));
        const step = results.find(r => r.strategy.includes('Step'));
        
        return {
            fixedVsDynamic: fixed.successRate > Math.max(decay.successRate, increase.successRate) ?
                'Fixed pricing outperforms linear strategies' :
                'Dynamic pricing provides advantages',
            priceDirection: increase.successRate > decay.successRate ?
                'Price increases during campaign improve success' :
                'Price decreases during campaign improve success',
            stepFunction: step.successRate > fixed.successRate ?
                'Step pricing outperforms fixed pricing' :
                'Fixed pricing beats step pricing',
            recommendation: 'Analyze market conditions to choose optimal static strategy'
        };
    }
}

// 3.2 Dynamic Pricing Rules Experiment  
class DynamicPricingExperiment extends BaseExperiment {
    constructor() {
        super('dynamic-pricing-exp', 'Dynamic Pricing Rules',
              'Test advanced dynamic pricing algorithms and sensitivity');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Dynamic Pricing Rules Experiment...');
        
        const strategies = [
            {
                name: 'Basic Dynamic',
                strategy: new DynamicPricingStrategy(parameters.initialPrice, 150, parameters.duration)
            },
            {
                name: 'Adaptive (Low Sensitivity)',
                strategy: new AdaptivePricingStrategy(parameters.initialPrice, 150, parameters.duration, 0.05)
            },
            {
                name: 'Adaptive (Medium Sensitivity)',
                strategy: new AdaptivePricingStrategy(parameters.initialPrice, 150, parameters.duration, 0.1)
            },
            {
                name: 'Adaptive (High Sensitivity)',
                strategy: new AdaptivePricingStrategy(parameters.initialPrice, 150, parameters.duration, 0.2)
            }
        ];
        
        const results = [];
        const numTrials = 5;
        
        for (const strategyConfig of strategies) {
            console.log(`Testing ${strategyConfig.name}`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
            let avgPriceVolatility = 0;
            let avgEfficiency = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new CrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice
                });
                
                const result = model.simulateCampaign(strategyConfig.strategy);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                
                // Calculate price volatility
                const prices = result.history.map(h => h.price);
                const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
                const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length;
                avgPriceVolatility += Math.sqrt(variance);
                
                // Calculate efficiency (revenue per unit effort)
                const totalEffort = result.history.reduce((sum, h) => sum + h.effort, 0);
                avgEfficiency += result.totalRaised / totalEffort;
            }
            
            results.push({
                strategy: strategyConfig.name,
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgPriceVolatility: avgPriceVolatility / numTrials,
                avgEfficiency: avgEfficiency / numTrials,
                trials: numTrials
            });
        }
        
        const bestStrategy = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'dynamic-pricing-exp',
            results: results,
            optimal: bestStrategy,
            summary: `Best dynamic strategy: ${bestStrategy.strategy} (${bestStrategy.successRate.toFixed(1)}% success rate)`,
            insights: this.generateDynamicPricingInsights(results)
        };
    }
    
    generateDynamicPricingInsights(results) {
        const basic = results.find(r => r.strategy === 'Basic Dynamic');
        const adaptive = results.filter(r => r.strategy.includes('Adaptive'));
        
        const bestAdaptive = adaptive.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            adaptiveVsBasic: bestAdaptive.successRate > basic.successRate ?
                'Adaptive pricing outperforms basic dynamic pricing' :
                'Basic dynamic pricing remains competitive',
            volatilityTradeoff: 'Higher sensitivity increases volatility but may improve responsiveness',
            optimalSensitivity: bestAdaptive.strategy,
            recommendation: 'Medium sensitivity adaptive pricing balances performance and stability'
        };
    }
}

// 3.3 Bonding Curve Experiments
class BondingCurvesExperiment extends BaseExperiment {
    constructor() {
        super('bonding-curves', 'Bonding Curve Experiments',
              'Test different bonding curve shapes and parameters');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Bonding Curve Experiments...');
        
        const curveConfigs = [
            { type: 'linear', steepness: 0.5, name: 'Linear (0.5)' },
            { type: 'linear', steepness: 1.0, name: 'Linear (1.0)' },
            { type: 'exponential', steepness: 0.3, name: 'Exponential (0.3)' },
            { type: 'exponential', steepness: 0.5, name: 'Exponential (0.5)' },
            { type: 'logarithmic', steepness: 0.5, name: 'Logarithmic (0.5)' },
            { type: 'sigmoid', steepness: 1.0, name: 'Sigmoid (1.0)' }
        ];
        
        const results = [];
        const numTrials = 5;
        
        for (const config of curveConfigs) {
            console.log(`Testing ${config.name} bonding curve`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
            let avgFinalPrice = 0;
            let avgPriceAppreciation = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new CrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice
                });
                
                const strategy = new AdvancedBondingCurveStrategy(
                    parameters.initialPrice,
                    config.type,
                    config.steepness
                );
                
                const result = model.simulateCampaign(strategy);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                
                const finalPrice = result.history[result.history.length - 1].price;
                avgFinalPrice += finalPrice;
                avgPriceAppreciation += (finalPrice - parameters.initialPrice) / parameters.initialPrice;
            }
            
            results.push({
                curveType: config.type,
                steepness: config.steepness,
                name: config.name,
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgFinalPrice: avgFinalPrice / numTrials,
                avgPriceAppreciation: (avgPriceAppreciation / numTrials) * 100,
                trials: numTrials
            });
        }
        
        const bestCurve = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'bonding-curves',
            results: results,
            optimal: bestCurve,
            summary: `Best bonding curve: ${bestCurve.name} (${bestCurve.successRate.toFixed(1)}% success rate, ${bestCurve.avgPriceAppreciation.toFixed(1)}% price appreciation)`,
            insights: this.generateBondingCurveInsights(results)
        };
    }
    
    generateBondingCurveInsights(results) {
        const linear = results.filter(r => r.curveType === 'linear');
        const exponential = results.filter(r => r.curveType === 'exponential');
        const logarithmic = results.filter(r => r.curveType === 'logarithmic');
        const sigmoid = results.filter(r => r.curveType === 'sigmoid');
        
        const avgLinearSuccess = linear.reduce((sum, r) => sum + r.successRate, 0) / linear.length;
        const avgExponentialSuccess = exponential.reduce((sum, r) => sum + r.successRate, 0) / exponential.length;
        
        return {
            linearVsExponential: avgLinearSuccess > avgExponentialSuccess ?
                'Linear curves outperform exponential curves' :
                'Exponential curves provide better results',
            steepnessEffect: 'Moderate steepness balances early accessibility with late-stage value',
            priceAppreciation: 'Bonding curves create natural price discovery mechanisms',
            recommendation: 'Choose curve shape based on target audience and campaign goals'
        };
    }
}

// Register pricing experiments
if (typeof experimentFramework !== 'undefined') {
    experimentFramework.registerExperiment('static-pricing', new StaticPricingExperiment());
    experimentFramework.registerExperiment('dynamic-pricing-exp', new DynamicPricingExperiment());
    experimentFramework.registerExperiment('bonding-curves', new BondingCurvesExperiment());
    console.log('✅ Pricing strategy experiments registered');
}