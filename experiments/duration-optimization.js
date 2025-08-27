class DurationOptimizationExperiment extends BaseExperiment {
    constructor() {
        super('duration-optimization', 'Duration Optimization', 
              'Test optimal campaign durations for different scenarios');
    }

    async run(parameters = {}) {
        console.log('🔬 Running Duration Optimization Experiment...');
        
        const durations = [7, 14, 30, 60, 90];
        const results = [];
        const numTrials = 20; // Run 20 trials per duration for statistical significance
        
        for (const duration of durations) {
            console.log(`Testing duration: ${duration} days`);
            
            let successCount = 0;
            let totalRaised = 0;
            let totalTokens = 0;
            
            // Run multiple trials for this duration
            for (let trial = 0; trial < numTrials; trial++) {
                // Create model with current parameters but different duration
                const model = new CrowdfundingModel({
                    alpha: parameters.alpha,
                    beta: parameters.beta,
                    gamma: parameters.gamma,
                    duration: duration,  // Test this duration
                    target: parameters.target,
                    initialPrice: parameters.initialPrice
                });
                
                // Create strategy (use the selected strategy)
                let strategy;
                switch(parameters.strategy) {
                    case 'dynamic':
                        strategy = new DynamicPricingStrategy(parameters.initialPrice, 150, duration);
                        break;
                    case 'bonding':
                        strategy = new BondingCurveStrategy(parameters.initialPrice);
                        break;
                    default:
                        strategy = new FixedPricingStrategy(parameters.initialPrice);
                }
                
                // Run the simulation
                const result = model.simulateCampaign(strategy);
                
                // Collect results
                if (result.success) successCount++;
                totalRaised += result.totalRaised;
                totalTokens += result.totalDemand;
            }
            
            // Calculate averages for this duration
            results.push({
                duration: duration,
                successRate: (successCount / numTrials) * 100,
                avgRaised: totalRaised / numTrials,
                avgTokens: totalTokens / numTrials,
                trials: numTrials
            });
        }
        
        console.log('🎯 Duration Optimization Results:', results);
        
        // Find optimal duration
        const bestDuration = results.reduce((best, current) => 
            current.successRate > best.successRate ? current : best
        );

        // ADD VALIDATION HERE - validate the optimal configuration
        const testModel = new CrowdfundingModel({
            alpha: parameters.alpha,
            beta: parameters.beta,
            gamma: parameters.gamma,
            duration: bestDuration.duration,  // Use the optimal duration
            target: parameters.target,
            initialPrice: parameters.initialPrice
        });
        
        const testStrategy = new FixedPricingStrategy(parameters.initialPrice);
        const testRun = testModel.simulateCampaign(testStrategy);
        const validation = campaignValidator.generateValidationReport(testRun, testModel);
        
        return {
            status: 'complete',
            experimentType: 'duration-optimization',
            results: results,
            optimal: bestDuration,
            validation: validation,
            summary: `Optimal duration: ${bestDuration.duration} days (${bestDuration.successRate.toFixed(1)}% success rate)`
        };
    }
}

// Register the experiment
if (typeof experimentFramework !== 'undefined') {
    experimentFramework.registerExperiment('duration-optimization', new DurationOptimizationExperiment());
}
