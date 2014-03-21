
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'canvas viz playground' });
};
exports.donuts = function(req, res){
  res.render('donuts', { title: 'donuts' });
};
exports.playground = function(req, res){
  res.render('playground', { title: 'playground' });
};
