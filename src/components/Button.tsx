import cn from 'classnames';

interface Props {
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

export function Button({ disabled, children, onClick }: Props) {
  const classNames = cn(
    'border border-gray-300 text-xs px-2 py-1 rounded-md hover:bg-gray-700',
    {
      'cursor-pointer': !disabled,
      'opacity-50': disabled,
    },
  );

  return (
    <button className={classNames} onClick={!disabled ? onClick : undefined}>
      {children}
    </button>
  );
}
