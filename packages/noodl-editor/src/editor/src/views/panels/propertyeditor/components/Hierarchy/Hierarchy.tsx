/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ReactDOM from 'react-dom';

import { NodeGraphNode } from '@noodl-models/nodegraphmodel';

import { Icon, IconName, IconSize } from '@noodl-core-ui/components/common/Icon';

import PopupLayer from '../../../../../views/popuplayer';
import { HierarchyPopup } from './HierarchyPopup';

// Ensure the CSS file is required
require('../../../../../styles/propertyeditor/hierarchy.css');

interface HierarchyProps {
  model: NodeGraphNode;
}

export class Hierarchy extends React.Component<HierarchyProps> {
  popout: any;
  popupAnchor: HTMLDivElement | null = null;

  componentWillUnmount() {
    if (this.popout) {
      PopupLayer.instance.hidePopout(this.popout);
    }
  }

  onToggleHierarchyPopup(evt: React.MouseEvent) {
    if (this.popout) {
      PopupLayer.instance.hidePopout(this.popout);
      this.popout = undefined;
      return;
    }

    const div = document.createElement('div');
    const props = {
      model: this.props.model,
      hidePopout: () => {
        if (this.popout) {
          PopupLayer.instance.hidePopout(this.popout);
          this.popout = undefined;
        }
      }
    };
    ReactDOM.render(React.createElement(HierarchyPopup, props), div);

    this.popout = PopupLayer.instance.showPopout({
      content: { el: $(div) },
      attachTo: $(this.popupAnchor as Element),
      position: 'right',
      onClose: () => {
        this.popout = undefined;
      }
    });

    evt.stopPropagation();
  }

  render() {
    // We get the model from props, passed down from propertyeditor.ts
    if (!this.props.model) return null;

    return (
      <div className="hierarchy-section" ref={(el) => (this.popupAnchor = el)}>
        <div className="hierarchy-name-section">
          <label>Hierarchy</label>
        </div>
        <div className="hierarchy-add-icon" onClick={this.onToggleHierarchyPopup.bind(this)}>
          {/* Using an icon from the existing Icon component */}
          <Icon icon={IconName.ComponentWithChildren} size={IconSize.Small} />
        </div>
      </div>
    );
  }
}
