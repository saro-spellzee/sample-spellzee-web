"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export type WidgetBoundaryProps = {
  /** Names the widget in error reports ("Skill map"). */
  name: string;
  /**
   * Shown in the widget's place if it fails: a server-rendered stand-in (the hero's first
   * word, the header without its menu), or nothing, the default, for decorative widgets.
   */
  fallback?: ReactNode;
  /** For content widgets: a short message with a button that renders the widget again. Shown before `fallback`. */
  notice?: { message: string; retry: string };
  /** Layout classes for the notice (usually the widget's own top margin). */
  className?: string;
  children: ReactNode;
};

type State = { failed: boolean };

/**
 * Error boundary around one client widget, so a widget that throws while rendering or in an
 * effect (a canvas, an observer, a native <dialog>) takes only itself down. Without it the error
 * reaches app/error.tsx, which replaces the whole page. The error is reported, then the widget's
 * `fallback` and/or `notice` render in its place; the notice's button renders the widget again.
 *
 * A plain React boundary rather than Next's `catchError`: importing that from `next/error` also
 * ships the Pages Router error page (~14 KB gzip of first-load JS here), and these widgets are
 * client components, so re-rendering them is the whole recovery (`retry()` would also refetch
 * the page's server payload). Not for trees that call `redirect()` or `notFound()`. Errors thrown
 * later in timers or event handlers never reach a boundary: guard those in the widget.
 */
export class WidgetBoundary extends Component<WidgetBoundaryProps, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // TODO(product): forward to an error-monitoring service once one is chosen (as app/error.tsx
    // and app/global-error.tsx do). Next also logs every caught error, without the widget's name.
    console.error(`${this.props.name} failed:`, error);
  }

  private retry = () => this.setState({ failed: false });

  render() {
    const { name, fallback = null, notice, className, children } = this.props;
    if (!this.state.failed) return children;
    return (
      <>
        {notice ? (
          <div
            data-widget-error={name}
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white bg-white/80 px-5 py-4 text-body font-semibold text-slate shadow-[0_0_0_1px_rgba(150,120,90,.12)]",
              className,
            )}
          >
            <p>{notice.message}</p>
            <Button variant="ghost" size="sm" onClick={this.retry}>
              {notice.retry}
            </Button>
          </div>
        ) : null}
        {fallback}
      </>
    );
  }
}
