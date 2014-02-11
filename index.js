/**
 * Module dependencies
 */

var iterator = require('dom-iterator');
var rchunk = /(\s+|\S+)/g;
var rword = /^\S+$/;

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
  if (!node || !node.nodeValue) return '';
  var parent = node.parentNode;
  var val = node.nodeValue;
  var start = node;
  var toks = [];
  var r = {};
  var more;
  var word;
  var len;
  var sub;
  var it;

  // initials
  r.startContainer = start;
  r.startOffset = 0;
  r.endContainer = start;
  r.endOffset = val.length;
  // update the offset to a token-based offset
  if (offset) {
    sub = val.substr(0, offset);
    offset = tokenize(sub).length - 1;
  }

  // tokenize the nodeValue
  toks = tokenize(val);
  len = toks.length;

  // we already have multiple tokens
  if (len > 1) {
    sub = toks.slice(0, offset).join('');
    more = offset < len - 1;
    if (offset) r.startOffset = sub.length;
    if (more) r.endOffset = r.startOffset + toks[offset].length;
    if (offset && more) return range(r);
  }

  word = isWord(toks[offset]);

  // traverse both directions
  left(node, r, word);
  right(node, r, word);

  return range(r);
}

/**
 * Traverse left
 *
 * @param {Node} node
 * @param {Object} range
 * @param {Boolean} word
 * @api private
 */

function left(node, range, word) {
  var it = iterator(node);
  var val = node.nodeValue;
  var offset = val.length;
  var toks = [];
  var tok;

  node = it.prev();
  while (node && !isBlock(node)) {
    if (3 != node.nodeType) {
      node = it.prev();
      continue;
    }

    val = node.nodeValue;
    offset = val.length;
    toks = tokenize(val);

    range.startContainer = node;
    range.startOffset = offset;

    for (var i = toks.length - 1; i >= 0; i--) {
      tok = toks[i];
      if (isWord(tok) != word) return;
      offset -= tok.length;
      range.startOffset = offset;
    }

    node = it.prev();
  }
}

/**
 * Traverse right
 *
 * @param {Node} node
 * @param {Object} range
 * @param {Boolean} word
 * @api private
 */

function right(node, range, word) {
  var it = iterator(node);
  var val = node.nodeValue;
  var offset = val.length;
  var toks = [];
  var tok;

  node = it.next();
  while (node && !isBlock(node)) {
    if (3 != node.nodeType) {
      node = it.next();
      continue;
    }

    val = node.nodeValue;
    offset = 0;
    toks = tokenize(val);

    range.endContainer = node;
    range.endOffset = offset;

    for (var i = 0, len = toks.length; i < len; i++) {
      tok = toks[i];
      if (isWord(tok) != word) return;
      offset += tok.length;
      range.endOffset = offset;
    }

    node = it.next();
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

/**
 * Is a word
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

function isWord(str) {
  return rword.test(str);
}
