/**
 * Module Dependencies
 */

var word = require('word-at-caret');
var assert = require('assert');
var domify = require('domify');
var inv = require('invisibles');

/**
 * Tests
 */

describe('word(node, offset)', function() {
  var el, range;

  it('should handle a no tokens', function() {
    el = domify('<p></p>');
    range = word(el.firstChild, 0);
    assert('' == range.toString());
  })

  it('should handle a single token', function() {
    el = domify('hi');
    range = word(el, 0);
    assert('hi' == range.toString())
    range = word(el, 1);
    assert('hi' == range.toString())
    range = word(el, 2);
    assert('hi' == range.toString())
  })

  describe('multiple initial tokens', function() {
    beforeEach(function() {
      el = domify('<p>hi there jimmy</p>');
    });

    it('offset: 0', function() {
      range = word(el.firstChild, 0);
      assert('hi' == range.toString())
    })

    it('offset: space | char', function() {
      range = word(el.firstChild, 3);
      assert(' ' == range.toString())
    })

    it('offset: char | space', function() {
      range = word(el.firstChild, 2);
      assert('hi' == range.toString())
    })

    it('offset: char | char', function() {
      range = word(el.firstChild, 4);
      assert('there' == range.toString())
    })

    it('offset: last word', function() {
      range = word(el.firstChild, 13);
      assert('jimmy' == range.toString())
    })

    it('offset: last', function() {
      range = word(el.firstChild, 14);
      assert('jimmy' == range.toString())
    })
  });

  describe('inline elements', function() {
    beforeEach(function() {
      el = domify('<em>http://<strong>wordpress</strong></em>.com');
    })

    it('middle: should select all contents', function() {
      var strong = el.querySelector('strong');
      range = word(strong.firstChild, 3);
      assert('http://wordpress.com' == range.toString())
    });

    it('left: should select all contents', function() {
      var em = el.querySelector('em');
      range = word(em.firstChild, 0);
      assert('http://wordpress.com' == range.toString())
      range = word(em.firstChild, 2);
      assert('http://wordpress.com' == range.toString())
      range = word(em.firstChild, 7);
      assert('http://wordpress.com' == range.toString())
    });

    it('right: should select all contents', function() {
      range = word(el.lastChild, 0);
      assert('http://wordpress.com' == range.toString())
      range = word(el.lastChild, 3);
      assert('http://wordpress.com' == range.toString())
      range = word(el.lastChild, 4);
      assert('http://wordpress.com' == range.toString())
    });
  })

  describe('block elements', function() {
    beforeEach(function() {
      el = domify('<p>http://<p><strong>wordpress</strong>.com</p></p>')
    })

    it('should stop at block elements', function() {
      var strong = el.querySelector('strong');
      range = word(strong.firstChild, 0);
      assert('wordpress.com' == range.toString())
      range = word(strong.firstChild, 3);
      assert('wordpress.com' == range.toString())
      range = word(strong.firstChild, 9);
      assert('wordpress.com' == range.toString())
    })
  })

  describe('whitespace on either side', function() {
    it('right: should ignore whitespace', function() {
      el = domify('<p>\n\n      \n         http://<strong>wordpress</strong>.com\n\n      </p>')
      range = word(el.lastChild, 4);
      assert('http://wordpress.com' == range.toString())
    })

    it('middle: should ignore whitespace', function() {
      el = domify('<p>\n\n      \n         http://<strong>wordpress</strong>.com\n\n      </p>')
      range = word(el.querySelector('strong').firstChild, 4);
      assert('http://wordpress.com' == range.toString())
    })

    it('before: should ignore immediate siblings of whitespace', function() {
      el = domify('<p>  <strong>wordpress.com</strong></p>')
      range = word(el.querySelector('strong').firstChild, 4);
      console.log(range.toString());
      assert('wordpress.com' == range.toString());
    })

    it('after: should ignore immediate siblings of whitespace', function() {
      el = domify('<p><strong>wordpress.com</strong>  </p>')
      range = word(el.querySelector('strong').firstChild, 4);
      assert('wordpress.com' == range.toString());
    })

    it('both: should ignore immediate siblings of whitespace', function() {
      el = domify('<p>  <strong>wordpress.com</strong>  </p>')
      range = word(el.querySelector('strong').firstChild, 4);
      assert('wordpress.com' == range.toString());
    })
  })
})
