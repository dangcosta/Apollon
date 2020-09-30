import { ActivityElementType, ActivityRelationshipType } from '..';
import { ILayer } from '../../../services/layouter/layer';
import { ILayoutable } from '../../../services/layouter/layoutable';
import { UMLElement } from '../../../services/uml-element/uml-element';
import { UMLElementType } from '../../uml-element-type';

export class UMLActivityObjectNode extends UMLElement {
  static supportedRelationships = [ActivityRelationshipType.ActivityControlFlow];

  type: UMLElementType = ActivityElementType.ActivityObjectNode;

  render(canvas: ILayer): ILayoutable[] {
    return [this];
  }
}
