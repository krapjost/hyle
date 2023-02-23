import { NodeType } from "prosemirror-model";
import {
  inputRules,
  wrappingInputRule,
  textblockTypeInputRule,
  smartQuotes,
  emDash,
  ellipsis,
} from "prosemirror-inputrules";

type NodeTypes = {
  doc: NodeType;
  heading: NodeType;
  paragraph: NodeType;
  blockquote: NodeType;
  horizontal_rule: NodeType;
  text: NodeType;
  image: NodeType;
  hard_break: NodeType;
};

export function blockQuoteRule(nodeType: NodeType) {
  return wrappingInputRule(/^\s*>\s$/, nodeType);
}

export function orderedListRule(nodeType: NodeType) {
  return wrappingInputRule(
    /^(\d+)\.\s$/,
    nodeType,
    (match) => ({ order: +match[1] }),
    (match, node) => node.childCount + node.attrs.order == +match[1]
  );
}

export function bulletListRule(nodeType: NodeType) {
  return wrappingInputRule(/^\s*([-+*])\s$/, nodeType);
}

export function headingRules(nodeType: NodeType, maxLevel: number) {
  return textblockTypeInputRule(
    new RegExp(`^(#{1,${maxLevel}}|,{1,${maxLevel}})\\s$`),
    nodeType,
    (match) => ({ level: match[1].length })
  );
}

export function buildInputRules(nodes: NodeTypes) {
  const rules = smartQuotes.concat(ellipsis, emDash);

  rules.push(blockQuoteRule(nodes.blockquote));
  rules.push(headingRules(nodes.heading, 6));
  // rules.push(orderedListRule(nodes.ordered_list));
  // rules.push(bulletListRule(nodes.bullet_list));

  return inputRules({ rules });
}
