'use server';

import {
  createNotificationSchema,
  CreateNotificationSchema,
} from '@/server/schemas/notifications';
import { checkAuthorization } from './courses';
import { prisma } from '@/lib/prisma';

export const sendNotifications = async (rawData: CreateNotificationSchema) => {
  await checkAuthorization();

  const data = createNotificationSchema.parse(rawData);

  const allUserIds = await prisma.user.findMany({
    select: {
      id: true,
    },
  });

  await prisma.notification.createMany({
    data: allUserIds.map((user) => ({
      userId: user.id,
      title: data.title,
      content: data.content,
      link: data.link,
    })),
  });
};
