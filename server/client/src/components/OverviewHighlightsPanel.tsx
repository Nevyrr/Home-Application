import type { ReactNode } from "react";

interface OverviewHighlightItem {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  className?: string;
}

interface OverviewHighlightsPanelProps {
  eyebrow: string;
  title: string;
  items: OverviewHighlightItem[];
  children?: ReactNode;
}

const joinClasses = (...classes: Array<string | undefined>): string => classes.filter(Boolean).join(" ");

const OverviewHighlightsPanel = ({ eyebrow, title, items, children }: OverviewHighlightsPanelProps) => (
  <section className="nono-panel">
    <div className="nono-panel-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
    </div>

    {children}

    <div className="nono-highlight-grid">
      {items.map((item) => (
        <div key={item.label} className={joinClasses("nono-highlight-card", item.className)}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.note ? <small>{item.note}</small> : null}
        </div>
      ))}
    </div>
  </section>
);

export default OverviewHighlightsPanel;
