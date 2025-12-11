import React from "react";

const Popup = ({
  children,
  aberto,
  onClose,
  title,
  footer,
  variant = "default",
}) => {
  if (!aberto) return;

  if (variant === "wide") {
    return (
      <div className="p-4 inset-0 bg-black/40 fixed justify-center z-50 flex items-center">
        <div className="relative w-full lg:w-[85vw] md:w-[90vw] max-w-7xl">
          <div className="overflow-hidden bg-white flex flex-col w-full rounded-lg max-h-[90vh] shadow-sm dark:bg-gray-700 relative">
            <div className="p-4 md:p-5 border-b justify-between items-center flex rounded-t border-gray-200 dark:border-gray-600">
              <h3 className="text-gray-900 font-medium dark:text-white text-lg">
                {title}
              </h3>
              <button
                className="w-8 hover:text-gray-900 rounded-lg text-sm bg-transparent inline-flex items-center justify-center dark:hover:bg-gray-600 h-8 text-gray-400 dark:hover:text-white hover:bg-gray-200 cursor-pointer"
                type="button"
                onClick={onClose}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 md:p-5 space-y-4 overflow-y-auto flex-1">
              {children}
            </div>
            {footer && (
              <div className="border-gray-200 dark:border-gray-600 md:p-5 bg-white dark:bg-gray-700 border-t p-4">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto bg-opacity-50 h-[calc(100%-1rem)] z-50 left-0 fixed bg-black/20 max-h-full justify-center right-0 items-center flex w-full top-0 overflow-x-hidden">
      <div className="max-w-2xl relative p-4 w-full max-h-full">
        <div className="rounded-lg dark:bg-gray-700 shadow-sm bg-white relative">
          <div className="justify-between border-b items-center rounded-t md:p-5 p-4 border-gray-200 dark:border-gray-600 flex">
            <h3 className="text-gray-900 dark:text-white text-lg font-medium">
              {title}
            </h3>
            <button
              className="inline-flex hover:bg-gray-200 cursor-pointer text-gray-400 justify-center items-center bg-transparent dark:hover:text-white text-sm h-8 w-8 rounded-lg hover:text-gray-900 dark:hover:bg-gray-600"
              type="button"
              onClick={onClose}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </button>
          </div>
          <div className="p-4 md:p-5 space-y-4">{children}</div>
          {footer && (
            <div className="border-t p-4 bg-white md:p-5 dark:border-gray-600 border-gray-200 dark:bg-gray-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
