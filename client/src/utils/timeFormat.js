/**
 * Shared relative-time and grouping helpers for the notification drawer,
 * activity feed and history timeline.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "2 min ago" / "5 h ago" / "Mar 3" */
export const timeAgo = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const diff = Date.now() - date.getTime();
    if (diff < 45_000) return 'just now';
    if (diff < HOUR) return `${Math.round(diff / MINUTE)} min ago`;
    if (diff < DAY) return `${Math.round(diff / HOUR)} h ago`;
    if (diff < 7 * DAY) return `${Math.round(diff / DAY)} d ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(date.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}),
    });
};

/** "10:30 AM" */
export const timeOfDay = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Bucket label used as a timeline heading.
 * Returns one of: Today | Yesterday | Last Week | Last Month | Earlier
 */
export const groupLabel = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Earlier';

    const today = startOfDay(new Date());
    const days = Math.floor((today - startOfDay(date)) / DAY);

    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days <= 7) return 'Last Week';
    if (days <= 30) return 'Last Month';
    return 'Earlier';
};

export const GROUP_ORDER = ['Today', 'Yesterday', 'Last Week', 'Last Month', 'Earlier'];

/**
 * Group an already-sorted (newest first) list into timeline sections.
 * @returns {{label: string, items: Array}[]} in chronological display order
 */
export const groupByDay = (items = [], getDate = (i) => i.createdAt) => {
    const buckets = new Map();

    for (const item of items) {
        const label = groupLabel(getDate(item));
        if (!buckets.has(label)) buckets.set(label, []);
        buckets.get(label).push(item);
    }

    return GROUP_ORDER
        .filter((label) => buckets.has(label))
        .map((label) => ({ label, items: buckets.get(label) }));
};

/** "Mar 3, 2026" */
export const fullDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default timeAgo;
