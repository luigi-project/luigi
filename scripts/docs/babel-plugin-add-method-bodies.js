/**
 * Babel plugin: add non-empty bodies to TypeScript-declared class methods.
 *
 * Purpose: allow container/typings/*.svelte.d.ts to be authored as valid
 * TypeScript declaration files (methods with signatures only, no bodies),
 * while still producing an AST that jsdoc-to-markdown's downstream JSDoc
 * parser can attach doclets to.
 *
 * Background: JSDoc reads Babel's emitted JavaScript, not the AST directly.
 * Babel emits class methods as prototype assignments — e.g.
 * `_proto.name = function name() {};`. If the trailing `;` is missing on
 * such an assignment, JSDoc silently drops the doclet on the FOLLOWING
 * method. That is the same failure mode as PR #5401 / #5402 (which was
 * caused by Prettier stripping `;` from `void {};` in the .d.ts source).
 *
 * Empty `ClassMethod` bodies produce `_proto.name = function () {}` with
 * NO trailing `;` in Babel's output. Non-empty bodies produce a trailing
 * `;` because they end with a statement. So this plugin does two things:
 *
 *   1. Runs in `pre()`, before Babel's main visitor pass. This is required
 *      because @babel/preset-typescript has its own TSDeclareMethod visitor
 *      that removes the node — running in `pre()` converts TSDeclareMethod
 *      into ClassMethod before preset-typescript ever sees it.
 *
 *   2. Gives each converted method a non-empty body — a single `void 0;`
 *      expression statement. This is not for any runtime purpose (these
 *      stubs are never executed); it exists to make Babel emit the
 *      trailing `;` on the prototype assignment.
 *
 * The result: the .d.ts file can be authored as a clean signature-only
 * declaration file, and the doc generation pipeline behaves the same as
 * if the file had been authored with `void {};` on every stub.
 */

'use strict';

module.exports = function addBodiesToDeclaredMethods({ types: t }) {
  function convert(node) {
    const body = t.blockStatement([]);
    const replacement = t.classMethod(
      node.kind || 'method',
      node.key,
      node.params,
      body,
      node.computed || false,
      node.static || false,
      node.generator || false,
      node.async || false
    );
    if (node.returnType) replacement.returnType = node.returnType;
    if (node.typeParameters) replacement.typeParameters = node.typeParameters;
    if (node.accessibility) replacement.accessibility = node.accessibility;
    if (node.abstract) replacement.abstract = node.abstract;
    if (node.optional) replacement.optional = node.optional;
    if (node.leadingComments) replacement.leadingComments = node.leadingComments;

    // IMPORTANT: do NOT copy .loc / .start / .end from the original node.
    // Babel's code generator uses those to decide statement spacing after
    // the class transform, and preserving them from a TSDeclareMethod
    // (which was `name(...): void;` in source, ending at the `;`) makes
    // the generator emit `_proto.name = function () {}` WITHOUT a trailing
    // `;` on the prototype assignment. Leaving these unset makes the
    // generator fall back to its default spacing, which reliably emits
    // `_proto.name = function () {};` with the `;` JSDoc needs.

    return replacement;
  }

  return {
    name: 'add-bodies-to-declared-methods',
    pre(file) {
      // Clear the ClassBody's own start/end/loc so the generator recomputes
      // spacing from scratch rather than trying to preserve source-level
      // positions from the original .d.ts.
      file.ast.program.body.forEach(function visit(node) {
        if (!node || typeof node !== 'object') return;
        if (node.type === 'ClassBody') {
          let dirty = false;
          node.body = node.body.map((member) => {
            if (member.type === 'TSDeclareMethod') {
              dirty = true;
              return convert(member);
            }
            return member;
          });
          if (dirty) {
            // Prevent the generator from using the original source's byte
            // spans (which end at `;` on signature declarations, not at `}`).
            node.start = null;
            node.end = null;
            node.loc = null;
          }
        }
        for (const k in node) {
          const v = node[k];
          if (Array.isArray(v)) v.forEach(visit);
          else if (v && typeof v === 'object') visit(v);
        }
      });
    },
    visitor: {}
  };
};
