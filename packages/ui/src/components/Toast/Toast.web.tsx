'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { X, Undo2 } from 'lucide-react';
import { cn } from '../../web/utils';
import { Button } from '../Button';

export type ToastType = 'message' | 'success' | 'warning' | 'error';

type Toast = {
  id: number;
  text: string | ReactNode;
  measuredHeight?: number;
  timeout?: ReturnType<typeof setTimeout>;
  remaining?: number;
  start?: number;
  pause?: () => void;
  resume?: () => void;
  preserve?: boolean;
  action?: string;
  onAction?: () => void;
  onUndoAction?: () => void;
  type: ToastType;
};

let root: ReturnType<typeof createRoot> | null = null;
let toastId = 0;

const toastStore = {
  toasts: [] as Toast[],
  listeners: new Set<() => void>(),

  add(
    text: string | ReactNode,
    type: ToastType,
    preserve?: boolean,
    action?: string,
    onAction?: () => void,
    onUndoAction?: () => void
  ) {
    const id = toastId++;
    const toast: Toast = {
      id,
      text,
      preserve,
      action,
      onAction,
      onUndoAction,
      type,
    };

    if (!toast.preserve) {
      toast.remaining = 3000;
      toast.start = Date.now();

      const close = () => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
        this.notify();
      };

      toast.timeout = setTimeout(close, toast.remaining);

      toast.pause = () => {
        if (!toast.timeout || toast.remaining == null || toast.start == null)
          return;
        clearTimeout(toast.timeout);
        toast.timeout = undefined;
        toast.remaining -= Date.now() - toast.start;
      };

      toast.resume = () => {
        if (toast.timeout) return;
        toast.start = Date.now();
        toast.timeout = setTimeout(close, toast.remaining);
      };
    }

    this.toasts.push(toast);
    this.notify();
  },

  remove(id: number) {
    const toast = toastStore.toasts.find((t) => t.id === id);
    if (toast?.timeout) clearTimeout(toast.timeout);
    toastStore.toasts = toastStore.toasts.filter((t) => t.id !== id);
    toastStore.notify();
  },

  subscribe(listener: () => void) {
    toastStore.listeners.add(listener);
    return () => {
      toastStore.listeners.delete(listener);
    };
  },

  notify() {
    toastStore.listeners.forEach((fn) => fn());
  },
};

/** Exported only for testing — do not use in production code. */
export { toastStore as _toastStore };

/** Exported only for testing — do not use in production code. */
export const _resetToastStore = () => {
  toastStore.toasts.forEach((t) => {
    if (t.timeout) clearTimeout(t.timeout);
  });
  toastStore.toasts = [];
  toastStore.listeners.clear();
  root = null;
  toastId = 0;
};

const TYPE_CLASSES: Record<ToastType, string> = {
  message: 'bg-background text-foreground border border-border',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  error: 'bg-destructive text-white',
};

const LAST_VISIBLE_COUNT = 3;
const DEFAULT_HEIGHT = 63;

const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shownIds, setShownIds] = useState<Set<number>>(new Set());
  const [isHovered, setIsHovered] = useState(false);

  const measureRef = (toast: Toast) => (node: HTMLDivElement | null) => {
    if (node && toast.measuredHeight == null) {
      toast.measuredHeight = node.getBoundingClientRect().height;
      toastStore.notify();
    }
  };

  useEffect(() => {
    setToasts([...toastStore.toasts]);
    return toastStore.subscribe(() => {
      setToasts([...toastStore.toasts]);
    });
  }, []);

  // Trigger the enter animation on the next frame after a toast appears.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setShownIds((prev) => {
        const next = new Set(prev);
        toasts.forEach((t) => next.add(t.id));
        return next;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [toasts]);

  const lastVisibleStart = Math.max(0, toasts.length - LAST_VISIBLE_COUNT);

  const getFinalTransform = (index: number, length: number): string => {
    if (index === length - 1) return 'none';

    const offset = length - 1 - index;
    let translateY = toasts[length - 1]?.measuredHeight ?? DEFAULT_HEIGHT;

    for (let i = length - 1; i > index; i--) {
      translateY += isHovered
        ? (toasts[i - 1]?.measuredHeight ?? DEFAULT_HEIGHT) + 10
        : 20;
    }

    const z = -offset;
    const scale = isHovered ? 1 : 1 - 0.05 * offset;
    return `translate3d(0, calc(100% - ${translateY}px), ${z}px) scale(${scale})`;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    toastStore.toasts.forEach((t) => t.pause?.());
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    toastStore.toasts.forEach((t) => t.resume?.());
  };

  const containerHeight = toasts
    .slice(lastVisibleStart)
    .reduce((acc, toast) => {
      return acc + (toast.measuredHeight ?? DEFAULT_HEIGHT);
    }, 0);

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] pointer-events-none w-[420px]"
      style={{ height: containerHeight }}
    >
      <div
        className="relative pointer-events-auto w-full"
        style={{ height: containerHeight }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {toasts.map((toast, index) => {
          const isVisible = index >= lastVisibleStart;
          return (
            <div
              key={toast.id}
              ref={measureRef(toast)}
              className={cn(
                'absolute right-0 bottom-0 shadow-toast rounded-xl leading-[21px] p-4 h-fit',
                TYPE_CLASSES[toast.type],
                isVisible ? 'opacity-100' : 'opacity-0',
                index < lastVisibleStart && 'pointer-events-none'
              )}
              style={{
                width: 420,
                transition: 'all .35s cubic-bezier(.25,.75,.6,.98)',
                transform: shownIds.has(toast.id)
                  ? getFinalTransform(index, toasts.length)
                  : 'translate3d(0, 100%, 150px) scale(1)',
              }}
            >
              <div className="flex flex-col text-[.875rem]">
                <div className="w-full flex items-center justify-between gap-4">
                  <span>{toast.text}</span>
                  {!toast.action && (
                    <div className="flex gap-1 shrink-0">
                      {toast.onUndoAction && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toast.onUndoAction?.();
                            toastStore.remove(toast.id);
                          }}
                        >
                          <Undo2 />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toastStore.remove(toast.id)}
                      >
                        <X />
                      </Button>
                    </div>
                  )}
                </div>
                {toast.action && (
                  <div className="w-full flex items-center justify-end gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toastStore.remove(toast.id)}
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        toast.onAction?.();
                        toastStore.remove(toast.id);
                      }}
                    >
                      {toast.action}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const mountContainer = () => {
  if (typeof document === 'undefined' || root) return;
  const el = document.createElement('div');
  document.body.appendChild(el);
  root = createRoot(el);
  root.render(<ToastContainer />);
};

interface ToastMessage {
  text: string | ReactNode;
  preserve?: boolean;
  action?: string;
  onAction?: () => void;
  onUndoAction?: () => void;
}

export const useToasts = () => {
  return {
    message: useCallback(
      ({ text, preserve, action, onAction, onUndoAction }: ToastMessage) => {
        mountContainer();
        toastStore.add(
          text,
          'message',
          preserve,
          action,
          onAction,
          onUndoAction
        );
      },
      []
    ),
    success: useCallback((text: string) => {
      mountContainer();
      toastStore.add(text, 'success');
    }, []),
    warning: useCallback((text: string) => {
      mountContainer();
      toastStore.add(text, 'warning');
    }, []),
    error: useCallback((text: string) => {
      mountContainer();
      toastStore.add(text, 'error');
    }, []),
  };
};
