/**
 * EquiCurve - Effort Strategy Experiments (Category 4)
 * 4.1 Constant vs Variable Effort
 * 4.2 Effort Allocation Strategies  
 * 4.3 Platform vs Entrepreneur Effort
 */

// Enhanced effort strategies
class VariableEffortStrategy extends PricingStrategy {
    constructor(initialPrice, effortPattern, totalBudget = 150, duration = 30) {
        super(initialPrice);
        this.effortPattern = effortPattern; // 'front-loaded', 'back-loaded', 'middle-peak', 'u-shape'
        this.totalBudget = totalBudget;
        this.duration = duration;
    }
    
    getPrice(day, cumulativeRaised, target) {
        return this.initialPrice; // Keep price fixed to isolate effort effects
    }
    
    getEffort(day, cumulativeRaised, target) {
        const duration = this.duration;
        const progress = day / duration;
        
        switch(this.effortPattern) {
            case 'front-loaded':
                // High effort early, tapering off
                return (this.totalBudget / duration) * 2 * (1 - progress);
            
            case 'back-loaded':
                // Low effort early, ramping up
                return (this.totalBudget / duration) * 2 * progress;
            
            case 'middle-peak':
                // Peak effort in middle, lower at ends
                return (this.totalBudget / duration) * 4 * progress * (1 - progress);
            
            case 'u-shape':
                // High at start and end, low in middle
                const midDistance = Math.abs(progress - 0.5);
                return (this.totalBudget / duration) * (1 + 2 * midDistance);
            
            case 'exponential':
                // Exponentially increasing effort
                return (this.totalBudget / duration) * Math.exp(2 * progress - 1);
            
            default: // constant
                return this.totalBudget / duration;
        }
    }
}

class DualEffortStrategy extends PricingStrategy {
    constructor(initialPrice, entrepreneurEffort, platformEffort, platformMultiplier = 1.5) {
        super(initialPrice);
        this.entrepreneurEffort = entrepreneurEffort;
        this.platformEffort = platformEffort;
        this.platformMultiplier = platformMultiplier;
    }
    
    getPrice(day, cumulativeRaised, target) {
        return this.initialPrice;
    }
    
    getEffort(day, cumulativeRaised, target) {
        // Combined effort with platform multiplier effect
        return this.entrepreneurEffort + (this.platformEffort * this.platformMultiplier);
    }
    
    getEntrepreneurEffort() {
        return this.entrepreneurEffort;
    }
    
    getPlatformEffort() {
        return this.platformEffort * this.platformMultiplier;
    }
}

class AdaptiveEffortStrategy extends PricingStrategy {
    constructor(initialPrice, baseBudget = 150, adaptationRate = 0.2) {
        super(initialPrice);
        this.baseBudget = baseBudget;
        this.adaptationRate = adaptationRate;
    }
    
    getPrice(day, cumulativeRaised, target) {
        return this.initialPrice;
    }
    
    getEffort(day, cumulativeRaised, target) {
        
        const duration = this.duration;
        const expectedProgress = day / duration;
        const actualProgress = cumulativeRaised / target;
        
        // Base daily effort
        const baseEffort = this.baseBudget / duration;
        
        // Adaptation based on performance
        const performanceGap = actualProgress - expectedProgress;
        const adaptation = baseEffort * this.adaptationRate * (-performanceGap);
        
        // Ensure effort stays positive and within reasonable bounds
        return Math.max(1, Math.min(baseEffort + adaptation, baseEffort * 3));
    }
}

// 4.1 Constant vs Variable Effort Experiment
class EffortPatternsExperiment extends BaseExperiment {
    constructor() {
        super('effort-patterns', 'Constant vs Variable Effort',
              'Compare different effort allocation patterns over time');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Effort Patterns Experiment...');
        
        const effortStrategies = [
            { pattern: 'constant', name: 'Constant Effort' },
            { pattern: 'front-loaded', name: 'Front-loaded (Early Push)' },
            { pattern: 'back-loaded', name: 'Back-loaded (Late Push)' },
            { pattern: 'middle-peak', name: 'Middle Peak' },
            { pattern: 'u-shape', name: 'U-Shape (Start & End)' },
            { pattern: 'exponential', name: 'Exponential Growth' }
        ];
        
        const results = [];
        const numTrials = 20;
        const totalBudget = 150;
        
        for (const strategyConfig of effortStrategies) {
            console.log(`Testing ${strategyConfig.name} effort pattern`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
            let avgTotalDemand = 0;
            let avgEffortUtilization = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new CrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice
                });
                
                const strategy = new VariableEffortStrategy(
                    parameters.initialPrice,
                    strategyConfig.pattern,
                    totalBudget,
                    parameters.duration || 30
                );
                
                const result = model.simulateCampaign(strategy);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                avgTotalDemand += result.totalDemand;
                
                // Calculate effort utilization efficiency
                const totalEffortUsed = result.history.reduce((sum, h) => sum + h.effort, 0);
                avgEffortUtilization += result.totalRaised / totalEffortUsed;
            }
            
            results.push({
                pattern: strategyConfig.pattern,
                name: strategyConfig.name,
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgTotalDemand: avgTotalDemand / numTrials,
                avgEffortUtilization: avgEffortUtilization / numTrials,
                budgetUsed: totalBudget,
                trials: numTrials
            });
        }
        
        const bestPattern = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'effort-patterns',
            results: results,
            optimal: bestPattern,
            summary: `Best effort pattern: ${bestPattern.name} (${bestPattern.successRate.toFixed(1)}% success rate, $${bestPattern.avgEffortUtilization.toFixed(2)} revenue per effort unit)`,
            insights: this.generateEffortPatternInsights(results)
        };
    }
    
    generateEffortPatternInsights(results) {
        const constant = results.find(r => r.pattern === 'constant');
        const frontLoaded = results.find(r => r.pattern === 'front-loaded');
        const backLoaded = results.find(r => r.pattern === 'back-loaded');
        const middlePeak = results.find(r => r.pattern === 'middle-peak');
        
        const variableStrategies = results.filter(r => r.pattern !== 'constant');
        const avgVariableSuccess = variableStrategies.reduce((sum, r) => sum + r.successRate, 0) / variableStrategies.length;
        
        return {
            constantVsVariable: avgVariableSuccess > constant.successRate ?
                'Variable effort patterns outperform constant effort' :
                'Constant effort remains competitive with variable patterns',
            timingEffect: frontLoaded.successRate > backLoaded.successRate ?
                'Early effort investment yields better results' :
                'Late effort investment is more effective',
            peakStrategy: middlePeak.successRate > Math.max(frontLoaded.successRate, backLoaded.successRate) ?
                'Mid-campaign effort peaks optimize results' :
                'Edge-weighted strategies outperform mid-peaks',
            efficiency: 'Effort timing significantly impacts ROI and campaign success',
            recommendation: 'Align effort timing with market dynamics and audience behavior'
        };
    }
}

// 4.2 Effort Allocation Strategies Experiment
class EffortAllocationExperiment extends BaseExperiment {
    constructor() {
        super('effort-allocation', 'Effort Allocation Strategies',
              'Optimize budget allocation between different effort types');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Effort Allocation Experiment...');
        
        // Test different budget allocations (marketing vs development vs community)
        const allocationStrategies = [
            { marketing: 0.6, development: 0.2, community: 0.2, name: 'Marketing-Heavy (60/20/20)' },
            { marketing: 0.4, development: 0.4, community: 0.2, name: 'Balanced (40/40/20)' },
            { marketing: 0.33, development: 0.33, community: 0.34, name: 'Equal Split (33/33/34)' },
            { marketing: 0.2, development: 0.6, community: 0.2, name: 'Development-Heavy (20/60/20)' },
            { marketing: 0.3, development: 0.2, community: 0.5, name: 'Community-Heavy (30/20/50)' }
        ];
        
        const results = [];
        const numTrials = 20;
        const totalBudget = 150;
        
        for (const allocation of allocationStrategies) {
            console.log(`Testing ${allocation.name} allocation`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
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
                
                // Create custom strategy with allocation-based effort calculation
                const strategy = {
                    getPrice: (day, cumulativeRaised, target) => parameters.initialPrice,
                    getEffort: (day, cumulativeRaised, target) => {
                        const duration = parameters.duration;
                        const baseEffort = totalBudget / duration;
                        
                        // Different effort types have different effectiveness multipliers
                        const marketingMultiplier = 1.2; // Marketing is most direct
                        const developmentMultiplier = 0.8; // Development has delayed impact
                        const communityMultiplier = 1.1; // Community builds momentum
                        
                        const effectiveEffort = 
                            (baseEffort * allocation.marketing * marketingMultiplier) +
                            (baseEffort * allocation.development * developmentMultiplier) +
                            (baseEffort * allocation.community * communityMultiplier);
                        
                        return effectiveEffort;
                    }
                };
                
                const result = model.simulateCampaign(strategy);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                
                const totalEffortUsed = result.history.reduce((sum, h) => sum + h.effort, 0);
                avgEfficiency += result.totalRaised / totalEffortUsed;
            }
            
            results.push({
                name: allocation.name,
                marketing: allocation.marketing,
                development: allocation.development,
                community: allocation.community,
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgEfficiency: avgEfficiency / numTrials,
                trials: numTrials
            });
        }
        
        const bestAllocation = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'effort-allocation',
            results: results,
            optimal: bestAllocation,
            summary: `Best allocation: ${bestAllocation.name} (${bestAllocation.successRate.toFixed(1)}% success rate)`,
            insights: this.generateAllocationInsights(results)
        };
    }
    
    generateAllocationInsights(results) {
        const marketingHeavy = results.filter(r => r.marketing >= 0.5);
        const developmentHeavy = results.filter(r => r.development >= 0.5);
        const communityHeavy = results.filter(r => r.community >= 0.4);
        const balanced = results.filter(r => Math.abs(r.marketing - r.development) <= 0.1);
        
        const avgMarketingSuccess = marketingHeavy.reduce((sum, r) => sum + r.successRate, 0) / marketingHeavy.length;
        const avgBalancedSuccess = balanced.reduce((sum, r) => sum + r.successRate, 0) / balanced.length;
        
        return {
            marketingVsBalanced: avgMarketingSuccess > avgBalancedSuccess ?
                'Marketing-heavy allocation outperforms balanced approach' :
                'Balanced allocation is more effective than marketing focus',
            diversificationBenefit: 'Diversified effort allocation reduces risk and improves stability',
            specialization: 'Specialized allocation can maximize specific outcomes',
            recommendation: 'Tailor allocation strategy to campaign phase and objectives'
        };
    }
}

// 4.3 Platform vs Entrepreneur Effort Experiment
class PlatformEffortExperiment extends BaseExperiment {
    constructor() {
        super('platform-effort', 'Platform vs Entrepreneur Effort',
              'Analyze optimal split between platform and entrepreneur effort');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Platform vs Entrepreneur Effort Experiment...');
        
        // Test different effort combinations
        const effortCombinations = [
            { entrepreneur: 8, platform: 0, name: 'Entrepreneur Only (8+0)' },
            { entrepreneur: 6, platform: 2, name: 'Entrepreneur Heavy (6+2)' },
            { entrepreneur: 5, platform: 3, name: 'Entrepreneur Majority (5+3)' },
            { entrepreneur: 4, platform: 4, name: 'Equal Split (4+4)' },
            { entrepreneur: 3, platform: 5, name: 'Platform Majority (3+5)' },
            { entrepreneur: 2, platform: 6, name: 'Platform Heavy (2+6)' },
            { entrepreneur: 0, platform: 8, name: 'Platform Only (0+8)' }
        ];
        
        const results = [];
        const numTrials = 20;
        const platformMultiplier = 1.5; // Platform effort has 50% multiplier effect
        
        for (const combination of effortCombinations) {
            console.log(`Testing ${combination.name} effort split`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
            let avgEfficiency = 0;
            let avgSynergy = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new CrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice
                });
                
                const strategy = new DualEffortStrategy(
                    parameters.initialPrice,
                    combination.entrepreneur,
                    combination.platform,
                    platformMultiplier
                );
                
                const result = model.simulateCampaign(strategy);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                
                const totalEffort = combination.entrepreneur + (combination.platform * platformMultiplier);
                avgEfficiency += result.totalRaised / (totalEffort * (parameters.duration));
                
                // Calculate synergy effect (bonus when both parties contribute)
                const synergy = combination.entrepreneur > 0 && combination.platform > 0 ? 
                    Math.min(combination.entrepreneur, combination.platform) * 0.1 : 0;
                avgSynergy += synergy;
            }
            
            results.push({
                name: combination.name,
                entrepreneurEffort: combination.entrepreneur,
                platformEffort: combination.platform,
                totalEffort: combination.entrepreneur + (combination.platform * platformMultiplier),
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgEfficiency: avgEfficiency / numTrials,
                avgSynergy: avgSynergy / numTrials,
                trials: numTrials
            });
        }
        
        const bestCombination = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'platform-effort',
            results: results,
            optimal: bestCombination,
            summary: `Best effort split: ${bestCombination.name} (${bestCombination.successRate.toFixed(1)}% success rate)`,
            insights: this.generatePlatformEffortInsights(results)
        };
    }
    
    generatePlatformEffortInsights(results) {
        const entrepreneurOnly = results.find(r => r.platformEffort === 0);
        const platformOnly = results.find(r => r.entrepreneurEffort === 0);
        const collaborative = results.filter(r => r.entrepreneurEffort > 0 && r.platformEffort > 0);
        
        const avgCollaborativeSuccess = collaborative.reduce((sum, r) => sum + r.successRate, 0) / collaborative.length;
        const soloMax = Math.max(entrepreneurOnly.successRate, platformOnly.successRate);
        
        return {
            collaborationBenefit: avgCollaborativeSuccess > soloMax ?
                'Collaborative effort outperforms solo approaches' :
                'Single-party effort can be more efficient',
            platformValue: platformOnly.successRate > entrepreneurOnly.successRate ?
                'Platform effort provides higher impact than entrepreneur effort' :
                'Entrepreneur effort is more valuable than platform effort',
            optimalBalance: 'Balanced effort distribution maximizes synergy effects',
            scalability: 'Platform involvement enables campaign scaling beyond entrepreneur capacity',
            recommendation: 'Establish clear effort division based on expertise and resources'
        };
    }
}

// Register effort experiments
if (typeof experimentFramework !== 'undefined') {
    experimentFramework.registerExperiment('effort-patterns', new EffortPatternsExperiment());
    experimentFramework.registerExperiment('effort-allocation', new EffortAllocationExperiment());
    experimentFramework.registerExperiment('platform-effort', new PlatformEffortExperiment());
    console.log('✅ Effort strategy experiments registered');
}