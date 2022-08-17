import { describe, expect, it } from 'vitest';

import { instanceOfNodeError, nodeErrorCode } from './errors';

class NodeError extends Error {
  code?: string;
}

describe(instanceOfNodeError.name, () => {
  it('returns true for node errors', () => {
    const error = new NodeError('Error test');
    error.code = 'Test';

    expect(instanceOfNodeError(error, NodeError)).toEqual(true);
  });

  it('returns false for errors without code', () => {
    const error = new Error('Error test');
    expect(instanceOfNodeError(error, Error)).toEqual(false);
  });

  it('returns false for non errors', () => {
    const error = 'string';
    expect(instanceOfNodeError(error, Error)).toEqual(false);
  });
});

describe(nodeErrorCode.name, () => {
  it('returns the error code', () => {
    const error = new NodeError('Error test');
    error.code = 'Test';

    expect(nodeErrorCode(error)).toEqual(error.code);
  });
});
