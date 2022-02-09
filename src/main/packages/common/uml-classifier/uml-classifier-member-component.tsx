import React, { FunctionComponent } from 'react';
import { Text } from '../../../components/controls/text/text.js';
import { UMLClassifierMember } from './uml-classifier-member.js';

export const UMLClassifierMemberComponent: FunctionComponent<Props> = ({ element, scale }) => {
  return (
    <g>
      <rect width="100%" height="100%" />
      <Text x={10 * scale} fill={element.textColor} fontWeight="normal" textAnchor="start">
        {element.name}
      </Text>
    </g>
  );
};

interface Props {
  element: UMLClassifierMember;
  scale: number;
}
