import type { CommandManager } from "../packages/commands";
import type { Uri } from "vscode";
import type { QueryHistoryInfo } from "../query-history/query-history-info";

// A command function matching the signature that VS Code calls when
// a command on a selection is invoked.
export type SelectionCommandFunction<Item> = (
  singleItem: Item,
  multiSelect: Item[],
) => Promise<void>;

/**
 * Contains type definitions for all commands used by the extension.
 *
 * To add a new command first define its type here, then provide
 * the implementation in the corresponding `getCommands` function.
 */

// Base commands not tied directly to a module like e.g. variant analysis.
export type BaseCommands = {
  "codeQL.openDocumentation": () => Promise<void>;
};

// Commands used for the query history panel
export type QueryHistoryCommands = {
  // Commands in the "navigation" group
  "codeQLQueryHistory.sortByName": () => Promise<void>;
  "codeQLQueryHistory.sortByDate": () => Promise<void>;
  "codeQLQueryHistory.sortByCount": () => Promise<void>;

  // Commands in the context menu or in the hover menu
  "codeQLQueryHistory.openQueryTitleMenu": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.openQueryContextMenu": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.removeHistoryItemTitleMenu": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.removeHistoryItemContextMenu": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.removeHistoryItemContextInline": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.renameItem": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.compareWith": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.showEvalLog": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.showEvalLogSummary": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.showEvalLogViewer": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.showQueryLog": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.showQueryText": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.openQueryDirectory": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.cancel": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.exportResults": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.viewCsvResults": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.viewCsvAlerts": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.viewSarifAlerts": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.viewDil": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.itemClicked": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.openOnGithub": SelectionCommandFunction<QueryHistoryInfo>;
  "codeQLQueryHistory.copyRepoList": SelectionCommandFunction<QueryHistoryInfo>;
};

// Commands tied to variant analysis
export type VariantAnalysisCommands = {
  "codeQL.openVariantAnalysisLogs": (
    variantAnalysisId: number,
  ) => Promise<void>;
  "codeQL.runVariantAnalysis": (uri?: Uri) => Promise<void>;
  "codeQL.runVariantAnalysisContextEditor": (uri?: Uri) => Promise<void>;
};

export type AllCommands = BaseCommands &
  QueryHistoryCommands &
  VariantAnalysisCommands;

export type AppCommandManager = CommandManager<AllCommands>;