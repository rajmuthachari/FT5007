/**
 * EquiCurve - Success Criteria Experiments (Category 7)
 * 7.1 Funding Thresholds
 * 7.2 Success Metrics Beyond Funding
 */

// Enhanced model for success metrics
class SuccessMetricsCrowdfundingModel extends CrowdfundingModel {
    constructor(params = {}) {
        super(params);
        this.softCap = params.softCap || this.target * 0.6; // Minimum viable funding
        this.hardCap = params.hardCap || this.target * 1.5; // Maximum funding
        this.communityGrowth = 0;
        this.brandAwareness = 0;
        this.networkEffects = 0;
    }
    
    simulateCampaignWithMetrics(strategy) {
        this.history = [];
        this.communityGrowth = 0;
        this.brandAwareness = 0;
        this.networkEffects = 0;
        
        let cumulativeRaised = 0;
        let cumulativeDemand = 0;
        
        for (let day = 1; day <= this.duration; day++) {
            const price = strategy.getPrice(day, cumulativeRaised, this.target);
            const effort = strategy.getEffort(day, cumulativeRaised, this.target);
            
            const demand = this.calculateDemand(price, effort);
            const revenue = demand * price;
            
            cumulativeRaised += revenue;
            cumulativeDemand += demand;
            
            // Calculate additional success metrics
            this.updateCommunityGrowth(demand, effort, day);
            this.updateBrandAwareness(effort, cumulativeRaised);
            this.updateNetworkEffects(cumulativeDemand, day);
            
            // Determine success levels
            const fundingSuccess = this.getFundingSuccessLevel(cumulativeRaised);
            const overallSuccess = this.getOverallSuccessScore(cumulativeRaised, day);
            
            this.history.push({
                day,
                price,
                effort,
                demand,
                revenue,
                cumulativeRaised,
                cumulativeDemand,
                percentComplete: (cumulativeRaised / this.target) * 100,
                communityGrowth: this.communityGrowth,
                brandAwareness: this.brandAwareness,
                networkEffects: this.networkEffects,
                fundingSuccess: fundingSuccess,
                overallSuccess: overallSuccess
            });
        }
        
        const finalFundingSuccess = this.getFundingSuccessLevel(cumulativeRaised);
        const finalOverallSuccess = this.getOverallSuccessScore(cumulativeRaised, this.duration);
        
        return {
            // Traditional metrics
            success: cumulativeRaised >= this.target,
            totalRaised: cumulativeRaised,
            totalDemand: cumulativeDemand,
            
            // Enhanced success metrics
            fundingLevel: finalFundingSuccess,
            softCapReached: cumulativeRaised >= this.softCap,
            hardCapReached: cumulativeRaised >= this.hardCap,
            communityScore: this.communityGrowth,
            brandScore: this.brandAwareness,
            networkScore: this.networkEffects,
            overallSuccessScore: finalOverallSuccess,
            
            history: this.history
        };
    }
    
    updateCommunityGrowth(demand, effort, day) {
        // Community grows with sustained engagement
        const engagementFactor = Math.min(demand / 100, 1); // Normalize demand
        const effortFactor = Math.min(effort / 10, 1); // Normalize effort
        const momentumFactor = day <= 10 ? 1.2 : day >= 25 ? 0.8 : 1.0; // Early momentum bonus
        
        this.communityGrowth += engagementFactor * effortFactor * momentumFactor * 10;
    }
    
    updateBrandAwareness(effort, cumulativeRaised) {
        // Brand awareness grows with marketing effort and funding visibility
        const effortContribution = effort * 2;
        const visibilityBonus = cumulativeRaised > this.target * 0.5 ? 20 : 0;
        
        this.brandAwareness += effortContribution + visibilityBonus;
    }
    
    updateNetworkEffects(cumulativeDemand, day) {
        // Network effects compound with user base and time
        const userBase = cumulativeDemand / 100; // Normalize
        const timeBonus = Math.sqrt(day); // Time-based network growth
        
        this.networkEffects += userBase * timeBonus;
    }
    
    getFundingSuccessLevel(raised) {
        if (raised >= this.hardCap) return 'Exceptional';
        if (raised >= this.target) return 'Full Success';
        if (raised >= this.softCap) return 'Partial Success';
        return 'Failed';
    }
    
    getOverallSuccessScore(raised, day) {
        // Weighted composite score (0-100)
        const fundingWeight = 0.4;
        const communityWeight = 0.25;
        const brandWeight = 0.2;
        const networkWeight = 0.15;
        
        const fundingScore = Math.min((raised / this.target) * 100, 100);
        const communityScore = Math.min(this.communityGrowth / 5, 100); // Normalize
        const brandScore = Math.min(this.brandAwareness / 1000, 100); // Normalize
        const networkScore = Math.min(this.networkEffects / 50, 100); // Normalize
        
        return (fundingScore * fundingWeight) + 
               (communityScore * communityWeight) + 
               (brandScore * brandWeight) + 
               (networkScore * networkWeight);
    }
}

// 7.1 Funding Thresholds Experiment
class FundingThresholdsExperiment extends BaseExperiment {
    constructor() {
        super('funding-thresholds', 'Funding Thresholds',
              'Test impact of different soft cap and hard cap thresholds');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Funding Thresholds Experiment...');
        
        // Test different threshold configurations
        const thresholdConfigs = [
            { softCap: 0.4, hardCap: 1.2, name: 'Conservative (40%/120%)' },
            { softCap: 0.5, hardCap: 1.5, name: 'Moderate (50%/150%)' },
            { softCap: 0.6, hardCap: 1.8, name: 'Standard (60%/180%)' },
            { softCap: 0.7, hardCap: 2.0, name: 'Ambitious (70%/200%)' },
            { softCap: 0.8, hardCap: 2.5, name: 'Aggressive (80%/250%)' }
        ];
        
        const results = [];
        const numTrials = 100;
        
        for (const config of thresholdConfigs) {
            console.log(`Testing ${config.name} thresholds`);
            
            let fullSuccessCount = 0;
            let partialSuccessCount = 0;
            let exceptionalCount = 0;
            let avgTotalRaised = 0;
            let avgOverallScore = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new SuccessMetricsCrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    softCap: parameters.target * config.softCap,
                    hardCap: parameters.target * config.hardCap
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
                
                const result = model.simulateCampaignWithMetrics(strategy);
                
                // Count different success levels
                if (result.fundingLevel === 'Exceptional') exceptionalCount++;
                if (result.fundingLevel === 'Full Success') fullSuccessCount++;
                if (result.fundingLevel === 'Partial Success') partialSuccessCount++;
                
                avgTotalRaised += result.totalRaised;
                avgOverallScore += result.overallSuccessScore;
            }
            
            results.push({
                name: config.name,
                softCapRatio: config.softCap,
                hardCapRatio: config.hardCap,
                exceptionalRate: (exceptionalCount / numTrials) * 100,
                fullSuccessRate: (fullSuccessCount / numTrials) * 100,
                partialSuccessRate: (partialSuccessCount / numTrials) * 100,
                combinedSuccessRate: ((fullSuccessCount + partialSuccessCount) / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgOverallScore: avgOverallScore / numTrials,
                trials: numTrials
            });
        }
        
        const bestThreshold = results.reduce((best, current) => 
            current.avgOverallScore > best.avgOverallScore ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'funding-thresholds',
            results: results,
            optimal: bestThreshold,
            summary: `Best threshold: ${bestThreshold.name} (${bestThreshold.avgOverallScore.toFixed(1)} overall score, ${bestThreshold.combinedSuccessRate.toFixed(1)}% success rate)`,
            insights: this.generateThresholdInsights(results)
        };
    }
    
    generateThresholdInsights(results) {
        const conservative = results.find(r => r.softCapRatio <= 0.5);
        const aggressive = results.find(r => r.softCapRatio >= 0.7);
        const moderate = results.filter(r => r.softCapRatio > 0.5 && r.softCapRatio < 0.7);
        
        const avgModerateScore = moderate.reduce((sum, r) => sum + r.avgOverallScore, 0) / moderate.length;
        
        return {
            conservativeVsAggressive: conservative.combinedSuccessRate > aggressive.combinedSuccessRate ?
                'Conservative thresholds improve success rates' :
                'Aggressive thresholds don\'t significantly hurt success rates',
            exceptionalOutcomes: 'Higher hard caps enable exceptional funding outcomes',
            balancedApproach: `Moderate thresholds provide balanced risk-reward (${avgModerateScore.toFixed(1)} avg score)`,
            strategyAlignment: 'Threshold setting should align with campaign strategy and risk tolerance',
            recommendation: 'Set soft cap at 50-60% of target, hard cap at 150-200% for optimal balance'
        };
    }
}

// 7.2 Success Metrics Beyond Funding Experiment
class SuccessMetricsExperiment extends BaseExperiment {
    constructor() {
        super('success-metrics', 'Success Metrics Beyond Funding',
              'Evaluate campaigns using community, brand, and network metrics');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Success Metrics Beyond Funding Experiment...');
        
        // Test different strategy focus areas
        const focusStrategies = [
            { name: 'Funding-Focused', effortAllocation: { funding: 0.8, community: 0.1, brand: 0.1 } },
            { name: 'Community-Focused', effortAllocation: { funding: 0.4, community: 0.4, brand: 0.2 } },
            { name: 'Brand-Focused', effortAllocation: { funding: 0.4, community: 0.2, brand: 0.4 } },
            { name: 'Balanced', effortAllocation: { funding: 0.5, community: 0.25, brand: 0.25 } },
            { name: 'Long-term', effortAllocation: { funding: 0.3, community: 0.35, brand: 0.35 } }
        ];
        
        const results = [];
        const numTrials = 100;
        
        for (const focusStrategy of focusStrategies) {
            console.log(`Testing ${focusStrategy.name} strategy`);
            
            let avgFundingScore = 0;
            let avgCommunityScore = 0;
            let avgBrandScore = 0;
            let avgNetworkScore = 0;
            let avgOverallScore = 0;
            let successCount = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new SuccessMetricsCrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    softCap: parameters.target * 0.6,
                    hardCap: parameters.target * 1.5
                });
                
                // Create custom strategy based on focus allocation
                const strategy = {
                    getPrice: (day, cumulativeRaised, target) => parameters.initialPrice,
                    getEffort: (day, cumulativeRaised, target) => {
                        const baseEffort = 150 / (parameters.duration);
                        const allocation = focusStrategy.effortAllocation;
                        
                        // Different focus areas have different effectiveness multipliers
                        const fundingMultiplier = 1.0;
                        const communityMultiplier = 0.8; // Slower immediate impact
                        const brandMultiplier = 0.9; // Medium-term impact
                        
                        return baseEffort * (
                            allocation.funding * fundingMultiplier +
                            allocation.community * communityMultiplier +
                            allocation.brand * brandMultiplier
                        );
                    }
                };
                
                const result = model.simulateCampaignWithMetrics(strategy);
                
                if (result.success) successCount++;
                
                // Normalize scores for comparison
                avgFundingScore += Math.min((result.totalRaised / parameters.target) * 100, 100);
                avgCommunityScore += Math.min(result.communityScore / 5, 100);
                avgBrandScore += Math.min(result.brandScore / 1000, 100);
                avgNetworkScore += Math.min(result.networkScore / 50, 100);
                avgOverallScore += result.overallSuccessScore;
            }
            
            results.push({
                strategy: focusStrategy.name,
                allocation: focusStrategy.effortAllocation,
                successRate: (successCount / numTrials) * 100,
                avgFundingScore: avgFundingScore / numTrials,
                avgCommunityScore: avgCommunityScore / numTrials,
                avgBrandScore: avgBrandScore / numTrials,
                avgNetworkScore: avgNetworkScore / numTrials,
                avgOverallScore: avgOverallScore / numTrials,
                trials: numTrials
            });
        }
        
        const bestStrategy = results.reduce((best, current) => 
            current.avgOverallScore > best.avgOverallScore ? current : best
        );
        
        // Find best performer in each category
        const bestFunding = results.reduce((best, current) => 
            current.avgFundingScore > best.avgFundingScore ? current : best
        );
        const bestCommunity = results.reduce((best, current) => 
            current.avgCommunityScore > best.avgCommunityScore ? current : best
        );
        const bestBrand = results.reduce((best, current) => 
            current.avgBrandScore > best.avgBrandScore ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'success-metrics',
            results: results,
            optimal: bestStrategy,
            categoryLeaders: {
                funding: bestFunding.strategy,
                community: bestCommunity.strategy,
                brand: bestBrand.strategy
            },
            summary: `Best overall strategy: ${bestStrategy.strategy} (${bestStrategy.avgOverallScore.toFixed(1)} overall score)`,
            insights: this.generateSuccessMetricsInsights(results)
        };
    }
    
    generateSuccessMetricsInsights(results) {
        const fundingFocused = results.find(r => r.strategy === 'Funding-Focused');
        const communityFocused = results.find(r => r.strategy === 'Community-Focused');
        const balanced = results.find(r => r.strategy === 'Balanced');
        const longTerm = results.find(r => r.strategy === 'Long-term');
        
        return {
            holisticValue: balanced.avgOverallScore > fundingFocused.avgOverallScore ?
                'Holistic approach outperforms pure funding focus' :
                'Funding focus remains most effective overall',
            communityBuilding: communityFocused.avgCommunityScore > balanced.avgCommunityScore ?
                'Dedicated community focus significantly improves community metrics' :
                'Balanced approach is sufficient for community building',
            longTermVsShortTerm: longTerm.avgOverallScore > fundingFocused.avgOverallScore ?
                'Long-term value creation strategies outperform short-term funding focus' :
                'Short-term funding success remains priority',
            metricTradeoffs: 'Different strategic focuses create clear metric trade-offs',
            recommendation: 'Choose strategy alignment based on project goals and success definitions'
        };
    }
}

// Register success criteria experiments
if (typeof experimentFramework !== 'undefined') {
    experimentFramework.registerExperiment('funding-thresholds', new FundingThresholdsExperiment());
    experimentFramework.registerExperiment('success-metrics', new SuccessMetricsExperiment());
    console.log('✅ Success criteria experiments registered');
}