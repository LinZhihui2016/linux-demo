import express from "express";

const router = express.Router();
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});
router.get('/hello', (req, res) => {
  res.render('hello', { title: 'Hello World' });
});

export default router;
