import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';

class MeetupController {
  async store(request, response) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: "Data didn't validate" });
    }

    const { title, description, location, date, file_id } = request.body;

    /**
     * Checks if the pretended meetup date is after now
     */
    if (isBefore(parseISO(request.body.date), new Date())) {
      return response
        .status(400)
        .json({ error: 'The meetup date should be in future' });
    }

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      user_id: request.userId,
      file_id,
    });

    return response.json(meetup);
  }

  async update(request, response) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: "Data didn't validate" });
    }

    const meetup = await Meetup.findByPk(request.params.id);

    if (!meetup) {
      return response.status(404).json({ error: "Meetup doesn't exist" });
    }

    if (meetup.user_id !== request.userId) {
      return response
        .status(405)
        .json({ error: 'Only the meetup creator can update it' });
    }

    await meetup.update(request.body);

    return response.json(meetup);
  }

  async delete(request, response) {
    const meetup = await Meetup.findByPk(request.params.id);

    /**
     * Checks if the user is the meetup owner
     */
    if (meetup.user_id !== request.userId) {
      return response.status(401).json({ error: 'Now allowed' });
    }

    /**
     * Checks if Meetup has already past
     */
    if (meetup.past) {
      return response.status(400).json({ error: "Can't cancel a past meetup" });
    }

    await meetup.destroy();

    return response.send();
  }
}

export default new MeetupController();
