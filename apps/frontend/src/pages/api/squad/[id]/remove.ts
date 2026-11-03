import { auth } from '@frontend/auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { removeUserFromSquad } from '@frontend/queries/remove.user.from.squad';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await auth(req, res);
  // @ts-ignore
  if (!session || !session.user.isMod) {
    return res.json({ error: 'Not a mod' });
  }

  const squadId = await removeUserFromSquad(req.query.id as string);

  await res.revalidate(`/leaderboard/` + squadId);
  return res.json({ error: 'Removed from squad' });
}
