/**
 * Module Dependencies
 */

var fs = require('fs');
var read = fs.readFileSync;
var parser = require('mini-html-parser');
var word = require('../');

/**
 * HTML
 */

var html = read(__dirname + '/example.html', 'utf8');
var dom = parser(html).parse();

/**
 * Set up the iterator from the middle of a node
 */

var strong = dom.childNodes[0].childNodes[3].firstChild.childNodes[1];

var range = word(strong.firstChild, 4);

console.log(range.startContainer.nodeValue);
console.log(range.endContainer.nodeValue);
