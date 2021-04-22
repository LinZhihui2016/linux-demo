import express from "express";
const router = express.Router();

router.get('/', (req, res) => {
  const {body,query} = req
  res.send(JSON.stringify({query,body}));
});

export default router;
