const REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
const REACT_PROFILER_TYPE = Symbol.for('react.profiler');
const REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
const REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
const REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
const REACT_MEMO_TYPE = Symbol.for('react.memo');
const REACT_LAZY_TYPE = Symbol.for('react.lazy');
const REACT_PROVIDER_TYPE = Symbol.for('react.provider');
const REACT_CONTEXT_TYPE = Symbol.for('react.context');
const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
const REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
const REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');

export function isValidElementType(type) {
  if (typeof type === 'string' || typeof type === 'function') {
    return true;
  }

  if (
    type === REACT_FRAGMENT_TYPE ||
    type === REACT_PROFILER_TYPE ||
    type === REACT_STRICT_MODE_TYPE ||
    type === REACT_SUSPENSE_TYPE ||
    type === REACT_SUSPENSE_LIST_TYPE ||
    type === REACT_OFFSCREEN_TYPE
  ) {
    return true;
  }

  if (typeof type === 'object' && type !== null) {
    return (
      type.$$typeof === REACT_LAZY_TYPE ||
      type.$$typeof === REACT_MEMO_TYPE ||
      type.$$typeof === REACT_PROVIDER_TYPE ||
      type.$$typeof === REACT_CONTEXT_TYPE ||
      type.$$typeof === REACT_FORWARD_REF_TYPE ||
      type.$$typeof === REACT_MODULE_REFERENCE ||
      type.getModuleId !== undefined
    );
  }

  return false;
}
