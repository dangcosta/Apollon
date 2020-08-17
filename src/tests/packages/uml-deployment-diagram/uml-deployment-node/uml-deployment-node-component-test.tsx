import * as React from 'react';
import { render } from '@testing-library/react';
import { UMLDeploymentNode } from "../../../../main/packages/uml-deployment-diagram/uml-deployment-node/uml-deployment-node";
import { UMLDeploymentNodeComponent } from "../../../../main/packages/uml-deployment-diagram/uml-deployment-node/uml-deployment-node-component";

it('render the uml-deployment-node-component', () => {
  const deploymentNode: UMLDeploymentNode = new UMLDeploymentNode({ name: 'TestDeploymentComponent' });
  const { getByText } = render(
    <svg>
      <UMLDeploymentNodeComponent element={deploymentNode} />
    </svg>,
  );
  expect(getByText(deploymentNode.name)).toBeInTheDocument();
});
