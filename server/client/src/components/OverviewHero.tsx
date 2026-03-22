import type { ReactNode } from "react";

interface OverviewStatItem {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  valueClassName?: string;
}

interface OverviewHeroProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  badgeIcon: string;
  stats: OverviewStatItem[];
  className?: string;
  badgeClassName?: string;
}

const joinClasses = (...classes: Array<string | undefined>): string => classes.filter(Boolean).join(" ");

const OverviewHero = ({
  eyebrow,
  title,
  subtitle,
  badgeIcon,
  stats,
  className,
  badgeClassName,
}: OverviewHeroProps) => (
  <div className={joinClasses("nono-hero", className)}>
    <div className="nono-hero-copy">
      <div className="nono-hero-copy-block">
        <div className="nono-hero-heading-row">
          <div className={joinClasses("nono-badge", badgeClassName)}>
            <i className={`fa-solid ${badgeIcon}`}></i>
          </div>
          <div className="nono-heading-title">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="title nono-title">{title}</h1>
          </div>
        </div>
        {subtitle ? <p className="nono-subtitle">{subtitle}</p> : null}
      </div>
    </div>

    <div className="nono-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="nono-stat">
          <span className="nono-stat-label">{stat.label}</span>
          <strong className={joinClasses("nono-stat-value", stat.valueClassName)}>{stat.value}</strong>
          {stat.note ? <span className="nono-stat-note">{stat.note}</span> : null}
        </div>
      ))}
    </div>
  </div>
);

export default OverviewHero;
