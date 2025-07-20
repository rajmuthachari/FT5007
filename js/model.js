/**
 * EquiCurve - Core Simulation Engine
 * Implements multiplicative demand model with log-log transformation capabilities
 */

class CrowdfundingModel {
    constructor(params = {}) {
        // Model parameters with defaults based on empirical studies
        this.alpha = params.alpha || 1000;  // Base demand scale
        this.beta = params.beta || 0.5;     // Effort elasticity
        this.gamma = params.gamma || 1.2;   // Price elasticity
        this.sigma = params.sigma || 0.2;   // Noise standard deviation
        
        // Campaign parameters
        this.duration = params.duration || 30;  // days
        this.target = params.target || 100000;  // USD
        this.initialPrice = params.initialPrice || 1.0;
        
        // Time series data storage
        this.history = [];
    }
    
    /**
     * Calculate demand using multiplicative model
     * D(t) = α × E(t)^β × P(t)^(-γ) × ε(t)
     */
    calculateDemand(price, effort, includeNoise = true) {
        const baseDemand = this.alpha * Math.pow(effort, this.beta) * Math.pow(price, -this.gamma);
        
        if (includeNoise) {
            // Log-normal noise
            const epsilon = this.generateLogNormalNoise();
            return baseDemand * epsilon;
        }
        
        return baseDemand;
    }
    
    /**
     * Generate log-normal noise
     * If ln(ε) ~ N(0, σ²), then ε ~ LogNormal(0, σ²)
     */
    generateLogNormalNoise() {
        const normal = this.generateNormalRandom(0, this.sigma);
        return Math.exp(normal);
    }
    
    /**
     * Box-Muller transform for normal distribution
     */
    generateNormalRandom(mean, stdDev) {
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdDev + mean;
    }
    
    /**
     * Estimate parameters using log-log transformation
     * Linear regression in log space
     */
    estimateParameters(data) {
        // Transform to log space
        const logData = data.map(d => ({
            logD: Math.log(d.demand),
            logE: Math.log(d.effort),
            logP: Math.log(d.price)
        }));
        
        // Simple OLS estimation
        const n = logData.length;
        let sumLogD = 0, sumLogE = 0, sumLogP = 0;
        let sumLogELogD = 0, sumLogPLogD = 0;
        let sumLogE2 = 0, sumLogP2 = 0, sumLogELogP = 0;
        
        logData.forEach(d => {
            sumLogD += d.logD;
            sumLogE += d.logE;
            sumLogP += d.logP;
            sumLogELogD += d.logE * d.logD;
            sumLogPLogD += d.logP * d.logD;
            sumLogE2 += d.logE * d.logE;
            sumLogP2 += d.logP * d.logP;
            sumLogELogP += d.logE * d.logP;
        });
        
        // Solve normal equations for multiple regression
        // This is simplified - in production use a proper linear algebra library
        const avgLogD = sumLogD / n;
        const avgLogE = sumLogE / n;
        const avgLogP = sumLogP / n;
        
        // Calculate coefficients
        const varLogE = sumLogE2 / n - avgLogE * avgLogE;
        const varLogP = sumLogP2 / n - avgLogP * avgLogP;
        const covLogELogP = sumLogELogP / n - avgLogE * avgLogP;
        const covLogELogD = sumLogELogD / n - avgLogE * avgLogD;
        const covLogPLogD = sumLogPLogD / n - avgLogP * avgLogD;
        
        // Simplified estimation (assuming low correlation between E and P)
        const betaEstimate = covLogELogD / varLogE;
        const gammaEstimate = -covLogPLogD / varLogP;  // Note negative sign
        const alphaLogEstimate = avgLogD - betaEstimate * avgLogE + gammaEstimate * avgLogP;
        
        return {
            alpha: Math.exp(alphaLogEstimate),
            beta: betaEstimate,
            gamma: gammaEstimate,
            r_squared: this.calculateRSquared(logData, alphaLogEstimate, betaEstimate, gammaEstimate)
        };
    }
    
    /**
     * Calculate R-squared for model fit
     */
    calculateRSquared(logData, alphaLog, beta, gamma) {
        const n = logData.length;
        const avgLogD = logData.reduce((sum, d) => sum + d.logD, 0) / n;
        
        let ssTotal = 0, ssResidual = 0;
        
        logData.forEach(d => {
            const predicted = alphaLog + beta * d.logE - gamma * d.logP;
            ssTotal += Math.pow(d.logD - avgLogD, 2);
            ssResidual += Math.pow(d.logD - predicted, 2);
        });
        
        return 1 - (ssResidual / ssTotal);
    }
    
    /**
     * Simulate a complete campaign
     */
    simulateCampaign(strategy) {
        this.history = [];
        let cumulativeRaised = 0;
        let cumulativeDemand = 0;
        
        for (let day = 1; day <= this.duration; day++) {
            // Get price and effort from strategy
            const price = strategy.getPrice(day, cumulativeRaised, this.target);
            const effort = strategy.getEffort(day, cumulativeRaised, this.target);
            
            // Calculate daily demand
            const demand = this.calculateDemand(price, effort);
            const revenue = demand * price;
            
            // Update cumulative values
            cumulativeRaised += revenue;
            cumulativeDemand += demand;
            
            // Store history
            this.history.push({
                day,
                price,
                effort,
                demand,
                revenue,
                cumulativeRaised,
                cumulativeDemand,
                percentComplete: (cumulativeRaised / this.target) * 100
            });
        }
        
        return {
            success: cumulativeRaised >= this.target,
            totalRaised: cumulativeRaised,
            totalDemand: cumulativeDemand,
            history: this.history
        };
    }
    
    /**
     * Calculate optimal price given current parameters
     * For profit maximization: P* = γ/(γ-1) × marginal cost
     * For revenue maximization: P* satisfies elasticity condition
     */
    calculateOptimalPrice(effort, marginalCost = 0) {
        if (this.gamma <= 1) {
            // Inelastic demand - set high price
            return this.initialPrice * 10;
        }
        
        // Revenue maximization (when marginal cost ≈ 0 for digital tokens)
        // This comes from ∂Revenue/∂P = 0
        const optimalPrice = this.initialPrice; // Simplified - needs more complex optimization
        
        return optimalPrice;
    }
    
    /**
     * Export model data for visualization
     */
    exportForVisualization() {
        return {
            parameters: {
                alpha: this.alpha,
                beta: this.beta,
                gamma: this.gamma,
                sigma: this.sigma
            },
            campaign: {
                duration: this.duration,
                target: this.target,
                initialPrice: this.initialPrice
            },
            history: this.history
        };
    }
}

/**
 * Pricing Strategy Classes
 */
class PricingStrategy {
    constructor(initialPrice) {
        this.initialPrice = initialPrice;
    }
    
    getPrice(day, cumulativeRaised, target) {
        throw new Error('Must implement getPrice method');
    }
    
    getEffort(day, cumulativeRaised, target) {
        throw new Error('Must implement getEffort method');
    }
}

class FixedPricingStrategy extends PricingStrategy {
    constructor(initialPrice, constantEffort = 5) {
        super(initialPrice);
        this.constantEffort = constantEffort;
    }
    
    getPrice(day, cumulativeRaised, target) {
        return this.initialPrice;
    }
    
    getEffort(day, cumulativeRaised, target) {
        return this.constantEffort;
    }
}

class DynamicPricingStrategy extends PricingStrategy {
    constructor(initialPrice, effortBudget = 150) {
        super(initialPrice);
        this.effortBudget = effortBudget;
        this.priceAdjustmentRate = 0.05;
    }
    
    getPrice(day, cumulativeRaised, target) {
        const progressRatio = cumulativeRaised / target;
        const timeRatio = day / 30;
        
        // Increase price if ahead of schedule, decrease if behind
        const expectedProgress = timeRatio;
        const adjustment = (progressRatio - expectedProgress) * this.priceAdjustmentRate;
        
        return this.initialPrice * (1 + adjustment);
    }
    
    getEffort(day, cumulativeRaised, target) {
        const remainingDays = 30 - day + 1;
        const remainingBudget = this.effortBudget * (1 - day/30);
        
        // Front-load effort if behind target
        const progressRatio = cumulativeRaised / target;
        const urgency = progressRatio < day/30 ? 2 : 1;
        
        return (remainingBudget / remainingDays) * urgency;
    }
}

class BondingCurveStrategy extends PricingStrategy {
    constructor(initialPrice, curveParam = 0.5) {
        super(initialPrice);
        this.curveParam = curveParam;
    }
    
    getPrice(day, cumulativeRaised, target) {
        // P = initialPrice * (1 + curveParam * (tokens_sold / target_tokens))
        const tokensSold = cumulativeRaised / this.initialPrice; // Simplified
        const targetTokens = target / this.initialPrice;
        
        return this.initialPrice * (1 + this.curveParam * (tokensSold / targetTokens));
    }
    
    getEffort(day, cumulativeRaised, target) {
        // Increase effort as price increases to maintain demand
        const currentPrice = this.getPrice(day, cumulativeRaised, target);
        const priceRatio = currentPrice / this.initialPrice;
        
        return 5 * Math.sqrt(priceRatio); // Scale effort with price
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CrowdfundingModel,
        FixedPricingStrategy,
        DynamicPricingStrategy,
        BondingCurveStrategy
    };
}