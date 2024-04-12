const express = require('express');
const path = require("path");
const router = express.Router();

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('sid');
        res.redirect('/');
    });
});

module.exports = router;