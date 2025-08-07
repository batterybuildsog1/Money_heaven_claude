import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { UserInputs, CompensatingFactors, CalculationResults } from "../types";

export function useScenarios() {
  const scenarios = useQuery(api.scenarios.list);
  const createScenario = useMutation(api.scenarios.create);
  const updateScenario = useMutation(api.scenarios.update);
  const deleteScenario = useMutation(api.scenarios.remove);

  const create = async (data: {
    inputs: UserInputs;
    compensatingFactors?: CompensatingFactors;
    results?: CalculationResults;
    name?: string;
    notes?: string;
  }) => {
    return await createScenario(data);
  };

  const update = async (
    id: Id<"scenarios">,
    data: {
      inputs?: UserInputs;
      compensatingFactors?: CompensatingFactors;
      results?: CalculationResults;
      name?: string;
      notes?: string;
    }
  ) => {
    return await updateScenario({ id, ...data });
  };

  const remove = async (id: Id<"scenarios">) => {
    return await deleteScenario({ id });
  };

  return {
    scenarios: scenarios || [],
    create,
    update,
    remove,
    isLoading: scenarios === undefined,
  };
}

export function useScenario(id: Id<"scenarios">) {
  const scenario = useQuery(api.scenarios.get, { id });
  
  return {
    scenario,
    isLoading: scenario === undefined,
  };
}