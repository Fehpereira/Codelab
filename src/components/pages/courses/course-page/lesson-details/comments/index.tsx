import { CommentInput } from './comment-input';

type LessonCommentsProps = {};

export const LessonComments = () => {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold"></h3>
      <CommentInput />
    </div>
  );
};
