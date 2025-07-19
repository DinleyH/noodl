// C:\projects\noodl\packages\noodl-editor\src\editor\src\views\NodePicker\NodePicker.tsx

import classNames from 'classnames';
import React from 'react';

import { Tabs, TabsVariant } from '@noodl-core-ui/components/layout/Tabs';

import { NodePickerContextProvider, useNodePickerContext } from './NodePicker.context';
import css from './NodePicker.module.scss';
import { ImportFromProject } from './tabs/ImportFromProject/ImportFromProject';
import { NodeLibrary, NodeLibraryProps } from './tabs/NodeLibrary/NodeLibrary';
import { NodePickerSearchView } from './tabs/NodePickerSearchView';

// --- CHANGE 1: Update the props type to officially include `source` ---
type NodePickerProps = NodeLibraryProps & { source?: 'viewer' | 'editor'; selectedNodeId?: string };

const NODE_LIBRARY_LABEL = 'Nodes';
const PREFAB_LIBRARY_LABEL = 'Prefabs';
const MODULE_LIBRARY_LABEL = 'Modules';
const PROJECT_IMPORT_LABEL = 'Import from project';

// --- CHANGE 2: Accept `source` in the function signature and give it a default value ---
function NodePickerWithoutContext({
  model,
  parentModel,
  pos,
  attachToRoot,
  runtimeType,
  source = 'editor',
  selectedNodeId
}: NodePickerProps) {
  const context = useNodePickerContext();

  // --- CHANGE 3: Add logic to show a simplified view if the source is the viewer ---
  if (source === 'viewer') {
    return (
      <div className={css['Root']}>
        {/* Render NodeLibrary directly, without tabs, and pass the source prop */}
        <NodeLibrary
          model={model}
          parentModel={parentModel}
          pos={pos}
          attachToRoot={attachToRoot}
          runtimeType={runtimeType}
          source={source}
          selectedNodeId={selectedNodeId}
        />
      </div>
    );
  }
  // ---------------------------------------------------------------------------------

  // This is the original code that will run when source is 'editor'
  const tabs = [
    {
      label: NODE_LIBRARY_LABEL,
      content: (
        <NodeLibrary
          model={model}
          parentModel={parentModel}
          pos={pos}
          attachToRoot={attachToRoot}
          runtimeType={runtimeType}
          source={source} // Also pass the source here for consistency
          selectedNodeId={selectedNodeId}
        />
      )
    }
  ];

  tabs.push({
    label: PREFAB_LIBRARY_LABEL,
    content: <NodePickerSearchView key="prefabs" itemType="prefab" searchInputPlaceholder="Search for a prefab" />
  });

  tabs.push({
    label: MODULE_LIBRARY_LABEL,
    content: (
      <NodePickerSearchView key="modules" itemType="module" searchInputPlaceholder="Search for an external library" />
    )
  });

  tabs.push({
    label: PROJECT_IMPORT_LABEL,
    content: <ImportFromProject />
  });

  return (
    <div className={css['Root']}>
      <Tabs
        UNSAFE_className={css['TabOverride']}
        variant={TabsVariant.Text}
        tabs={tabs}
        activeTab={context.activeTab}
        onChange={(activeTab) => {
          context.setActiveTab(activeTab);
        }}
      />

      <div className={classNames(css['Blocker'], context.isBlocked && css['is-visible'])} />

      <div className={css['ShadowWrapper']}>
        <div className={css['Shadow']}></div>
      </div>
    </div>
  );
}

export function NodePicker(props) {
  return (
    <NodePickerContextProvider>
      <NodePickerWithoutContext {...props} />
    </NodePickerContextProvider>
  );
}
