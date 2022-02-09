import React, { Component, ComponentClass, ComponentType } from 'react';
import { Droppable as DragDroppable } from '../../draggable/droppable.js';
import { UMLElementComponentProps } from '../uml-element-component-props.js';

type Props = UMLElementComponentProps;

export const droppable = (
  WrappedComponent: ComponentType<UMLElementComponentProps>,
): ComponentClass<UMLElementComponentProps> => {
  return class Droppable extends Component<Props> {
    render() {
      return (
        <DragDroppable owner={this.props.id}>
          <WrappedComponent {...this.props} />
        </DragDroppable>
      );
    }
  };
};
