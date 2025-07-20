import React from 'react';

import { NodeGraphNode } from '@noodl-models/nodegraphmodel';

import { Icon, IconName, IconSize } from '@noodl-core-ui/components/common/Icon';

import { reparentNode } from './reparentNode';

interface HierarchyPopupProps {
  model: NodeGraphNode;
  hidePopout: () => void;
}

export class HierarchyPopup extends React.Component<HierarchyPopupProps> {
  handleParentClick() {
    const { model } = this.props;
    // You can't move the node above its grandparent if it doesn't exist
    if (!model.parent || !model.parent.parent) return;

    reparentNode(model, model.parent.parent);
    this.props.hidePopout();
  }

  handleSiblingClick(sibling: NodeGraphNode) {
    reparentNode(this.props.model, sibling);
    this.props.hidePopout();
  }

  render() {
    const { model } = this.props;
    const parent = model.parent;

    if (!parent) {
      return (
        <div className="hierarchy-popup">
          <div className="hierarchy-popup-item-disabled">This node cannot be rearranged.</div>
        </div>
      );
    }

    const siblings = parent.children;

    return (
      <div className="hierarchy-popup">
        {/* Parent Item - only show if there is a grandparent */}
        {parent.parent && (
          <div className="hierarchy-popup-item parent" onClick={() => this.handleParentClick()}>
            <div className="hierarchy-popup-icon">
              <Icon icon={IconName.ArrowUp} size={IconSize.Small} />
            </div>
            <div className="hierarchy-popup-label">{parent.label || parent.type.name}</div>
            <div className="hierarchy-popup-info">Make Sibling</div>
          </div>
        )}

        <div className="hierarchy-popup-separator"></div>

        {/* Sibling Items */}
        {siblings.map((sibling) => {
          if (sibling.id === model.id) {
            // This is the currently selected node
            return (
              <div key={sibling.id} className="hierarchy-popup-item selected">
                <div className="hierarchy-popup-icon">
                  <Icon icon={IconName.CircleOpen} size={IconSize.Small} />
                </div>
                <div className="hierarchy-popup-label">{sibling.label || sibling.type.name}</div>
              </div>
            );
          }
          // These are the other siblings. A node cannot be its own child.
          return (
            <div
              key={sibling.id}
              className="hierarchy-popup-item sibling"
              onClick={() => this.handleSiblingClick(sibling)}
            >
              <div className="hierarchy-popup-icon">
                <Icon icon={IconName.ArrowDown} size={IconSize.Small} />
              </div>
              <div className="hierarchy-popup-label">{sibling.label || sibling.type.name}</div>
              <div className="hierarchy-popup-info">Make Child</div>
            </div>
          );
        })}
      </div>
    );
  }
}
