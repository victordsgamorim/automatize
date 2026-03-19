'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Undo2,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { cn } from '../../utils';
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
  toastId = 0;
};

// All toast types share the surface background — only the icon is colored.
const TYPE_ICONS: Record<ToastType, ReactNode> = {
  message: <Info className="size-[18px] shrink-0 text-muted-foreground" />,
  success: <CheckCircle2 className="size-[18px] shrink-0 text-success" />,
  warning: <AlertTriangle className="size-[18px] shrink-0 text-warning" />,
  error: <XCircle className="size-[18px] shrink-0 text-destructive" />,
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
    .reduce((acc, toast) => acc + (toast.measuredHeight ?? DEFAULT_HEIGHT), 0);

  const TOAST_W = 400;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] pointer-events-none"
      style={{ width: TOAST_W, height: containerHeight }}
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
                'absolute right-0 bottom-0 h-fit',
                'rounded-md border border-border shadow-md',
                'bg-popover text-popover-foreground',
                'px-4 py-3',
                isVisible ? 'opacity-100' : 'opacity-0',
                index < lastVisibleStart && 'pointer-events-none'
              )}
              style={{
                width: TOAST_W,
                transition: 'all .4s cubic-bezier(.22,.68,0,1.2)',
                transform: shownIds.has(toast.id)
                  ? getFinalTransform(index, toasts.length)
                  : 'translate3d(0, 110%, 120px) scale(0.96)',
              }}
            >
              {/* Main row: icon + message + actions */}
              <div className="flex items-center gap-3">
                {/* Type icon (only the icon carries the type color) */}
                <span className="shrink-0">{TYPE_ICONS[toast.type]}</span>

                {/* Text */}
                <span className="flex-1 min-w-0 text-sm font-medium leading-snug">
                  {toast.text}
                </span>

                {/* Close / undo buttons */}
                {!toast.action && (
                  <div className="flex items-center gap-0.5 shrink-0 -mr-1.5">
                    {toast.onUndoAction && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => {
                          toast.onUndoAction?.();
                          toastStore.remove(toast.id);
                        }}
                      >
                        <Undo2 className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => toastStore.remove(toast.id)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Action row */}
              {toast.action && (
                <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-border">
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
          );
        })}
      </div>
    </div>
  );
};

/**
 * Place <ToastProvider> at the root layout, wrapping {children}.
 * It renders the ToastContainer as a portal directly into document.body,
 * so toasts always overlay everything regardless of page layout.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {children}
      {mounted && createPortal(<ToastContainer />, document.body)}
    </>
  );
}

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
      toastStore.add(text, 'success');
    }, []),
    warning: useCallback((text: string) => {
      toastStore.add(text, 'warning');
    }, []),
    error: useCallback((text: string) => {
      toastStore.add(text, 'error');
    }, []),
  };
};
