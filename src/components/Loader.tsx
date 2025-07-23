import { ComponentProps } from 'react';
import cx from 'classnames';

export default function Loader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cx('flex h-16 w-16 items-center justify-center', className)} {...props}>
      <div className="h-full w-full animate-spin rounded-full border-4 border-solid border-primary-dark border-t-transparent bg-transparent"></div>
    </div>
  );
}
