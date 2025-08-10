/**
 * EquiCurve - Modular Experiment Framework
 * Base structure for organizing and running experiments
 */

class ExperimentFramework {
    constructor() {
        this.experiments = new Map();
        this.results = new Map();
        this.currentExperiment = null;
    }

    /**
     * Register a new experiment
     */
    registerExperiment(id, experiment) {
        this.experiments.set(id, experiment);
    }

    /**
     * Run a specific experiment
     */
    async runExperiment(experimentId, parameters = {}) {
        const experiment = this.experiments.get(experimentId);
        if (!experiment) {
            throw new Error(`Experiment ${experimentId} not found`);
        }

        this.currentExperiment = experimentId;
        
        try {
            const results = await experiment.run(parameters);
            this.results.set(experimentId, results);
            return results;
        } catch (error) {
            console.error(`Error running experiment ${experimentId}:`, error);
            throw error;
        }
    }

    /**
     * Get experiment results
     */
    getResults(experimentId) {
        return this.results.get(experimentId);
    }

    /**
     * List available experiments
     */
    listExperiments() {
        return Array.from(this.experiments.keys());
    }
}

/**
 * Base Experiment Class
 */
class BaseExperiment {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.parameters = {};
        this.results = null;
    }

    /**
     * Set experiment parameters
     */
    setParameters(params) {
        this.parameters = { ...this.parameters, ...params };
    }

    /**
     * Validate parameters (to be overridden)
     */
    validateParameters() {
        return true;
    }

    /**
     * Run the experiment (to be overridden)
     */
    async run(parameters = {}) {
        this.setParameters(parameters);
        
        if (!this.validateParameters()) {
            throw new Error('Invalid parameters for experiment');
        }

        // To be implemented by subclasses
        throw new Error('run() method must be implemented by subclass');
    }

    /**
     * Generate visualization data
     */
    getVisualizationData() {
        return this.results;
    }

    /**
     * Export results
     */
    exportResults() {
        return {
            id: this.id,
            name: this.name,
            parameters: this.parameters,
            results: this.results,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Experiment Categories - Placeholders for future implementation
 */


/**
 * Global experiment framework instance
 */
const experimentFramework = new ExperimentFramework();


// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ExperimentFramework = ExperimentFramework;
    window.BaseExperiment = BaseExperiment;
    window.experimentFramework = experimentFramework;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ExperimentFramework,
        BaseExperiment,
        experimentFramework,
        // Experiment classes
        PriceElasticityExperiment,
        EffortElasticityExperiment,
        FixedFeesExperiment,
        StaticPricingExperiment
    };
}
