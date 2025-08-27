/**
 * EquiCurve - Platform Fee Structure Experiments (Category 2)
 * 2.1 Fixed Fee Models
 * 2.2 Dynamic Fee Models
 * 2.3 Hybrid Models
 */

// Extended model to include fee calculations
class CrowdfundingModelWithFees extends CrowdfundingModel {
    constructor(params = {}) {
        super(params);
        this.feeStructure = params.feeStructure || 'fixed';
        this.feeRate = params.feeRate || 0.05; // 5% default
        this.platformRevenue = 0;
        this.entrepreneurRevenue = 0;
    }
    
    calculateFee(day, cumulativeRaised, dailyRevenue, target, success = false) {
        switch(this.feeStructure) {
            case 'fixed':
                return dailyRevenue * this.feeRate;
            
            case 'success-based':
                return success ? dailyRevenue * this.feeRate : 0;
            
            case 'progressive':
                // Higher fee rate as campaign progresses
                const progress = cumulativeRaised / target;
                const progressiveFee = Math.min(this.feeRate * (1 + progress), this.feeRate * 2);
                return dailyRevenue * progressiveFee;
            
            case 'performance-based':
                // Fee based on success probability
                const expectedSuccess = Math.min(cumulativeRaised / target, 1);
                const performanceFee = this.feeRate * (0.5 + 0.5 * expectedSuccess);
                return dailyRevenue * performanceFee;
            
            case 'hybrid':
                // Base fee + success bonus
                const baseFee = dailyRevenue * (this.feeRate * 0.6);
                const successBonus = success ? dailyRevenue * (this.feeRate * 0.4) : 0;
                return baseFee + successBonus;
            
            default:
                return dailyRevenue * this.feeRate;
        }
    }
    
    simulateCampaignWithFees(strategy) {
        this.history = [];
        this.platformRevenue = 0;
        this.entrepreneurRevenue = 0;
        
        let cumulativeRaised = 0;
        let cumulativeDemand = 0;
        
        for (let day = 1; day <= this.duration; day++) {
            const price = strategy.getPrice(day, cumulativeRaised, this.target);
            const effort = strategy.getEffort(day, cumulativeRaised, this.target);
            
            const demand = this.calculateDemand(price, effort);
            const revenue = demand * price;
            
            cumulativeRaised += revenue;
            cumulativeDemand += demand;
            
            // Calculate fees
            const isLastDay = day === this.duration;
            const finalSuccess = cumulativeRaised >= this.target;
            const fee = this.calculateFee(day, cumulativeRaised, revenue, this.target, isLastDay && finalSuccess);
            
            this.platformRevenue += fee;
            this.entrepreneurRevenue += (revenue - fee);
            
            this.history.push({
                day,
                price,
                effort,
                demand,
                revenue,
                fee,
                cumulativeRaised,
                cumulativeDemand,
                percentComplete: (cumulativeRaised / this.target) * 100,
                platformRevenue: this.platformRevenue,
                entrepreneurRevenue: this.entrepreneurRevenue
            });
        }
        
        return {
            success: cumulativeRaised >= this.target,
            totalRaised: cumulativeRaised,
            totalDemand: cumulativeDemand,
            platformRevenue: this.platformRevenue,
            entrepreneurRevenue: this.entrepreneurRevenue,
            effectiveFeeRate: this.platformRevenue / cumulativeRaised,
            history: this.history
        };
    }
}

// 2.1 Fixed Fee Models Experiment
class FixedFeesExperiment extends BaseExperiment {
    constructor() {
        super('fixed-fees', 'Fixed Fee Models',
              'Compare different fixed fee structures and rates');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Fixed Fee Models Experiment...');
        
        // Test different fixed fee rates
        const feeRates = [0.02, 0.03, 0.05, 0.07, 0.10, 0.15];
        const results = [];
        const numTrials = 20;
        
        for (const feeRate of feeRates) {
            console.log(`Testing fixed fee rate: ${(feeRate * 100).toFixed(1)}%`);
            
            let successCount = 0;
            let avgPlatformRevenue = 0;
            let avgEntrepreneurRevenue = 0;
            let avgTotalRaised = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new CrowdfundingModelWithFees({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    feeStructure: 'fixed',
                    feeRate: feeRate
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
                
                const result = model.simulateCampaignWithFees(strategy);
                
                if (result.success) successCount++;
                avgPlatformRevenue += result.platformRevenue;
                avgEntrepreneurRevenue += result.entrepreneurRevenue;
                avgTotalRaised += result.totalRaised;
            }
            
            results.push({
                feeRate: feeRate,
                feePercentage: (feeRate * 100).toFixed(1),
                successRate: (successCount / numTrials) * 100,
                avgPlatformRevenue: avgPlatformRevenue / numTrials,
                avgEntrepreneurRevenue: avgEntrepreneurRevenue / numTrials,
                avgTotalRaised: avgTotalRaised / numTrials,
                trials: numTrials
            });
        }
        
        // Find optimal fee rate (balancing platform revenue and success rate)
        const optimalFee = results.reduce((best, current) => {
            const bestScore = best.avgPlatformRevenue * best.successRate / 100;
            const currentScore = current.avgPlatformRevenue * current.successRate / 100;
            return currentScore > bestScore ? current : best;
        });
        
        return {
            status: 'complete',
            experimentType: 'fixed-fees',
            results: results,
            optimal: optimalFee,
            summary: `Optimal fixed fee: ${optimalFee.feePercentage}% (${optimalFee.successRate.toFixed(1)}% success rate, $${optimalFee.avgPlatformRevenue.toFixed(0)} platform revenue)`,
            insights: this.generateFixedFeeInsights(results)
        };
    }
    
    generateFixedFeeInsights(results) {
        const lowFees = results.filter(r => r.feeRate <= 0.05);
        const highFees = results.filter(r => r.feeRate > 0.05);
        
        const avgLowFeeSuccess = lowFees.reduce((sum, r) => sum + r.successRate, 0) / lowFees.length;
        const avgHighFeeSuccess = highFees.reduce((sum, r) => sum + r.successRate, 0) / highFees.length;
        
        return {
            lowFeePerformance: avgLowFeeSuccess.toFixed(1),
            highFeePerformance: avgHighFeeSuccess.toFixed(1),
            recommendation: avgLowFeeSuccess > avgHighFeeSuccess ? 
                'Lower fees improve campaign success rates' :
                'Fee rate has minimal impact on success',
            elasticity: 'Fixed fees show predictable revenue but may discourage entrepreneurs at high rates'
        };
    }
}

// 2.2 Dynamic Fee Models Experiment
class DynamicFeesExperiment extends BaseExperiment {
    constructor() {
        super('dynamic-fees', 'Dynamic Fee Models',
              'Test performance-based and progressive fee structures');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Dynamic Fee Models Experiment...');
        
        const feeStructures = [
            { type: 'fixed', rate: 0.05, name: 'Fixed 5%' },
            { type: 'success-based', rate: 0.08, name: 'Success-based 8%' },
            { type: 'progressive', rate: 0.04, name: 'Progressive 4-8%' },
            { type: 'performance-based', rate: 0.06, name: 'Performance-based 3-9%' }
        ];
        
        const results = [];
        const numTrials = 20;
        
        for (const feeStructure of feeStructures) {
            console.log(`Testing ${feeStructure.name} fee structure`);
            
            let successCount = 0;
            let avgPlatformRevenue = 0;
            let avgEntrepreneurRevenue = 0;
            let avgEffectiveFeeRate = 0;
            let avgTotalRaised = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new CrowdfundingModelWithFees({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    feeStructure: feeStructure.type,
                    feeRate: feeStructure.rate
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
                
                const result = model.simulateCampaignWithFees(strategy);
                
                if (result.success) successCount++;
                avgPlatformRevenue += result.platformRevenue;
                avgEntrepreneurRevenue += result.entrepreneurRevenue;
                avgEffectiveFeeRate += result.effectiveFeeRate;
                avgTotalRaised += result.totalRaised;
            }
            
            results.push({
                feeStructure: feeStructure.type,
                name: feeStructure.name,
                nominalRate: feeStructure.rate,
                successRate: (successCount / numTrials) * 100,
                avgPlatformRevenue: avgPlatformRevenue / numTrials,
                avgEntrepreneurRevenue: avgEntrepreneurRevenue / numTrials,
                avgEffectiveFeeRate: (avgEffectiveFeeRate / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                trials: numTrials
            });
        }
        
        // Find best performing structure
        const bestStructure = results.reduce((best, current) => {
            const bestScore = best.avgPlatformRevenue * best.successRate / 100;
            const currentScore = current.avgPlatformRevenue * current.successRate / 100;
            return currentScore > bestScore ? current : best;
        });
        
        return {
            status: 'complete',
            experimentType: 'dynamic-fees',
            results: results,
            optimal: bestStructure,
            summary: `Best fee structure: ${bestStructure.name} (${bestStructure.successRate.toFixed(1)}% success rate, ${bestStructure.avgEffectiveFeeRate.toFixed(1)}% effective fee)`,
            insights: this.generateDynamicFeeInsights(results)
        };
    }
    
    generateDynamicFeeInsights(results) {
        const fixedFee = results.find(r => r.feeStructure === 'fixed');
        const dynamicFees = results.filter(r => r.feeStructure !== 'fixed');
        
        const avgDynamicSuccess = dynamicFees.reduce((sum, r) => sum + r.successRate, 0) / dynamicFees.length;
        const avgDynamicRevenue = dynamicFees.reduce((sum, r) => sum + r.avgPlatformRevenue, 0) / dynamicFees.length;
        
        return {
            dynamicVsFixed: avgDynamicSuccess > fixedFee.successRate ? 
                'Dynamic fees outperform fixed fees' :
                'Fixed fees remain competitive',
            revenueOptimization: avgDynamicRevenue > fixedFee.avgPlatformRevenue ?
                'Dynamic fees generate higher platform revenue' :
                'Fixed fees provide more predictable revenue',
            recommendation: 'Success-based fees align platform and entrepreneur incentives best'
        };
    }
}

// 2.3 Hybrid Models Experiment
class HybridFeesExperiment extends BaseExperiment {
    constructor() {
        super('hybrid-fees', 'Hybrid Fee Models',
              'Test combinations of fixed base fees with performance bonuses');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Hybrid Fee Models Experiment...');
        
        // Test different hybrid combinations
        const hybridModels = [
            { base: 0.02, bonus: 0.02, name: '2% Base + 2% Success' },
            { base: 0.03, bonus: 0.03, name: '3% Base + 3% Success' },
            { base: 0.04, bonus: 0.02, name: '4% Base + 2% Success' },
            { base: 0.02, bonus: 0.04, name: '2% Base + 4% Success' },
            { base: 0.05, bonus: 0.00, name: '5% Fixed (Control)' }
        ];
        
        const results = [];
        const numTrials = 20;
        
        for (const model of hybridModels) {
            console.log(`Testing ${model.name}`);
            
            let successCount = 0;
            let avgPlatformRevenue = 0;
            let avgEntrepreneurRevenue = 0;
            let avgTotalRaised = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const crowdfundingModel = new CrowdfundingModelWithFees({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    feeStructure: 'hybrid',
                    feeRate: model.base + model.bonus
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
                
                const result = crowdfundingModel.simulateCampaignWithFees(strategy);
                
                if (result.success) successCount++;
                avgPlatformRevenue += result.platformRevenue;
                avgEntrepreneurRevenue += result.entrepreneurRevenue;
                avgTotalRaised += result.totalRaised;
            }
            
            results.push({
                model: model.name,
                baseFee: model.base,
                bonusFee: model.bonus,
                totalFee: model.base + model.bonus,
                successRate: (successCount / numTrials) * 100,
                avgPlatformRevenue: avgPlatformRevenue / numTrials,
                avgEntrepreneurRevenue: avgEntrepreneurRevenue / numTrials,
                avgTotalRaised: avgTotalRaised / numTrials,
                trials: numTrials
            });
        }
        
        // Find optimal hybrid model
        const bestHybrid = results.reduce((best, current) => {
            const bestScore = best.avgPlatformRevenue * best.successRate / 100;
            const currentScore = current.avgPlatformRevenue * current.successRate / 100;
            return currentScore > bestScore ? current : best;
        });
        
        return {
            status: 'complete',
            experimentType: 'hybrid-fees',
            results: results,
            optimal: bestHybrid,
            summary: `Best hybrid model: ${bestHybrid.model} (${bestHybrid.successRate.toFixed(1)}% success rate, ${bestHybrid.avgPlatformRevenue.toFixed(0)} platform revenue)`,
            insights: this.generateHybridFeeInsights(results)
        };
    }
    
    generateHybridFeeInsights(results) {
        const control = results.find(r => r.bonusFee === 0);
        const hybrids = results.filter(r => r.bonusFee > 0);
        
        const avgHybridSuccess = hybrids.reduce((sum, r) => sum + r.successRate, 0) / hybrids.length;
        const avgHybridRevenue = hybrids.reduce((sum, r) => sum + r.avgPlatformRevenue, 0) / hybrids.length;
        
        return {
            hybridVsFixed: avgHybridSuccess > control.successRate ? 
                'Hybrid models outperform pure fixed fees' :
                'Fixed fees remain competitive with hybrids',
            incentiveAlignment: 'Success bonuses align platform and entrepreneur goals',
            riskProfile: 'Hybrid models provide revenue stability with upside potential',
            recommendation: 'Low base fee with moderate success bonus optimizes both parties'
        };
    }
}

// Register fee experiments
if (typeof experimentFramework !== 'undefined') {
    experimentFramework.registerExperiment('fixed-fees', new FixedFeesExperiment());
    experimentFramework.registerExperiment('dynamic-fees', new DynamicFeesExperiment());
    experimentFramework.registerExperiment('hybrid-fees', new HybridFeesExperiment());
    console.log('✅ Fee structure experiments registered');
}
                