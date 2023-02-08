import {
  Schema,
  NodeSpec,
  MarkSpec,
  Mark,
  Node,
  DOMOutputSpec,
  ParseRule,
  Attrs,
} from "prosemirror-model";

type Nodes = {
  doc: NodeSpec;
  title: NodeSpec;
  heading: NodeSpec;
  paragraph: NodeSpec;
  blockquote: NodeSpec;
  horizontal_rule: NodeSpec;
  text: NodeSpec;
  image: NodeSpec;
  hard_break: NodeSpec;
};

type Marks = {
  link: MarkSpec;
  em: MarkSpec;
  strong: MarkSpec;
};

const toTitle = (): DOMOutputSpec => ["h1", 0],
  toParagraph = (): DOMOutputSpec => ["p", 0],
  toHeading = (node: Node): DOMOutputSpec => ["h" + node.attrs.level, 0],
  toBlockquote = (): DOMOutputSpec => ["blockquote", 0],
  toHr = (): DOMOutputSpec => ["hr", 0],
  toBr = (): DOMOutputSpec => ["br", 0],
  toImg = ({ attrs }: Node): DOMOutputSpec => {
    const { src, alt, title } = attrs;
    return ["img", { src, alt, title }];
  };

const parseHr = [{ tag: "hr" }],
  parseParagraph = [{ tag: "p" }],
  parseBlockquote = [{ tag: "blockquote" }],
  parseHeading = [
    { tag: "h2", attrs: { level: 2 } },
    { tag: "h3", attrs: { level: 3 } },
    { tag: "h4", attrs: { level: 4 } },
  ],
  parseBr = [{ tag: "br" }],
  parseImg: readonly ParseRule[] = [
    {
      tag: "img[src]",
      getAttrs: (node: string | HTMLElement) => ({
        src: typeof (node) === "string" ? node : node.getAttribute("src"),
        title: typeof (node) === "string" ? node : node.getAttribute("title"),
        alt: typeof (node) === "string" ? node : node.getAttribute("alt"),
      } as Attrs),
    },
  ];

export const nodes: Nodes = {
  doc: {
    content: "title block+",
  },

  title: {
    content: "inline*",
    group: "title",
    toDOM: toTitle,
  },

  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: parseParagraph,
    toDOM: toParagraph,
  },

  heading: {
    attrs: { level: { default: 2 } },
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: parseHeading,
    toDOM: toHeading,
  },

  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: parseBlockquote,
    toDOM: toBlockquote,
  },

  text: {
    group: "inline",
    inline: true,
  },

  horizontal_rule: {
    group: "block",
    parseDOM: parseHr,
    toDOM: toHr,
  },

  image: {
    inline: true,
    attrs: {
      src: {},
      alt: { default: null },
      title: { default: null },
    },
    group: "inline",
    draggable: true,
    parseDOM: parseImg,
    toDOM: toImg,
  },

  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: parseBr,
    toDOM: toBr,
  },
};

const parseLinkDOM: readonly ParseRule[] = [
  {
    tag: "a[href]",
    getAttrs: (node: string | HTMLElement) => ({
      href: typeof node === "string" ? null : node.getAttribute("href"),
      title: typeof node === "string" ? null : node.getAttribute("title"),
    }),
  },
],
  parseEmDOM = [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
  parseStrongDOM: readonly ParseRule[] = [
    { tag: "strong" },
    {
      tag: "b",
      getAttrs: (node: string | HTMLElement) =>
        typeof node === "string"
          ? false
          : node.style.fontWeight !== "normal" && null,
    },
    {
      style: "font-weight",
      getAttrs: (val: string | HTMLElement) =>
        /^(bold(er)?|[5-9]\d{2,})$/.test(val as string) && null,
    },
  ];

const toEmDOM = (_: Mark): DOMOutputSpec => ["em", 0],
  toStrongDOM = (_: Mark): DOMOutputSpec => ["strong", 0],
  toLinkDOM = ({ attrs }: Mark): DOMOutputSpec => {
    const { href, title } = attrs;
    return ["a", { href, title }, 0];
  };

export const marks: Marks = {
  link: {
    attrs: {
      href: {},
      title: { default: null },
    },
    inclusive: false,
    parseDOM: parseLinkDOM,
    toDOM: toLinkDOM,
  },
  em: {
    parseDOM: parseEmDOM,
    toDOM: toEmDOM,
  },
  strong: {
    parseDOM: parseStrongDOM,
    toDOM: toStrongDOM,
  },
};

export default new Schema({ nodes, marks });
