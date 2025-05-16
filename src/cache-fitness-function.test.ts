import type {Allele, Genotype, Phenotype} from './types.js';

import {cacheFitnessFunction} from './cache-fitness-function.js';
import {describe, expect, jest, test} from '@jest/globals';

interface TestGenotype extends Genotype {
  readonly fitness: Allele<number>;
}

describe(`cacheFitnessFunction()`, () => {
  test(`fitness cache`, async () => {
    const phenotypeA = {fitness: 0};
    const phenotypeB = {fitness: 1};

    const fitnessFunction = jest.fn(
      async (phenotype: Phenotype<TestGenotype>) =>
        Promise.resolve(phenotype.fitness),
    );

    const cachedFitnessFunction = cacheFitnessFunction(fitnessFunction);

    expect(await cachedFitnessFunction(phenotypeA)).toBe(0);
    expect(await cachedFitnessFunction(phenotypeB)).toBe(1);
    expect(await cachedFitnessFunction(phenotypeA)).toBe(0);
    expect(await cachedFitnessFunction(phenotypeB)).toBe(1);
    expect(fitnessFunction).toHaveBeenCalledTimes(2);
  });
});
