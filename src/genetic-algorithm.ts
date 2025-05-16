import type {
  CrossoverOperator,
  FitnessFunction,
  Genotype,
  MutationOperator,
  Phenotype,
  SelectionOperator,
} from './types.js';

import {createRandomPhenotype} from './create-random-phenotype.js';

export interface GeneticAlgorithmState<TGenotype extends Genotype> {
  readonly genotype: TGenotype;
  readonly phenotypes: readonly Phenotype<TGenotype>[];
  readonly populationSize: number;
  readonly elitePopulationSize?: number;
  readonly fitnessFunction: FitnessFunction<TGenotype>;
  readonly selectionOperator: SelectionOperator<TGenotype>;
  readonly crossoverOperator: CrossoverOperator<TGenotype>;
  readonly mutationOperator: MutationOperator<TGenotype>;
}

export async function geneticAlgorithm<TGenotype extends Genotype>(
  state: GeneticAlgorithmState<TGenotype>,
): Promise<GeneticAlgorithmState<TGenotype>> {
  const {
    genotype,
    populationSize,
    elitePopulationSize = 0,
    fitnessFunction,
    selectionOperator,
    crossoverOperator,
    mutationOperator,
  } = state;

  const inputPhenotypes = [...state.phenotypes];

  if (inputPhenotypes.length > populationSize) {
    throw new Error(
      `There are more phenotypes than the population size allows.`,
    );
  }

  if (elitePopulationSize >= populationSize) {
    throw new Error(
      `The elite population size must be smaller than the total population size.`,
    );
  }

  while (inputPhenotypes.length < populationSize) {
    inputPhenotypes.push(createRandomPhenotype(genotype));
  }

  const outputPhenotypes: Phenotype<TGenotype>[] = [];

  if (elitePopulationSize > 0) {
    // Compute fitness values asynchronously before sorting
    const phenotypesWithFitness = await Promise.all(
      inputPhenotypes.map(async (phenotype) => ({
        phenotype,
        fitness: await fitnessFunction(phenotype),
      })),
    );
    phenotypesWithFitness.sort((a, b) => b.fitness - a.fitness);
    outputPhenotypes.push(
      ...phenotypesWithFitness
        .slice(0, elitePopulationSize)
        .map(({phenotype}) => phenotype),
    );
  }

  while (outputPhenotypes.length < populationSize) {
    outputPhenotypes.push(
      mutationOperator(
        crossoverOperator(
          await selectionOperator(inputPhenotypes, fitnessFunction),
          await selectionOperator(inputPhenotypes, fitnessFunction),
        ),
        genotype,
      ),
    );
  }

  return {...state, phenotypes: outputPhenotypes};
}
