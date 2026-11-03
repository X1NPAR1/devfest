export type RemoveMemberDecision =
  | { allowed: true }
  | { allowed: false; status: 400 | 403 | 404; error: string };

export interface RemoveMemberInput {
  callerId: string;
  targetId: string;
  // id of the squad owned by the caller, if any
  ownedSquadId?: string | null;
  // squad the target currently belongs to, null when not found / no squad
  targetSquadId?: string | null;
}

export const canRemoveMember = (
  input: RemoveMemberInput
): RemoveMemberDecision => {
  if (!input.ownedSquadId) {
    return {
      allowed: false,
      status: 403,
      error: 'Only the squad owner can remove members',
    };
  }

  if (input.callerId === input.targetId) {
    return {
      allowed: false,
      status: 400,
      error: 'You cannot remove yourself from your own squad',
    };
  }

  if (!input.targetSquadId || input.targetSquadId !== input.ownedSquadId) {
    return {
      allowed: false,
      status: 404,
      error: 'Member not found in your squad',
    };
  }

  return { allowed: true };
};
