/**
 * EquiCurve - Validation Utilities
 * Validates simulation results against known crowdfunding patterns
 */

class CampaignValidator {
    constructor() {
        // Real statistical patterns from crowdfunding research
        this.patterns = {
            // Distribution of funding over time (normalized)
            fundingCurve: {
                firstWeek: 0.42,  // 42% typically raised in first week
                middlePeriod: 0.28, // 28% in middle period
                lastWeek: 0.30  // 30% in final push
            },
            
            // Success factors
            successMetrics: {
                minDailyProgress: 0.033, // ~3.3% per day for 30 days
                criticalMomentum: 0.30,  // 30% by day 10 predicts success
                averageConversion: 0.02   // 2% of viewers become backers
            },
            
            // Price elasticity validation ranges
            elasticityRanges: {
                gamma: { min: 0.8, max: 1.5, typical: 1.2 },
                beta: { min: 0.3, max: 0.7, typical: 0.5 }
            }
        };
    }
    
    validateCampaignPattern(history, duration) {
        const firstWeekEnd = Math.floor(duration * 0.23);
        const lastWeekStart = Math.floor(duration * 0.77);
        
        const totalRaised = history[history.length - 1].cumulativeRaised;
        
        const firstWeekRaised = history[firstWeekEnd].cumulativeRaised;
        const middleRaised = history[lastWeekStart].cumulativeRaised - firstWeekRaised;
        const lastWeekRaised = totalRaised - history[lastWeekStart].cumulativeRaised;
        
        const actualPattern = {
            firstWeek: firstWeekRaised / totalRaised,
            middle: middleRaised / totalRaised,
            lastWeek: lastWeekRaised / totalRaised
        };
        
        // Calculate deviation from typical pattern
        const patternDeviation = Math.abs(actualPattern.firstWeek - this.patterns.fundingCurve.firstWeek) +
                                Math.abs(actualPattern.middle - this.patterns.fundingCurve.middlePeriod) +
                                Math.abs(actualPattern.lastWeek - this.patterns.fundingCurve.lastWeek);
        
        return {
            pattern: actualPattern,
            expected: this.patterns.fundingCurve,
            deviation: patternDeviation,
            isRealistic: patternDeviation < 0.3, // 30% total deviation acceptable
            analysis: this.analyzePattern(actualPattern)
        };
    }
    
    analyzePattern(pattern) {
        if (pattern.firstWeek > 0.6) {
            return "Front-loaded: Unusually high early momentum";
        } else if (pattern.firstWeek < 0.2) {
            return "Slow start: Low initial traction";
        } else if (pattern.lastWeek > 0.5) {
            return "Hockey stick: Unrealistic final surge";
        } else {
            return "Realistic funding curve";
        }
    }
    
    validateParameters(alpha, beta, gamma) {
        const validations = [];
        
        // Check gamma (price elasticity)
        if (gamma < this.patterns.elasticityRanges.gamma.min) {
            validations.push(`Price elasticity (γ=${gamma}) below typical range - demand too inelastic`);
        } else if (gamma > this.patterns.elasticityRanges.gamma.max) {
            validations.push(`Price elasticity (γ=${gamma}) above typical range - demand too elastic`);
        }
        
        // Check beta (effort elasticity)
        if (beta < this.patterns.elasticityRanges.beta.min) {
            validations.push(`Effort elasticity (β=${beta}) too low - marketing ineffective`);
        } else if (beta > this.patterns.elasticityRanges.beta.max) {
            validations.push(`Effort elasticity (β=${beta}) too high - unrealistic marketing impact`);
        }
        
        // Check alpha (base demand)
        if (alpha < 100) {
            validations.push(`Base demand (α=${alpha}) too low for viable campaign`);
        } else if (alpha > 10000) {
            validations.push(`Base demand (α=${alpha}) unrealistically high`);
        }
        
        return {
            isValid: validations.length === 0,
            issues: validations
        };
    }
    
    generateValidationReport(results, model) {
        const patternValidation = this.validateCampaignPattern(results.history, model.duration);
        const paramValidation = this.validateParameters(model.alpha, model.beta, model.gamma);
        
        return {
            overall: patternValidation.isRealistic && paramValidation.isValid,
            fundingPattern: patternValidation,
            parameters: paramValidation,
            metrics: {
                dailyAvgProgress: (results.totalRaised / model.target / model.duration),
                finalSuccessRate: results.success ? 100 : (results.totalRaised / model.target * 100),
                roi: results.roi || 'N/A'
            },
            recommendation: this.getRecommendation(patternValidation, paramValidation)
        };
    }
    
    getRecommendation(patternVal, paramVal) {
        if (!patternVal.isRealistic && !paramVal.isValid) {
            return "Results unrealistic - adjust both parameters and strategy";
        } else if (!patternVal.isRealistic) {
            return "Funding pattern atypical - consider adjusting pricing strategy";
        } else if (!paramVal.isValid) {
            return `Parameter issues: ${paramVal.issues.join('; ')}`;
        } else {
            return "Results within realistic bounds";
        }
    }
}

// Global validator instance
const campaignValidator = new CampaignValidator();

// Export
if (typeof window !== 'undefined') {
    window.CampaignValidator = CampaignValidator;
    window.campaignValidator = campaignValidator;
}