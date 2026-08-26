import { ProgramSelectionCodec } from './selection-codec';

export interface ProgramSelectionSourceResolved {
  type: 'resolved';
  selectedIds: string[];
  updateUrl: boolean;
}

export interface ProgramSelectionSourceConflict {
  type: 'conflict';
  querySelectedIds: string[];
  storageSelectedIds: string[];
}

export type ProgramSelectionSourceResolution = ProgramSelectionSourceResolved | ProgramSelectionSourceConflict;

interface ResolveSelectionSourceParams {
  queryValue: string | null | undefined;
  storageValue: string | null | undefined;
  validIds: readonly string[];
}

export class ProgramSelectionSourceResolver {
  static resolve({
    queryValue,
    storageValue,
    validIds,
  }: ResolveSelectionSourceParams): ProgramSelectionSourceResolution {
    const querySelection = ProgramSelectionCodec.parse(queryValue, validIds);
    const storageSelection = ProgramSelectionCodec.parse(storageValue, validIds);
    const serializedQuery = ProgramSelectionCodec.serialize(querySelection);
    const serializedStorage = ProgramSelectionCodec.serialize(storageSelection);

    if (serializedQuery && serializedStorage && serializedQuery !== serializedStorage) {
      return {
        type: 'conflict',
        querySelectedIds: querySelection,
        storageSelectedIds: storageSelection,
      };
    }

    if (serializedQuery) {
      return {
        type: 'resolved',
        selectedIds: querySelection,
        updateUrl: false,
      };
    }

    return {
      type: 'resolved',
      selectedIds: storageSelection,
      updateUrl: false,
    };
  }
}
