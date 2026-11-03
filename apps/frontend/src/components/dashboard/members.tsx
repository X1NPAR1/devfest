import { FC, useCallback } from 'react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { User } from '@frontend/components/dashboard/main';
import { Button } from '@frontend/components/button';
import GithubSvg from '@frontend/components/svgs/GithubSvg';

export const Members: FC<{ user: User; mutate: () => void }> = (props) => {
  const { mutate } = props;
  const removeMember = useCallback(
    async (member: User['squad']['members'][number]) => {
      const sure = await Swal.fire({
        title: 'Are you sure?',
        text: `${member.name} will be removed from your squad.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove!',
        cancelButtonText: 'No',
      });

      if (!sure.isConfirmed) {
        return;
      }

      const res = await fetch(`/api/dashboard/squad/members/${member.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const body: { error?: string } = await res.json().catch(() => ({}));
        toast.error(body.error || 'Could not remove member');
        return;
      }

      toast.success(`${member.name} was removed`);
      mutate();
    },
    [mutate]
  );

  return (
    <div className="flex gap-[32px]">
      {props.user.squad.members.map((p) => (
        <div className="flex flex-col items-center" key={p.id}>
          <div className="w-[130px] h-[130px] bg-black rounded-full overflow-hidden">
            <img
              className="relative z-[1] aspect-square h-full w-full rounded-full"
              alt={p.name}
              src={p.profilePicture}
            />
          </div>
          <div className="flex gap-[4px] items-center justify-center mt-[16px]">
            <div>{p.name}</div>
            <div>
              <a href={`https://github.com/${p.handle}`} target="_blank">
                <GithubSvg color="white" width={16} height={16} />
              </a>
            </div>
          </div>
          {props.user.owner && p.id !== props.user.id && (
            <div className="mt-[8px]">
              <Button
                type="button"
                size="sm"
                glow={false}
                variant="secondary"
                onClick={() => removeMember(p)}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
