import React from 'react';

const Input = React.forwardRef(
  (
    {
      label,
      icon: Icon,
      rightIcon: RightIcon,
      onRightIconClick,
      error,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        {/* INPUT WRAPPER */}
        <div
          className={`
            relative flex items-center
            bg-gray-100 rounded-lg
            transition-all
            focus-within:bg-gray-200
            focus-within:ring-2 focus-within:ring-blue-500/40
            ${error ? 'ring-2 ring-red-500/40' : ''}
          `}
        >
          {Icon && (
            <div className="pl-3 text-gray-400">
              <Icon className="h-5 w-5" />
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full bg-transparent
              py-3
              ${Icon ? 'pl-3' : 'pl-4'}
              ${RightIcon ? 'pr-10' : 'pr-4'}
              text-gray-900 placeholder-gray-400
              outline-none border-none
              focus:outline-none focus:ring-0
              ${className}
            `}
            {...props}
          />

          {RightIcon && (
            <button
              type="button"
              tabIndex={-1}
              onClick={onRightIconClick}
              className="
                absolute right-3
                flex items-center justify-center
                bg-transparent border-0
                outline-none focus:outline-none
                text-gray-400 hover:text-gray-600
              "
            >
              <RightIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
