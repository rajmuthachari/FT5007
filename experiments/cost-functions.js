/**
 * EquiCurve - Cost Functions for Effort
 * Implements C(E) = c1*E + c2*E^2 (quadratic cost function)
 */

class CostFunction {
    constructor(c1 = 10, c2 = 0.5) {
        this.c1 = c1; // Linear cost coefficient ($/effort unit)
        this.c2 = c2; // Quadratic cost coefficient ($/effort unit^2)
    }
    
    calculate(effort) {
        return this.c1 * effort + this.c2 * Math.pow(effort, 2);
    }
    
    marginalCost(effort) {
        return this.c1 + 2 * this.c2 * effort;
    }
}

// Extend the base model to include costs
class CrowdfundingModelWithCosts extends CrowdfundingModel {
    constructor(params = {}) {
        super(params);
        this.costFunction = new CostFunction(params.c1 || 10, params.c2 || 0.5);
        this.totalCosts = 0;
    }
    
    simulateCampaignWithProfits(strategy) {
        const result = this.simulateCampaign(strategy);
        
        // Calculate total costs from effort history
        this.totalCosts = result.history.reduce((sum, h) => {
            return sum + this.costFunction.calculate(h.effort);
        }, 0);
        
        // Add profit calculations
        result.totalCosts = this.totalCosts;
        result.netProfit = result.totalRaised - this.totalCosts;
        result.roi = (result.netProfit / this.totalCosts) * 100;
        
        // Add daily profit tracking
        let cumulativeCosts = 0;
        result.history = result.history.map(h => {
            const dailyCost = this.costFunction.calculate(h.effort);
            cumulativeCosts += dailyCost;
            return {
                ...h,
                dailyCost: dailyCost,
                cumulativeCosts: cumulativeCosts,
                netRevenue: h.revenue - dailyCost,
                cumulativeProfit: h.cumulativeRaised - cumulativeCosts
            };
        });
        
        return result;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.CostFunction = CostFunction;
    window.CrowdfundingModelWithCosts = CrowdfundingModelWithCosts;
}