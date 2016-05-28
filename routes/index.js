var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

let appRegisterRender = function (req, res) {
  res.render('register', {});
};

router.get('/gunbound', appRegisterRender);

module.exports = router;
