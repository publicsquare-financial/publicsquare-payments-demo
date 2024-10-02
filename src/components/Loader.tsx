import { ComponentProps } from 'react';
import cx from 'classnames';

export default function Loader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cx('flex h-16 w-16 items-center justify-center', className)}
      {...props}
    >
      <div className="border-primary-dark bg-transparent h-full w-full animate-spin rounded-full border-4 border-solid border-t-transparent"></div>
    </div>
  )
}