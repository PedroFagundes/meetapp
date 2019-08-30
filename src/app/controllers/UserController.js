import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: "Data didn't validate" });
    }

    const userExists = await User.findOne({
      where: { email: request.body.email },
    });

    if (userExists) {
      return response
        .status(400)
        .json({ error: 'User with this email already exists' });
    }

    const { id, name, email } = await User.create(request.body);

    return response.json({ id, name, email });
  }

  async update(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      password: Yup.string().min(6),
      old_password: Yup.string()
        .min(6)
        .when('password', (password, field) =>
          password ? field.required() : field
        ),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: "Data didn't validate" });
    }

    const { email, old_password, password } = request.body;

    const user = await User.findByPk(request.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return response
          .status(400)
          .json({ error: 'User with this email already exists' });
      }

      if (password && !old_password) {
        return response
          .status(400)
          .json({ error: 'Old password required to set a new password' });
      }

      if (password && (await user.checkPassword(old_password))) {
        return response.status(400).json({ error: 'Invalid old password' });
      }
    }

    const { id, name } = await user.update(request.body);

    return response.json({ id, name, email });
  }
}

export default new UserController();
