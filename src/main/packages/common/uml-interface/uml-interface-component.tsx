import React, { FunctionComponent } from 'react';
import { Text } from '../../../components/controls/text/text.js';
import { UMLInterface } from './uml-interface.js';

export const UMLInterfaceComponent: FunctionComponent<Props> = ({ element, scale }) => (
  <g>
    <circle
      cx={`${10 * scale}px`}
      cy="50%"
      r={10 * scale}
      stroke={element.strokeColor || 'black'}
      strokeWidth={2 * scale}
    />
    <Text noY x={`${25 * scale}px`} dominantBaseline="auto" textAnchor="start" fill={element.textColor}>
      {element.name}
    </Text>
  </g>
);

interface Props {
  element: UMLInterface;
  scale: number;
}
