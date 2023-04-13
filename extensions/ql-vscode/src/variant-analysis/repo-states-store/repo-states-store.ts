import { outputJson, readJson } from "fs-extra";
import { VariantAnalysisScannedRepositoryState } from "../shared/variant-analysis";
import { VariantAnalysisScannedRepositoryStateDto } from "./repo-states-dto";
import { mapRepoStateToData } from "./repo-states-to-data-mapper";
import { mapRepoStateToDomain } from "./repo-states-to-domain-mapper";

export const REPO_STATES_FILENAME = "repo_states.json";

export async function writeRepoStates(
  storagePath: string,
  repoStates: Record<number, VariantAnalysisScannedRepositoryState>,
): Promise<void> {
  // Map from repoStates Domain type to the repoStates Data type
  const repoStatesData = Object.fromEntries(
    Object.entries(repoStates).map(([key, value]) => {
      return [key, mapRepoStateToData(value)];
    }),
  );

  await outputJson(storagePath, repoStatesData);
}

export async function readRepoStates(
  storagePath: string,
): Promise<Record<number, VariantAnalysisScannedRepositoryState> | undefined> {
  try {
    const repoStatesData: Record<
      number,
      VariantAnalysisScannedRepositoryStateDto
    > = await readJson(storagePath);

    // Map from repoStates Data type to the repoStates Domain type
    const repoStates = Object.fromEntries(
      Object.entries(repoStatesData).map(([key, value]) => {
        return [key, mapRepoStateToDomain(value)];
      }),
    );

    return repoStates;
  } catch (e) {
    // Ignore this error, we simply might not have downloaded anything yet
    return undefined;
  }
}
