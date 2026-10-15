// External SDK regression fixture: records the selected public/operator route.
exports.calls = [];
exports.call = async (op, args) => {
  exports.calls.push({ op, args });
  if (op === 'sandbox.service') return { value: { id: 'sb_automatic' } };
  if (args.sandbox === 'sb_missing') {
    return { refused: { code: 'NoSuchSandbox', message: 'selected Sandbox absent', detail: null } };
  }
  return { value: { sandbox: args.sandbox, text: 'selected route', items: [], hasMore: false } };
};
exports.operatorCall = async (op, args) => {
  exports.calls.push({ op, args });
  return { value: { sandbox: args.sandbox, dedupe: '2', compression: null } };
};
