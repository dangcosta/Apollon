import { SagaIterator } from 'redux-saga';
import { all, call, getContext, put, select, take } from 'redux-saga/effects';
import { ModelState } from '../../components/store/model-state.js';
import { run } from '../../utils/actions/sagas.js';
import { diff } from '../../utils/fx/diff.js';
import { ILayer } from '../layouter/layer.js';
import { RemoveAction, UMLContainerActionTypes } from '../uml-container/uml-container-types.js';
import { MoveAction, MovingActionTypes } from '../uml-element/movable/moving-types.js';
import { ResizeAction, ResizingActionTypes } from '../uml-element/resizable/resizing-types.js';
import { UMLElementRepository } from '../uml-element/uml-element-repository.js';
import { CreateAction, DeleteAction, UMLElementActionTypes, UpdateAction } from '../uml-element/uml-element-types.js';
import { ReconnectableActionTypes, ReconnectAction } from './reconnectable/reconnectable-types.js';
import { IUMLRelationship, UMLRelationship } from './uml-relationship.js';
import { UMLRelationshipRepository } from './uml-relationship-repository.js';
import { LayoutAction } from './uml-relationship-types.js';
import { UMLRelationshipType } from '../../packages/uml-relationship-type.js';
import { IUMLCommunicationLink } from '../../packages/uml-communication-diagram/uml-communication-link/uml-communication-link.js';

export function* UMLRelationshipSaga() {
  yield run([create, reconnect, update, layoutElement, deleteElement]);
}

function* create(): SagaIterator {
  const action: CreateAction = yield take(UMLElementActionTypes.CREATE);
  for (const value of action.payload.values) {
    yield call(recalc, value.id);
  }
}

function* reconnect(): SagaIterator {
  const action: ReconnectAction = yield take(ReconnectableActionTypes.RECONNECT);
  for (const connection of action.payload.connections) {
    yield call(recalc, connection.id);
  }
}

function* update(): SagaIterator {
  const action: UpdateAction = yield take(UMLElementActionTypes.UPDATE);
  const { elements }: ModelState = yield select();

  for (const value of action.payload.values) {
    if (!UMLRelationship.isUMLRelationship(elements[value.id])) {
      continue;
    }

    yield call(recalc, value.id);
  }
}

function* layoutElement(): SagaIterator {
  const action: MoveAction | ResizeAction = yield take([MovingActionTypes.MOVE, ResizingActionTypes.RESIZE]);
  const { elements }: ModelState = yield select();
  const relationships = Object.values(elements).filter((x): x is IUMLRelationship =>
    UMLRelationship.isUMLRelationship(x),
  );
  const updates: string[] = [];

  loop: for (const relationship of relationships) {
    let source: string | null = relationship.source.element;
    while (source) {
      if (action.payload.ids.includes(source)) {
        updates.push(relationship.id);
        continue loop;
      }
      source = elements[source].owner;
    }
    let target: string | null = relationship.target.element;
    while (target) {
      if (action.payload.ids.includes(target)) {
        updates.push(relationship.id);
        continue loop;
      }
      target = elements[target].owner;
    }
  }

  for (const id of [...new Set([...updates])]) {
    yield call(recalc, id);
  }
}

function* deleteElement(): SagaIterator {
  const action: DeleteAction = yield take(UMLElementActionTypes.DELETE);
  const { elements }: ModelState = yield select();
  const relationships = Object.values(elements)
    .filter((x): x is IUMLRelationship => UMLRelationship.isUMLRelationship(x))
    .filter(
      (relationship) =>
        action.payload.ids.includes(relationship.source.element) ||
        action.payload.ids.includes(relationship.target.element),
    )
    .map((relationship) => relationship.id);

  yield all([
    put<RemoveAction>({
      type: UMLContainerActionTypes.REMOVE,
      payload: { ids: relationships },
      undoable: false,
    }),
    put<DeleteAction>({
      type: UMLElementActionTypes.DELETE,
      payload: { ids: relationships },
      undoable: false,
    }),
  ]);
}

export function* recalc(id: string): SagaIterator {
  const { elements }: ModelState = yield select();
  const layer: ILayer = yield getContext('layer');
  const relationship = UMLRelationshipRepository.get(elements[id]);
  if (!relationship) {
    return;
  }

  const source = UMLElementRepository.get(elements[relationship.source.element]);
  const target = UMLElementRepository.get(elements[relationship.target.element]);
  if (!source || !target) {
    return;
  }

  const sourcePosition = yield put(UMLElementRepository.getAbsolutePosition(relationship.source.element));
  source.bounds = { ...source.bounds, ...sourcePosition };

  const targetPosition = yield put(UMLElementRepository.getAbsolutePosition(relationship.target.element));
  target.bounds = { ...target.bounds, ...targetPosition };

  const original = elements[id];
  const [updates] = relationship.render(layer, source, target) as UMLRelationship[];

  const { path, bounds } = diff(original, updates) as Partial<IUMLRelationship>;
  if (path) {
    yield put<LayoutAction>(UMLRelationshipRepository.layout(updates.id, path, { ...original.bounds, ...bounds }));
  }
  // layout messages of CommunicationLink
  if (updates.type === UMLRelationshipType.CommunicationLink) {
    yield put<UpdateAction>(UMLElementRepository.update<IUMLCommunicationLink>(updates.id, updates));
  }
}
