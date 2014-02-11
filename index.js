/**
 * Module dependencies
 */

var iterator = require('dom-iterator');
var rchunk = /(\s+|\S+)/g;

/**
 * Regex for block level elements
 *
 * Do not merge words across
 * block-level elements
 */

var rblock = /^(TABLE|THEAD|TFOOT|CAPTION|COL|COLGROUP|TBODY|TR|TD|TH|DIV|DL|DD|DT|UL|OL|LI|PRE|SELECT|OPTION|FORM|MAP|AREA|BLOCKQUOTE|ADDRESS|MATH|STYLE|P|H[1-6]|HR|FIELDSET|NOSCRIPT|LEGEND|SECTION|ARTICLE|ASIDE|HGROUP|HEADER|FOOTER|NAV|FIGURE|FIGCAPTION|DETAILS|MENU|SUMMARY)$/;

/**
 * Export `word`
 */

module.exports = word;

/**
 * Initialize `word`
 *
 * @param {Node} node
 * @param {Number} offset
 * @return {Range|Object}
 * @api public
 */

function word(node, offset) {
  offset = undefined == offset ? 0 : offset;
  if (!node) return '';

  var parent = node.parentNode;
  var val = node.nodeValue;
  var start = node;
  var toks = [];
  var r = {};
  var it;

  // initials
  r.startContainer = start;
  r.startOffset = 0;
  r.endContainer = start;
  r.endOffset = val.length;

  // update the offset to a token-based offset
  if (offset) {
    var sub = val.substr(0, offset);
    offset = tokenize(sub).length - 1;
  }

  // tokenize the nodeValue
  toks = tokenize(val);

  // we already have multiple tokens
  if (toks.length > 1) {
    sub = toks.slice(0, offset).join('');
    r.startOffset = sub.length;
    r.endOffset = r.startOffset + toks[offset].length;
    return range(r);
  }

  // traverse both directions
  traverse(node, r, 'prev');
  traverse(node, r, 'next');

  return range(r);
}

/**
 * Traverse each way
 *
 * @param {Node} range
 * @param {Object} range
 * @param {String} dir
 * @api private
 */

function traverse(node, range, dir) {
  var side = 'prev' == dir ? 'start' : 'end';
  var it = iterator(node);
  var len;

  node = it[dir]();
  toks = [];

  while (node && !isBlock(node)) {
    if (3 != node.nodeType) {
      node = it[dir]();
      continue;
    }

    toks = tokenize(node.nodeValue);
    len = toks.pop().length;

    if (toks.length) range[side + 'Offset'] = node.nodeValue - len;
    else range[side + 'Offset'] = 'prev' == dir ? 0 : len;

    range[side + 'Container'] = node;
    node = it[dir]();
  }
}

/**
 * Create a range
 *
 * @param {Object} obj
 * @return {Range|Object} range
 */

function range(obj) {
  if (typeof document == 'undefined') {
    return obj;
  } else if (document.createRange) {
    var range = document.createRange();
    range.setStart(obj.startContainer, obj.startOffset);
    range.setEnd(obj.endContainer, obj.endOffset);
    return range;
  } else {
    // TODO: IE support
    return obj;
  }
}

/**
 * Tokenize the input
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function tokenize(str) {
  var tokens = [];
  str.replace(rchunk, function(m) { tokens.push(m); });
  return tokens;
}

/**
 * isBlock
 *
 * TODO: move to it's own component
 *
 * @param {Node} node
 * @return {Boolean}
 * @api private
 */

function isBlock(node) {
  return rblock.test(node.nodeName);
}
