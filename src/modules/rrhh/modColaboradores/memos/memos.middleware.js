import { catchAsync } from '../../../../utils/catchAsync.js';
import { Memos } from './memos.model.js';

export const validExistMemo = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const memo = await Memos.findOne({
    where: {
      id,
    },
  });

  if (!memo) {
    return next(new AppError(`the memo  with id: ${id} not found `, 404));
  }

  req.memo = memo;
  next();
});
