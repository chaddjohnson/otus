import type {Genotype, SelectionOperator} from './types.js';

export function createFitnessProportionateSelectionOperator<
  TGenotype extends Genotype,
>(randomFunction: () => number = Math.random): SelectionOperator<TGenotype> {
  return async (phenotypes, fitnessFunction) => {
    if (phenotypes.length === 0) {
      throw new Error(`No phenotype available to select.`);
    }

    const fitnessList = await Promise.all(
      phenotypes.map(async (phenotype) => ({
        phenotype,
        fitness: await fitnessFunction(phenotype),
      })),
    );

    const maxFitness = Math.max(...fitnessList.map(({fitness}) => fitness));

    while (true) {
      const {phenotype, fitness} =
        fitnessList[Math.floor(randomFunction() * fitnessList.length)]!;

      if (randomFunction() < fitness / maxFitness) {
        return phenotype;
      }
    }
  };
}
