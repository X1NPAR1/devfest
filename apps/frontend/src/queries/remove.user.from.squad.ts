import { prisma } from '@db/prisma';

/**
 * Removes a user from their squad.
 * Deletes the squad when no other non-banned member remains, otherwise
 * hands ownership to the next member if the removed user was the owner.
 * Returns the id of the squad the user was removed from, if any.
 */
export const removeUserFromSquad = async (userId: string) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        squadId: true,
        ownedSquads: true,
        squad: {
          select: {
            members: {
              where: {
                banned: false,
                id: {
                  not: userId,
                },
              },
            },
          },
        },
      },
    });

    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        squadId: null,
      },
    });

    if (!user?.squadId || !user.squad) {
      return user?.squadId ?? null;
    }

    const remaining = user.squad.members;

    // if it was the only member of the squad, delete the squad
    if (remaining.length === 0) {
      await tx.squad.delete({
        where: {
          id: user.squadId,
        },
      });
    }
    // if it was the owner of the squad, assign the first member as the owner
    else if (user.ownedSquads[0]?.id) {
      await tx.squad.update({
        where: {
          id: user.squadId,
        },
        data: {
          ownerId: remaining[0].id,
        },
      });
    }

    return user.squadId;
  });
};
