import { useKeyboardCommands } from '@noodl-hooks/useKeyboardCommands';
import React, { useEffect, useRef, useState } from 'react';
import { platform } from '@noodl/platform';

import { Keybindings } from '@noodl-constants/Keybindings';
import { NodeGraphNode } from '@noodl-models/nodegraphmodel';
import { ProjectModel } from '@noodl-models/projectmodel';
import { SidebarModel } from '@noodl-models/sidebar';
import getDocsEndpoint from '@noodl-utils/getDocsEndpoint';
import { tracker } from '@noodl-utils/tracker';

import { IconName, IconSize } from '@noodl-core-ui/components/common/Icon';
import { IconButton, IconButtonVariant } from '@noodl-core-ui/components/inputs/IconButton';
import { Select } from '@noodl-core-ui/components/inputs/Select';
import { TextInput, TextInputVariant } from '@noodl-core-ui/components/inputs/TextInput';
import { Tooltip } from '@noodl-core-ui/components/popups/Tooltip';

import { NodeGraphNodeDelete, NodeGraphNodeRename } from '../..';
import { useNodeGraphContext } from '../../../../../contexts/NodeGraphContext/NodeGraphContext';

export interface NodeLabelProps {
  model: NodeGraphNode;
  showHelp?: boolean;
}

export function NodeLabel({ model, showHelp = true }: NodeLabelProps) {
  const labelInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [label, setLabel] = useState(model.label || model.type.name);

  const [isHierarchyOpen, setHierarchyOpen] = useState(false);
  const { nodeGraph } = useNodeGraphContext();

  // ───────────────────────────────────────────────────────────────────────────────
  //  Keep local `label` in sync with the node model, and clean up properly.
  // ───────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const updateLabel = () => {
      setLabel(model.label || model.type.name);
    };
    updateLabel();

    // Use the handler itself as our "context" so we can unsubscribe cleanly.
    model.on('labelChanged', updateLabel, updateLabel);

    return () => {
      // off(context) matches on(..., handler, context)
      model.off(updateLabel);
    };
  }, [model]);
  // ───────────────────────────────────────────────────────────────────────────────

  function getHierarchyItems() {
    const items: Array<{ label: string; value: string; disabled?: boolean }> = [];
    const parent = model.parent;

    if (parent) {
      items.push({
        label: `[Parent] ${parent.label || parent.type.name}`,
        value: parent.id
      });
      parent.children.forEach((child) => {
        const prefix = child.id === model.id ? '● ' : '  ';
        items.push({
          label: `${prefix}${child.label || child.type.name}`,
          value: child.id
        });
      });
    } else {
      items.push({
        label: `[Selected] ${model.label || model.type.name}`,
        value: model.id,
        disabled: true
      });
      model.children.forEach((child) => {
        items.push({
          label: `  ${child.label || child.type.name}`,
          value: child.id
        });
      });
    }

    return items;
  }

  function handleNodeSelection(nodeId: string | number) {
    if (!nodeId || !nodeGraph) return;

    setTimeout(() => {
      const nodeModel = ProjectModel.instance.findNodeWithId(nodeId as string);
      if (!nodeModel) return;

      const component = nodeModel.owner?.owner;

      if (component && component !== nodeGraph.getActiveComponent()) {
        nodeGraph.switchToComponent(component, { pushHistory: true, node: nodeModel });
      } else {
        const nodeToSelect = nodeGraph.findNodeWithId(nodeId as string);
        if (nodeToSelect) {
          nodeGraph.selectNode(nodeToSelect);
        }
      }
    }, 0);

    setHierarchyOpen(false);
  }

  function onOpenDocs() {
    if (!model.type.docs) return;
    const docsUrl = model.type.docs.replace('https://docs.noodl.net', getDocsEndpoint());
    tracker.track('Open Node Docs Clicked', { url: docsUrl });
    platform.openExternal(docsUrl);
  }

  function onEditLabel() {
    setIsEditingLabel(true);
    requestAnimationFrame(() => {
      labelInputRef.current?.focus();
      labelInputRef.current?.select();
    });
  }

  function onSaveLabel() {
    NodeGraphNodeRename(model, label);
    setIsEditingLabel(false);
    setLabel(model.label || model.type.name);
    window.getSelection()?.removeAllRanges();
  }

  useKeyboardCommands(() => [
    { handler: onOpenDocs, keybinding: Keybindings.PROPERTY_PANEL_OPEN_DOCS.hash },
    {
      handler: () => {
        if (!isEditingLabel) onEditLabel();
      },
      keybinding: Keybindings.PROPERTY_PANEL_EDIT_LABEL.hash
    }
  ]);

  return (
    <div className="property-editor-label-and-buttons property-header-bar" style={{ flex: '0 0' }}>
      <div
        style={{ flexGrow: 1, overflow: 'hidden' }}
        onDoubleClick={() => {
          if (!isEditingLabel) onEditLabel();
        }}
      >
        {isHierarchyOpen ? (
          <Select options={getHierarchyItems()} value={model.id} onChange={(value) => handleNodeSelection(value)} />
        ) : (
          <TextInput
            onRefChange={(ref) => (labelInputRef.current = ref.current)}
            value={label}
            isDisabled={!isEditingLabel}
            UNSAFE_textStyle={{ color: 'var(--theme-color-fg-highlight)' }}
            variant={TextInputVariant.Transparent}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={onSaveLabel}
            onEnter={onSaveLabel}
          />
        )}
      </div>

      {!isEditingLabel && (
        <div className="sidebar-panel-edit-bar hide-on-edit property-panel-header-edit-bar">
          <div style={{ width: 35, height: 35, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip content="Show Hierarchy">
              <IconButton
                icon={isHierarchyOpen ? IconName.CaretUp : IconName.CaretDown}
                size={IconSize.Tiny}
                variant={IconButtonVariant.OpaqueOnHover}
                onClick={() => setHierarchyOpen(!isHierarchyOpen)}
              />
            </Tooltip>
          </div>

          {showHelp && Boolean(model.type.docs) && (
            <div style={{ width: 35, height: 35, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Tooltip content="Open Node Docs" fineType={Keybindings.PROPERTY_PANEL_OPEN_DOCS.label}>
                <IconButton
                  icon={IconName.Question}
                  size={IconSize.Tiny}
                  variant={IconButtonVariant.OpaqueOnHover}
                  onClick={onOpenDocs}
                />
              </Tooltip>
            </div>
          )}

          <div style={{ width: 35, height: 35, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip content="Edit the node label" fineType={Keybindings.PROPERTY_PANEL_EDIT_LABEL.label}>
              <IconButton
                icon={IconName.Pencil}
                size={IconSize.Tiny}
                variant={IconButtonVariant.OpaqueOnHover}
                onClick={onEditLabel}
              />
            </Tooltip>
          </div>

          <div style={{ width: 35, height: 35, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip content="Delete the node" fineType={Keybindings.PROPERTY_PANEL_DELETE.label}>
              <IconButton
                icon={IconName.Trash}
                size={IconSize.Tiny}
                variant={IconButtonVariant.OpaqueOnHover}
                onClick={() => NodeGraphNodeDelete(model)}
              />
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}
