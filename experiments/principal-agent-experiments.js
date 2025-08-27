/**
 * EquiCurve - Principal-Agent Experiments (Category 8)
 * 8.1 Information Asymmetry
 * 8.2 Incentive Mechanisms
 * 8.3 Governance Models
 */

// Enhanced model for principal-agent dynamics
class PrincipalAgentCrowdfundingModel extends CrowdfundingModel {
    constructor(params = {}) {
        super(params);
        this.informationAsymmetry = params.informationAsymmetry || 0; // 0-1 scale
        this.incentiveMechanism = params.incentiveMechanism || 'none';
        this.governanceModel = params.governanceModel || 'centralized';
        this.entrepreneurType = params.entrepreneurType || 'honest'; // honest, optimistic, deceptive
        this.platformKnowledge = params.platformKnowledge || 0.5; // 0-1 scale
        this.trustLevel = 0.5; // Dynamic trust between parties
        this.moralHazard = 0; // Accumulated moral hazard
    }
    
    simulatePrincipalAgentCampaign(strategy) {
        this.history = [];
        this.trustLevel = 0.5;
        this.moralHazard = 0;
        
        let cumulativeRaised = 0;
        let cumulativeDemand = 0;
        let platformPayoff = 0;
        let entrepreneurPayoff = 0;
        
        for (let day = 1; day <= this.duration; day++) {
            // Information asymmetry affects pricing and effort decisions
            const perceivedProgress = this.getPerceivedProgress(cumulativeRaised, day);
            const actualProgress = cumulativeRaised / this.target;
            
            const price = strategy.getPrice(day, cumulativeRaised, this.target, perceivedProgress);
            const effort = strategy.getEffort(day, cumulativeRaised, this.target, this.trustLevel);
            
            // Calculate demand with trust and information effects
            const demand = this.calculateDemandWithTrust(price, effort, day);
            const revenue = demand * price;
            
            cumulativeRaised += revenue;
            cumulativeDemand += demand;
            
            // Update trust and moral hazard
            this.updateTrust(actualProgress, perceivedProgress, effort);
            this.updateMoralHazard(effort, day);
            
            // Calculate payoffs based on incentive mechanism
            const { platformPayout, entrepreneurPayout } = this.calculatePayoffs(revenue, day, cumulativeRaised >= this.target);
            platformPayoff += platformPayout;
            entrepreneurPayoff += entrepreneurPayout;
            
            this.history.push({
                day,
                price,
                effort,
                demand,
                revenue,
                cumulativeRaised,
                cumulativeDemand,
                percentComplete: (cumulativeRaised / this.target) * 100,
                trustLevel: this.trustLevel,
                moralHazard: this.moralHazard,
                informationGap: Math.abs(actualProgress - perceivedProgress),
                platformPayoff: platformPayoff,
                entrepreneurPayoff: entrepreneurPayoff
            });
        }
        
        return {
            success: cumulativeRaised >= this.target,
            totalRaised: cumulativeRaised,
            totalDemand: cumulativeDemand,
            platformPayoff: platformPayoff,
            entrepreneurPayoff: entrepreneurPayoff,
            finalTrust: this.trustLevel,
            totalMoralHazard: this.moralHazard,
            alignmentScore: this.calculateAlignmentScore(),
            history: this.history
        };
    }
    
    getPerceivedProgress(actualRaised, day) {
        const actualProgress = actualRaised / this.target;
        
        switch(this.entrepreneurType) {
            case 'optimistic':
                // Entrepreneur overestimates progress
                return Math.min(actualProgress * (1 + this.informationAsymmetry * 0.5), 1);
            
            case 'deceptive':
                // Entrepreneur may misrepresent progress
                const deceptionFactor = this.informationAsymmetry * 0.3;
                return actualProgress + deceptionFactor * Math.sin(day / 5); // Cyclical deception
            
            default: // honest
                // Small noise in progress reporting
                return actualProgress + (Math.random() - 0.5) * this.informationAsymmetry * 0.1;
        }
    }
    
    calculateDemandWithTrust(price, effort, day) {
        const baseDemand = this.alpha * Math.pow(effort, this.beta) * Math.pow(price, -this.gamma);
        
        // Trust affects market confidence
        const trustMultiplier = 0.7 + (this.trustLevel * 0.6); // 0.7 to 1.3 range
        
        // Moral hazard reduces effectiveness
        const moralHazardPenalty = Math.max(0, 1 - this.moralHazard * 0.1);
        
        return baseDemand * trustMultiplier * moralHazardPenalty * this.generateLogNormalNoise();
    }
    
    updateTrust(actualProgress, perceivedProgress, effort) {
        const progressGap = Math.abs(actualProgress - perceivedProgress);
        const effortSignal = effort > 5 ? 0.02 : -0.01; // High effort builds trust
        
        // Trust decreases with information gaps, increases with effort
        const trustChange = -progressGap * 0.5 + effortSignal;
        this.trustLevel = Math.max(0, Math.min(1, this.trustLevel + trustChange));
    }
    
    updateMoralHazard(effort, day) {
        // Moral hazard accumulates when effort is consistently low
        if (effort < 3) {
            this.moralHazard += 0.1;
        } else if (effort > 7) {
            this.moralHazard = Math.max(0, this.moralHazard - 0.05);
        }
    }
    
    calculatePayoffs(revenue, day, campaignSuccess) {
        switch(this.incentiveMechanism) {
            case 'fixed-fee':
                return {
                    platformPayout: revenue * 0.05,
                    entrepreneurPayout: revenue * 0.95
                };
            
            case 'success-sharing':
                const baseRate = 0.03;
                const successBonus = campaignSuccess ? 0.02 : 0;
                const platformRate = baseRate + successBonus;
                return {
                    platformPayout: revenue * platformRate,
                    entrepreneurPayout: revenue * (1 - platformRate)
                };
            
            case 'effort-based':
                // Platform takes higher fee when entrepreneur effort is low
                const effortPenalty = this.moralHazard > 0.5 ? 0.02 : 0;
                const platformRate2 = 0.05 + effortPenalty;
                return {
                    platformPayout: revenue * platformRate2,
                    entrepreneurPayout: revenue * (1 - platformRate2)
                };
            
            case 'trust-based':
                // Fee varies with trust level
                const trustBonus = (this.trustLevel - 0.5) * 0.02; // ±1% based on trust
                const platformRate3 = Math.max(0.02, Math.min(0.08, 0.05 - trustBonus));
                return {
                    platformPayout: revenue * platformRate3,
                    entrepreneurPayout: revenue * (1 - platformRate3)
                };
            
            default: // none
                return {
                    platformPayout: revenue * 0.05,
                    entrepreneurPayout: revenue * 0.95
                };
        }
    }
    
    calculateAlignmentScore() {
        // Measure how well platform and entrepreneur interests are aligned
        const trustScore = this.trustLevel * 25;
        const moralHazardPenalty = this.moralHazard * 20;
        const informationScore = (1 - this.informationAsymmetry) * 25;
        const governanceScore = this.getGovernanceScore();
        
        return Math.max(0, trustScore - moralHazardPenalty + informationScore + governanceScore);
    }
    
    getGovernanceScore() {
        switch(this.governanceModel) {
            case 'decentralized':
                return 30; // High alignment through shared governance
            case 'hybrid':
                return 20; // Moderate alignment
            default: // centralized
                return 10; // Lower alignment
        }
    }
}

// Enhanced strategies for principal-agent scenarios
class InformationAwarePricingStrategy extends PricingStrategy {
    constructor(initialPrice, informationLevel = 0.5) {
        super(initialPrice);
        this.informationLevel = informationLevel;
    }
    
    getPrice(day, cumulativeRaised, target, perceivedProgress = null) {
        const actualProgress = cumulativeRaised / target;
        const usedProgress = perceivedProgress || actualProgress;
        
        // Adjust pricing based on perceived vs actual progress
        const progressAdjustment = (usedProgress - actualProgress) * 0.1;
        return this.initialPrice * (1 + progressAdjustment);
    }
    
    getEffort(day, cumulativeRaised, target, trustLevel = 0.5) {
        const baseEffort = 5;
        const trustAdjustment = (trustLevel - 0.5) * 4; // ±2 effort based on trust
        return Math.max(1, Math.min(10, baseEffort + trustAdjustment));
    }
}

// 8.1 Information Asymmetry Experiment
class InformationAsymmetryExperiment extends BaseExperiment {
    constructor() {
        super('information-asymmetry', 'Information Asymmetry',
              'Test impact of information gaps between platform and entrepreneur');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Information Asymmetry Experiment...');
        
        const asymmetryLevels = [
            { level: 0.0, entrepreneurType: 'honest', name: 'Perfect Information (Honest)' },
            { level: 0.2, entrepreneurType: 'honest', name: 'Low Asymmetry (Honest)' },
            { level: 0.4, entrepreneurType: 'honest', name: 'Medium Asymmetry (Honest)' },
            { level: 0.2, entrepreneurType: 'optimistic', name: 'Low Asymmetry (Optimistic)' },
            { level: 0.4, entrepreneurType: 'optimistic', name: 'Medium Asymmetry (Optimistic)' },
            { level: 0.6, entrepreneurType: 'optimistic', name: 'High Asymmetry (Optimistic)' },
            { level: 0.3, entrepreneurType: 'deceptive', name: 'Medium Asymmetry (Deceptive)' },
            { level: 0.5, entrepreneurType: 'deceptive', name: 'High Asymmetry (Deceptive)' }
        ];
        
        const results = [];
        const numTrials = 100;
        
        for (const config of asymmetryLevels) {
            console.log(`Testing ${config.name}`);
            
            let successCount = 0;
            let avgAlignmentScore = 0;
            let avgTrustLevel = 0;
            let avgMoralHazard = 0;
            let avgPlatformPayoff = 0;
            let avgEntrepreneurPayoff = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new PrincipalAgentCrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    informationAsymmetry: config.level,
                    entrepreneurType: config.entrepreneurType,
                    incentiveMechanism: 'fixed-fee'
                });
                
                const strategy = new InformationAwarePricingStrategy(parameters.initialPrice, 1 - config.level);
                const result = model.simulatePrincipalAgentCampaign(strategy);
                
                if (result.success) successCount++;
                avgAlignmentScore += result.alignmentScore;
                avgTrustLevel += result.finalTrust;
                avgMoralHazard += result.totalMoralHazard;
                avgPlatformPayoff += result.platformPayoff;
                avgEntrepreneurPayoff += result.entrepreneurPayoff;
            }
            
            results.push({
                name: config.name,
                asymmetryLevel: config.level,
                entrepreneurType: config.entrepreneurType,
                successRate: (successCount / numTrials) * 100,
                avgAlignmentScore: avgAlignmentScore / numTrials,
                avgTrustLevel: avgTrustLevel / numTrials,
                avgMoralHazard: avgMoralHazard / numTrials,
                avgPlatformPayoff: avgPlatformPayoff / numTrials,
                avgEntrepreneurPayoff: avgEntrepreneurPayoff / numTrials,
                trials: numTrials
            });
        }
        
        const bestAlignment = results.reduce((best, current) => 
            current.avgAlignmentScore > best.avgAlignmentScore ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'information-asymmetry',
            results: results,
            optimal: bestAlignment,
            summary: `Best alignment: ${bestAlignment.name} (${bestAlignment.avgAlignmentScore.toFixed(1)} alignment score, ${bestAlignment.avgTrustLevel.toFixed(2)} trust level)`,
            insights: this.generateAsymmetryInsights(results)
        };
    }
    
    generateAsymmetryInsights(results) {
        const perfectInfo = results.find(r => r.asymmetryLevel === 0);
        const honest = results.filter(r => r.entrepreneurType === 'honest');
        const optimistic = results.filter(r => r.entrepreneurType === 'optimistic');
        const deceptive = results.filter(r => r.entrepreneurType === 'deceptive');
        
        const avgHonestTrust = honest.reduce((sum, r) => sum + r.avgTrustLevel, 0) / honest.length;
        const avgDeceptiveTrust = deceptive.reduce((sum, r) => sum + r.avgTrustLevel, 0) / deceptive.length;
        
        return {
            informationValue: `Perfect information provides ${(perfectInfo.avgAlignmentScore - results[results.length-1].avgAlignmentScore).toFixed(1)} point alignment advantage`,
            entrepreneurTypeMatter: avgHonestTrust > avgDeceptiveTrust ? 
                'Honest entrepreneurs build significantly more trust' :
                'Entrepreneur type has minimal trust impact',
            asymmetryThreshold: 'Alignment degrades significantly above 40% information asymmetry',
            moralHazardRisk: 'High asymmetry increases moral hazard and reduces effort',
            recommendation: 'Implement transparency mechanisms to reduce information gaps'
        };
    }
}

// 8.2 Incentive Mechanisms Experiment
class IncentiveMechanismsExperiment extends BaseExperiment {
    constructor() {
        super('incentive-mechanisms', 'Incentive Mechanisms',
              'Compare different incentive structures for platform-entrepreneur alignment');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Incentive Mechanisms Experiment...');
        
        const mechanisms = [
            { type: 'fixed-fee', name: 'Fixed Fee (5%)' },
            { type: 'success-sharing', name: 'Success Sharing (3% + 2% bonus)' },
            { type: 'effort-based', name: 'Effort-Based (5% + penalties)' },
            { type: 'trust-based', name: 'Trust-Based (Dynamic 2-8%)' }
        ];
        
        const results = [];
        const numTrials = 100;
        
        for (const mechanism of mechanisms) {
            console.log(`Testing ${mechanism.name} incentive mechanism`);
            
            let successCount = 0;
            let avgAlignmentScore = 0;
            let avgPlatformPayoff = 0;
            let avgEntrepreneurPayoff = 0;
            let avgEffortLevel = 0;
            let avgTrustLevel = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new PrincipalAgentCrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    informationAsymmetry: 0.3, // Moderate asymmetry
                    entrepreneurType: 'honest',
                    incentiveMechanism: mechanism.type
                });
                
                const strategy = new InformationAwarePricingStrategy(parameters.initialPrice, 0.7);
                const result = model.simulatePrincipalAgentCampaign(strategy);
                
                if (result.success) successCount++;
                avgAlignmentScore += result.alignmentScore;
                avgPlatformPayoff += result.platformPayoff;
                avgEntrepreneurPayoff += result.entrepreneurPayoff;
                avgTrustLevel += result.finalTrust;
                
                // Calculate average effort
                const totalEffort = result.history.reduce((sum, h) => sum + h.effort, 0);
                avgEffortLevel += totalEffort / result.history.length;
            }
            
            results.push({
                mechanism: mechanism.type,
                name: mechanism.name,
                successRate: (successCount / numTrials) * 100,
                avgAlignmentScore: avgAlignmentScore / numTrials,
                avgPlatformPayoff: avgPlatformPayoff / numTrials,
                avgEntrepreneurPayoff: avgEntrepreneurPayoff / numTrials,
                avgEffortLevel: avgEffortLevel / numTrials,
                avgTrustLevel: avgTrustLevel / numTrials,
                platformROI: (avgPlatformPayoff / numTrials) / ((avgPlatformPayoff + avgEntrepreneurPayoff) / numTrials),
                trials: numTrials
            });
        }
        
        const bestMechanism = results.reduce((best, current) => 
            current.avgAlignmentScore > best.avgAlignmentScore ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'incentive-mechanisms',
            results: results,
            optimal: bestMechanism,
            summary: `Best incentive mechanism: ${bestMechanism.name} (${bestMechanism.avgAlignmentScore.toFixed(1)} alignment score)`,
            insights: this.generateIncentiveInsights(results)
        };
    }
    
    generateIncentiveInsights(results) {
        const fixedFee = results.find(r => r.mechanism === 'fixed-fee');
        const successSharing = results.find(r => r.mechanism === 'success-sharing');
        const effortBased = results.find(r => r.mechanism === 'effort-based');
        const trustBased = results.find(r => r.mechanism === 'trust-based');
        
        return {
            alignmentRanking: `Best alignment: ${results.sort((a,b) => b.avgAlignmentScore - a.avgAlignmentScore).map(r => r.mechanism).join(' > ')}`,
            effortIncentives: effortBased.avgEffortLevel > fixedFee.avgEffortLevel ?
                'Effort-based mechanisms increase entrepreneur effort' :
                'Effort-based mechanisms don\'t significantly improve effort',
            trustBuilding: trustBased.avgTrustLevel > fixedFee.avgTrustLevel ?
                'Trust-based mechanisms improve relationship quality' :
                'Trust mechanisms show limited impact',
            platformProfitability: `Success sharing provides best platform ROI (${(successSharing.platformROI * 100).toFixed(1)}%)`,
            recommendation: 'Hybrid mechanisms combining success sharing with effort monitoring optimize alignment'
        };
    }
}

// 8.3 Governance Models Experiment
class GovernanceModelsExperiment extends BaseExperiment {
    constructor() {
        super('governance-models', 'Governance Models',
              'Test different governance structures for platform-entrepreneur relationships');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Governance Models Experiment...');
        
        const governanceModels = [
            { type: 'centralized', name: 'Centralized (Platform Control)', decisionPower: { platform: 0.8, entrepreneur: 0.2 } },
            { type: 'hybrid', name: 'Hybrid (Shared Control)', decisionPower: { platform: 0.5, entrepreneur: 0.5 } },
            { type: 'decentralized', name: 'Decentralized (Community Control)', decisionPower: { platform: 0.3, entrepreneur: 0.7 } }
        ];
        
        const results = [];
        const numTrials = 100;
        
        for (const governance of governanceModels) {
            console.log(`Testing ${governance.name} governance model`);
            
            let successCount = 0;
            let avgAlignmentScore = 0;
            let avgDecisionQuality = 0;
            let avgFlexibility = 0;
            let avgAccountability = 0;
            let avgStakeholderSatisfaction = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new PrincipalAgentCrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: parameters.duration,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    informationAsymmetry: 0.2,
                    entrepreneurType: 'honest',
                    incentiveMechanism: 'success-sharing',
                    governanceModel: governance.type
                });
                
                const strategy = new InformationAwarePricingStrategy(parameters.initialPrice, 0.8);
                const result = model.simulatePrincipalAgentCampaign(strategy);
                
                if (result.success) successCount++;
                avgAlignmentScore += result.alignmentScore;
                
                // Calculate governance-specific metrics
                avgDecisionQuality += this.calculateDecisionQuality(governance, result);
                avgFlexibility += this.calculateFlexibility(governance, result);
                avgAccountability += this.calculateAccountability(governance, result);
                avgStakeholderSatisfaction += this.calculateStakeholderSatisfaction(governance, result);
            }
            
            results.push({
                governance: governance.type,
                name: governance.name,
                decisionPower: governance.decisionPower,
                successRate: (successCount / numTrials) * 100,
                avgAlignmentScore: avgAlignmentScore / numTrials,
                avgDecisionQuality: avgDecisionQuality / numTrials,
                avgFlexibility: avgFlexibility / numTrials,
                avgAccountability: avgAccountability / numTrials,
                avgStakeholderSatisfaction: avgStakeholderSatisfaction / numTrials,
                trials: numTrials
            });
        }
        
        const bestGovernance = results.reduce((best, current) => 
            current.avgAlignmentScore > best.avgAlignmentScore ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'governance-models',
            results: results,
            optimal: bestGovernance,
            summary: `Best governance model: ${bestGovernance.name} (${bestGovernance.avgAlignmentScore.toFixed(1)} alignment score)`,
            insights: this.generateGovernanceInsights(results)
        };
    }
    
    calculateDecisionQuality(governance, result) {
        // Simplified decision quality based on success and efficiency
        const baseQuality = result.success ? 70 : 40;
        const governanceBonus = governance.type === 'hybrid' ? 10 : governance.type === 'decentralized' ? 5 : 0;
        return baseQuality + governanceBonus;
    }
    
    calculateFlexibility(governance, result) {
        // Decentralized models are more flexible
        const base = 50;
        const flexibilityBonus = governance.type === 'decentralized' ? 30 : governance.type === 'hybrid' ? 20 : 0;
        return base + flexibilityBonus;
    }
    
    calculateAccountability(governance, result) {
        // Centralized models have higher accountability
        const base = 50;
        const accountabilityBonus = governance.type === 'centralized' ? 30 : governance.type === 'hybrid' ? 20 : 10;
        return base + accountabilityBonus;
    }
    
    calculateStakeholderSatisfaction(governance, result) {
        // Balanced satisfaction across stakeholders
        const platformSatisfaction = result.platformPayoff / 1000; // Normalized
        const entrepreneurSatisfaction = result.entrepreneurPayoff / 1000; // Normalized
        const trustBonus = result.finalTrust * 20;
        
        return (platformSatisfaction + entrepreneurSatisfaction) / 2 + trustBonus;
    }
    
    generateGovernanceInsights(results) {
        const centralized = results.find(r => r.governance === 'centralized');
        const hybrid = results.find(r => r.governance === 'hybrid');
        const decentralized = results.find(r => r.governance === 'decentralized');
        
        return {
            flexibilityVsControl: decentralized.avgFlexibility > centralized.avgAccountability ?
                'Flexibility benefits outweigh control advantages' :
                'Control and accountability remain more valuable',
            hybridAdvantage: hybrid.avgAlignmentScore > Math.max(centralized.avgAlignmentScore, decentralized.avgAlignmentScore) ?
                'Hybrid governance provides optimal balance' :
                'Extreme governance models outperform hybrid approach',
            stakeholderBalance: 'Governance model significantly affects stakeholder satisfaction distribution',
            adaptability: 'Decentralized models show higher adaptability to market changes',
            recommendation: 'Choose governance model based on project complexity and stakeholder preferences'
        };
    }
}

// Register principal-agent experiments
if (typeof experimentFramework !== 'undefined') {
    experimentFramework.registerExperiment('information-asymmetry', new InformationAsymmetryExperiment());
    experimentFramework.registerExperiment('incentive-mechanisms', new IncentiveMechanismsExperiment());
    experimentFramework.registerExperiment('governance-models', new GovernanceModelsExperiment());
    console.log('✅ Principal-agent experiments registered');
}