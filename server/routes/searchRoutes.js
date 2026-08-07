const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/searchController');

router.use(protect);

router.get('/global', ctrl.globalSearch);

router.route('/recent')
    .get(ctrl.getRecents)
    .post(ctrl.addRecent)
    .delete(ctrl.clearRecents);

module.exports = router;
