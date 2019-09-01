import Meetup from '../models/Meetup';
import File from '../models/File';

class OrganizationController {
  async index(request, response) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: request.userId,
      },
      attributes: ['id', 'title', 'description', 'location', 'date', 'past'],
      include: [
        {
          model: File,
          attributes: ['id', 'url', 'path'],
        },
      ],
    });

    return response.json(meetups);
  }
}

export default new OrganizationController();
