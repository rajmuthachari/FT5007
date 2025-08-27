/**
 * EquiCurve - Multi-Round Strategies Experiment (6.2)
 * Test sequential funding rounds vs single campaign strategies
 */

class MultiRoundCrowdfundingModel extends CrowdfundingModel {
    constructor(params = {}) {
        super(params);
        this.rounds = params.rounds || 1;
        this.roundTargets = params.roundTargets || [this.target];
        this.roundDurations = params.roundDurations || [this.duration];
        this.momentumCarryover = params.momentumCarryover || 0.3; // How much momentum carries between rounds
        this.brandValue = 0; // Accumulated brand value across rounds
        this.userLoyalty = 0; // User retention between rounds
    }
    
    simulateMultiRoundCampaign(strategies) {
        const roundResults = [];
        let totalRaised = 0;
        let totalDemand = 0;
        let cumulativeBrand = 0;
        let cumulativeUsers = 0;
        
        for (let roundNum = 0; roundNum < this.rounds; roundNum++) {
            console.log(`Running Round ${roundNum + 1}/${this.rounds}`);
            
            // Set up round-specific parameters
            const roundTarget = this.roundTargets[roundNum] || this.target;
            const roundDuration = this.roundDurations[roundNum] || this.duration;
            const strategy = strategies[roundNum] || strategies[0];
            
            // Apply momentum from previous rounds
            const momentumBonus = roundNum > 0 ? this.momentumCarryover * (this.brandValue / 100) : 0;
            const adjustedAlpha = this.alpha * (1 + momentumBonus);
            
            // Create round-specific model
            const roundModel = new CrowdfundingModel({
                alpha: adjustedAlpha,
                beta: this.beta,
                gamma: this.gamma,
                duration: roundDuration,
                target: roundTarget,
                initialPrice: this.initialPrice
            });
            
            // Simulate this round
            const roundResult = roundModel.simulateCampaign(strategy);
            
            // Update cumulative metrics
            totalRaised += roundResult.totalRaised;
            totalDemand += roundResult.totalDemand;
            
            // Update brand value and user loyalty
            this.updateBrandValue(roundResult, roundNum);
            this.updateUserLoyalty(roundResult, roundNum);
            
            // Store round results
            roundResults.push({
                round: roundNum + 1,
                target: roundTarget,
                duration: roundDuration,
                raised: roundResult.totalRaised,
                success: roundResult.success,
                demand: roundResult.totalDemand,
                momentum: momentumBonus,
                brandValue: this.brandValue,
                userLoyalty: this.userLoyalty,
                history: roundResult.history.map(h => ({...h, round: roundNum + 1}))
            });
            
            // Break if a round fails (depending on strategy)
            if (!roundResult.success && this.shouldStopOnFailure(roundNum, strategies)) {
                break;
            }
        }
        
        const overallSuccess = this.calculateOverallSuccess(roundResults);
        const completedRounds = roundResults.length;
        
        return {
            success: overallSuccess,
            totalRaised: totalRaised,
            totalDemand: totalDemand,
            roundsCompleted: completedRounds,
            roundResults: roundResults,
            finalBrandValue: this.brandValue,
            finalUserLoyalty: this.userLoyalty,
            averageRoundSuccess: roundResults.filter(r => r.success).length / completedRounds,
            history: this.combineRoundHistories(roundResults)
        };
    }
    
    updateBrandValue(roundResult, roundNum) {
        const baseIncrease = roundResult.success ? 20 : 5;
        const performanceBonus = (roundResult.totalRaised / roundResult.target) * 10;
        const roundBonus = roundNum * 5; // Later rounds build more brand value
        
        this.brandValue += baseIncrease + performanceBonus + roundBonus;
    }
    
    updateUserLoyalty(roundResult, roundNum) {
        if (roundNum === 0) {
            this.userLoyalty = roundResult.success ? 0.7 : 0.3;
        } else {
            // Loyalty evolves based on consistent performance
            const loyaltyChange = roundResult.success ? 0.1 : -0.2;
            this.userLoyalty = Math.max(0, Math.min(1, this.userLoyalty + loyaltyChange));
        }
    }
    
    shouldStopOnFailure(roundNum, strategies) {
        // Stop if this is a "all-or-nothing" multi-round strategy
        return strategies.length === 1 || (strategies[roundNum] && strategies[roundNum].stopOnFailure);
    }
    
    calculateOverallSuccess(roundResults) {
        // Success criteria: either all rounds succeed, or total target is met
        const allRoundsSucceed = roundResults.every(r => r.success);
        const totalTarget = this.roundTargets.reduce((sum, target) => sum + target, 0);
        const totalRaised = roundResults.reduce((sum, r) => sum + r.raised, 0);
        
        return allRoundsSucceed || (totalRaised >= totalTarget);
    }
    
    combineRoundHistories(roundResults) {
        const combinedHistory = [];
        let dayOffset = 0;
        
        for (const round of roundResults) {
            for (const historyEntry of round.history) {
                combinedHistory.push({
                    ...historyEntry,
                    absoluteDay: historyEntry.day + dayOffset,
                    round: round.round
                });
            }
            dayOffset += round.duration;
        }
        
        return combinedHistory;
    }
}

class MultiRoundStrategiesExperiment extends BaseExperiment {
    constructor() {
        super('multi-round', 'Multi-Round Strategies',
              'Compare single large campaign vs multiple sequential rounds');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Multi-Round Strategies Experiment...');
        
        const multiRoundConfigs = [
            {
                name: 'Single Round (Control)',
                rounds: 1,
                targets: [parameters.target],
                durations: [parameters.duration],
                strategies: ['fixed']
            },
            {
                name: 'Two Equal Rounds',
                rounds: 2,
                targets: [parameters.target * 0.5, parameters.target * 0.5],
                durations: [15, 15],
                strategies: ['fixed', 'fixed']
            },
            {
                name: 'Small-Large Rounds',
                rounds: 2,
                targets: [parameters.target * 0.3, parameters.target * 0.7],
                durations: [10, 20],
                strategies: ['fixed', 'dynamic']
            },
            {
                name: 'Three Equal Rounds',
                rounds: 3,
                targets: [parameters.target * 0.33, parameters.target * 0.33, parameters.target * 0.34],
                durations: [10, 10, 10],
                strategies: ['fixed', 'dynamic', 'bonding']
            },
            {
                name: 'Escalating Rounds',
                rounds: 3,
                targets: [parameters.target * 0.2, parameters.target * 0.3, parameters.target * 0.5],
                durations: [8, 10, 12],
                strategies: ['fixed', 'dynamic', 'bonding']
            },
            {
                name: 'De-escalating Rounds',
                rounds: 3,
                targets: [parameters.target * 0.5, parameters.target * 0.3, parameters.target * 0.2],
                durations: [12, 10, 8],
                strategies: ['bonding', 'dynamic', 'fixed']
            }
        ];
        
        const results = [];
        const numTrials = 100; // Reduced due to complexity
        
        for (const config of multiRoundConfigs) {
            console.log(`Testing ${config.name} strategy`);
            
            let successCount = 0;
            let avgTotalRaised = 0;
            let avgRoundsCompleted = 0;
            let avgBrandValue = 0;
            let avgUserLoyalty = 0;
            let avgTimeToCompletion = 0;
            
            for (let trial = 0; trial < numTrials; trial++) {
                const model = new MultiRoundCrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    target: parameters.target,
                    initialPrice: parameters.initialPrice,
                    rounds: config.rounds,
                    roundTargets: config.targets,
                    roundDurations: config.durations,
                    momentumCarryover: 0.3
                });
                
                // Create strategies for each round
                const strategies = config.strategies.map(stratType => {
                    switch(stratType) {
                        case 'dynamic':
                            return new DynamicPricingStrategy(parameters.initialPrice, 150, 30);
                        case 'bonding':
                            return new BondingCurveStrategy(parameters.initialPrice);
                        default:
                            return new FixedPricingStrategy(parameters.initialPrice);
                    }
                });
                
                const result = model.simulateMultiRoundCampaign(strategies);
                
                if (result.success) successCount++;
                avgTotalRaised += result.totalRaised;
                avgRoundsCompleted += result.roundsCompleted;
                avgBrandValue += result.finalBrandValue;
                avgUserLoyalty += result.finalUserLoyalty;
                
                // Calculate time to completion
                const totalDuration = config.durations.slice(0, result.roundsCompleted).reduce((sum, d) => sum + d, 0);
                avgTimeToCompletion += totalDuration;
            }
            
            results.push({
                name: config.name,
                rounds: config.rounds,
                targets: config.targets,
                durations: config.durations,
                strategies: config.strategies,
                successRate: (successCount / numTrials) * 100,
                avgTotalRaised: avgTotalRaised / numTrials,
                avgRoundsCompleted: avgRoundsCompleted / numTrials,
                avgBrandValue: avgBrandValue / numTrials,
                avgUserLoyalty: avgUserLoyalty / numTrials,
                avgTimeToCompletion: avgTimeToCompletion / numTrials,
                efficiency: (avgTotalRaised / numTrials) / (avgTimeToCompletion / numTrials), // Raised per day
                trials: numTrials
            });
        }
        
        const bestStrategy = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            status: 'complete',
            experimentType: 'multi-round',
            results: results,
            optimal: bestStrategy,
            summary: `Best multi-round strategy: ${bestStrategy.name} (${bestStrategy.successRate.toFixed(1)}% success rate, $${bestStrategy.efficiency.toFixed(0)} per day efficiency)`,
            insights: this.generateMultiRoundInsights(results)
        };
    }
    
    generateMultiRoundInsights(results) {
        const singleRound = results.find(r => r.rounds === 1);
        const multiRound = results.filter(r => r.rounds > 1);
        const twoRounds = results.filter(r => r.rounds === 2);
        const threeRounds = results.filter(r => r.rounds === 3);
        
        const avgMultiRoundSuccess = multiRound.reduce((sum, r) => sum + r.successRate, 0) / multiRound.length;
        const avgTwoRoundSuccess = twoRounds.reduce((sum, r) => sum + r.successRate, 0) / twoRounds.length;
        const avgThreeRoundSuccess = threeRounds.reduce((sum, r) => sum + r.successRate, 0) / threeRounds.length;
        
        const bestMultiRound = multiRound.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );
        
        return {
            multiRoundAdvantage: avgMultiRoundSuccess > singleRound.successRate ?
                `Multi-round strategies provide ${((avgMultiRoundSuccess - singleRound.successRate) / singleRound.successRate * 100).toFixed(1)}% improvement` :
                'Single round strategy remains competitive with multi-round approaches',
            optimalRoundCount: avgTwoRoundSuccess > avgThreeRoundSuccess ?
                'Two rounds provide optimal balance of momentum and complexity' :
                'Three rounds can outperform two-round strategies',
            brandBuilding: `Best multi-round strategy builds ${bestMultiRound.avgBrandValue.toFixed(0)} brand value vs ${singleRound.avgBrandValue.toFixed(0)} for single round`,
            efficiency: bestMultiRound.efficiency > singleRound.efficiency ?
                'Multi-round strategies can be more time-efficient' :
                'Single round provides better time efficiency',
            userLoyalty: `Multi-round campaigns achieve ${bestMultiRound.avgUserLoyalty.toFixed(2)} user loyalty vs ${singleRound.avgUserLoyalty.toFixed(2)}`,
            riskProfile: 'Multi-round strategies provide more flexibility but increase execution complexity',
            recommendation: 'Consider 2-3 round strategies for building long-term value and managing risk'
        };
    }
}

// Register multi-round experiment
if (typeof experimentFramework !== 'undefined') {
    experimentFramework.registerExperiment('multi-round', new MultiRoundStrategiesExperiment());
    console.log('✅ Multi-round strategies experiment registered');
}