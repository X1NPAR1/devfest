import { revalidatePath } from 'next/cache';
import { auth } from '@frontend/auth';
import { prisma } from '@db/prisma';
import { canRemoveMember } from '@frontend/queries/can.remove.member';
import { removeUserFromSquad } from '@frontend/queries/remove.user.from.squad';

export const DELETE = auth(async (req, ctx) => {
  const callerId = req.auth?.user?.id;
  if (!callerId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const targetId = ctx.params?.id;
  if (typeof targetId !== 'string') {
    return Response.json({ error: 'Invalid member id' }, { status: 400 });
  }

  const [ownedSquad, target] = await Promise.all([
    prisma.squad.findFirst({
      where: {
        ownerId: callerId,
      },
      select: {
        id: true,
      },
    }),
    prisma.user.findUnique({
      where: {
        id: targetId,
      },
      select: {
        squadId: true,
      },
    }),
  ]);

  const decision = canRemoveMember({
    callerId,
    targetId,
    ownedSquadId: ownedSquad?.id,
    targetSquadId: target?.squadId,
  });

  if (!decision.allowed) {
    return Response.json(
      { error: decision.error },
      { status: decision.status }
    );
  }

  const squadId = await removeUserFromSquad(targetId);
  revalidatePath(`/leaderboard/${squadId}`);

  return Response.json({ message: 'Member removed' });
});
