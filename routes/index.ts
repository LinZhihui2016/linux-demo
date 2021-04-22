import express from "express";
import { User } from "../moodels/user";

const router = express.Router();
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});
router.get('/hello', (req, res) => {
  res.render('hello', { title: 'Hello World' });
});

router.get('/user', (req, res) => {
  const firstName = req.$get.str('firstName', 'Hello')
  const lastName = req.$get.str('lastName', 'World')
  const age = req.$get.num('age', 12)
  const user = User.add(firstName, lastName, +age)
  res.render('user', { user, allUser: User.getAllName.join(' ; ') })
})
export default router;
