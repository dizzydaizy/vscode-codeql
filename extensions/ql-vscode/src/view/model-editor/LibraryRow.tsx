import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { styled } from "styled-components";
import { ExternalApiUsage } from "../../model-editor/external-api-usage";
import { ModeledMethod } from "../../model-editor/modeled-method";
import { ModeledMethodDataGrid } from "./ModeledMethodDataGrid";
import { calculateModeledPercentage } from "../../model-editor/shared/modeled-percentage";
import { percentFormatter } from "./formatters";
import { Codicon } from "../common";
import { Mode } from "../../model-editor/shared/mode";
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeTag,
} from "@vscode/webview-ui-toolkit/react";
import { ModelEditorViewState } from "../../model-editor/shared/view-state";
import { InProgressMethods } from "../../model-editor/shared/in-progress-methods";

const LibraryContainer = styled.div`
  background-color: var(--vscode-peekViewResult-background);
  padding: 0.3rem;
  margin-bottom: 1rem;
  border-radius: 0.3rem;
`;

const TitleContainer = styled.button`
  display: flex;
  gap: 0.5em;
  align-items: center;
  width: 100%;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;

  color: var(--vscode-editor-foreground);
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const SectionDivider = styled(VSCodeDivider)`
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
`;

const NameContainer = styled.div`
  display: flex;
  gap: 0.5em;
  align-items: baseline;
  flex-grow: 1;
  text-align: left;
`;

const DependencyName = styled.span`
  font-size: 1.2em;
  font-weight: bold;
`;

const ModeledPercentage = styled.span`
  color: var(--vscode-descriptionForeground);
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.4em;
  justify-content: right;
  margin-bottom: 1rem;
  margin-right: 1rem;
`;

type Props = {
  title: string;
  libraryVersion?: string;
  externalApiUsages: ExternalApiUsage[];
  modeledMethods: Record<string, ModeledMethod>;
  modifiedSignatures: Set<string>;
  inProgressMethods: InProgressMethods;
  viewState: ModelEditorViewState;
  hideModeledApis: boolean;
  onChange: (
    modelName: string,
    externalApiUsage: ExternalApiUsage,
    modeledMethod: ModeledMethod,
  ) => void;
  onSaveModelClick: (
    externalApiUsages: ExternalApiUsage[],
    modeledMethods: Record<string, ModeledMethod>,
  ) => void;
  onGenerateFromLlmClick: (
    dependencyName: string,
    externalApiUsages: ExternalApiUsage[],
    modeledMethods: Record<string, ModeledMethod>,
  ) => void;
  onStopGenerateFromLlmClick: (dependencyName: string) => void;
  onGenerateFromSourceClick: () => void;
  onModelDependencyClick: () => void;
};

export const LibraryRow = ({
  title,
  libraryVersion,
  externalApiUsages,
  modeledMethods,
  modifiedSignatures,
  inProgressMethods,
  viewState,
  hideModeledApis,
  onChange,
  onSaveModelClick,
  onGenerateFromLlmClick,
  onStopGenerateFromLlmClick,
  onGenerateFromSourceClick,
  onModelDependencyClick,
}: Props) => {
  const modeledPercentage = useMemo(() => {
    return calculateModeledPercentage(externalApiUsages);
  }, [externalApiUsages]);

  const [isExpanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(async () => {
    setExpanded((oldIsExpanded) => !oldIsExpanded);
  }, []);

  const handleModelWithAI = useCallback(
    async (e: React.MouseEvent) => {
      onGenerateFromLlmClick(title, externalApiUsages, modeledMethods);
      e.stopPropagation();
      e.preventDefault();
    },
    [title, externalApiUsages, modeledMethods, onGenerateFromLlmClick],
  );

  const handleStopModelWithAI = useCallback(
    async (e: React.MouseEvent) => {
      onStopGenerateFromLlmClick(title);
      e.stopPropagation();
      e.preventDefault();
    },
    [title, onStopGenerateFromLlmClick],
  );

  const handleModelFromSource = useCallback(
    async (e: React.MouseEvent) => {
      onGenerateFromSourceClick();
      e.stopPropagation();
      e.preventDefault();
    },
    [onGenerateFromSourceClick],
  );

  const handleModelDependency = useCallback(
    async (e: React.MouseEvent) => {
      onModelDependencyClick();
      e.stopPropagation();
      e.preventDefault();
    },
    [onModelDependencyClick],
  );

  const handleSave = useCallback(
    async (e: React.MouseEvent) => {
      onSaveModelClick(externalApiUsages, modeledMethods);
      e.stopPropagation();
      e.preventDefault();
    },
    [externalApiUsages, modeledMethods, onSaveModelClick],
  );

  const onChangeWithModelName = useCallback(
    (externalApiUsage: ExternalApiUsage, modeledMethod: ModeledMethod) => {
      onChange(title, externalApiUsage, modeledMethod);
    },
    [onChange, title],
  );

  const hasUnsavedChanges = useMemo(() => {
    return externalApiUsages.some((externalApiUsage) =>
      modifiedSignatures.has(externalApiUsage.signature),
    );
  }, [externalApiUsages, modifiedSignatures]);

  const canStopAutoModeling = useMemo(() => {
    return externalApiUsages.some((externalApiUsage) =>
      inProgressMethods.hasMethod(title, externalApiUsage.signature),
    );
  }, [externalApiUsages, title, inProgressMethods]);

  return (
    <LibraryContainer>
      <TitleContainer onClick={toggleExpanded} aria-expanded={isExpanded}>
        {isExpanded ? (
          <Codicon name="chevron-down" label="Collapse" />
        ) : (
          <Codicon name="chevron-right" label="Expand" />
        )}
        <NameContainer>
          <DependencyName>
            {title}
            {libraryVersion && <>@{libraryVersion}</>}
          </DependencyName>
          <ModeledPercentage>
            {percentFormatter.format(modeledPercentage / 100)} modeled
          </ModeledPercentage>
          {hasUnsavedChanges ? <VSCodeTag>UNSAVED</VSCodeTag> : null}
        </NameContainer>
        {viewState.showLlmButton && !canStopAutoModeling && (
          <VSCodeButton appearance="icon" onClick={handleModelWithAI}>
            <Codicon name="lightbulb-autofix" label="Model with AI" />
            &nbsp;Model with AI
          </VSCodeButton>
        )}
        {viewState.showLlmButton && canStopAutoModeling && (
          <VSCodeButton appearance="icon" onClick={handleStopModelWithAI}>
            <Codicon name="debug-stop" label="Stop model with AI" />
            &nbsp;Stop
          </VSCodeButton>
        )}
        {viewState.mode === Mode.Application && (
          <VSCodeButton appearance="icon" onClick={handleModelFromSource}>
            <Codicon name="code" label="Model from source" />
            &nbsp;Model from source
          </VSCodeButton>
        )}
        {viewState.mode === Mode.Application && (
          <VSCodeButton appearance="icon" onClick={handleModelDependency}>
            <Codicon name="references" label="Model dependency" />
            &nbsp;Model dependency
          </VSCodeButton>
        )}
      </TitleContainer>
      {isExpanded && (
        <>
          <SectionDivider />
          <ModeledMethodDataGrid
            packageName={title}
            externalApiUsages={externalApiUsages}
            modeledMethods={modeledMethods}
            modifiedSignatures={modifiedSignatures}
            inProgressMethods={inProgressMethods}
            mode={viewState.mode}
            hideModeledApis={hideModeledApis}
            onChange={onChangeWithModelName}
          />
          <SectionDivider />
          <ButtonsContainer>
            <VSCodeButton onClick={handleSave} disabled={!hasUnsavedChanges}>
              Save
            </VSCodeButton>
          </ButtonsContainer>
        </>
      )}
    </LibraryContainer>
  );
};