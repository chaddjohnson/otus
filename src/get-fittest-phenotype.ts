import type {GeneticAlgorithmState} from './genetic-algorithm.js';
import type {Genotype, Phenotype} from './types.js';

export async function getFittestPhenotype<TGenotype extends Genotype>(
  state: GeneticAlgorithmState<TGenotype>,
): Promise<Phenotype<TGenotype> | undefined> {
  const {phenotypes, fitnessFunction} = state;

  if (!phenotypes.length) {
    return undefined;
  }

  const fitnessValues = await Promise.all(
    phenotypes.map(async (phenotype) => ({
      phenotype,
      fitness: await fitnessFunction(phenotype),
    })),
  );

  fitnessValues.sort((a, b) => b.fitness - a.fitness);

  return fitnessValues[0]?.phenotype;
}
