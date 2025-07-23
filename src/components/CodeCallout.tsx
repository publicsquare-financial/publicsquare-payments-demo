import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ComponentProps } from 'react';
import Button from './Button';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

export default function CodeCallout({
  title,
  description,
  code = 'var data = 1;',
  open,
  onClose,
}: ComponentProps<'button'> & {
  title: string;
  description: string;
  code: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <Dialog open={open} onClose={() => onClose()} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="w-full max-w-4xl space-y-4 rounded-lg border bg-white p-12 shadow-2xl">
            <DialogTitle className="font-bold">{title}</DialogTitle>
            <Description>{description}</Description>
            <pre
              className="line-numbers inset-4 overflow-auto whitespace-pre rounded border bg-gray-100 p-2"
              dangerouslySetInnerHTML={{
                __html: Prism.highlight(code, Prism.languages.javascript, 'javascript'),
              }}
            />
            <div className="flex gap-4">
              <Button onClick={() => onClose()}>Close</Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
