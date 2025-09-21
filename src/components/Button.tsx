import cn from 'classnames';

interface Props {
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

export function Button({ disabled, active, children, onClick }: Props) {
  const classNames = cn(
    'border border-gray-300 text-xs px-2 py-1 rounded-md',
    {
      'hover:bg-gray-700': !disabled && !active,
      'cursor-pointer': !disabled && !active,
      'opacity-10': disabled,
      'bg-gray-300': active,
      'text-gray-900': active,
    },
  );

  return (
    <button className={classNames} onClick={!disabled ? onClick : undefined}>
      {children}
    </button>
  );
}
