import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import User from '../models/User';

class SubscriptionController {
  async index(request, response) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: request.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });

    return response.json(subscriptions);
  }

  async store(request, response) {
    const user = await User.findByPk(request.userId);
    const meetup = await Meetup.findByPk(request.params.meetupId, {
      include: [{ model: User, as: 'organizer' }],
    });

    if (!meetup) {
      return response.status(404).json({ error: 'Meetup not found' });
    }

    if (meetup.organizer.id === user.id) {
      return response
        .status(400)
        .json({ error: "Can't subscribe to your own meetup" });
    }

    if (meetup.past) {
      return response
        .status(400)
        .json({ error: "Can't subscribe to past meetup" });
    }

    const alreadySubscribed = await Subscription.findOne({
      where: {
        user_id: user.id,
        meetup_id: meetup.id,
      },
    });

    if (alreadySubscribed) {
      return response
        .status(400)
        .json({ error: "You're already subscribed to this meetup" });
    }

    const alreadySubscribedThisDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: { date: meetup.date },
        },
      ],
    });

    if (alreadySubscribedThisDate) {
      return response
        .status(400)
        .json({ error: "You're already subscribed to a meetup in this date" });
    }

    const subscription = await Subscription.create({
      meetup_id: meetup.id,
      user_id: user.id,
    });

    return response.json(subscription);
  }
}

export default new SubscriptionController();
