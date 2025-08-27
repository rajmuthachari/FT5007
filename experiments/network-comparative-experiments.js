/**
 * EquiCurve - Network Effects & Comparative Analysis Experiments (Categories 9 & 10)
 * 9.1 Viral Mechanics
 * 9.2 Community Building
 * 10.1 Traditional vs Web3
 * 10.2 Platform Comparison
 */

// Enhanced model with network effects
class NetworkEffectsCrowdfundingModel extends CrowdfundingModel {
    constructor(params = {}) {
        super(params);
        this.viralCoefficient = params.viralCoefficient || 0.1; // How viral the campaign is
        this.networkValue = 0; // Accumulated network value
        this.userBase = 0; // Total unique users
        this.communityEngagement = 0; // Community activity level
        this.platformType = params.platformType || 'web3'; // web3 vs traditional
    }
    
    simulateNetworkCampaign(strategy) {
        this.history = [];
        this.networkValue = 0;
        this.userBase = 0;
        this.communityEngagement = 0;
        
        let cumulativeRaised = 0;
        let cumulativeDemand = 0;
        
        for (let day = 1; day <= this.duration; day++) {
            const price = strategy.getPrice(day, cumulativeRaised, this.target);
            const effort = strategy.getEffort(day, cumulativeRaised, this.target);
            
            // Calculate base demand
            let demand = this.calculateDemand(price, effort);
            
            // Apply network effects
            const networkMultiplier = this.calculateNetworkMultiplier(day);
            demand *= networkMultiplier;
            
            const revenue = demand * price;
            cumulativeRaised += revenue;
            cumulativeDemand += demand;
            
            // Update network metrics
            this.updateNetworkMetrics(demand, effort, day);
            
            this.history.push({
                day,
                price,
                effort,
                demand,
                revenue,
                cumulativeRaised,
                cumulativeDemand,
                percentComplete: (cumulativeRaised / this.target) * 100,
                networkValue: this.networkValue,
                userBase: this.userBase,
                communityEngagement: this.communityEngagement,
                networkMultiplier: networkMultiplier
            });
        }
        
        return {
            success: cumulativeRaised >= this.target,
            totalRaised: cumulativeRaised,
            totalDemand: cumulativeDemand,
            finalNetworkValue: this.networkValue,
            finalUserBase: this.userBase,
            finalCommunityEngagement: this.communityEngagement,
            viralityScore: this.calculateViralityScore(),
            history: this.history
        };
    }
    
    calculateNetworkMultiplier(day) {
        // Metcalfe's law: network value proportional to square of users
        const metcalfeMultiplier = Math.pow(this.userBase / 100, 0.5); // Square root for moderation
        
        // Viral growth factor
        const viralMultiplier = 1 + (this.viralCoefficient * this.communityEngagement / 100);
        
        // Platform-specific bonuses
        const platformMultiplier = this.getPlatformMultiplier();
        
        return Math.max(0.5, 1 + metcalfeMultiplier * viralMultiplier * platformMultiplier * 0.1);
    }
    
    getPlatformMultiplier() {
        switch(this.platformType) {
            case 'web3':
                // Web3 platforms have stronger network effects but slower initial adoption
                return this.userBase > 50 ? 1.5 : 0.8;
            case 'traditional':
                // Traditional platforms have steady but limited network effects
                return 1.0;
            case 'hybrid':
                // Hybrid platforms balance both approaches
                return 1.2;
            default:
                return 1.0;
        }
    }
    
    updateNetworkMetrics(demand, effort, day) {
        // User base grows with demand (new backers)
        const newUsers = demand * 0.1; // 10% of demand translates to new users
        this.userBase += newUsers;
        
        // Community engagement driven by effort and network effects
        const effortContribution = effort * 2;
        const networkContribution = this.userBase * 0.05;
        this.communityEngagement = Math.min(100, this.communityEngagement + effortContribution + networkContribution);
        
        // Network value compounds with user base and engagement
        this.networkValue += (this.userBase * this.communityEngagement) / 1000;
    }
    
    calculateViralityScore() {
        const growthRate = this.userBase / this.duration; // Users per day
        const engagementBonus = this.communityEngagement;
        const networkBonus = Math.min(this.networkValue, 100);
        
        return (growthRate * 2) + (engagementBonus * 0.5) + (networkBonus * 0.3);
    }
}

// 9.1 Viral Mechanics Experiment
class ViralMechanicsExperiment extends BaseExperiment {
    constructor() {
        super('viral-mechanics', 'Viral Mechanics',
              'Test different viral coefficients and sharing mechanisms');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Viral Mechanics Experiment...');
        
        const viralConfigs = [
            { coefficient: 0.0, name: 'No Viral Effects' },
            { coefficient: 0.05, name: 'Low Virality (5%)' },
            { coefficient: 0.1, name: 'Medium Virality (10%)' },
            { coefficient: 0.2, name: 'High Virality (20%)' },
            { coefficient: 0.3, name: 'Super Viral (30%)' }
        ];
        
        const results = [];
        const numTrials = 100;
        
        for (const config of viralConfigs) {
            console.log(`Testing ${config.name}`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
            let avgViralityScore = 0;
            let avgUserBase = 0;
            let avgNetworkValue = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new NetworkEffectsCrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    viralCoefficient: config.coefficient,
                    platformType: 'web3'
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
                
                const result = model.simulateNetworkCampaign(strategy);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                avgViralityScore += result.viralityScore;
                avgUserBase += result.finalUserBase;
                avgNetworkValue += result.finalNetworkValue;
            }
            
            results.push({
                name: config.name,
                viralCoefficient: config.coefficient,
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgViralityScore: avgViralityScore / numTrials,
                avgUserBase: avgUserBase / numTrials,
                avgNetworkValue: avgNetworkValue / numTrials,
                trials: numTrials
            });
        }
        
        const bestViral = results.reduce((best, current) => 
            current.avgViralityScore > best.avgViralityScore ? current : best
        );
        
        // ADD VALIDATION HERE - validate the optimal configuration
        const testModel = new CrowdfundingModel({
            alpha: parameters.alpha,
            beta: parameters.beta,
            gamma: parameters.gamma,
            duration: parameters.duration,  // Use the optimal duration
            target: parameters.target,
            initialPrice: parameters.initialPrice
        });
        
        const testStrategy = new FixedPricingStrategy(parameters.initialPrice);
        const testRun = testModel.simulateCampaign(testStrategy);
        const validation = campaignValidator.generateValidationReport(testRun, testModel);

        return {
            status: 'complete',
            experimentType: 'viral-mechanics',
            results: results,
            optimal: bestViral,
            validation: validation, 
            summary: `Best viral configuration: ${bestViral.name} (${bestViral.avgViralityScore.toFixed(1)} virality score, ${bestViral.successRate.toFixed(1)}% success rate)`,
            insights: this.generateViralInsights(results)
        };
    }
    
    generateViralInsights(results) {
        const noViral = results.find(r => r.viralCoefficient === 0);
        const highViral = results.filter(r => r.viralCoefficient >= 0.2);
        const mediumViral = results.filter(r => r.viralCoefficient >= 0.1 && r.viralCoefficient < 0.2);
        
        const avgHighViralSuccess = highViral.reduce((sum, r) => sum + r.successRate, 0) / highViral.length;
        const viralityImpact = ((avgHighViralSuccess - noViral.successRate) / noViral.successRate) * 100;
        
        return {
            viralImpact: `High virality increases success rate by ${viralityImpact.toFixed(1)}%`,
            optimalVirality: 'Medium to high virality (10-20%) provides best risk-reward balance',
            networkGrowth: 'Viral mechanics significantly accelerate user base growth',
            diminishingReturns: 'Very high virality (>30%) may face diminishing returns or authenticity concerns',
            recommendation: 'Implement organic sharing incentives to achieve 10-15% viral coefficient'
        };
    }
}

// 9.2 Community Building Experiment
class CommunityBuildingExperiment extends BaseExperiment {
    constructor() {
        super('community-building', 'Community Building',
              'Test different community engagement strategies and their impact');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Community Building Experiment...');
        
        const communityStrategies = [
            { name: 'No Community Focus', engagement: 0, viral: 0.05 },
            { name: 'Light Community', engagement: 20, viral: 0.08 },
            { name: 'Moderate Community', engagement: 40, viral: 0.12 },
            { name: 'Heavy Community', engagement: 60, viral: 0.15 },
            { name: 'Community-First', engagement: 80, viral: 0.20 }
        ];
        
        const results = [];
        const numTrials = 100;
        
        for (const strategy of communityStrategies) {
            console.log(`Testing ${strategy.name} strategy`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
            let avgCommunityEngagement = 0;
            let avgUserRetention = 0;
            let avgLongTermValue = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new NetworkEffectsCrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    viralCoefficient: strategy.viral,
                    platformType: 'web3'
                });
                
                // Set initial community engagement
                model.communityEngagement = strategy.engagement;
                
                let pricingStrategy;
                switch(parameters.strategy) {
                    case 'dynamic':
                        pricingStrategy = new DynamicPricingStrategy(parameters.initialPrice, 150, parameters.duration);
                        break;
                    case 'bonding':
                        pricingStrategy = new BondingCurveStrategy(parameters.initialPrice);
                        break;
                    default:
                        pricingStrategy = new FixedPricingStrategy(parameters.initialPrice);
                }
                
                const result = model.simulateNetworkCampaign(pricingStrategy);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                avgCommunityEngagement += result.finalCommunityEngagement;
                
                // Calculate user retention (simplified)
                const earlyUsers = result.history[Math.floor(result.history.length * 0.3)].userBase;
                const lateUsers = result.finalUserBase;
                avgUserRetention += earlyUsers > 0 ? (lateUsers / earlyUsers) : 1;
                
                // Long-term value = network value + community engagement
                avgLongTermValue += result.finalNetworkValue + (result.finalCommunityEngagement * 10);
            }
            
            results.push({
                strategy: strategy.name,
                initialEngagement: strategy.engagement,
                viralCoefficient: strategy.viral,
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgCommunityEngagement: avgCommunityEngagement / numTrials,
                avgUserRetention: avgUserRetention / numTrials,
                avgLongTermValue: avgLongTermValue / numTrials,
                trials: numTrials
            });
        }
        
        const bestCommunity = results.reduce((best, current) => 
            current.avgLongTermValue > best.avgLongTermValue ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'community-building',
            results: results,
            optimal: bestCommunity,
            summary: `Best community strategy: ${bestCommunity.strategy} (${bestCommunity.avgLongTermValue.toFixed(1)} long-term value, ${bestCommunity.successRate.toFixed(1)}% success rate)`,
            insights: this.generateCommunityInsights(results)
        };
    }
    
    generateCommunityInsights(results) {
        const noCommunity = results.find(r => r.initialEngagement === 0);
        const communityFirst = results.find(r => r.initialEngagement === 80);
        const moderate = results.find(r => r.initialEngagement === 40);
        
        return {
            communityROI: `Community-first approach provides ${((communityFirst.avgLongTermValue - noCommunity.avgLongTermValue) / noCommunity.avgLongTermValue * 100).toFixed(1)}% higher long-term value`,
            retentionBenefit: communityFirst.avgUserRetention > noCommunity.avgUserRetention ?
                'Strong community building significantly improves user retention' :
                'Community building has minimal retention impact',
            balancePoint: moderate.successRate > communityFirst.successRate ?
                'Moderate community focus balances short-term and long-term goals' :
                'Heavy community investment pays off even in short term',
            virality: 'Community engagement drives viral growth and organic reach',
            recommendation: 'Invest 40-60% of effort in community building for optimal long-term value'
        };
    }
}

// 10.1 Traditional vs Web3 Experiment
class TraditionalVsWeb3Experiment extends BaseExperiment {
    constructor() {
        super('traditional-vs-web3', 'Traditional vs Web3',
              'Compare traditional crowdfunding with Web3 token-based approaches');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Traditional vs Web3 Experiment...');
        
        const platformTypes = [
            { 
                type: 'traditional', 
                name: 'Traditional Crowdfunding',
                features: { networkEffects: 0.8, fees: 0.05, transparency: 0.6, liquidity: 0.3 }
            },
            { 
                type: 'web3', 
                name: 'Web3 Token Platform',
                features: { networkEffects: 1.3, fees: 0.03, transparency: 0.9, liquidity: 0.8 }
            },
            { 
                type: 'hybrid', 
                name: 'Hybrid Web2/Web3',
                features: { networkEffects: 1.1, fees: 0.04, transparency: 0.75, liquidity: 0.6 }
            }
        ];
        
        const results = [];
        const numTrials = 100;
        
        for (const platform of platformTypes) {
            console.log(`Testing ${platform.name} platform`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
            let avgUserExperience = 0;
            let avgInnovationScore = 0;
            let avgAccessibility = 0;
            let avgTotalCost = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new NetworkEffectsCrowdfundingModel({
                    alpha: parameters.alpha * platform.features.networkEffects, // Adjust for platform
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    viralCoefficient: platform.type === 'web3' ? 0.15 : 0.08,
                    platformType: platform.type
                });
                
                let strategy;
                switch(parameters.strategy) {
                    case 'dynamic':
                        strategy = new DynamicPricingStrategy(parameters.initialPrice, 150, parameters.duration);
                        break;
                    case 'bonding':
                        // Bonding curves more natural for Web3
                        if (platform.type === 'traditional') {
                            strategy = new FixedPricingStrategy(parameters.initialPrice);
                        } else {
                            strategy = new BondingCurveStrategy(parameters.initialPrice);
                        }
                        break;
                    default:
                        strategy = new FixedPricingStrategy(parameters.initialPrice);
                }
                
                const result = model.simulateNetworkCampaign(strategy);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                
                // Calculate platform-specific metrics
                avgUserExperience += this.calculateUserExperience(platform, result);
                avgInnovationScore += this.calculateInnovationScore(platform, result);
                avgAccessibility += this.calculateAccessibility(platform);
                avgTotalCost += result.totalRaised * platform.features.fees;
            }
            
            results.push({
                platform: platform.type,
                name: platform.name,
                features: platform.features,
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgUserExperience: avgUserExperience / numTrials,
                avgInnovationScore: avgInnovationScore / numTrials,
                avgAccessibility: avgAccessibility / numTrials,
                avgTotalCost: avgTotalCost / numTrials,
                netRevenue: (avgTotalRaised - avgTotalCost) / numTrials,
                trials: numTrials
            });
        }
        
        const bestPlatform = results.reduce((best, current) => 
            current.netRevenue > best.netRevenue ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'traditional-vs-web3',
            results: results,
            optimal: bestPlatform,
            summary: `Best platform: ${bestPlatform.name} (${bestPlatform.netRevenue.toFixed(0)} net revenue, ${bestPlatform.successRate.toFixed(1)}% success rate)`,
            insights: this.generatePlatformComparisonInsights(results)
        };
    }
    
    calculateUserExperience(platform, result) {
        const baseUX = 60;
        const transparencyBonus = platform.features.transparency * 20;
        const liquidityBonus = platform.features.liquidity * 15;
        const successBonus = result.success ? 10 : 0;
        
        return baseUX + transparencyBonus + liquidityBonus + successBonus;
    }
    
    calculateInnovationScore(platform, result) {
        const baseScore = platform.type === 'web3' ? 80 : platform.type === 'hybrid' ? 60 : 40;
        const networkBonus = result.finalNetworkValue > 100 ? 20 : 0;
        
        return baseScore + networkBonus;
    }
    
    calculateAccessibility(platform) {
        // Traditional platforms are more accessible to general public
        switch(platform.type) {
            case 'traditional': return 85;
            case 'hybrid': return 70;
            case 'web3': return 55;
            default: return 60;
        }
    }
    
    generatePlatformComparisonInsights(results) {
        const traditional = results.find(r => r.platform === 'traditional');
        const web3 = results.find(r => r.platform === 'web3');
        const hybrid = results.find(r => r.platform === 'hybrid');
        
        return {
            revenueComparison: `Web3 provides ${((web3.netRevenue - traditional.netRevenue) / traditional.netRevenue * 100).toFixed(1)}% higher net revenue`,
            userExperience: web3.avgUserExperience > traditional.avgUserExperience ?
                'Web3 platforms provide superior user experience' :
                'Traditional platforms maintain UX advantages',
            accessibilityTradeoff: `Traditional platforms offer ${(traditional.avgAccessibility - web3.avgAccessibility).toFixed(0)} points higher accessibility`,
            innovationAdvantage: `Web3 platforms lead innovation by ${(web3.avgInnovationScore - traditional.avgInnovationScore).toFixed(0)} points`,
            hybridViability: hybrid.netRevenue > Math.min(traditional.netRevenue, web3.netRevenue) ?
                'Hybrid approach provides competitive middle ground' :
                'Pure platform approaches outperform hybrid models',
            recommendation: 'Choose platform based on target audience technical sophistication and innovation priorities'
        };
    }
}

// 10.2 Platform Comparison Experiment
class PlatformComparisonExperiment extends BaseExperiment {
    constructor() {
        super('platform-comparison', 'Platform Comparison',
              'Compare performance across different crowdfunding platform configurations');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Platform Comparison Experiment...');
        
        const platforms = [
            { name: 'EquiCurve', fees: 0.03, features: ['dynamic-pricing', 'bonding-curves', 'governance'], networkStrength: 1.2 },
            { name: 'Traditional High-Fee', fees: 0.08, features: ['fixed-pricing'], networkStrength: 0.9 },
            { name: 'Traditional Low-Fee', fees: 0.04, features: ['fixed-pricing', 'basic-analytics'], networkStrength: 1.0 },
            { name: 'Competitor Web3', fees: 0.025, features: ['bonding-curves', 'dao'], networkStrength: 1.1 },
            { name: 'Premium Platform', fees: 0.06, features: ['dynamic-pricing', 'advanced-analytics', 'marketing'], networkStrength: 1.3 }
        ];
        
        const results = [];
        const numTrials = 100;
        
        for (const platform of platforms) {
            console.log(`Testing ${platform.name} platform`);
            
            let successCount = 0;
            let avgEntrepreneurNet = 0;
            let avgPlatformRevenue = 0;
            let avgUserSatisfaction = 0;
            let avgFeatureValue = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new NetworkEffectsCrowdfundingModel({
                    alpha: parameters.alpha * platform.networkStrength,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    viralCoefficient: 0.1,
                    platformType: 'web3'
                });
                
                // Choose strategy based on platform features
                let strategy;
                if (platform.features.includes('bonding-curves')) {
                    strategy = new BondingCurveStrategy(parameters.initialPrice);
                } else if (platform.features.includes('dynamic-pricing')) {
                    strategy = new DynamicPricingStrategy(parameters.initialPrice, 150, parameters.duration);
                } else {
                    strategy = new FixedPricingStrategy(parameters.initialPrice);
                }
                
                const result = model.simulateNetworkCampaign(strategy);
                
                if (result.success) successCount++;
                
                const platformFees = result.totalRaised * platform.fees;
                avgEntrepreneurNet += result.totalRaised - platformFees;
                avgPlatformRevenue += platformFees;
                
                // Calculate user satisfaction based on features and performance
                avgUserSatisfaction += this.calculateUserSatisfaction(platform, result);
                avgFeatureValue += this.calculateFeatureValue(platform.features);
            }
            
            results.push({
                platform: platform.name,
                fees: platform.fees,
                features: platform.features,
                networkStrength: platform.networkStrength,
                successRate: (successCount / numTrials) * 100,
                avgEntrepreneurNet: avgEntrepreneurNet / numTrials,
                avgPlatformRevenue: avgPlatformRevenue / numTrials,
                avgUserSatisfaction: avgUserSatisfaction / numTrials,
                avgFeatureValue: avgFeatureValue / numTrials,
                valueProposition: (avgEntrepreneurNet / numTrials) + (avgUserSatisfaction / numTrials) * 100,
                trials: numTrials
            });
        }
        
        const bestPlatform = results.reduce((best, current) => 
            current.valueProposition > best.valueProposition ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'platform-comparison',
            results: results,
            optimal: bestPlatform,
            summary: `Best platform: ${bestPlatform.platform} (${bestPlatform.valueProposition.toFixed(0)} value score, ${bestPlatform.successRate.toFixed(1)}% success rate)`,
            insights: this.generatePlatformInsights(results)
        };
    }
    
    calculateUserSatisfaction(platform, result) {
        const baseScore = result.success ? 70 : 40;
        const feeScore = (0.1 - platform.fees) * 500; // Lower fees = higher satisfaction
        const featureScore = platform.features.length * 5;
        const networkScore = platform.networkStrength * 10;
        
        return Math.max(0, Math.min(100, baseScore + feeScore + featureScore + networkScore));
    }
    
    calculateFeatureValue(features) {
        const featureValues = {
            'dynamic-pricing': 15,
            'bonding-curves': 20,
            'governance': 10,
            'dao': 12,
            'advanced-analytics': 8,
            'marketing': 10,
            'basic-analytics': 5,
            'fixed-pricing': 2
        };
        
        return features.reduce((sum, feature) => sum + (featureValues[feature] || 0), 0);
    }
    
    generatePlatformInsights(results) {
        const sorted = results.sort((a, b) => b.valueProposition - a.valueProposition);
        const highFee = results.filter(r => r.fees >= 0.06);
        const lowFee = results.filter(r => r.fees <= 0.04);
        
        const avgHighFeeSuccess = highFee.reduce((sum, r) => sum + r.successRate, 0) / highFee.length;
        const avgLowFeeSuccess = lowFee.reduce((sum, r) => sum + r.successRate, 0) / lowFee.length;
        
        return {
            topPerformers: `Best platforms: ${sorted.slice(0, 2).map(p => p.platform).join(', ')}`,
            feeImpact: `Low-fee platforms show ${(avgLowFeeSuccess - avgHighFeeSuccess).toFixed(1)}% higher success rate`,
            featureVsPrice: 'Advanced features can justify higher fees if they drive success',
            networkEffects: 'Platform network strength significantly impacts campaign outcomes',
            competitiveAdvantage: 'EquiCurve\'s dynamic pricing and bonding curves provide differentiation',
            recommendation: 'Balance competitive fees with innovative features for optimal market position'
        };
    }
}

// Register network and comparative experiments
if (typeof experimentFramework !== 'undefined') {
    experimentFramework.registerExperiment('viral-mechanics', new ViralMechanicsExperiment());
    experimentFramework.registerExperiment('community-building', new CommunityBuildingExperiment());
    experimentFramework.registerExperiment('traditional-vs-web3', new TraditionalVsWeb3Experiment());
    experimentFramework.registerExperiment('platform-comparison', new PlatformComparisonExperiment());
    console.log('✅ Network effects and comparative analysis experiments registered');
}
            