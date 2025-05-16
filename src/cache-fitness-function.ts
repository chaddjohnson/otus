import type {FitnessFunction, Genotype, Phenotype} from './types.js';

export function cacheFitnessFunction<TGenotype extends Genotype>(
  fitnessFunction: FitnessFunction<TGenotype>,
): FitnessFunction<TGenotype> {
  const fitnessCache = new Map<string, number>();

  return async (phenotype: Phenotype<TGenotype>): Promise<number> => {
    const key = JSON.stringify(phenotype);
    const cached = fitnessCache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const fitness = await fitnessFunction(phenotype);
    fitnessCache.set(key, fitness);

    return fitness;
  };
}
